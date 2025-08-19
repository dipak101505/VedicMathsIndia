import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/config";
import TwitchStream from "../components/TwitchStream";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import CustomYouTubePlayer from "../components/CustomYoutubePlayer";
import toast from "react-hot-toast";



function MeetingsPage() {
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [centres, setCentres] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [currentStreamData, setCurrentStreamData] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batch: "",
    subject: "",
    centres: [],
    topic: "",
    subtopic: "",
    startTime: new Date(),
  });
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const uploadRef = useRef(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);


    // Call the cloud function to generate Jitsi Meet link
  const generateMeetLink = async (batch = "Batch1", subject = "VedicMaths", topic = "LiveSession") => {
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('User authenticated:', user.email);
      const generateMeetLinkFunction = httpsCallable(functions, 'generateMeetLink');
      const result = await generateMeetLinkFunction({ batch, subject, topic });
      return result.data.meetLink;
    } catch (error) {
      console.error('Error generating Meet link:', error);
      toast.error('Failed to generate Meet link. Please try again.');
      throw error;
    }
  };

  // Function to fetch meeting transcript
  const fetchTranscript = async (roomName) => {
    try {
      setTranscriptLoading(true);
      const getMeetingTranscriptFunction = httpsCallable(functions, 'getMeetingTranscript');
      const result = await getMeetingTranscriptFunction({ roomName });
      setTranscriptData(result.data);
      setShowTranscript(true);
      toast.success('Transcript retrieved successfully!');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to fetch transcript. Please try again.');
    } finally {
      setTranscriptLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        logout();
        navigate("/login");
        return;
      }

      // Check if user is admin (email ends with zenithadmin.com)
      const isAdminUser = user.email.endsWith("@zenithadmin.com") ;
      setIsAdmin(isAdminUser);

      if (!isAdminUser) {
        // Fetch student data
        const studentQuery = query(
          collection(db, "students"),
          where("email", "==", user.email),
        );
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
          setStudentData(studentSnapshot.docs[0].data());
        }
      }

      // Fetch current stream
      const streamQuery = query(
        collection(db, "streams"),
        where("status", "==", "active"),
      );
      const streamSnapshot = await getDocs(streamQuery);
      if (!streamSnapshot.empty) {
        const streamDoc = streamSnapshot.docs[0];
        setCurrentStreamId(streamDoc.id);
        setCurrentStreamData(streamDoc.data());
      }

      // Only fetch form data if user is admin
      if (isAdminUser) {
        fetchData();
      }
    };

    checkAccess();
  }, [user, navigate]);

  const handleStreamToggle = async () => {
    if (!currentStreamId) {
      try {
        // Generate a new Jitsi Meet link with batch, subject, and topic
        const generateMeetLinkFunction = httpsCallable(functions, 'generateMeetLink');
        const result = await generateMeetLinkFunction({
          batch: formData.batch || "Batch1",
          subject: formData.subject || "VedicMaths",
          topic: formData.topic || "LiveSession"
        });
        
        // Start streaming - create document with the new link and room info
        const streamData = {
          ...formData,
          gmeetLink: result.data.meetLink,
          roomName: result.data.roomName,
          recordingEnabled: result.data.recordingEnabled,
          transcriptionEnabled: result.data.transcriptionEnabled,
          centres: formData.centres, // Ensure centres are included
          batch: formData.batch, // Ensure batch is included
          subject: formData.subject, // Ensure subject is included
          topic: formData.topic, // Ensure topic is included
          startTime: new Date(),
          status: "active",
        };

        const streamDoc = await addDoc(collection(db, "streams"), streamData);
        setCurrentStreamId(streamDoc.id);
        setCurrentStreamData(streamData);
        
        toast.success('Stream started with Meet - free unlimited meeting!');
      } catch (error) {
        console.error("Error starting stream:", error);
        toast.error('Failed to start stream. Please try again.');
      }
    } else {
      try {
        // Stop streaming - delete document and clear chat
        await deleteDoc(doc(db, "streams", currentStreamId));
        // await Chat.clearMessages(); // Clear all chat messages
        setCurrentStreamId(null);
        setCurrentStreamData(null);
        setShowUpload(true);
        toast.success('Stream stopped successfully!');
      } catch (error) {
        console.error("Error stopping stream:", error);
        toast.error('Failed to stop stream.');
      }
    }
  };

  // Function to check if student has access to stream
  const canViewStream = () => {
    debugger;
    if (!studentData || !currentStreamData) return false;
    
    console.log('Student Data:', studentData);
    console.log('Current Stream Data:', currentStreamData);
    
    // Check batch match - handle missing batch data
    let hasMatchingBatch = true; // Default to true if no batch data
    if (studentData.batch && currentStreamData.batch) {
      hasMatchingBatch = studentData.batch.includes(currentStreamData.batch);
    }
    
    // Check centre match - handle missing centres data
    let hasMatchingCentre = true; // Default to true if no centres data
    if (currentStreamData.centres && currentStreamData.centres.length > 0) {
      hasMatchingCentre = 
        currentStreamData.centres.includes("All") ||
        (studentData.centres && studentData.centres.some((centre) =>
          currentStreamData.centres.includes(centre)
        ));
    }
    
    // Check subject match - handle missing subject data
    let hasMatchingSubject = true; // Default to true if no subject data
    if (studentData.subjects && currentStreamData.subject) {
      hasMatchingSubject = studentData.subjects.includes(currentStreamData.subject);
    }
    
    console.log('Access Check:', {
      hasMatchingBatch,
      hasMatchingCentre,
      hasMatchingSubject,
      studentBatch: studentData.batch,
      streamBatch: currentStreamData.batch,
      studentCentres: studentData.centres,
      streamCentres: currentStreamData.centres,
      studentSubjects: studentData.subjects,
      streamSubject: currentStreamData.subject
    });
    
    return hasMatchingBatch && hasMatchingCentre && hasMatchingSubject;
  };

  const fetchData = async () => {
    try {
      // Fetch batches
      const batchesSnapshot = await getDocs(collection(db, "batches"));
      setBatches(
        batchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      // Fetch subjects
      const subjectsSnapshot = await getDocs(collection(db, "subjects"));
      setSubjects(
        subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      // Fetch centres
      const centresSnapshot = await getDocs(collection(db, "centres"));
      setCentres(
        centresSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCentresChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      centres: selectedOptions,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadProgress(0);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      toast.error("Storage quota exceeded. Image uploads are temporarily disabled.", {
        duration: 5000,
          position: "bottom-center",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploadProgress(0);
    }
  };

  return (
    <div
      style={{
        paddingTop: "10px",
        padding: "32px",
        maxWidth: "1200px",
        margin: "10px auto",
        minHeight: "80vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "32px",
          gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr",
          alignItems: "start",
        }}
      >
        {isAdmin && (
          <div
            style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Batch *
                <select
                  value={
                    currentStreamData ? currentStreamData.batch : formData.batch
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: currentStreamId ? "not-allowed" : "pointer",
                  }}
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = "#ffa600";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.name}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Subject *
                <select
                  value={
                    currentStreamData
                      ? currentStreamData.subject
                      : formData.subject
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: currentStreamId ? "not-allowed" : "pointer",
                  }}
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = "#ffa600";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Topic *
                <input
                  type="text"
                  value={
                    currentStreamData ? currentStreamData.topic : formData.topic
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: currentStreamId ? "not-allowed" : "pointer",
                  }}
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = "#ffa600";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter topic for this class"
                />
              </label>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Subtopic *
                <input
                  type="text"
                  value={
                    currentStreamData
                      ? currentStreamData.subtopic
                      : formData.subtopic
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, subtopic: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: currentStreamId ? "not-allowed" : "pointer",
                  }}
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = "#ffa600";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter subtopic for this class"
                />
              </label>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Centre *
                <select
                  value={
                    currentStreamData
                      ? currentStreamData.centres[0]
                      : formData.centres[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, centres: [e.target.value] })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: currentStreamId ? "not-allowed" : "pointer",
                  }}
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = "#ffa600";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select Centre</option>
                  <option value="All">All Centres</option>
                  {centres.map((centre) => (
                    <option key={centre.id} value={centre.name}>
                      {centre.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Meeting Link *
                <input
                  type="text"
                  value={
                    currentStreamData
                      ? currentStreamData.gmeetLink
                      : "Link will be generated automatically"
                  }
                  readOnly
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    color: "#2d3748",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                    outline: "none",
                    cursor: "not-allowed",
                  }}
                  placeholder="Link will be generated automatically"
                />
              </label>
            </div>

            <button
              onClick={handleStreamToggle}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: currentStreamId ? "#dc2626" : "#ffa600",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              {currentStreamId ? "Stop Streaming" : "Start Streaming"}
            </button>

            {currentStreamId && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f0fff4",
                  borderRadius: "8px",
                  border: "1px solid #9ae6b4",
                  color: "#2f855a",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Stream is currently active
              </div>
            )}
          </div>
        )}

        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow:
              "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {currentStreamId ? (
            !isAdmin && !canViewStream() ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "#718096",
                  fontSize: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}
              >
                You don't have access to this stream. Please contact your
                administrator.
              </div>
            ) : (
              <>
                {!isAdmin && currentStreamData && canViewStream() && (
                  <div
                    style={{
                      marginBottom: "20px",
                      paddingTop: "0px",
                      padding: "16px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      border: "1px solid #bae6fd",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "20px",
                        color: "#0369a1",
                        marginBottom: "8px",
                      }}
                    >
                      Current Class: {currentStreamData.subject}
                    </h2>
                    {currentStreamData.topic && (
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#0284c7",
                          margin: "0",
                          paddingLeft: "2px",
                        }}
                      >
                        {currentStreamData.topic}: {currentStreamData.subtopic}
                      </p>
                    )}
                  </div>
                )}
                            {/* Jitsi Meeting Controls */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button
                onClick={() => window.open(currentStreamData.gmeetLink, "_blank")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ffa600",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  flex: 1,
                  minWidth: "150px",
                }}
              >
                🎥 Join Meeting
              </button>

              {/* {currentStreamData.roomName && (
                <button
                  onClick={() => fetchTranscript(currentStreamData.roomName)}
                  disabled={transcriptLoading}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: transcriptLoading ? "#cbd5e0" : "#4299e1",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: transcriptLoading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    flex: 1,
                    minWidth: "150px",
                  }}
                >
                  {transcriptLoading ? "Loading..." : "📝 Get Transcript"}
                </button>
              )} */}
            </div>

            {/* Meeting Instructions */}
            <div style={{
              padding: "12px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>📋 Meeting Instructions:</h4>
              <ul style={{ margin: "0", paddingLeft: "20px", color: "#0284c7", fontSize: "14px" }}>
                <li>🎤 <strong>Audio starts muted</strong> - Click microphone to unmute</li>
                <li>📹 <strong>Video is enabled</strong> - Click camera to turn off if needed</li>
                <li>🎬 <strong>Recording available</strong> - Click record button to save session</li>
                <li>📝 <strong>Live captions</strong> - Enable in settings for transcription</li>
                <li>🖥️ <strong>Screen sharing</strong> - Share your screen for presentations</li>
                <li>💬 <strong>Chat available</strong> - Send messages during meeting</li>
                <li>⏰ <strong>No time limits</strong> - Meetings can run as long as needed</li>
              </ul>
            </div>

            {/* Jitsi Benefits Notice */}
            {/* <div style={{
              padding: "12px",
              backgroundColor: "#e8f5e8",
              border: "1px solid #4caf50",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <p style={{ margin: 0, color: "#2e7d32", fontSize: "14px" }}>
                ✅ <strong>FREE unlimited meetings</strong> • No time limits • No participant limits • Built-in recording & transcription • Opens in new tab for better experience
              </p>
            </div> */}
                {/* <Chat /> */}
                
                {/* Transcript Modal */}
                {showTranscript && transcriptData && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000,
                    }}
                    onClick={() => setShowTranscript(false)}
                  >
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "32px",
                        borderRadius: "16px",
                        maxWidth: "80%",
                        maxHeight: "80%",
                        overflow: "auto",
                        position: "relative",
                        minWidth: "500px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 style={{ margin: 0, color: "#2d3748" }}>Meeting Transcript</h2>
                        <button
                          onClick={() => setShowTranscript(false)}
                          style={{
                            backgroundColor: "#f56565",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div style={{ marginBottom: "16px", padding: "16px", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
                        <h3 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>Room: {transcriptData.roomName}</h3>
                        <p style={{ margin: 0, color: "#0284c7" }}>{transcriptData.transcript.message}</p>
                      </div>
                      
                                        <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ color: "#4a5568", marginBottom: "12px" }}>How to Use Transcripts in Meet:</h4>
                    <ul style={{ color: "#718096", paddingLeft: "20px" }}>
                      {transcriptData.instructions.map((instruction, index) => (
                        <li key={index} style={{ marginBottom: "8px" }}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                      
                      {transcriptData.transcript.downloadUrl && (
                        <div style={{ textAlign: "center" }}>
                          <a
                            href={transcriptData.transcript.downloadUrl}
                            download
                            style={{
                              padding: "12px 24px",
                              backgroundColor: "#48bb78",
                              color: "white",
                              textDecoration: "none",
                              borderRadius: "8px",
                              display: "inline-block",
                            }}
                          >
                            Download Transcript
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "#718096",
                fontSize: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              {isAdmin
                ? "Start streaming to begin the class"
                : "The class has not started yet. Please refresh the page in 5 minutes."}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px", color: "#2d3748" }}>
            Upload Class Recording
          </h3>

          <div
            style={{
              border: "2px dashed #e0e0e0",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              marginBottom: "16px",
            }}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="video-upload"
            />
            <label htmlFor="video-upload" style={{ cursor: "pointer" }}>
              {!uploadFile ? (
                <>
                  <div style={{ marginBottom: "8px" }}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffa600"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div style={{ color: "#4a5568" }}>
                    Click to upload video recording
                  </div>
                </>
              ) : (
                <div style={{ color: "#4a5568" }}>
                  Selected: {uploadFile.name}
                </div>
              )}
            </label>
          </div>

          {uploadStatus === "uploading" && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  backgroundColor: "#edf2f7",
                  borderRadius: "2px",
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    backgroundColor: "#ffa600",
                    borderRadius: "2px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploadStatus === "uploading"}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor:
                !uploadFile || uploadStatus === "uploading"
                  ? "#cbd5e0"
                  : "#ffa600",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                !uploadFile || uploadStatus === "uploading"
                  ? "not-allowed"
                  : "pointer",
              fontSize: "15px",
            }}
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload Recording"}
          </button>

          {uploadStatus === "success" && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#f0fff4",
                color: "#2f855a",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              Upload successful!
            </div>
          )}

          {uploadStatus === "error" && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#fff5f5",
                color: "#e53e3e",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              Upload failed. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MeetingsPage;
