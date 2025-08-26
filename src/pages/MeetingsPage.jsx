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
import { theme } from "../styles/theme";
import {
  MainContainer,
  GridContainer,
  AdminPanel,
  FormSection,
  FormLabel,
  FormSelect,
  FormInput,
  StreamButton,
  StatusMessage,
  MainPanel,
  AccessDeniedMessage,
  ClassInfoPanel,
  ClassTitle,
  ClassSubtitle,
  MeetingControls,
  MeetingButton,
  InstructionsPanel,
  InstructionsTitle,
  InstructionsList,
  TranscriptModal,
  TranscriptContent,
  TranscriptHeader,
  TranscriptTitle,
  CloseButton,
  TranscriptInfo,
  TranscriptRoomTitle,
  TranscriptMessage,
  InstructionsSection,
  InstructionsSectionTitle,
  InstructionsSectionList,
  DownloadButton,
  UploadSection,
  UploadTitle,
  UploadArea,
  UploadIcon,
  UploadText,
  ProgressBar,
  ProgressFill,
  UploadButton,
  SuccessMessage,
  ErrorMessage,
  HiddenFileInput,
  FileUploadLabel,
} from "../styles/meetingsPage.styles";


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
    <MainContainer>
      <GridContainer isAdmin={isAdmin}>
        {isAdmin && (
          <AdminPanel>
            <FormSection>
              <FormLabel>
                Batch *
                <FormSelect
                  value={
                    currentStreamData ? currentStreamData.batch : formData.batch
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                  required
                  disabled={currentStreamId}
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.name}>
                      {batch.name}
                    </option>
                  ))}
                </FormSelect>
              </FormLabel>
            </FormSection>

            <FormSection>
              <FormLabel>
                Subject *
                <FormSelect
                  value={
                    currentStreamData
                      ? currentStreamData.subject
                      : formData.subject
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </FormSelect>
              </FormLabel>
            </FormSection>

            <FormSection>
              <FormLabel>
                Topic *
                <FormInput
                  type="text"
                  value={
                    currentStreamData ? currentStreamData.topic : formData.topic
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  required
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter topic for this class"
                />
              </FormLabel>
            </FormSection>

            <FormSection>
              <FormLabel>
                Subtopic *
                <FormInput
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
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter subtopic for this class"
                />
              </FormLabel>
            </FormSection>

            <FormSection>
              <FormLabel>
                Centre *
                <FormSelect
                  value={
                    currentStreamData
                      ? currentStreamData.centres[0]
                      : formData.centres[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, centres: [e.target.value] })
                  }
                  required
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
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
                </FormSelect>
              </FormLabel>
            </FormSection>

            <FormSection>
              <FormLabel>
                Meeting Link *
                <FormInput
                  type="text"
                  value={
                    currentStreamData
                      ? currentStreamData.gmeetLink
                      : "Link will be generated automatically"
                  }
                  readOnly
                  onFocus={(e) => {
                    if (!currentStreamId) {
                      e.target.style.borderColor = theme.colors.primary.main;
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(255, 166, 0, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.borderColor;
                    e.target.style.backgroundColor = theme.colors.inputBackground;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Link will be generated automatically"
                />
              </FormLabel>
            </FormSection>

            <StreamButton
              onClick={handleStreamToggle}
              isActive={!!currentStreamId}
            >
              {currentStreamId ? "Stop Streaming" : "Start Streaming"}
            </StreamButton>

            {currentStreamId && (
              <StatusMessage>
                Stream is currently active
              </StatusMessage>
            )}
          </AdminPanel>
        )}

        <MainPanel>
          {currentStreamId ? (
            !isAdmin && !canViewStream() ? (
              <AccessDeniedMessage>
                You don't have access to this stream. Please contact your
                administrator.
              </AccessDeniedMessage>
            ) : (
              <>
                {!isAdmin && currentStreamData && canViewStream() && (
                  <ClassInfoPanel>
                    <ClassTitle>
                      Current Class: {currentStreamData.subject}
                    </ClassTitle>
                    {currentStreamData.topic && (
                      <ClassSubtitle>
                        {currentStreamData.topic}: {currentStreamData.subtopic}
                      </ClassSubtitle>
                    )}
                  </ClassInfoPanel>
                )}
                            {/* Jitsi Meeting Controls */}
            <MeetingControls>
              <MeetingButton
                onClick={() => window.open(currentStreamData.gmeetLink, "_blank")}
              >
                🎥 Join Meeting
              </MeetingButton>

              {/* {currentStreamData.roomName && (
                <button
                  onClick={() => fetchTranscript(currentStreamData.roomName)}
                  disabled={transcriptLoading}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: transcriptLoading ? theme.colors.borderColor : theme.colors.info.main,
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
            </MeetingControls>

            {/* Meeting Instructions */}
            <InstructionsPanel>
              <InstructionsTitle>📋 Meeting Instructions:</InstructionsTitle>
              <InstructionsList>
                <li>🎤 <strong>Audio starts muted</strong> - Click microphone to unmute</li>
                <li>📹 <strong>Video is enabled</strong> - Click camera to turn off if needed</li>
                <li>🎬 <strong>Recording available</strong> - Click record button to save session</li>
                <li>📝 <strong>Live captions</strong> - Enable in settings for transcription</li>
                <li>🖥️ <strong>Screen sharing</strong> - Share your screen for presentations</li>
                <li>💬 <strong>Chat available</strong> - Send messages during meeting</li>
                <li>⏰ <strong>No time limits</strong> - Meetings can run as long as needed</li>
              </InstructionsList>
            </InstructionsPanel>

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
                  <TranscriptModal
                    onClick={() => setShowTranscript(false)}
                  >
                    <TranscriptContent
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TranscriptHeader>
                        <TranscriptTitle>Meeting Transcript</TranscriptTitle>
                        <CloseButton
                          onClick={() => setShowTranscript(false)}
                        >
                          ×
                        </CloseButton>
                      </TranscriptHeader>
                      
                      <TranscriptInfo>
                        <TranscriptRoomTitle>Room: {transcriptData.roomName}</TranscriptRoomTitle>
                        <TranscriptMessage>{transcriptData.transcript.message}</TranscriptMessage>
                      </TranscriptInfo>
                      
                                        <InstructionsSection>
                    <InstructionsSectionTitle>How to Use Transcripts in Meet:</InstructionsSectionTitle>
                    <InstructionsSectionList>
                      {transcriptData.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </InstructionsSectionList>
                  </InstructionsSection>
                      
                      {transcriptData.transcript.downloadUrl && (
                        <div style={{ textAlign: "center" }}>
                          <DownloadButton
                            href={transcriptData.transcript.downloadUrl}
                            download
                          >
                            Download Transcript
                          </DownloadButton>
                        </div>
                      )}
                    </TranscriptContent>
                  </TranscriptModal>
                )}
              </>
            )
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: theme.colors.text.secondary,
                fontSize: "16px",
                backgroundColor: theme.colors.background.light,
                borderRadius: "8px",
                border: `1px solid ${theme.colors.borderColor}`,
              }}
            >
              {isAdmin
                ? "Start streaming to begin the class"
                : "The class has not started yet. Please refresh the page in 5 minutes."}
            </div>
          )}
        </MainPanel>
      </GridContainer>

      {showUpload && (
        <UploadSection>
          <UploadTitle>
            Upload Class Recording
          </UploadTitle>

          <UploadArea>
            <HiddenFileInput
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              id="video-upload"
            />
            <FileUploadLabel htmlFor="video-upload">
              {!uploadFile ? (
                <>
                  <UploadIcon
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </UploadIcon>
                  <UploadText>Click to upload video recording</UploadText>
                </>
              ) : (
                <UploadText>Selected: {uploadFile.name}</UploadText>
              )}
            </FileUploadLabel>
          </UploadArea>

          {uploadStatus === "uploading" && (
            <ProgressBar>
              <ProgressFill progress={uploadProgress} />
            </ProgressBar>
          )}

          <UploadButton
            onClick={handleUpload}
            disabled={!uploadFile || uploadStatus === "uploading"}
            hasFile={!!uploadFile}
            isUploading={uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload Recording"}
          </UploadButton>

          {uploadStatus === "success" && (
            <SuccessMessage>
              Upload successful!
            </SuccessMessage>
          )}

          {uploadStatus === "error" && (
            <ErrorMessage>
              Upload failed. Please try again.
            </ErrorMessage>
          )}
        </UploadSection>
      )}
    </MainContainer>
  );
}

export default MeetingsPage;
