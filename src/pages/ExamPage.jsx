import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getExams, addExam, deleteExam, getUserExamResults } from "../services/questionService";
import { examResultsStyles, examResultsScript } from '../styles/components/examResults.styles';
import * as XLSX from 'xlsx';
import { MdDelete, MdAssessment, MdDownload } from 'react-icons/md';
import {
  ExamPageContainer,
  ExamFormContainer,
  ExamsHeader,
  ExamFormTitle,
  ExamsTitle,
  FormGrid,
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  SectionsContainer,
  SectionsGrid,
  SectionCheckbox,
  CheckboxInput,
  BlueButton,
  FilterContainer,
  FilterSelect,
  Loading,
  NoExams,
  ExamsTableContainer,
  ExamsTable,
  TableHeader,
  TableRow,
  ClickableCell,
  SubmittedBadge,
  ActionButtonContainer,
  DeleteButton,
  ViewResultsButton,
  DownloadButton,
  ApplyButtonContainer,
  AppliedButton,
  ReviewButton,
  ReviewedButton,
} from '../styles/components/examPage.styles';

function ExamPage() {
  const location = useLocation();

  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [dateFilter, setDateFilter] = useState("week");
  const [submittedExams, setSubmittedExams] = useState([]);
  const [examResults, setExamResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    batch: "",
    date: "",
    time: "",
    duration: "",
    totalMarks: "",
    videoKey: location.state?.videoKey || "", // Auto-populate from navigation state
  });
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchBatchesAndSubjects();
    if (!isAdmin) {
      fetchApplications();
      fetchSubmittedExams();
    }
  }, [isAdmin, user?.email, user?.uid]);

  // Fetch submitted exams
  const fetchSubmittedExams = async () => {
    if (!user) return;
    
    try {
      const results = await getUserExamResults(user.uid);
      
      // Extract exam IDs from results
      const examIds = results.map(result => result.SK.replace("EXAM#", ""));
      setSubmittedExams(examIds);
    } catch (error) {
      console.error("Error fetching submitted exams:", error);
    }
  };

  useEffect(() => {
    filterExamsByDate();
  }, [exams, dateFilter]);

  const filterExamsByDate = () => {
    if (dateFilter === "all") {
      setFilteredExams(exams);
      return;
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate date for previous week (start)
    const prevWeekStart = new Date();
    prevWeekStart.setDate(today.getDate() - 7);
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];
    
    // Calculate date for next week
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Calculate date for next month
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    let filtered;
    
    switch (dateFilter) {
      case "today":
        filtered = exams.filter(exam => exam.date === todayStr);
        break;
      case "prevWeek":
        filtered = exams.filter(exam => {
          return exam.date >= prevWeekStartStr && exam.date < todayStr;
        });
        break;
      case "week":
        filtered = exams.filter(exam => {
          return exam.date >= todayStr && exam.date <= nextWeekStr;
        });
        break;
      case "month":
        filtered = exams.filter(exam => {
          return exam.date >= todayStr && exam.date <= nextMonthStr;
        });
        break;
      default:
        filtered = exams;
    }
    
    setFilteredExams(filtered);
  };

  const fetchExams = async () => {
    try {
      const examsData = await getExams();
      setExams(examsData);
      setFilteredExams(examsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchBatchesAndSubjects = async () => {
    try {
      const [batchesSnapshot, subjectsSnapshot] = await Promise.all([
        getDocs(collection(db, "batches")),
        getDocs(collection(db, "subjects")),
      ]);

      setBatches(
        batchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      setSubjects(
        subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    } catch (error) {
      console.error("Error fetching batches and subjects:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(
        collection(db, "examApplications"),
      );
      const applicationsData = {};
      applicationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userEmail === user.email) {
          applicationsData[data.examId] = {
            id: doc.id,
            status: data.status,
          };
        }
      });
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...formData,
        sections: selectedSections,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
      };

      const docRef = await addExam(examData);

      setFormData({
        name: "",
        subject: "",
        batch: "",
        date: "",
        time: "",
        duration: "",
        totalMarks: "",
      });
      fetchExams();
    } catch (error) {
      console.error("Error adding exam:", error);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(examId);
        fetchExams();
      } catch (error) {
        console.error("Error deleting exam:", error);
      }
    }
  };

  const handleApplicationToggle = async (examId) => {
    try {
      if (!applications[examId]) {
        // Create new application
        const docRef = await addDoc(collection(db, "examApplications"), {
          examId,
          userEmail: user.email,
          status: "applied",
          appliedAt: new Date(),
        });
        setApplications((prev) => ({
          ...prev,
          [examId]: { id: docRef.id, status: "applied" },
        }));

        // Navigate to exam interface instead of opening index.html
        navigate("/exam-interface");
      } else if (applications[examId].status === "applied") {
        // Update to review
        const docRef = doc(db, "examApplications", applications[examId].id);
        await updateDoc(docRef, {
          status: "review",
          reviewedAt: new Date(),
        });
        setApplications((prev) => ({
          ...prev,
          [examId]: { ...prev[examId], status: "review" },
        }));
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  // In ExamPage.jsx, update the handleStartExam function
  const handleStartExam = (exam) => {
    exam.subject = subjects;
    if (isAdmin) {
      // Open edit-exam in a new tab/window
      const examData = JSON.stringify(exam);
      const url = `/edit-exam?examData=${encodeURIComponent(examData)}`;
      window.open(url, '_blank');
    } else {
      navigate(`/exam-interface/${exam.id}`);
    }
  };

  const fetchExamResults = async (examId) => {
    try {
      setLoadingResults(true);
      const response = await fetch('https://7tklqol24ryrcbizyb3zccrhou0hiudz.lambda-url.ap-south-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify({
          examId: examId
        })
      });
      
      const data = await response.json();
      
      setExamResults(data);
      
      // Display results in a modal or new window
      const resultsWindow = window.open("", "_blank");
      if (resultsWindow) {
        resultsWindow.document.write(`
          <html>
            <head>
              <title>Exam Results - ${examId}</title>
              <style>
                ${examResultsStyles}
              </style>
            </head>
            <body>
              <h1>Exam Results</h1>
              <p>${data.message}</p>
              <table>
                <thead>
                  <tr>
                    <th class="clickable-header" onclick="toggleColumn('rank')">Rank </th>
                    <th class="clickable-header" onclick="toggleColumn('name')">Name </th>
                    <th class="clickable-header" onclick="toggleColumn('submitted-at')">Submitted At </th>
                    <th class="clickable-header" onclick="toggleColumn('time-spent')">Time Spent (mins) </th>
                    <th class="clickable-header" onclick="toggleColumn('physics')">Physics </th>
                    <th class="clickable-header" onclick="toggleColumn('chemistry')">Chemistry </th>
                    <th class="clickable-header" onclick="toggleColumn('mathematics')">Mathematics </th>
                    <th class="clickable-header" onclick="toggleColumn('total-marks')">Total Marks </th>
                    <th class="clickable-header" onclick="toggleColumn('delete')">Delete </th>
                  </tr>
                </thead>
                <tbody>
                  ${data.results.map((result, index) => {
                    const userEmail = result.email || result.userEmail || result.userId || 'N/A';
                    const deleteUrl = userEmail !== 'N/A' 
                      ? `https://5jcu22ihhuqkcummoqrf3rmuqq0ilvcp.lambda-url.ap-south-1.on.aws/?userId=${encodeURIComponent(userEmail)}&examId=${encodeURIComponent(examId)}`
                      : '#';
                    
                    return `
                    <tr>
                      <td class="rank">${index + 1}</td>
                      <td class="name">${result.name}</td>
                      <td class="submitted-at">${new Date(result.submittedAt).toLocaleString()}</td>
                      <td class="time-spent">${result.timeSpent}</td>
                      <td class="physics">${result.subjectResults.Physics ? `${result.subjectResults.Physics.totalMarks} (${result.subjectResults.Physics.correct}/${parseInt(result.subjectResults.Physics.correct) + parseInt(result.subjectResults.Physics.incorrect)})` : 'N/A'}</td>
                      <td class="chemistry">${result.subjectResults.Chemistry ? `${result.subjectResults.Chemistry.totalMarks} (${result.subjectResults.Chemistry.correct}/${parseInt(result.subjectResults.Chemistry.correct) + parseInt(result.subjectResults.Chemistry.incorrect)})` : 'N/A'}</td>
                      <td class="mathematics">${result.subjectResults.Mathematics ? `${result.subjectResults.Mathematics.totalMarks} (${result.subjectResults.Mathematics.correct}/${parseInt(result.subjectResults.Mathematics.correct) + parseInt(result.subjectResults.Mathematics.incorrect)})` : 'N/A'}</td>
                      <td class="total-marks">${result.totalMarks}</td>
                      <td class="delete" style="text-align: center;">
                        ${userEmail !== 'N/A' 
                          ? `<a href="${deleteUrl}" target="_blank" style="color: #dc3545; text-decoration: none; font-size: 16px;" onclick="return confirm('Are you sure you want to delete the exam result for ${userEmail}?')" title="Delete exam result for ${userEmail}">🗑️</a>`
                          : '<span style="color: #ccc;">—</span>'
                        }
                      </td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <script>
                ${examResultsScript}
              </script>
            </body>
          </html>
        `);
        resultsWindow.document.close();
      }
    } catch (error) {
      console.error("Error fetching exam results:", error);
      alert("Failed to fetch exam results. Please try again.");
    } finally {
      setLoadingResults(false);
    }
  };

  const downloadExamResults = async (examId, examName) => {
    try {
      setLoadingResults(true);
      const response = await fetch('https://7tklqol24ryrcbizyb3zccrhou0hiudz.lambda-url.ap-south-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify({
          examId: examId
        })
      });
      
      const data = await response.json();
      
      // Prepare data for Excel export
      const excelData = data.results.map((result, index) => ({
        'Rank': index + 1,
        'Name': result.name,
        'Submitted At': new Date(result.submittedAt).toLocaleString(),
        'Time Spent (mins)': result.timeSpent,
        'Physics Score': result.subjectResults.Physics ? `${result.subjectResults.Physics.totalMarks} (${result.subjectResults.Physics.correct}/${parseInt(result.subjectResults.Physics.correct) + parseInt(result.subjectResults.Physics.incorrect)})` : 'N/A',
        'Chemistry Score': result.subjectResults.Chemistry ? `${result.subjectResults.Chemistry.totalMarks} (${result.subjectResults.Chemistry.correct}/${parseInt(result.subjectResults.Chemistry.correct) + parseInt(result.subjectResults.Chemistry.incorrect)})` : 'N/A',
        'Mathematics Score': result.subjectResults.Mathematics ? `${result.subjectResults.Mathematics.totalMarks} (${result.subjectResults.Mathematics.correct}/${parseInt(result.subjectResults.Mathematics.correct) + parseInt(result.subjectResults.Mathematics.incorrect)})` : 'N/A',
        'Total Marks': result.totalMarks,
        'Email': result.email || result.userEmail || result.userId || 'N/A'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');
      
      // Generate Excel file and trigger download
      const fileName = `${examName || examId}_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error("Error downloading exam results:", error);
      alert("Failed to download exam results. Please try again.");
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <ExamPageContainer>
      {isAdmin && (
        <ExamFormContainer>
          <ExamFormTitle>
            Add New Exam
          </ExamFormTitle>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormField>
                <FormLabel>
                  Exam Name
                  <FormInput
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
              <FormField>
                <FormLabel>
                  Batch
                  <FormSelect
                    value={formData.batch}
                    onChange={(e) =>
                      setFormData({ ...formData, batch: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </FormSelect>
                </FormLabel>
              </FormField>
              <SectionsContainer>
                <FormLabel>
                  Sections
                </FormLabel>
                <SectionsGrid>
                  {subjects.map((section) => (
                    <SectionCheckbox
                      key={section.id}
                    >
                      <CheckboxInput
                        type="checkbox"
                        checked={selectedSections.includes(section.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSections([
                              ...selectedSections,
                              section.id,
                            ]);
                          } else {
                            setSelectedSections(
                              selectedSections.filter(
                                (id) => id !== section.id,
                              ),
                            );
                          }
                        }}
                      />
                      {section.name}
                    </SectionCheckbox>
                  ))}
                </SectionsGrid>
              </SectionsContainer>
              <FormField>
                <FormLabel>
                  Date
                  <FormInput
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
              <FormField>
                <FormLabel>
                  Time
                  <FormInput
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
              <FormField>
                <FormLabel>
                  Duration (minutes)
                  <FormInput
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
              <FormField>
                <FormLabel>
                  Total Marks
                  <FormInput
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
              <FormField>
                <FormLabel>
                  Location
                  <FormInput
                    type="text"
                    value={formData.videoKey}
                    onChange={(e) =>
                      setFormData({ ...formData, videoKey: e.target.value })
                    }
                    required
                  />
                </FormLabel>
              </FormField>
            </FormGrid>
            <BlueButton type="submit">
              Add Exam
            </BlueButton>
          </form>
        </ExamFormContainer>
      )}

      <ExamFormContainer>
        <ExamsHeader>
          <ExamsTitle>
            Upcoming Exams
          </ExamsTitle>
          <div>
            <FilterContainer>
              Filter by date:
            </FilterContainer>
            <FilterSelect
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Exams</option>
              <option value="prevWeek">Previous Week</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </FilterSelect>
          </div>
        </ExamsHeader>
        {loading ? (
          <Loading>
            Loading exams...
          </Loading>
        ) : filteredExams.length === 0 ? (
          <NoExams>
            No exams found for selected date filter
          </NoExams>
        ) : (
          <ExamsTableContainer>
            <ExamsTable>
              <thead>
                <TableHeader>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Total Marks</th>
                  {isAdmin && <th>Actions</th>}
                  {!isAdmin && <th>Action</th>}
                </TableHeader>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <ClickableCell onClick={() => handleStartExam(exam)}>
                      {exam.name}
                      {submittedExams.includes(exam.id) && (
                        <SubmittedBadge>
                          Submitted
                        </SubmittedBadge>
                      )}
                    </ClickableCell>
                    <td>
                      {exam.sections
                        ?.map(
                          (sectionId) =>
                            subjects.find((s) => s.id === sectionId)?.name,
                        )
                        .join(", ")}
                    </td>
                    <td>{exam.date}</td>
                    <td>{exam.time}</td>
                    <td>{exam.duration} mins</td>
                    <td>{exam.totalMarks}</td>
                    {isAdmin && (
                      <td>
                        <ActionButtonContainer>
                          <DeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exam.id);
                            }}
                            title="Delete Exam"
                          >
                            <MdDelete size={16} />
                          </DeleteButton>
                          <ViewResultsButton
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchExamResults(exam.id);
                            }}
                            disabled={loadingResults}
                            title="View Results"
                          >
                            <MdAssessment size={16} />
                          </ViewResultsButton>
                          <DownloadButton
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadExamResults(exam.id, exam.name);
                            }}
                            disabled={loadingResults}
                            title="Download Excel"
                          >
                            <MdDownload size={16} />
                          </DownloadButton>
                        </ActionButtonContainer>
                      </td>
                    )}
                    {!isAdmin && (
                      <td>
                        <ApplyButtonContainer>
                          {applications[exam.id]?.status === "review" ? (
                            <ReviewedButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplicationToggle(exam.id);
                              }}
                            >
                              Reviewed
                            </ReviewedButton>
                          ) : applications[exam.id]?.status === "applied" ? (
                            <ReviewButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplicationToggle(exam.id);
                              }}
                            >
                              Review
                            </ReviewButton>
                          ) : (
                            <AppliedButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplicationToggle(exam.id);
                              }}
                            >
                              Apply
                            </AppliedButton>
                          )}
                        </ApplyButtonContainer>
                      </td>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </ExamsTable>
          </ExamsTableContainer>
        )}
      </ExamFormContainer>
    </ExamPageContainer>
  );
}

export default ExamPage;
