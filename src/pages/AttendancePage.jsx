import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import {
  getAllStudents,
  updateStudentAttendance,
} from "../services/studentService";
import toast from "react-hot-toast";
import { theme } from "../styles/theme";
import {
  PageContainer,
  PageTitle,
  SelectorContainer,
  Select,
  DateInput,
  FilterContainer,
  FilterLabel,
  FilterInput,
  TopicInput,
  VideoContainer,
  StudentsGrid,
  StudentCard,
  StudentInfo,
  StudentName,
  StudentEmail,
  AttendancePhoto,
  CameraIcon,
  NoStudentsMessage,
  SubmitButton,
  LoadingText,
  StyledCheckbox,
} from "../styles/AttendancePage.styles";

function AttendancePage() {
  const { user, isFranchise } = useAuth();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [centres, setCentres] = useState([]); // State for centres
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCentre, setSelectedCentre] = useState(""); // State for selected centre
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [nameFilter, setNameFilter] = useState(""); // State for name filter
  const [topic, setTopic] = useState("");

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0)?.toUpperCase() + string.slice(1)?.toLowerCase();
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesSnap, studentsData, subjectsSnap, centresSnap] =
          await Promise.all([
            getDocs(collection(db, "batches")),
            getAllStudents(), // Fetch students
            getDocs(collection(db, "subjects")),
            getDocs(collection(db, "centres")), // Fetch centres
          ]);

        setBatches(
          batchesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
        setStudents(studentsData);
  
        setSubjects(
          subjectsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
        setCentres(
          centresSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        ); // Set centres
        if (isFranchise)
          setSelectedCentre(capitalizeFirstLetter(user.email.split("@")[0]));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    
  }, []);

  const startCamera = async (studentId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Error accessing camera");
    }
  };

  const capturePhoto = async (student) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      // Draw the current video frame
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg"),
      );

      // Upload to Firebase Storage
      const fileName = `attendance-photos/${selectedDate}/${selectedBatch}/${student.id}-${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, blob);
      const photoUrl = await getDownloadURL(snapshot.ref);

      // Store URL and mark attendance
      setCapturedPhotos((prev) => ({
        ...prev,
        [student.id]: photoUrl,
      }));
      handleAttendanceToggle(student.id);

      // Stop camera
      stopCamera();
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("Error capturing photo");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleAttendanceToggle = (studentId) => {
    setAttendanceList((prev) => {
      const exists = prev.includes(studentId);
      if (exists) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSubmitAttendance = async () => {
    if (!selectedBatch || !selectedSubject) {
      alert("Please select both batch and subject");
      return;
    }

    try {
      const attendanceData = {
        batch: selectedBatch,
        subject: selectedSubject,
        centre: selectedCentre,
        date: Timestamp.fromDate(new Date(selectedDate)),
        presentStudents: attendanceList.map((studentId) => {
          const student = students.find((student) => student.id === studentId);
          return {
            name: student?.name || "",
            studentId,
            photoUrl: capturedPhotos?.[studentId] || "",
          };
        }),
        createdAt: Timestamp.now(),
        createdBy: user.email,
        capturedPhotos: capturedPhotos || [],
      };
      await addDoc(collection(db, "attendance"), attendanceData);

      const eligibleStudents = students.filter(
        (student) =>
          student.batch?.includes(selectedBatch) &&
          student.status === "active" &&
          student.subjects?.includes(selectedSubject) &&
          student.centres
            ?.map((centre) => centre.replace(/\s+/g, ""))
            .includes(selectedCentre),
      );
      const absentPromises = eligibleStudents
        .filter((student) => !attendanceList.includes(student.SK))
        .map((student) =>
          updateStudentAttendance(student.email, {
            subject: selectedSubject,
            topic: topic,
            status: "absent",
          }),
        );
      await Promise.all([...absentPromises]);
      // Replace the existing toast.success line with:
      toast.success("Attendance submitted successfully!", {
        position: "top-center",
        duration: 3000,
        style: {
          background: theme.colors.success.main,
          color: theme.colors.success.contrast,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
        },
      });
      setAttendanceList([]);
      setCapturedPhotos({});
      setSelectedBatch("");
      setSelectedSubject("");
      setSelectedCentre("");
      setTopic("");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Error submitting attendance", {
        position: "top-center",
        duration: 3000,
        style: {
          background: theme.colors.error.main,
          color: theme.colors.error.contrast,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
        },
      });
    }
  };
  // Filter students based on name and centre
  const filteredStudents = students.filter(
    (student) =>{
      return student.name?.toLowerCase().includes(nameFilter?.toLowerCase()) &&
      (selectedCentre
        ? student.centres
            ?.map((centre) => centre.replace(/\s+/g, ""))
            .includes(selectedCentre)
        : true)}
  );

  if (loading) return <LoadingText>Loading...</LoadingText>;

  return (
    <PageContainer>
      <PageTitle>Attendance Management</PageTitle>

      {/* Batch, Subject, Date selectors */}
      <SelectorContainer>
        <Select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.name}>
              {batch.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedCentre}
          onChange={(e) => setSelectedCentre(e.target.value)}
          disabled={isFranchise}
        >
          <option value="">Select Centres</option>
          {centres.map((centre) => (
            <option key={centre.id} value={centre.name}>
              {centre.name}
            </option>
          ))}
        </Select>

        <DateInput
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </SelectorContainer>

      <FilterContainer>
        <FilterLabel>
          Name :
          <FilterInput
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </FilterLabel>

        <TopicInput
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter Topic"
        />
      </FilterContainer>

      {selectedBatch && selectedSubject && (
        <div>
          <VideoContainer
            ref={videoRef}
            autoPlay
            playsInline
            isActive={isCameraActive}
          />

          <StudentsGrid>
            {filteredStudents
              .filter(
                (student) =>
                  student.batch.includes(selectedBatch) &&
                  student.status === "active" &&
                  student.subjects?.includes(selectedSubject),
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((student) => (
                <StudentCard
                  key={student.id}
                  isPresent={attendanceList.includes(student.SK)}
                >
                  <StyledCheckbox
                    type="checkbox"
                    checked={attendanceList.includes(student.SK)}
                    onChange={() => handleAttendanceToggle(student.SK)}
                  />
                  <StudentInfo>
                    <StudentName>{student.name}</StudentName>
                    <StudentEmail>{student.email}</StudentEmail>
                  </StudentInfo>
                  {capturedPhotos[student.id] ? (
                    <AttendancePhoto src={capturedPhotos[student.id]} alt="Attendance" />
                  ) : (
                    <CameraIcon
                      icon={faCamera}
                      onClick={() =>
                        isCameraActive
                          ? capturePhoto(student)
                          : startCamera(student.id)
                      }
                    />
                  )}
                </StudentCard>
              ))}
          </StudentsGrid>

          {filteredStudents.filter(
            (student) =>
              student.batch.includes(selectedBatch) &&
              student.status === "active" &&
              student.subjects?.includes(selectedSubject),
          ).length === 0 && (
            <NoStudentsMessage>
              No active students found for this batch and subject.
            </NoStudentsMessage>
          )}

          {filteredStudents.filter(
            (student) =>
              student.batch.includes(selectedBatch) &&
              student.status === "active" &&
              student.subjects?.includes(selectedSubject),
          ).length > 0 && (
            <SubmitButton onClick={handleSubmitAttendance}>
              Submit Attendance
            </SubmitButton>
          )}
        </div>
      )}
    </PageContainer>
  );
}

export default AttendancePage;
