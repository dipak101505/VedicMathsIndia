import { useState, useEffect, useReducer, useMemo, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  getDoc,
  doc,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { AiFillFilePdf } from "react-icons/ai";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { ref, listAll, getMetadata, deleteObject } from "firebase/storage";
import { storage } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaClipboardList } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { getUserExamResults } from "../services/questionService";
import { getExams } from "../services/questionService";
import {
  storeVideoFiles,
  retrieveVideoFiles,
  getStudentByEmail,
} from "../services/studentService";
import { simulationService } from "../services/simulationService";
import { getLectureNotes } from "../services/lectureNotesService";
import Artplayer from "artplayer";
import Hls from "hls.js";
import {
  VideoListContainer,
  SearchFilterSection,
  SearchInput,
  LoadingContainer,
  ResponsiveWrapper,
  FileItemContainer,
  FileContentRow,
  FileIcon,
  FileLink,
  FileMetaContainer,
  FileActionContainer,
  FileActionButton,
  ContentWrapper,
  VideoSectionContainer,
  AdjacentContainer,
  AdjacentContent,
  TabContainer,
  Tab,
  TabIcon,
  SectionContainer,
  SectionHeader,
  SectionContent,
  SectionTitle,
  TopicTitle,
  ExpandIcon,
  SubjectSectionContainer,
  TopicSectionContainer,
  SimulationBadge,
  SearchResultText,
  ErrorContainer,
  LoadingText,
  Spinner
} from "../styles/components/videoList.styles";
import AdminSimulationForm from "../components/AdminSimulationForm";
import SimulationInterface from "../components/SimulationControls";
import { 
  VIDEO_CONFIG, 
  API_URLS, 
  TIME_CONSTANTS, 
  COLORS, 
  UI_CONSTANTS, 
  ROUTES 
} from "../config/constants";

// Simulation state reducer
const simulationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUBJECT':
      return { 
        ...state, 
        selectedSubject: action.payload, 
        selectedTopic: '', 
        selectedSimName: '',
        topicOptions: [],
        nameOptions: []
      };
    case 'SET_TOPIC':
      return { 
        ...state, 
        selectedTopic: action.payload, 
        selectedSimName: '',
        nameOptions: []
      };
    case 'SET_SIM_NAME':
      return { ...state, selectedSimName: action.payload };
    case 'SET_SIM_URL':
      return { ...state, simUrl: action.payload };
    case 'SET_SIM_NAME_INPUT':
      return { ...state, simName: action.payload };
    case 'SET_IFRAME_URL':
      return { ...state, iframeUrl: action.payload };
    case 'SET_SUBJECT_OPTIONS':
      return { ...state, subjectOptions: action.payload };
    case 'SET_TOPIC_OPTIONS':
      return { ...state, topicOptions: action.payload };
    case 'SET_NAME_OPTIONS':
      return { ...state, nameOptions: action.payload };
    case 'SET_TOPIC_SIMULATIONS':
      return { ...state, topicSimulations: action.payload };
    case 'SET_ACTIVE_SIMULATIONS':
      return { ...state, activeSimulations: action.payload };
    case 'TOGGLE_SIM_MODAL':
      return { ...state, showSimModal: !state.showSimModal };
    case 'SET_SIM_MODAL':
      return { ...state, showSimModal: action.payload };
    case 'RESET_SIMULATION_FORM':
      return { 
        ...state, 
        simName: '',
        simUrl: '',
        selectedSubject: '',
        selectedTopic: '',
        selectedSimName: ''
      };
    default:
      return state;
  }
};

// Initial simulation state
const initialSimulationState = {
  simName: "",
  simUrl: "",
  topicSimulations: {},
  showSimModal: false,
  activeSimulations: null,
  iframeUrl: API_URLS.VIGNAM_SIMULATION,
  subjectOptions: [],
  topicOptions: [],
  nameOptions: [],
  selectedSubject: "",
  selectedTopic: "",
  selectedSimName: ""
};

function VideoListPage() {
  const { user, isAdmin, isFranchise } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [studentData, setStudentData] = useState(null);
  const [accessibleFiles, setAccessibleFiles] = useState(new Set());
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  
  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);
  
  // Adjacent container state
  const [activeSection, setActiveSection] = useState("video-player");
  
  // Video player state for adjacent container
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lectureNotes, setLectureNotes] = useState(null);
  const [lectureImage, setLectureImage] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const artRef = useRef();
  
  // Consolidated simulation state using useReducer
  const [simulationState, dispatchSimulation] = useReducer(simulationReducer, initialSimulationState);
  const sortOrder = "asc";

  const navigate = useNavigate();

  useEffect(() => {
    if (user && isFranchise) {
      navigate(ROUTES.STUDENTS);
    }
  }, [user, isFranchise, navigate]);

  // Mobile detection effect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial mobile state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Get exam results from DynamoDB
        const results = await getUserExamResults(user.uid);

        // Transform DynamoDB response
        const transformedResults = results.map((result) => ({
          examId: result.SK.replace("EXAM#", ""),
          userId: result.userId,
          answers: result.answers,
          sections: result.sections,
          statistics: result.statistics,
          submittedAt: result.submittedAt,
          status: result.status,
        }));

        setExamResults(transformedResults);
      } catch (error) {
        console.error("Error fetching exam results:", error);
      }
    };
    if (user) {
      fetchExamData();
    }
  }, [user]);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || isAdmin || isFranchise) return;
      
      try {

        // const querySnapshot = await getDocs(q);

        let ddbstudents = await getStudentByEmail(user.email);
        if (ddbstudents.empty) {
          setError("Student not found");
          setLoading(false);
          return;
        }


        setStudentData({
          id: ddbstudents?.SK || 1,
          ...ddbstudents,
        });



        // If student is inactive, set error
        if (ddbstudents.status !== "active") {
          setError(
            "Your account is currently inactive. Please contact administrator.",
          );
          setLoading(false);
          return;
        }
        // Set student data
        const studentInfo = {
          id: ddbstudents?.SK || 1,
          ...ddbstudents,
        };
        setStudentData(studentInfo);
        // Then fetch exams for this student's batch
        const examSnapshot = await getExams();
        const examsData = examSnapshot.map((exam) => ({
          id: exam.id,
          name: exam.name,
          batch: exam.batch,
          subject: exam.subject,
          videoKey: exam.videoKey,
          createdBy: exam.createdBy,
        }));
        setExams(
          examsData.filter((exam) => studentInfo.batch.includes(exam.batch)),
        );
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to fetch student data");
      }
    };

    fetchStudentData();
  }, [user, isAdmin]);

  // Only fetch videos if student is active
  useEffect(() => {
    const fetchFiles = async () => {
      if (!isAdmin && (!studentData || studentData?.status !== "active")) {
        if (studentData !== null) setLoading(false);
        return;
      }

      try {
        let videoFiles = [];
        if (isAdmin) {
          // Fetch videos from Bunny Stream
          const videoResponse = await fetch(
            API_URLS.LAMBDA_URL,
          );

          if (!videoResponse.ok) {
            throw new Error(`HTTP error! status: ${videoResponse.status}`);
          }

          // Process video files
          const videoData = await videoResponse.json();
          videoFiles =
            videoData.items?.map((item) => {
              // Split title by underscores to get components
              const [batch, subject, topic, subtopic] = item.title.split("_");
              return {
                name: item.title,
                batch,
                subject,
                topic,
                subtopic,
                lastModified: item.dateUploaded,
                size: (item.storageSize / VIDEO_CONFIG.BYTES_TO_MB_DIVISOR).toFixed(VIDEO_CONFIG.PERCENTAGE_DECIMAL_PLACES),
                type: "video",
                bunnyVideoId: item.guid,
              };
            }) || [];

          // Store video files in DynamoDB
          await storeVideoFiles(videoFiles);
        } else {
          //retrieve it from the cache
          videoFiles = await retrieveVideoFiles();
        }

        // 2. Fetch PDFs from Firebase Storage
        const pdfListRef = ref(storage, "pdfs");
        const pdfList = await listAll(pdfListRef);
        let pdfFiles = await Promise.all(
          pdfList.items.map(async (item) => {
            const name = item.name;
            const nameParts = name.replace(".pdf", "").split("_");
            const [batch, subject, topic, subtopic] = nameParts;
            const metadata = await getMetadata(item);

            return {
              name: name,
              batch,
              subject,
              topic,
              subtopic,
              lastModified: new Date(metadata.timeCreated),
                              size: (metadata.size / VIDEO_CONFIG.BYTES_TO_MB_DIVISOR).toFixed(VIDEO_CONFIG.PERCENTAGE_DECIMAL_PLACES),
              type: "pdf",
            };
          }),
        );

        // Combine and filter files
        let allFiles = [...videoFiles, ...pdfFiles];

        if (!isAdmin && studentData) {
          allFiles = allFiles.filter((file) => {
            return (
              studentData.batch.includes(file.batch) &&
              studentData.subjects?.includes(file.subject)
            );
          });
        }

        setVideos(allFiles);
        setFilteredVideos(allFiles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isAdmin, studentData]);

  const handleDelete = async (file) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      if (file.type === "pdf") {
        // Delete from Firebase Storage
        const pdfRef = ref(storage, `pdfs/${file.name}`);
        await deleteObject(pdfRef);
      } else {
        // Delete from Bunny Stream
        const response = await fetch(
          `${API_URLS.BUNNY_CDN.BASE_URL}${file.bunnyVideoId}`,
          {
            method: "DELETE",
            headers: {
              AccessKey: API_URLS.BUNNY_CDN.ACCESS_KEY,
            },
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update UI
      setVideos((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      toast.success("File deleted successfully");
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file: " + err.message);
    }
  };

  const handleRemoveSimulation = async (SK, createdAt, name, url) => {
  
    try {
      // Call the removeSimulationLink method from simulationService
      const result = await simulationService.removeSimulationLink({
        SK,
        createdAt,
        name,
        simUrl: url,
      });
  
      if (result.success) {
        toast.success("Simulation removed successfully, reload the page!");
  
        // Update the UI by removing the simulation from the state
        const updatedSimulations = simulationState.topicSimulations[SK]?.filter(
            (sim) => sim.url !== url
          );
        dispatchSimulation({
          type: 'SET_TOPIC_SIMULATIONS',
          payload: {
            ...simulationState.topicSimulations,
            [SK]: updatedSimulations,
          }
        });
      } else {
        toast.error(result.message || "Failed to remove simulation.");
      }
    } catch (error) {
      console.error("Error removing simulation:", error);
      toast.error("Failed to remove simulation. Please try again.");
    }
  };

  const handleTest = useCallback(async (videoKey) => {
    navigate(ROUTES.EXAMS, {
      state: { videoKey: videoKey },
    });
  }, [navigate]);

  // Handle video selection for adjacent container or direct navigation
  const handleVideoSelect = useCallback(async (file) => {
    try {
      // On mobile, navigate directly to video player
      if (isMobile) {
        navigate(`/play/${file.bunnyVideoId}`);
        return;
      }

      // On desktop, use adjacent container
      setSelectedVideo(file);
      setActiveSection("video-player"); // Switch to video player tab
      setNotesLoading(true);
      setNotesError(null);
      setLectureNotes(null);
      setLectureImage(null);

      // Fetch lecture notes using the video ID
      const notes = await getLectureNotes(file.bunnyVideoId);
      
      if (notes?.imageBase64) {
        setLectureImage(notes.imageBase64);
      }
      setLectureNotes(notes);
    } catch (err) {
      console.error("Error fetching lecture data:", err);
      setNotesError(err.message);
    } finally {
      setNotesLoading(false);
    }
  }, [isMobile, navigate]);

  // Initialize Artplayer when video is selected
  useEffect(() => {
    if (selectedVideo && artRef.current) {
      // Destroy existing player if any
      if (artRef.current.art && artRef.current.art.destroy) {
        artRef.current.art.destroy(false);
      }

      // Function to handle HLS playback (from VideoPlayer.jsx)
      function playM3u8(video, url, art) {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on("destroy", () => hls.destroy());
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          art.notice.show = "HLS is not supported for this browser";
        }
      }

      const art = new Artplayer({
        container: artRef.current,
        url: `https://vz-d5d4ebc7-6d2.b-cdn.net/${selectedVideo.bunnyVideoId}/playlist.m3u8`,
        volume: 0.5,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: false, // Disable auto mini for embedded player
        screenshot: false,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: false, // Disable fullscreen web for embedded
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        theme: "#ff0000",
        preload: "metadata",
        videoAttribute: {
          preload: "metadata",
          "x-webkit-airplay": "allow",
          "webkit-playsinline": "true",
          playsinline: "true",
          "x-playsinline": "true",
        },
        customType: {
          m3u8: function (video, url) {
            if (Hls.isSupported()) {
              const hls = new Hls({
                maxBufferSize: 0,
                maxBufferLength: 5,
                maxMaxBufferLength: 10,
                liveDurationInfinity: false,
              });
              hls.loadSource(url);
              hls.attachMedia(video);
            }
          },
        },
      });

      // Store the art instance for cleanup
      artRef.current.art = art;

      return () => {
        if (art && art.destroy) {
          art.destroy(false);
        }
      };
    }
  }, [selectedVideo]);

  // Cleanup Artplayer on component unmount
  useEffect(() => {
    return () => {
      if (artRef.current?.art && artRef.current.art.destroy) {
        artRef.current.art.destroy(false);
      }
    };
  }, []);

  // Memoized function to organize videos into hierarchical structure based on user role
  const videoStructure = useMemo(() => {
    const structure = {};

    filteredVideos.forEach((file) => {
      const { batch, subject, topic, subtopic } = file;

      if (isAdmin) {
        // Admin view - show all levels including batch
        if (!structure[batch]) structure[batch] = {};
        if (!structure[batch][subject]) structure[batch][subject] = {};
        if (!structure[batch][subject][topic])
          structure[batch][subject][topic] = [];

        structure[batch][subject][topic].push({
          ...file,
          filename: subtopic || "untitled",
        });
      } else {
        // Student view - skip batch level
        if (!structure[subject]) structure[subject] = {};
        if (!structure[subject][topic]) structure[subject][topic] = [];

        structure[subject][topic].push({
          ...file,
          filename: subtopic || "untitled",
        });
      }
    });

    // Sort videos within each topic based on sortOrder
    const sortVideos = (videos) => {
      return videos.sort((a, b) => {
        const nameA = a.filename || a.name || "";
        const nameB = b.filename || b.name || "";
        
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    };

    // Apply sorting to all video arrays in the structure
    if (isAdmin) {
      Object.keys(structure).forEach(batch => {
        Object.keys(structure[batch]).forEach(subject => {
          Object.keys(structure[batch][subject]).forEach(topic => {
            structure[batch][subject][topic] = sortVideos(structure[batch][subject][topic]);
          });
        });
      });
    } else {
      Object.keys(structure).forEach(subject => {
        Object.keys(structure[subject]).forEach(topic => {
          structure[subject][topic] = sortVideos(structure[subject][topic]);
        });
      });
    }

    return structure;
  }, [filteredVideos, isAdmin, sortOrder]);

  const toggleSection = useCallback((path) => {
    setExpandedSections((prev) => {
      const pathParts = path.split('/');
      const newExpandedSections = { ...prev };
      
      // If section is currently expanded, just collapse it
      if (prev[path]) {
        newExpandedSections[path] = false;
        return newExpandedSections;
      }
      
      // Otherwise, expand this section and collapse others at the same level
      if (isAdmin) {
        // Admin view has batch/subject/topic hierarchy
        if (pathParts.length === 1) {
          // Batch level - collapse all other batches
          Object.keys(prev).forEach(key => {
            if (key.split('/').length === 1 && key !== path) {
              newExpandedSections[key] = false;
            }
          });
        } else if (pathParts.length === 2) {
          // Subject level - collapse other subjects in the same batch
          const batch = pathParts[0];
          Object.keys(prev).forEach(key => {
            const keyParts = key.split('/');
            if (keyParts.length === 2 && keyParts[0] === batch && key !== path) {
              newExpandedSections[key] = false;
            }
          });
        } else if (pathParts.length === 3) {
          // Topic level - collapse other topics in the same subject
          const batchSubject = `${pathParts[0]}/${pathParts[1]}`;
          Object.keys(prev).forEach(key => {
            const keyParts = key.split('/');
            if (keyParts.length === 3 && key.startsWith(batchSubject) && key !== path) {
              newExpandedSections[key] = false;
            }
          });
        }
      } else {
        // Student view has subject/topic hierarchy (no batch level)
        if (pathParts.length === 1) {
          // Subject level - collapse all other subjects
          Object.keys(prev).forEach(key => {
            if (key.split('/').length === 1 && key !== path) {
              newExpandedSections[key] = false;
            }
          });
        } else if (pathParts.length === 2) {
          // Topic level - collapse other topics in the same subject
          const subject = pathParts[0];
          Object.keys(prev).forEach(key => {
            const keyParts = key.split('/');
            if (keyParts.length === 2 && keyParts[0] === subject && key !== path) {
              newExpandedSections[key] = false;
            }
          });
        }
      }
      
      // Expand the clicked section
      newExpandedSections[path] = true;
      return newExpandedSections;
    });
  }, [isAdmin]);



  const checkVideoViewLimit = async (videoName, userEmail) => {
    try {
      const viewsRef = collection(db, "videoViews");
      const q = query(viewsRef, where("userEmail", "==", userEmail));
      const snapshot = await getDocs(q);

      // Filter views for this video in the last 7 days
      const now = new Date();
    const weekAgo = now.getTime() - TIME_CONSTANTS.WEEK_IN_MS;

      const recentViews = snapshot.docs
        .map((doc) => doc.data())
        .filter(
          (view) =>
            view.videoName === videoName && view.viewedAt.toMillis() > weekAgo,
        );

      return recentViews.length < VIDEO_CONFIG.MAX_VIEWS_PER_WEEK;
    } catch (error) {
      console.error("Error checking view limit:", error);
      return true; // Allow view on error
    }
  };

  // Fetch accessible files once
  useEffect(() => {
    const fetchAccessibleFiles = async (email) => {
      const docRef = doc(db, "VideoAccessGranted", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const filesArray = docSnap.data().files?.split("|||") || [];
        setAccessibleFiles(new Set(filesArray));
      } else {
        setAccessibleFiles(new Set());
      }
    };
    if (user?.email) {
      fetchAccessibleFiles(user.email);
    }
  }, [user]);

  const ExamTooltipContent = ({ exam, examResults }) => {
    const result = examResults.find((r) => r.examId === exam.id);
    return (
      <div className="tooltip-content">
        <div
          style={{
            fontWeight: 600,
            fontSize: "1.1rem",
            marginBottom: "0.5rem",
          }}
        >
          {exam.name}
        </div>
        {result && (
          <div className="text-xs">
            {Object.entries(result.answers).map(([section, data]) => (
              <div key={section} className="mt-1">
                <div
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    fontWeight: 500,
                    color: "#f97316",
                    paddingBottom: "2px",
                    marginBottom: "4px",
                  }}
                >
                  {section}
                </div>
                <div>Total Marks: {data.totalMarks}</div>
                <div>Accuracy: {((data.correct/data.attempted)*100).toFixed(VIDEO_CONFIG.PERCENTAGE_DECIMAL_PLACES)}%</div>
                <div>Prep level: {((data.correct/data.totalSectionQuestions)*100).toFixed(VIDEO_CONFIG.PERCENTAGE_DECIMAL_PLACES)}%</div>
                <div>Positive: {data.positiveMarks}</div>
                <div>Negative: {data.negativeMarks}</div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="font-medium">Statistics:</div>
              <div>
                Time Spent: {Math.floor(result.statistics.timeSpent / 60)}m{" "}
                {result.statistics.timeSpent % 60}s
              </div>
              <div>
                Questions Attempted: {result.statistics.questionsAttempted}
              </div>
              <div>
                Marked for Review: {result.statistics.questionsMarkedForReview}
              </div>
              <div className="text-gray-500 text-[10px] mt-1">
                Submitted: {new Date(result.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatVideoKey = (videoKey) => {
    //remove '_' "/" and "."
    const nameWithoutTimestamp = videoKey?.replace(/[_/.-]/g, "");
    return nameWithoutTimestamp;
  };

  const FileItem = ({ file, isAdmin, handleDelete, user, handleVideoSelect }) => {
    const isPdf = file.type === "pdf";
    const [isHovered, setIsHovered] = useState(false);
    const displayName = file.subtopic || "untitled";

    return (
      <FileItemContainer
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FileContentRow>
          <FileIcon>
            {isPdf ? (
              <AiFillFilePdf size={UI_CONSTANTS.ICON_SIZE} color={COLORS.PDF_ICON} />
            ) : (
              <BsFillPlayCircleFill size={UI_CONSTANTS.ICON_SIZE} color={COLORS.VIDEO_ICON} />
            )}
          </FileIcon>

          <FileLink
            to={
              isPdf
                ? `/pdf/${encodeURIComponent(file.name)}`
                : `/play/${file.bunnyVideoId}`
            }
            onClick={async (e) => {
              if (isPdf) {
                e.preventDefault();
                window.open(`/pdf/${encodeURIComponent(file.name)}`, "_blank");
                return;
              }

              e.preventDefault();
              const canView = await checkVideoViewLimit(file.name, user.email);
              if (!canView) {
                alert(
                  "You have reached the maximum views for this video this week.",
                );
                return;
              }

              await addDoc(collection(db, "videoViews"), {
                videoName: file.name,
                userEmail: user.email,
                viewedAt: Timestamp.now(),
              });

              // Load video in adjacent container instead of navigating
              await handleVideoSelect(file);
            }}
          >
            {displayName}
          </FileLink>
        </FileContentRow>
        <FileMetaContainer>
          {exams
            .filter((exam) =>
              formatVideoKey(file.name).includes(formatVideoKey(exam.videoKey)),
            )
            .sort((a, b) => new Date(a.date) > new Date(b.date))
            .map((exam) => (
              <div key={exam.id}>
                <Tooltip
                  anchorSelect={`.exam-icon-${exam.id.replace(/[^a-zA-Z0-9]/g, "-")}`}
                  place="top"
                >
                  <ExamTooltipContent exam={exam} examResults={examResults} />
                </Tooltip>
                <FaClipboardList
                  color={
                    examResults.some((result) => result.examId === exam.id)
                      ? "#d1d5db"
                      : "#f97316"
                  }
                  className={`
                    text-xl
                    ${
                      examResults.some((result) => result.examId === exam.id)
                        ? "text-gray-400"
                        : "text-gray-600 hover:text-orange-500 cursor-pointer"
                    }
                    exam-icon-${exam.id.replace(/[^a-zA-Z0-9]/g, "-")}
                  `}
                  onClick={() => {
                    if (
                      !examResults.some((result) => result.examId === exam.id)
                    ) {
                      navigate(`/exam-interface/${exam?.id}`);
                    }
                  }}
                />
              </div>
            ))}
        </FileMetaContainer>

        {isAdmin && (
          <FileActionContainer>
            {/* <FileMetaInfo isHovered={isHovered}>
              {file.size} MB | {new Date(file.lastModified).toLocaleString()}
            </FileMetaInfo> */}
            <FileActionButton
              variant="test"
              onClick={() => handleTest(file.name)}
              title="Add Test"
            >
              ➕
            </FileActionButton>
            <FileActionButton
              variant="delete"
              isHovered={isHovered}
              onClick={() => handleDelete(file)}
              title="Delete"
            >
              🗑️
            </FileActionButton>
          </FileActionContainer>
        )}
      </FileItemContainer>
    );
  };

  // Fetch simulation subjects on mount
  useEffect(() => {
    const fetchSimulationSubjects = async () => {
      try {
        const subjects = await simulationService.getSimulationSubjects();
        if (subjects && subjects.length > 0) {
          dispatchSimulation({ type: 'SET_SUBJECT_OPTIONS', payload: subjects });
        }
      } catch (error) {
        console.error("Error fetching simulation subjects:", error);
      }
    };
    
    fetchSimulationSubjects();
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopics = async () => {
          if (!simulationState.selectedSubject) {
      dispatchSimulation({ type: 'SET_TOPIC_OPTIONS', payload: [] });
        return;
      }
      
      try {
        const simulations = await simulationService.getSimulationLinksBySubject(simulationState.selectedSubject);
        if (simulations && simulations.length > 0) {
          // Extract unique topics from the simulations
          const uniqueTopics = [...new Set(simulations.map(sim => {
            // Extract topic from SK (assuming format is subject/topic)
            const parts = sim.SK.split('/');
            return parts.length > 1 ? parts[1] : '';
          }))].filter(Boolean);
          
          dispatchSimulation({ type: 'SET_TOPIC_OPTIONS', payload: uniqueTopics });
          dispatchSimulation({ type: 'SET_TOPIC_SIMULATIONS', payload: {
            ...simulationState.topicSimulations,
            [simulationState.selectedSubject]: simulations
          } });
        }
      } catch (error) {
        console.error("Error fetching topics for subject:", error);
      }
    };
    
    fetchTopics();
  }, [simulationState.selectedSubject]);

  // Update simulation names when topic changes
  useEffect(() => {
    if (!simulationState.selectedSubject || !simulationState.selectedTopic || !simulationState.topicSimulations[simulationState.selectedSubject]) {
      dispatchSimulation({ type: 'SET_NAME_OPTIONS', payload: [] });
      return;
    }
    
    const simulations = simulationState.topicSimulations[simulationState.selectedSubject].find(
      sim => sim.SK.includes(simulationState.selectedTopic)
    )?.simulations || [];
    
    dispatchSimulation({ type: 'SET_NAME_OPTIONS', payload: simulations.map(sim => ({
      name: sim.name,
      url: sim.url
    })) });
  }, [simulationState.selectedSubject, simulationState.selectedTopic, simulationState.topicSimulations]);

  // Update iframe URL when simulation name changes
  useEffect(() => {
    if (simulationState.selectedSimName) {
      const simulation = simulationState.nameOptions.find(option => option.name === simulationState.selectedSimName);
      if (simulation && simulation.url) {
        dispatchSimulation({ type: 'SET_IFRAME_URL', payload: simulation.url });
        // Only scroll to iframe when user explicitly chooses a simulation
        // Don't scroll when just selecting dropdowns
      }
    }
  }, [simulationState.selectedSimName, simulationState.nameOptions]);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <div>
          <LoadingText primary>
            Loading videos... Please wait
          </LoadingText>
          <LoadingText secondary>
            If this takes too long, please contact your administrator.
          </LoadingText>
        </div>
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorContainer>Error: {error}</ErrorContainer>;
  }

  if (!isAdmin && (!studentData || studentData.status !== "active")) {
    return (
      <ErrorContainer>
        Your account is currently inactive. Please contact administrator.
      </ErrorContainer>
    );
  }



  return (
    <ResponsiveWrapper>
      <VideoListContainer>
      <ContentWrapper>
      <VideoSectionContainer>
        <SearchFilterSection>
          <SearchInput
            type="text"
            placeholder="🔍 Search videos..."
            onChange={(e) => setFilteredVideos(videos.filter((video) => video.name.toLowerCase().includes(e.target.value.toLowerCase())))}
          />
          {videos?.length != filteredVideos?.length && (
            <SearchResultText>
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
            </SearchResultText>
          )}
        </SearchFilterSection>

        {isAdmin
          ? // Admin View - With Batch Level
            Object.entries(videoStructure).map(([batch, subjects]) => (
              <SectionContainer
                key={batch}
                className="batch-section"
              >
                <SectionHeader
                  level="batch"
                  onClick={() => toggleSection(batch)}
                >
                  <ExpandIcon expanded={expandedSections[batch]}>
                    ▶
                  </ExpandIcon>
                  {batch}
                </SectionHeader>

                {expandedSections[batch] && (
                  <SectionContent>
                    {Object.entries(subjects).map(([subject, topics]) => (
                      <SubjectSectionContainer key={subject}>
                        <SectionHeader
                          level="subject"
                          onClick={() => {
                            toggleSection(`${batch}/${subject}`);
                            simulationService
                              .getSimulationLinksBySubject(subject)
                              .then((res) => {
                                dispatchSimulation({
                                  type: 'SET_TOPIC_SIMULATIONS',
                                  payload: {
                                    ...simulationState.topicSimulations,
                                  [subject]: res,
                                  }
                                });
                              });
                          }}
                        >
                          <ExpandIcon expanded={expandedSections[`${batch}/${subject}`]}>
                            ▶
                          </ExpandIcon>
                          {subject}
                        </SectionHeader>

                        {expandedSections[`${batch}/${subject}`] && (
                          <SectionContent>
                            {Object.entries(topics).map(([topic, videos]) => (
                              <TopicSectionContainer key={topic}>
                                <SectionHeader
                                  level="topic"
                                  onClick={() =>
                                    toggleSection(
                                      `${batch}/${subject}/${topic}`,
                                    )
                                  }
                                >
                                  <ExpandIcon
                                    expanded={expandedSections[`${batch}/${subject}/${topic}`]}
                                  >
                                    ▶
                                  </ExpandIcon>
                                  <SectionTitle>
                                    <TopicTitle>
                                      {topic}
                                    </TopicTitle>
                                    {simulationState.topicSimulations[subject]
                                      ?.filter((sim) => sim.SK.includes(topic))
                                      .map((sim) => (
                                        <SimulationBadge
                                          key={sim.SK}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Show simulation options in a dropdown or modal
                                            dispatchSimulation({ 
                                              type: 'SET_ACTIVE_SIMULATIONS', 
                                              payload: sim 
                                            });
                                            dispatchSimulation({ type: 'SET_SIM_MODAL', payload: true });
                                          }}
                                        >
                                          <span>
                                            {sim.simulations?.length}{" "}
                                            Simulations
                                          </span>
                                        </SimulationBadge>
                                      ))}

                                    {/* Add this modal component */}
                                    {simulationState.showSimModal && (
                                      <div
                                        className="simulation-modal"
                                        style={{
                                          position: "fixed",
                                          top: "50%",
                                          left: "50%",
                                          transform: "translate(-50%, -50%)",
                                          backgroundColor: "white",
                                          padding: "24px",
                                          borderRadius: "12px",
                                          boxShadow:
                                            "0 4px 6px rgba(0, 0, 0, 0.1)",
                                          zIndex: 1000,
                                          minWidth: "300px",
                                        }}
                                      >
                                        <h3
                                          style={{
                                            marginBottom: "16px",
                                            fontSize: "18px",
                                          }}
                                        >
                                          Available Simulations
                                        </h3>
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                          }}
                                        >
                                          {simulationState.activeSimulations?.simulations?.map(
                                            (simulation) => (
                                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                              <button
                                                key={simulation.url}
                                                onClick={() => {
                                                  dispatchSimulation({ type: 'SET_IFRAME_URL', payload: simulation.url });
                                                  dispatchSimulation({ type: 'SET_SIM_MODAL', payload: false });
                                                  document
                                                    .getElementById("iframe")
                                                    .scrollIntoView({
                                                      behavior: "smooth",
                                                    });
                                                }}
                                                style={{
                                                  padding: "12px",
                                                  textAlign: "left",
                                                  backgroundColor: "#f8fafc",
                                                  border: "1px solid #e2e8f0",
                                                  borderRadius: "8px",
                                                  cursor: "pointer",
                                                  transition: "all 0.2s",
                                                  color: "#2d3748",
                                                  hoverBackgroundColor:
                                                    "#f1f5f9",
                                                }}
                                              >
                                                {simulation.name ||
                                                  "Simulation"}
                                              </button>
                                              {isAdmin && (
                                                <button
                                                  onClick={() =>{
                                                    handleRemoveSimulation(
                                                      simulationState.activeSimulations.SK,
                                                      simulation.createdAt,
                                                      simulation.name,
                                                      simulation.url
                                                    )
                                                  }
                                                  }
                                                  style={{
                                                    padding: "6px 6px",
                                                    backgroundColor: "#dc2626",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                    marginLeft: "16px",
                                                    width: "80px",
                                                  }}
                                                >
                                                  Remove
                                                </button>
                                              )}</div>
                                            ),
                                          )}
                                        </div>
                                        <button
                                          onClick={() => dispatchSimulation({ type: 'SET_SIM_MODAL', payload: false })}
                                          style={{
                                            marginTop: "16px",
                                            padding: "8px",
                                            backgroundColor: "#e2e8f0",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}

                                  </SectionTitle>
                                </SectionHeader>

                                {expandedSections[
                                  `${batch}/${subject}/${topic}`
                                ] && (
                                  <SectionContent level="topic">
                                    {videos.map((video) => (
                                      <FileItem
                                        key={video.name}
                                        file={video}
                                        isAdmin={isAdmin}
                                        handleDelete={handleDelete}
                                        user={user}
                                        handleVideoSelect={handleVideoSelect}
                                      />
                                    ))}
                                  </SectionContent>
                                )}
                              </TopicSectionContainer>
                            ))}
                          </SectionContent>
                        )}
                      </SubjectSectionContainer>
                    ))}
                  </SectionContent>
                )}
              </SectionContainer>
            ))
          : // Student View - Start from Subject Level
            Object.entries(videoStructure).map(([subject, topics]) => (
              <SectionContainer key={subject}>
                <SectionHeader
                  level="batch"
                  onClick={() => {
                    toggleSection(subject);
                    simulationService
                      .getSimulationLinksBySubject(subject)
                      .then((res) => {
                        dispatchSimulation({
                          type: 'SET_TOPIC_SIMULATIONS',
                          payload: {
                            ...simulationState.topicSimulations,
                          [subject]: res,
                          }
                        });
                      });
                  }}
                >
                  <ExpandIcon expanded={expandedSections[subject]}>
                    ▶
                  </ExpandIcon>
                  {subject}
                </SectionHeader>

                {expandedSections[subject] && (
                  <SectionContent>
                    {Object.entries(topics).map(([topic, videos]) => (
                      <TopicSectionContainer key={topic}>
                        <SectionHeader
                          level="topic"
                          onClick={() => toggleSection(`${subject}/${topic}`)}
                        >
                          <ExpandIcon expanded={expandedSections[`${subject}/${topic}`]}>
                            ▶
                          </ExpandIcon>
                          <SectionTitle>
                            <TopicTitle>
                              {topic}
                            </TopicTitle>
                            {simulationState.topicSimulations[subject]
                              ?.filter((sim) => sim.SK.includes(topic))
                              .map((sim) => (
                                <SimulationBadge
                                  key={sim.SK}
                                >
                                  <span>
                                    {sim.simulations?.length} Sim
                                  </span>
                                </SimulationBadge>
                              ))}

                            {/* Add this modal component */}
                            {simulationState.showSimModal && (
                              <div
                                className="simulation-modal"
                                style={{
                                  position: "fixed",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  backgroundColor: "white",
                                  padding: "24px",
                                  borderRadius: "12px",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  zIndex: 1000,
                                  minWidth: "300px",
                                }}
                              >
                                <h3
                                  style={{
                                    marginBottom: "16px",
                                    fontSize: "18px",
                                  }}
                                >
                                  Available Simulations
                                </h3>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                  }}
                                >
                                  {simulationState.activeSimulations?.simulations?.map((simulation) => (
                                    <button
                                      key={simulation.url}
                                      onClick={() => {
                                        dispatchSimulation({ type: 'SET_IFRAME_URL', payload: simulation.url });
                                        dispatchSimulation({ type: 'SET_SIM_MODAL', payload: false });
                                        document
                                          .getElementById("iframe")
                                          .scrollIntoView({
                                            behavior: "smooth",
                                          });
                                      }}
                                      style={{
                                        padding: "12px",
                                        textAlign: "left",
                                        backgroundColor: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        color: "#2d3748",
                                        hoverBackgroundColor: "#f1f5f9",
                                      }}
                                    >
                                      {simulation.name || "Simulation"}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => dispatchSimulation({ type: 'SET_SIM_MODAL', payload: false })}
                                  style={{
                                    marginTop: "16px",
                                    padding: "8px",
                                    backgroundColor: "#e2e8f0",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    color: "#4a5568",
                                  }}
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </SectionTitle>
                        </SectionHeader>

                        {expandedSections[`${subject}/${topic}`] && (
                          <SectionContent level="topic">
                            {videos.map((video) => (
                              <FileItem
                                key={video.name}
                                file={video}
                                isAdmin={isAdmin}
                                handleDelete={handleDelete}
                                user={user}
                                handleVideoSelect={handleVideoSelect}
                              />
                            ))}
                          </SectionContent>
                        )}
                      </TopicSectionContainer>
                    ))}
                  </SectionContent>
                )}
              </SectionContainer>
            ))}
      </VideoSectionContainer>
        
        <AdjacentContainer>
          {/* Tab Navigation */}
          <TabContainer>
            <Tab 
              className={activeSection === "video-player" ? "active" : ""}
              onClick={() => setActiveSection("video-player")}
            >
              <TabIcon>🎥</TabIcon>
              Video Player
            </Tab>
            <Tab 
              className={activeSection === "video-notes" ? "active" : ""}
              onClick={() => setActiveSection("video-notes")}
            >
              <TabIcon>📝</TabIcon>
              Notes
            </Tab>
            <Tab 
              className={activeSection === "podcast" ? "active" : ""}
              onClick={() => setActiveSection("podcast")}
            >
              <TabIcon>🎧</TabIcon>
              Podcast
            </Tab>
            <Tab 
              className={activeSection === "simulation" ? "active" : ""}
              onClick={() => setActiveSection("simulation")}
            >
              <TabIcon>🧪</TabIcon>
              Simulation
            </Tab>
          </TabContainer>
          
          {/* Video Player Content */}
          <AdjacentContent className={activeSection === "video-player" ? "" : "hidden"}>
            {selectedVideo ? (
              <div>
                {/* Video Info */}
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2c3e50' }}>
                    🎥 {selectedVideo.topic} - {selectedVideo.subtopic}
                  </h4>
                </div>

                {/* Artplayer Video Player */}
                <div style={{ marginBottom: '16px' }}>
                  <div 
                    ref={artRef} 
                    style={{ 
                      width: '100%', 
                      height: 'calc(100vh - 380px)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#000'
                    }} 
                  />
                </div>

                {/* Video Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <button 
                    onClick={() => window.open(`/play/${selectedVideo.bunnyVideoId}`, '_blank')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffa600',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '10%' // Reduced width
                    }}
                  >
                    🔗 Full Player
                  </button>
                </div>

                {/* Lecture Image */}
                {lectureImage && (
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#495057' }}>
                      Lecture Notes Image
                    </h5>
                    <img
                      src={lectureImage}
                      alt="Lecture Notes"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Video Player</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Click on a video from the list to watch it here
                </p>
              </div>
            )}
          </AdjacentContent>
          
          {/* Video Notes Content */}
          <AdjacentContent className={activeSection === "video-notes" ? "" : "hidden"}>
            {selectedVideo ? (
              <div>
                {/* Lecture Notes */}
                {notesLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                    <div> Loading lecture notes...</div>
                  </div>
                ) : notesError ? (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '12px'
                  }}>
                    ❌ Error loading notes: {notesError}
                  </div>
                ) : lectureNotes ? (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2c3e50' }}>
                       {lectureNotes.title}
                    </h4>
                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: '#4a5568',
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        height: 'calc(100vh - 350px)',
                        overflowY: 'auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: lectureNotes.content }}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fff3cd', 
                    color: '#856404',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '12px'
                  }}>
                    📝 No lecture notes available for this video
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Video Notes</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Select a video to view its lecture notes and take personal notes
                </p>
              </div>
            )}
          </AdjacentContent>
          
          {/* Podcast Content */}
          <AdjacentContent className={activeSection === "podcast" ? "" : "hidden"}>
            {selectedVideo ? (
              <div>
                {/* Podcast Info */}
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2c3e50' }}>
                    🎧 {selectedVideo.topic} - {selectedVideo.subtopic} Podcast
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                    Listen to the audio explanation of this topic
                  </p>
                </div>

                {/* Audio Player */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginBottom: '16px'
                }}>
                  <audio 
                    controls 
                    style={{ 
                      width: '100%',
                      height: '40px'
                    }}
                    preload="metadata"
                  >
                    <source 
                      src="https://zenithlms.b-cdn.net/Magnetism.m4a" 
                      type="audio/mpeg"
                    />
                    <source 
                      src="https://zenithlms.b-cdn.net/Magnetism.m4a" 
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                {/* Podcast Description */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#4a5568'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#2c3e50' }}>
                    📻 About this Podcast
                  </h5>
                  <p style={{ margin: '0 0 8px 0' }}>
                    This audio content provides a detailed explanation of the {selectedVideo.topic} topic, 
                    covering key concepts and practical applications.
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                    Duration: Demo Audio • Quality: High Definition
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Podcast Player</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Select a video to listen to its accompanying podcast
                </p>
              </div>
            )}
          </AdjacentContent>
          
          {/* Interactive Simulation Content */}
          <AdjacentContent className={activeSection === "simulation" ? "simulation-content" : "hidden"}>
            <div>
              {isAdmin ? (
                <div>
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    borderRadius: '6px',
                    border: '1px solid #ffeaa7',
                    fontSize: '12px'
                  }}>
                    🔧 <strong>Admin Controls:</strong> Add simulation URLs and names for students
                  </div>
                  <AdminSimulationForm 
                    simulationState={simulationState}
                    dispatchSimulation={dispatchSimulation}
                  />
                  
                  {/* Add Simulation Button */}
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (simulationState.simName && simulationState.simUrl && simulationState.selectedSubject && simulationState.selectedTopic) {
                          try {
                            const result = await simulationService.addSimulationLink(
                              simulationState.selectedSubject,
                              simulationState.selectedTopic,
                              {
                                name: simulationState.simName,
                                url: simulationState.simUrl,
                              },
                            );

                            if (result) {
                              toast.success(
                                `Simulation "${simulationState.simName}" added successfully!`,
                              );
                              dispatchSimulation({ type: 'RESET_SIMULATION_FORM' });
                            } else {
                              toast.error(result.message);
                            }
                          } catch (error) {
                            console.error(
                              "Error adding simulation:",
                              error,
                            );
                            toast.error(
                              "Failed to add simulation. Please try again.",
                            );
                          }
                        } else {
                          toast.error(
                            "Please enter simulation name, URL and select subject and topic",
                          );
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ffa600",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        width: "100%",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f59e0b";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffa600";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add Simulation
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <SimulationInterface 
                    simulationState={simulationState}
                    dispatchSimulation={dispatchSimulation}
                  />
                </div>
              )}
            </div>
          </AdjacentContent>
        </AdjacentContainer>
      </ContentWrapper>
      </VideoListContainer>
    </ResponsiveWrapper>
  );
}

export default VideoListPage;
