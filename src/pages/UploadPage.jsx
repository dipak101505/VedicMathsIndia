import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase/config";
import { getTopics, addTopic } from "../services/questionService";
import {
  UploadPageContainer,
  HeaderSection,
  PageTitle,
  PageSubtitle,
  FormContainer,
  FormGrid,
  FormField,
  FormLabel,
  StyledSelect,
  StyledInput,
  TopicSearchContainer,
  TopicDropdown,
  TopicOption,
  AddTopicOption,
  FileUploadArea,
  FileUploadInput,
  FileUploadLabel,
  UploadIcon,
  UploadText,
  UploadSubtext,
  FileInfo,
  FileName,
  RemoveFileButton,
  ErrorMessage,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressInfo,
  CancelUploadButton,
  SubmitButton,
  SuccessMessage,
  ErrorStatusMessage,
  FileIcon,
  UploadIconSvg,
  ErrorIcon,
} from "../styles/uploadPage.styles";

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    batch: "",
    subject: "",
    topic: "",
    subtopic: "",
    videoKey: "",
  });
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [topicSearch, setTopicSearch] = useState("");
  const uploadRef = useRef(null);
  const lastUploadedRef = useRef(0);
  const timeRef = useRef(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesSnapshot = await getDocs(collection(db, "batches"));
        const subjectsSnapshot = await getDocs(collection(db, "subjects"));

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
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (formData.batch && formData.subject) {
        try {
          const topics = await getTopics();
      
          setTopics(topics.map((topic) => topic.topicName));
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      }
    };

    fetchTopics();
  }, [formData.batch, formData.subject]);

  if (!user) {
    return (
      <UploadPageContainer>
        <p>Please log in to upload files</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </UploadPageContainer>
    );
  }

  const MAX_FILE_SIZE = 2000 * 1024 * 1024; // 2000MB

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(topicSearch.toLowerCase()),
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPDF = selectedFile.type === "application/pdf";
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isPDF && !isVideo) {
      setFileError("Please upload a file or PDF file");
      setFile(null);
      return;
    }

    if (isPDF && selectedFile.size > 5 * 1024 * 1024) {
      // 50MB limit for PDFs
      setFileError("PDF file size must be less than 5MB");
      setFile(null);
      return;
    }

    if (isVideo && selectedFile.size > MAX_FILE_SIZE) {
      // 600MB limit for videos
      setFileError("Video file size must be less than 2GB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);
    setUploadSpeed(0);
    setTimeRemaining(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear topic-related fields when batch or subject changes
      ...(name === "batch" || name === "subject"
        ? { topic: "", newTopic: "" }
        : {}),
    }));
  };

  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      setUploadStatus("cancelled");
      setUploadProgress(0);
      setUploadSpeed(0);
      setTimeRemaining(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the effective topic (either selected topic or new topic)
    const effectiveTopic =
      formData.topic === "new" ? formData.newTopic : formData.topic;

    if (!file || !formData.batch || !formData.subject || !effectiveTopic) {
      alert("Please fill all required fields");
      return;
    }
    if (formData.topic === "new") await addTopic(effectiveTopic);
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      const fileName = `${formData.batch}_${formData.subject}_${effectiveTopic}_${formData.subtopic || "untitled"}`;

      if (file.type === "application/pdf") {
        // Upload PDF to Firebase Storage
        const storageRef = ref(storage, `pdfs/${fileName}.pdf`);

        // Create upload task with uploadBytesResumable
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error("Upload error:", error);
            setUploadStatus("error");
            setUploadProgress(0);
            alert("Upload failed: " + error.message);
          },
          async () => {
            // Upload completed successfully
            setUploadStatus("completed");
            setUploadProgress(100);
            setTimeout(() => {
              navigate("/videos");
            }, 1000);
          },
        );
      } else {
        // Video Upload using Bunny Stream (existing code)
        const createResponse = await fetch(
          `https://video.bunnycdn.com/library/359657/videos`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              AccessKey: "a12e0bb1-1753-422b-8592a11c9c61-605b-46a8",
            },
            body: JSON.stringify({ title: fileName }),
          },
        );

        if (!createResponse.ok) throw new Error("Failed to create video");
        const { guid } = await createResponse.json();

        try {
          const response = await fetch('https://keqruwgbe4a2ruqiwqmahuxcba0pgkbd.lambda-url.ap-south-1.on.aws/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Include authorization if needed
              // 'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify({
              videoCode: formData.videoKey,  // Replace with dynamic value
              bunnyVideoCode: guid,  // Replace with dynamic value
              videoPath: fileName,  // Replace with dynamic value
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.text();  // Use .text() since it returns HTML directly
        } catch (err) {
          console.error('Error calling Lambda function:', err);
        }

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          uploadRef.current = xhr;

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress(Math.round(percentComplete));

              // Calculate upload speed
              const currentTime = Date.now();
              const timeElapsed = (currentTime - timeRef.current) / 1000;
              const bytesPerSecond =
                (event.loaded - lastUploadedRef.current) / timeElapsed;
              setUploadSpeed(bytesPerSecond);

              // Calculate time remaining
              const remainingBytes = event.total - event.loaded;
              const remainingTime = remainingBytes / bytesPerSecond;
              setTimeRemaining(remainingTime);

              timeRef.current = currentTime;
              lastUploadedRef.current = event.loaded;
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadStatus("success");
              resolve();
              window.location.reload();
            } else {
              setUploadStatus("error");
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            setUploadStatus("error");
            reject(new Error("Upload failed"));
          };

          xhr.onabort = () => {
            setUploadStatus("cancelled");
            reject(new Error("Upload cancelled"));
          };

          xhr.open(
            "PUT",
            `https://video.bunnycdn.com/library/359657/videos/${guid}`,
          );
          xhr.setRequestHeader(
            "AccessKey",
            "a12e0bb1-1753-422b-8592a11c9c61-605b-46a8",
          );
          xhr.send(file);
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploadProgress(0);
      alert("Upload failed: " + error.message);
    }
  };

  return (
    <UploadPageContainer>
      <HeaderSection>
        <PageTitle>Upload File</PageTitle>
        <PageSubtitle>Upload educational content for your students</PageSubtitle>
      </HeaderSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            {/* Batch Selection */}
            <FormField>
              <FormLabel>Batch *</FormLabel>
              <StyledSelect
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </StyledSelect>
            </FormField>

            {/* Subject Selection */}
            <FormField>
              <FormLabel>Subject *</FormLabel>
              <StyledSelect
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </StyledSelect>
            </FormField>
          </FormGrid>

          {/* Topic Selection */}
          <TopicSearchContainer>
            <FormLabel>Topic *</FormLabel>
            <StyledInput
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search or select topic"
            />
            <TopicDropdown show={topicSearch}>
              {filteredTopics.map((topic) => (
                <TopicOption
                  key={topic}
                  selected={formData.topic === topic}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, topic }));
                    setTopicSearch(topic);
                  }}
                >
                  {topic}
                </TopicOption>
              ))}
              <AddTopicOption
                onClick={() => {
                  setFormData((prev) => ({ ...prev, topic: "new" }));
                  setTopicSearch("");
                }}
              >
                + Add New Topic
              </AddTopicOption>
            </TopicDropdown>
          </TopicSearchContainer>

          {/* New Topic Input */}
          {formData.topic === "new" && (
            <FormField>
              <FormLabel>New Topic Name *</FormLabel>
              <StyledInput
                type="text"
                name="newTopic"
                value={formData.newTopic}
                onChange={handleInputChange}
                required
                placeholder="Enter new topic name"
              />
            </FormField>
          )}

          {/* Subtopic Input */}
          <FormField>
            <FormLabel>File Title (optional)</FormLabel>
            <StyledInput
              type="text"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleInputChange}
              placeholder="Enter subtopic name"
            />
          </FormField>

          {/* Video Key */}
          <FormField>
            <FormLabel>Video ID</FormLabel>
            <StyledInput
              type="text"
              name="videoKey"
              value={formData.videoKey}
              onChange={handleInputChange}
              placeholder="Enter youtube video id"
            />
          </FormField>

          {/* File Upload */}
          <FormField>
            <FormLabel>File * {file && <span>({formatFileSize(file.size)})</span>}</FormLabel>
            <FileUploadArea
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile)
                  handleFileChange({ target: { files: [droppedFile] } });
              }}
            >
              <FileUploadInput
                type="file"
                accept="video/*,.pdf"
                onChange={handleFileChange}
                id="video-upload"
              />
              <FileUploadLabel htmlFor="video-upload">
                {!file ? (
                  <>
                    <UploadIcon>
                      <UploadIconSvg viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </UploadIconSvg>
                    </UploadIcon>
                    <UploadText>Drag and drop your video or PDF here or click to browse</UploadText>
                    <UploadSubtext>Maximum file size: 2GB for videos, 5MB for PDFs</UploadSubtext>
                  </>
                ) : (
                  <FileInfo>
                    <FileName>
                      {file.type === "application/pdf" ? (
                        <FileIcon fileType="pdf" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </FileIcon>
                      ) : (
                        <FileIcon fileType="video" viewBox="0 0 24 24" fill="none">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect
                            x="1"
                            y="5"
                            width="15"
                            height="14"
                            rx="2"
                            ry="2"
                          ></rect>
                        </FileIcon>
                      )}
                      {file.name}
                    </FileName>
                    <RemoveFileButton
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        document.getElementById("video-upload").value = "";
                      }}
                    >
                      Remove File
                    </RemoveFileButton>
                  </FileInfo>
                )}
              </FileUploadLabel>
            </FileUploadArea>
            {fileError && (
              <ErrorMessage>
                <ErrorIcon viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </ErrorIcon>
                {fileError}
              </ErrorMessage>
            )}
          </FormField>

          {/* Upload Progress */}
          {uploadStatus === "uploading" && (
            <ProgressContainer>
              <ProgressBar>
                <ProgressFill progress={uploadProgress} />
              </ProgressBar>
              <ProgressInfo>
                <div>{uploadProgress}%</div>
                <div>Speed: {formatFileSize(uploadSpeed)}/s</div>
                {timeRemaining && (
                  <div>Time remaining: {formatTime(timeRemaining)}</div>
                )}
              </ProgressInfo>
              <CancelUploadButton type="button" onClick={cancelUpload}>
                Cancel Upload
              </CancelUploadButton>
            </ProgressContainer>
          )}

          {/* Submit Button */}
          <SubmitButton
            type="submit"
            disabled={!file || uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading"
              ? "Uploading..."
              : `Upload ${file?.type === "application/pdf" ? "PDF" : "Video"}`}
          </SubmitButton>
        </form>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <SuccessMessage>
            Upload successful!
          </SuccessMessage>
        )}
        {uploadStatus === "error" && (
          <ErrorStatusMessage>
            Upload failed. Please try again.
          </ErrorStatusMessage>
        )}
        {uploadStatus === "cancelled" && (
          <ErrorStatusMessage>
            Upload cancelled
          </ErrorStatusMessage>
        )}
      </FormContainer>
    </UploadPageContainer>
  );
}

export default UploadPage;
