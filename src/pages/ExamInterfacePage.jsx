import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import "katex/dist/katex.min.css";
import { useLocation } from "react-router-dom";
import Katex from "@matejmazur/react-katex";
import { useNavigate } from "react-router-dom";
import { saveExamResult } from "../services/questionService";
import posthog from "posthog-js";
import ExamGuidelines from "../components/ExamGuidelines";
import { useQuestionNavigation } from "../hooks/useQuestionNavigation";
import { useFullScreen } from "../hooks/useFullScreen";
import { useFeedback } from "../hooks/useFeedback";
import { useExamData } from "../hooks/useExamData";
import {
  Modal,
  Timer,
  WelcomeScreen,
  StartButton,
  SubmitModal,
  ExamContainer,
  Header1,
  LeftSection,
  Sidebar,
  ExamName,
  TimeSection,
  SectionNames,
  SectionItem,
  QuestionArea,
  QuestionTitle,
  NavigationButtons,
  Button,
  PersonInfo,
  ProfileImage,
  ColorInfo,
  InfoItem,
  StatusIcon,
  StatusText,
  QuestionPalette,
  PaletteHeader,
  ChooseText,
  PaletteGrid,
  QuestionNumber,
  OptionContainer,
  TimeSpentBox,
  ModalContent,
  ModalButton,
  ButtonContainer,
  ResultsSummaryContainer,
  ResultsHeader,
  ResultsTitle,
  SectionResults,
  SectionTitle,
  ResultsGrid,
  ResultCard,
  StatLabel,
  StatValue,
  ProgressBar,
  SidebarSummary,
  SummaryStat,
  SummaryLabel,
  SummaryValue,
  SidebarFooter,
  FeedbackModalContainer,
  FeedbackModalContent,
  StarRatingContainer,
  Star,
  FeedbackTextArea,
  // New styled components for inline styles
  ExamHeader,
  LogoImage,
  HeaderNavItem,
  QuestionContentContainer,
  OptionsContentContainer,
  SolutionContainer,
  SolutionHeader,
  QuestionWrapper,
  ModalTitle,
  ModalSection,
  ScoreHeader,
  ScoreLabel,
  ScoreValue,
  StatsGrid,
  StatCard,
  StatCardLabel,
  StatCardValue,
  SectionSummaryWrapper,
  SectionSummaryTitle,
  SectionItemWrapper,
  SectionItemHeader,
  SectionName,
  SectionScore,
  SectionStats,
  SectionStatItem,
  StatusIconAnswered,
  StatusIconNotAnswered,
  StatusIconNotVisited,
  StatusIconMarkedForReview,
  StatusIconAnsweredAndMarked,
  FilterWrapper,
  FilterLabel,
  FilterSelect,
  SidebarResultsTitle,
  EarlySubmissionTitle,
  EarlySubmissionText,
  ConditionalButton,
  ContentImage,
  IntegerInputContainer,
  IntegerInputDisplay,
  NumericKeypad,
  KeypadButton,
} from "../styles/examInterface.styles";
const CONTENT_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  LATEX: "latex",
  TABLE: "table",
};

const viewExamInterface = 1;
const viewExamSolution = 1;

const LatexRenderer = ({ content }) => {
  // Split content by LaTeX delimiters
  const parts = content.split(/(\$[^\$]+\$|\\\\)/g);

  return (
    <div className="latex-content">
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          // Inline math
          return (
            <Katex
              key={index}
              math={part.slice(1, -1)}
              settings={{ throwOnError: false }}
            />
          );
        } else if (part === "\\\\") {
          // Line break
          return <br key={index} />;
        } else {
          // Regular text with possible LaTeX commands
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
};

function ExamInterfacePage() {
  const location = useLocation();
  // const examData = location.state?.examData;
  const examId = location.pathname.split("/").pop();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(
    3 * 60 * 60, // Default 3 hours in seconds, will be updated when examData loads
  );
  const [examStarted, setExamStarted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const frameRef = useRef();
  const endTimeRef = useRef();
  const submitButtonRef = useRef(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Add state for previous slide and topic
  const [previousSlide, setPreviousSlide] = useState(null);
  const [previousTopic, setPreviousTopic] = useState(null);

  // Add navigate hook
  const navigate = useNavigate();

  // Initialize exam data hook with delayed initialization
  const {
    examData,
    examResults,
    hasSubmitted,
    answersObject,
    subjects,
    questionsBySection,
    selectedAnswers,
    questionStatuses,
    questionTimes,
    isLoadingExam,
    isLoadingResults,
    examError,
    resultsError,
    totalQuestionsCount,
    updateSelectedAnswers,
    clearSelectedAnswer,
    updateQuestionStatus,
    updateQuestionTime,
    setSelectedAnswers,
    setQuestionStatuses,
    setQuestionTimes,
    setAnswersObject,
    setHasSubmitted,
  } = useExamData({
    examId,
    user,
    initializeNavigation: undefined, // Will handle initialization separately
  });

  // Mark functions for question status - will be defined after navigation hook
  let markAnswered, markNotAnswered, markForReview, markAnsweredAndReview;

  // Load topic function for the navigation hook
  const loadTopic = async (topicId) => {
    setCurrentTopic(topicId);
    setCurrentSlide(0);
  };

  // Initialize question navigation hook
  const {
    currentSlide,
    currentTopic,
    initializeNavigation,
    goToQuestion,
    goToSection,
    goToPrevious,
    goToNext,
    saveAndNext,
    markForReviewAndNext,
    getCurrentQuestion,
    getNavigationInfo,
    setCurrentSlide,
    setCurrentTopic,
  } = useQuestionNavigation({
    subjects,
    questionsBySection,
    loadTopic,
    markAnswered: (questionIndex) =>
      updateQuestionStatus(currentTopic, questionIndex, "a"),
    markNotAnswered: (questionIndex) =>
      updateQuestionStatus(currentTopic, questionIndex, "na"),
    selectedAnswers,
    hasSubmitted,
  });

  // Now define the mark functions using the currentTopic from navigation hook
  markAnswered = (questionIndex) => {
    updateQuestionStatus(currentTopic, questionIndex, "a");
  };

  markNotAnswered = (questionIndex) => {
    updateQuestionStatus(currentTopic, questionIndex, "na");
  };

  markForReview = (questionIndex) => {
    updateQuestionStatus(currentTopic, questionIndex, "mr");
  };

  markAnsweredAndReview = (questionIndex) => {
    updateQuestionStatus(currentTopic, questionIndex, "amr");
  };

  // Handle initialization of navigation when exam data is loaded
  useEffect(() => {
    if (
      examData?.questions &&
      subjects.length > 0 &&
      subjects[0]?.id &&
      initializeNavigation
    ) {
      initializeNavigation(subjects[0].id);
    }
  }, [examData, subjects, initializeNavigation]);

  // Update timeLeft when examData is loaded
  useEffect(() => {
    if (examData?.duration) {
      setTimeLeft(examData.duration * 60);
    }
  }, [examData?.duration]);

  // Initialize fullscreen hook
  const {
    isFullScreen,
    showExitModal,
    enterFullscreen,
    exitFullscreen,
    checkFullscreenStatus,
    handleExitModalConfirm,
    handleExitModalCancel,
    setShowExitModal,
  } = useFullScreen({
    isExamStarted: examStarted,
    hasSubmitted,
  });

  // Initialize feedback hook
  const {
    showFeedbackModal,
    feedbackRating,
    feedbackComment,
    showFeedbackModalWithFeatureFlag,
    submitFeedback,
    cancelFeedback,
    setStarRating,
    updateFeedbackComment,
    getStarsData,
    setShowFeedbackModal,
    setFeedbackRating,
    setFeedbackComment,
  } = useFeedback({
    examId,
    user,
    examData,
    answersObject,
    navigate,
    exitFullscreen,
  });

  const [filter, setFilter] = useState("all"); // State to track the selected filter

  const filterQuestions = (status, questionIndex) => {
    const question = questionsBySection.get(currentTopic)?.[questionIndex];
    const questionId = question?.id;
    const correctAnswer = question?.correctAnswer?.trim().toLowerCase();
    const selectedValue = selectedAnswers
      .get(currentTopic)
      ?.get(questionId)
      ?.trim()
      .toLowerCase();

    switch (filter) {
      case "attempted":
        return status === "a" || status === "amr";
      case "nonAttempted":
        return status === "na" || status === "nv";
      case "correct":
        if (!hasSubmitted || !selectedValue || !correctAnswer) {
          return false;
        }

        if (question?.type === "multiple") {
          // For multiple choice questions, check if all selected answers are correct
          const selectedAnswers = selectedValue
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter((value, index, self) => self.indexOf(value) === index);
          const correctAnswers = correctAnswer
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter((value, index, self) => self.indexOf(value) === index);

          const allSelectedAreCorrect = selectedAnswers.every((selected) =>
            correctAnswers.includes(selected),
          );
          const allCorrectAreSelected = correctAnswers.every((correct) =>
            selectedAnswers.includes(correct),
          );

          return (
            allSelectedAreCorrect &&
            allCorrectAreSelected &&
            selectedAnswers.length === correctAnswers.length
          );
        } else {
          // For other question types, simple string comparison
          return selectedValue === correctAnswer;
        }
      case "wrong":
        if (!hasSubmitted || !selectedValue || !correctAnswer) {
          return false;
        }

        if (question?.type === "multiple") {
          // For multiple choice questions, check if answers don't match
          const selectedAnswers = selectedValue
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter((value, index, self) => self.indexOf(value) === index);
          const correctAnswers = correctAnswer
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter((value, index, self) => self.indexOf(value) === index);

          const allSelectedAreCorrect = selectedAnswers.every((selected) =>
            correctAnswers.includes(selected),
          );
          const allCorrectAreSelected = correctAnswers.every((correct) =>
            selectedAnswers.includes(correct),
          );

          return !(
            allSelectedAreCorrect &&
            allCorrectAreSelected &&
            selectedAnswers.length === correctAnswers.length
          );
        } else {
          // For other question types, simple string comparison
          return selectedValue !== correctAnswer;
        }
      case "markedForReview":
        return status === "mr" || status === "amr";
      default:
        return true; // Show all questions
    }
  };

  useEffect(() => {
    // Set end time when exam starts
    endTimeRef.current =
      Date.now() + (examData?.duration ? examData.duration * 60 * 1000 : 0);

    function tick() {
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        submitButtonRef.current?.click();
        setTimeLeft(0);
        return;
      }
      if (remaining <= 60 || remaining % 60 === 0) {
        setTimeLeft(remaining);
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    if (!hasSubmitted) {
      frameRef.current = requestAnimationFrame(tick);

      // Save to localStorage on each tick
      localStorage.setItem("examEndTime", endTimeRef.current.toString());

      return () => {
        cancelAnimationFrame(frameRef.current);
      };
    }
  }, [examData?.duration, hasSubmitted, examResults]);

  useEffect(() => {
    // Prevent page reload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      if (
        // Reload: Ctrl+R, Command+R, F5
        (e.key === "r" && (e.ctrlKey || e.metaKey)) ||
        e.key === "F5" ||
        // Forward/Back: Alt+Left/Right, Command+Left/Right
        ((e.altKey || e.metaKey) && ["ArrowLeft", "ArrowRight"].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Block right click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Update the current slide/topic tracking useEffect to include examResults
  useEffect(() => {
    if (!hasSubmitted) {
      const timeSpent = Date.now() - questionStartTime;

      // Only save time if we have a previous question
      if (previousSlide !== null && previousTopic) {
        const prevQuestion =
          questionsBySection.get(previousTopic)?.[previousSlide];
        if (prevQuestion) {
          updateQuestionTime(previousTopic, previousSlide, timeSpent);
          console.log(
            "Updated question time for:",
            `${previousTopic}-${previousSlide}`,
            timeSpent,
          );
        }
      }

      // Update previous question reference
      setPreviousSlide(currentSlide);
      setPreviousTopic(currentTopic);
      // Reset timer for new question
      setQuestionStartTime(Date.now());
    }
  }, [
    currentSlide,
    currentTopic,
    hasSubmitted,
    previousSlide,
    previousTopic,
    questionsBySection,
  ]);

  const calculateSectionMarks = () => {
    // If answersObject is empty or undefined, return an empty object
    if (!answersObject || Object.keys(answersObject).length === 0) {
      return {};
    }

    console.log("Calculating section marks from answersObject:", answersObject);

    return Object.entries(answersObject).reduce((acc, [section, data]) => {
      acc[section] = {
        totalMarks: data.totalMarks || 0,
        positiveMarks: data.positiveMarks || 0,
        negativeMarks: data.negativeMarks || 0,
        attempted: data.attempted || 0,
        correct: data.correct || 0,
        incorrect: data.attempted - data.correct || 0,
        totalSectionQuestions: data.totalSectionQuestions || 0,
      };
      return acc;
    }, {});
  };

  const getAttemptedCount = () => {
    let count = 0;
    questionStatuses.forEach((topicStatuses) => {
      // topicStatuses is also a Map
      topicStatuses.forEach((status) => {
        if (status === "a" || status === "amr") {
          count++;
        }
      });
    });
    return count;
  };

  const getMarkedForReviewCount = () => {
    let count = 0;
    questionStatuses.forEach((topicStatuses) => {
      // topicStatuses is also a Map
      topicStatuses.forEach((status) => {
        if (status === "mr" || status === "amr") {
          count++;
        }
      });
    });
    return count;
  };

  const handleSubmit = async () => {
    try {
      // Calculate final time for the last viewed question
      const finalTimeSpent = Date.now() - questionStartTime;
      const finalQuestion =
        questionsBySection.get(currentTopic)?.[currentSlide];

      if (finalQuestion) {
        updateQuestionTime(currentTopic, currentSlide, finalTimeSpent);
      }

      // Convert question times to a format suitable for storage
      const questionTimesObject = {};
      questionTimes.forEach((time, key) => {
        const [topic, questionId] = key.split("-");
        if (!questionTimesObject[topic]) {
          questionTimesObject[topic] = {};
        }
        questionTimesObject[topic][questionId] = Math.round(time / 1000); // Convert to seconds
      });

      const answersObject = {};

      // Process each section
      selectedAnswers.forEach((sectionAnswers, section) => {
        // Convert answers Map to object
        answersObject[section] = Object.fromEntries(sectionAnswers);

        // Initialize marks for this section
        let positiveMarks = 0;
        let negativeMarks = 0;
        let attempted = sectionAnswers.size;
        let correct = 0;
        let totalSectionQuestions = questionsBySection.get(section).length;

        // Calculate marks for each answer
        sectionAnswers.forEach((answer, questionId) => {
          const question = questionsBySection
            .get(section)
            .find((q) => q.id === questionId);

          if (question) {
            if (question.type === "integer") {
              // For integer type questions, compare the numeric value
              if (
                Math.abs(
                  parseFloat(question.correctAnswer) - parseFloat(answer),
                ) <= 0.01
              ) {
                positiveMarks += question.metadata?.marks?.correct || 0;
                correct++;
              } else {
                negativeMarks += question.metadata?.marks?.incorrect || 0;
              }
            } else if (question.type === "multiple") {
              // For multiple choice questions, handle comma-separated answers
              const selectedAnswers = answer
                .split(",")
                .map((a) => a.trim().toLowerCase())
                .filter((value, index, self) => self.indexOf(value) === index);
              const correctAnswers = question.correctAnswer
                .split(",")
                .map((a) => a.trim().toLowerCase())
                .filter((value, index, self) => self.indexOf(value) === index);

              // Check if all selected answers are correct and all correct answers are selected
              const allSelectedAreCorrect = selectedAnswers.every((selected) =>
                correctAnswers.includes(selected),
              );
              const allCorrectAreSelected = correctAnswers.every((correct) =>
                selectedAnswers.includes(correct),
              );

              if (
                allSelectedAreCorrect &&
                allCorrectAreSelected &&
                selectedAnswers.length === correctAnswers.length
              ) {
                positiveMarks += question.metadata?.marks?.correct || 0;
                correct++;
              } else {
                negativeMarks += question.metadata?.marks?.incorrect || 0;
              }
            } else {
              // For other question types, compare strings
              if (
                question.correctAnswer.toLowerCase().trim() ===
                answer.toLowerCase().trim()
              ) {
                positiveMarks += question.metadata?.marks?.correct || 0;
                correct++;
              } else {
                negativeMarks += question.metadata?.marks?.incorrect || 0;
              }
            }
          }
        });

        negativeMarks =
          negativeMarks < 0
            ? (negativeMarks *= -1)
            : (negativeMarks = negativeMarks);

        // Store marks in answer object
        answersObject[section] = {
          ...answersObject[section],
          totalMarks: positiveMarks - negativeMarks,
          positiveMarks,
          negativeMarks,
          attempted,
          correct,
          totalSectionQuestions,
        };
      });

      const examResult = {
        examId,
        userId: user.uid,
        answers: answersObject,
        questionStatuses: Object.fromEntries(
          Array.from(questionStatuses.entries()).map(([topic, statusMap]) => [
            topic,
            Object.fromEntries(statusMap),
          ]),
        ),
        sections: calculateSectionMarks(),
        statistics: {
          timeSpent:
            (examData?.duration || 0) * 60 -
            Math.max(
              0,
              Math.ceil((endTimeRef.current - Date.now()) / 1000),
            ),
          questionsAttempted: getAttemptedCount(),
          questionsMarkedForReview: getMarkedForReviewCount(),
          questionTimes: questionTimesObject, // Add question times to statistics
        },
        status: "completed",
        submittedAt: new Date().toISOString(),
      };

      await saveExamResult(user.uid, examId, examResult);

      setTimeLeft(0);
      setAnswersObject(answersObject);
      setHasSubmitted(true);
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  const handleClearResponse = () => {
    // Get current section's questions
    const sectionQuestions = questionsBySection.get(currentTopic);

    if (sectionQuestions && sectionQuestions[currentSlide]) {
      // Clear selected answer from state using hook function
      clearSelectedAnswer(currentTopic, sectionQuestions[currentSlide].id);

      // Update question status using hook function
      updateQuestionStatus(currentTopic, currentSlide, "na");
    }
  };

  const handleMarkForReview = () => {
    const result = markForReviewAndNext();

    // Handle marking based on whether there's an answer
    if (result.hasAnswer) {
      markAnsweredAndReview(currentSlide);
    } else {
      markForReview(currentSlide);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (seconds > 60)
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    else return `${secs.toString().padStart(2, "0")}`;
  };

  const ContentRenderer = ({ content }) => {
    switch (content.type) {
      case CONTENT_TYPES.TEXT:
        return <span className="text-content">{content.value}</span>;
      case CONTENT_TYPES.LATEX:
        // return <Katex math={content.value} />;
        return <LatexRenderer content={content.value} />;
      case CONTENT_TYPES.IMAGE:
        return (
          <div>
            <ContentImage
              src={content.value}
              width={content.dimensions?.width}
              height={content.dimensions?.height}
              alt="Question content"
              className="my-2"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderMarksSummary = (answersObject) => {
    return Object.entries(answersObject).map(([section, data]) => (
      <div key={section} style={{ marginBottom: "10px" }}>
        <h3 style={{ fontWeight: "bold", color: "#FF9800" }}>{section}</h3>
        <p>Total Marks: {data.totalMarks}</p>
        <p>Accuracy: {data.correct / data.attempted}</p>
        <p>Prep level: {data.correct / data.totalSectionQuestions}</p>
        <p>Positive Marks: {data.positiveMarks}</p>
        <p>Negative Marks: {data.negativeMarks}</p>
      </div>
    ));
  };

  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);

  const handleSubmitClick = () => {
    if (!hasSubmitted) {
      if (timeLeft > 300) {
        // 5 minutes = 300 seconds
        setShowConfirmSubmitModal(true);
      } else {
        handleSubmit();
      }
    } else {
      // Exit fullscreen mode and navigate
      exitFullscreen();
      navigate("/");
    }
  };

  // Fix ResultsSummary component
  const ResultsSummary = ({ examResults, examData }) => {
    if (!examResults || examResults.length === 0) {
      return null;
    }

    const result = examResults[0];

    // Use answers instead of sections since that's where the data is
    const sections = result?.answers || {};

    const totalMarks = Object.values(sections).reduce(
      (sum, section) => sum + (section?.totalMarks || 0),
      0,
    );

    const totalPositiveMarks = Object.values(sections).reduce(
      (sum, section) => sum + (section?.positiveMarks || 0),
      0,
    );

    const totalNegativeMarks = Object.values(sections).reduce(
      (sum, section) => sum + (section?.negativeMarks || 0),
      0,
    );

    const totalAttempted = Object.values(sections).reduce(
      (sum, section) => sum + (section?.attempted || 0),
      0,
    );

    const totalCorrect = Object.values(sections).reduce(
      (sum, section) => sum + (section?.correct || 0),
      0,
    );

    const totalQuestions = Object.values(sections).reduce(
      (sum, section) => sum + (section?.totalSectionQuestions || 0),
      0,
    );

    const accuracy = totalAttempted ? (totalCorrect / totalAttempted) * 100 : 0;
    const prepLevel = totalQuestions
      ? (totalCorrect / totalQuestions) * 100
      : 0;

    return (
      <ResultsSummaryContainer>
        <ResultsHeader>
          <ResultsTitle>Exam Results: {examData?.name}</ResultsTitle>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              Total Score: {totalMarks}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Submitted on:{" "}
              {result?.submittedAt
                ? new Date(result.submittedAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
        </ResultsHeader>

        {/* Overall Results */}
        <SectionResults>
          <SectionTitle>Overall Performance</SectionTitle>
          <ResultsGrid>
            <ResultCard $highlight={true}>
              <StatLabel>Total Score</StatLabel>
              <StatValue $color="#ff9800">{totalMarks}</StatValue>
              <ProgressBar
                $percent={
                  totalQuestions ? (totalMarks / (4 * totalQuestions)) * 100 : 0
                }
              />
            </ResultCard>

            <ResultCard>
              <StatLabel>Accuracy</StatLabel>
              <StatValue>{accuracy.toFixed(2)}%</StatValue>
              <ProgressBar $percent={accuracy} />
            </ResultCard>

            <ResultCard>
              <StatLabel>Prep Level</StatLabel>
              <StatValue>{prepLevel.toFixed(2)}%</StatValue>
              <ProgressBar $percent={prepLevel} />
            </ResultCard>

            <ResultCard>
              <StatLabel>Time Spent</StatLabel>
              <StatValue>
                {result?.statistics?.timeSpent
                  ? `${Math.floor(result.statistics.timeSpent / 60)}m ${
                      result.statistics.timeSpent % 60
                    }s`
                  : "N/A"}
              </StatValue>
            </ResultCard>
          </ResultsGrid>

          <ResultsGrid>
            <ResultCard>
              <StatLabel>Positive Marks</StatLabel>
              <StatValue $color="#4caf50">{totalPositiveMarks}</StatValue>
            </ResultCard>

            <ResultCard>
              <StatLabel>Negative Marks</StatLabel>
              <StatValue $color="#f44336">{totalNegativeMarks}</StatValue>
            </ResultCard>

            <ResultCard>
              <StatLabel>Questions Attempted</StatLabel>
              <StatValue>
                {totalAttempted} / {totalQuestions}
              </StatValue>
            </ResultCard>

            <ResultCard>
              <StatLabel>Correct Answers</StatLabel>
              <StatValue $color="#4caf50">{totalCorrect}</StatValue>
            </ResultCard>
          </ResultsGrid>
        </SectionResults>

        {/* Section-wise Results */}
        <SectionResults>
          <SectionTitle>Section-wise Performance</SectionTitle>
          {Object.entries(sections).map(([section, data]) => (
            <div key={section} style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "16px", color: "#333", marginBottom: "10px" }}>
                {section}
              </h4>
              <ResultsGrid>
                <ResultCard>
                  <StatLabel>Score</StatLabel>
                  <StatValue>{data?.totalMarks || 0}</StatValue>
                </ResultCard>

                <ResultCard>
                  <StatLabel>Accuracy</StatLabel>
                  <StatValue>
                    {data?.attempted
                      ? ((data.correct / data.attempted) * 100).toFixed(2)
                      : 0}
                    %
                  </StatValue>
                  <ProgressBar
                    $percent={
                      data?.attempted
                        ? (data.correct / data.attempted) * 100
                        : 0
                    }
                  />
                </ResultCard>

                <ResultCard>
                  <StatLabel>Prep Level</StatLabel>
                  <StatValue>
                    {data?.totalSectionQuestions
                      ? (
                          (data.correct / data.totalSectionQuestions) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </StatValue>
                  <ProgressBar
                    $percent={
                      data?.totalSectionQuestions
                        ? (data.correct / data.totalSectionQuestions) * 100
                        : 0
                    }
                  />
                </ResultCard>

                <ResultCard>
                  <StatLabel>Attempted</StatLabel>
                  <StatValue>
                    {data?.attempted || 0} / {data?.totalSectionQuestions || 0}
                  </StatValue>
                </ResultCard>
              </ResultsGrid>
            </div>
          ))}
        </SectionResults>
      </ResultsSummaryContainer>
    );
  };

  const IntegerTypeComponent = ({
    value,
    onChange,
    disabled,
    questionId,
  }) => {
    const handleButtonClick = (digit) => {
      if (disabled) return;
      let newValue;
      if (digit === "C") {
        newValue = "";
      } else if (digit === "⌫") {
        newValue = value.slice(0, -1);
      } else {
        newValue = value + digit;
      }
      onChange(newValue);
    };

    return (
      <IntegerInputContainer>
        <IntegerInputDisplay
          type="text"
          id={`question${questionId}`}
          value={value}
          readOnly
          disabled={disabled}
        />
        <NumericKeypad>
          {[...Array(9).keys()].map((i) => (
            <KeypadButton
              key={i + 1}
              onClick={() => handleButtonClick((i + 1).toString())}
            >
              {i + 1}
            </KeypadButton>
          ))}
          <KeypadButton onClick={() => handleButtonClick(".")}>.</KeypadButton>
          <KeypadButton onClick={() => handleButtonClick("0")}>0</KeypadButton>
          <KeypadButton onClick={() => handleButtonClick("⌫")}>⌫</KeypadButton>
        </NumericKeypad>
      </IntegerInputContainer>
    );
  };

  return (
    <>
      {!examStarted && (
        <WelcomeScreen>
          <h1>{examData?.name}</h1>
          <p>Duration: {examData?.duration} minutes</p>
          {hasSubmitted && (
            <ResultsSummary examResults={examResults} examData={examData} />
          )}
          {!hasSubmitted && <ExamGuidelines />}
          <StartButton
            onClick={async () => {
              // Simple direct check for feature flag
              debugger;
              console.log(
                "posthog.isFeatureEnabled('show-exam-interface')",
                posthog.isFeatureEnabled("show-exam-interface"),
              );
              console.log(
                "posthog.isFeatureEnabled('Exam-Feedback')",
                posthog.isFeatureEnabled("Exam-Feedback"),
              );
              if (
                (viewExamInterface && !hasSubmitted) ||
                (viewExamSolution && hasSubmitted)
              ) {
                // Feature flag is enabled, proceed with exam start
                await enterFullscreen();
                setExamStarted(true);
                // startTimer(examData.duration);
              } else {
                // Feature flag is disabled, show message and track event
                alert(
                  "Exam interface is currently not available. Please try again later.",
                );
                posthog.capture("exam_interface_disabled", {
                  exam_id: examData?.id,
                  exam_name: examData?.name,
                });
              }
            }}
          >
            {hasSubmitted ? "Review" : "Start Exam"}
          </StartButton>
        </WelcomeScreen>
      )}

      {examStarted && (
        <ExamContainer>
          <LeftSection>
            <ExamHeader>
              <LogoImage
                src="/zenithLogo.png"
                height="50"
                alt="Zenith Logo"
              />
            </ExamHeader>

            <Header1>
              {examData?.name}
              <HeaderNavItem>
                <div>Instructions</div>
              </HeaderNavItem>
              <HeaderNavItem>
                <div>Question Paper</div>
              </HeaderNavItem>
            </Header1>

            <ExamName>
              {/* <ExamNameText>{examData?.name || 'Joint Entrance Exam'}</ExamNameText> */}
            </ExamName>

            <TimeSection>
              {currentTopic || "Section"}
              <Timer $timeLeft={timeLeft}>
                Time Left: {formatTime(timeLeft)}
              </Timer>
            </TimeSection>

            <SectionNames>
              {subjects.map((topic, index) => (
                <SectionItem
                  key={topic.id}
                  className={
                    currentTopic === topic.id
                      ? "section_selected"
                      : "section_unselected"
                  }
                  onClick={() => goToSection(topic.id)}
                >
                  {topic.name}
                </SectionItem>
              ))}
            </SectionNames>

            <QuestionArea>
              <QuestionTitle>
                <div>Question no. {currentSlide + 1}</div>
              </QuestionTitle>

              {/* Question content */}
              {questionsBySection?.get(currentTopic)?.length >=
                currentSlide + 1 && (
                <QuestionWrapper>
                  {hasSubmitted && (
                    <TimeSpentBox>
                      {(() => {
                        const questionKey = `${currentTopic}-${currentSlide}`;
                        const timeSpent =
                          questionTimes instanceof Map
                            ? questionTimes.get(questionKey)
                            : 0;
                        if (timeSpent) {
                          const minutes = Math.floor(timeSpent / 60000);
                          const seconds = Math.floor(
                            (timeSpent % 60000) / 1000,
                          );
                          return `Time spent on this question: ${minutes}:${seconds
                            .toString()
                            .padStart(2, "0")}`;
                        }
                        return "Time data not available";
                      })()}
                    </TimeSpentBox>
                  )}

                  {/* Question content */}
                  <QuestionContentContainer>
                    {questionsBySection
                      .get(currentTopic)
                      [currentSlide].question?.map((content, i) => (
                        <ContentRenderer key={i} content={content} />
                      ))}
                  </QuestionContentContainer>

                  {/* Options content */}
                  <OptionsContentContainer>
                    {questionsBySection.get(currentTopic)[currentSlide].type ===
                    "integer" ? (
                      <IntegerTypeComponent
                        value={
                          selectedAnswers
                            .get(currentTopic)
                            ?.get(
                              questionsBySection.get(currentTopic)[currentSlide]
                                .id,
                            ) || ""
                        }
                        onChange={(value) => {
                          if (!hasSubmitted) {
                            markAnswered(currentSlide);
                            const questionId =
                              questionsBySection.get(currentTopic)[currentSlide]
                                .id;
                            updateSelectedAnswers(
                              currentTopic,
                              questionId,
                              value,
                            );
                          }
                        }}
                        disabled={hasSubmitted}
                        questionId={currentSlide + 1}
                      />
                    ) : questionsBySection.get(currentTopic)[currentSlide]
                        .type === "multiple" ? (
                      // Render checkboxes for multiple choice questions
                      questionsBySection
                        .get(currentTopic)
                        [currentSlide].options?.map((option, optIndex) => {
                          const questionId =
                            questionsBySection.get(currentTopic)[currentSlide]
                              .id;
                          const currentValue = ["A", "B", "C", "D"][optIndex];
                          const correctAnswer =
                            questionsBySection.get(currentTopic)[currentSlide]
                              .correctAnswer;
                          const selectedValue = selectedAnswers
                            .get(currentTopic)
                            ?.get(questionId);

                          // For multiple choice, selectedValue is an array
                          const selectedArray = selectedValue
                            ? selectedValue.split(",").map((s) => s.trim())
                            : [];
                          const isCorrect =
                            correctAnswer &&
                            correctAnswer
                              .toLowerCase()
                              .includes(currentValue.toLowerCase());
                          const isSelected = selectedArray.includes(
                            currentValue,
                          );

                          return (
                            <OptionContainer
                              key={optIndex}
                              $hasSubmitted={hasSubmitted}
                              $isCorrect={isCorrect}
                              $isSelected={isSelected}
                            >
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: hasSubmitted
                                    ? "default"
                                    : "pointer",
                                  width: "100%",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name={`question${currentSlide + 1}`}
                                  value={currentValue}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (!hasSubmitted) {
                                      markAnswered(currentSlide);

                                      // Get current selected answers for this question
                                      const currentSelected = selectedAnswers
                                        .get(currentTopic)
                                        ?.get(questionId);
                                      const currentArray = currentSelected
                                        ? currentSelected
                                            .split(",")
                                            .map((s) => s.trim())
                                        : [];

                                      let newArray;
                                      if (e.target.checked) {
                                        // Add to selection
                                        newArray = [
                                          ...currentArray,
                                          currentValue,
                                        ];
                                      } else {
                                        // Remove from selection
                                        newArray = currentArray.filter(
                                          (val) => val !== currentValue,
                                        );
                                      }

                                      // Update using hook function
                                      updateSelectedAnswers(
                                        currentTopic,
                                        questionId,
                                        newArray.join(", "),
                                      );
                                    }
                                  }}
                                  disabled={hasSubmitted}
                                  style={{
                                    cursor: hasSubmitted
                                      ? "default"
                                      : "pointer",
                                  }}
                                />
                                <div
                                  style={{
                                    display: "inline-block",
                                    color: hasSubmitted
                                      ? isCorrect
                                        ? "#4CAF50"
                                        : isSelected && !isCorrect
                                        ? "#f44336"
                                        : "inherit"
                                      : "inherit",
                                  }}
                                >
                                  {option.contents?.map((content, i) => (
                                    <ContentRenderer
                                      key={i}
                                      content={content}
                                    />
                                  ))}
                                </div>
                              </label>
                              {hasSubmitted && (
                                <div
                                  style={{
                                    marginLeft: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {isCorrect && (
                                    <span
                                      style={{
                                        color: "#4CAF50",
                                        fontSize: "20px",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                  {!isCorrect && isSelected && (
                                    <span
                                      style={{
                                        color: "#f44336",
                                        fontSize: "20px",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      ✗
                                    </span>
                                  )}
                                </div>
                              )}
                            </OptionContainer>
                          );
                        })
                    ) : (
                      // Render radio buttons for single choice questions
                      questionsBySection
                        .get(currentTopic)
                        [currentSlide].options?.map((option, optIndex) => {
                          const questionId =
                            questionsBySection.get(currentTopic)[currentSlide]
                              .id;
                          const currentValue = ["A", "B", "C", "D"][optIndex];
                          const correctAnswer =
                            questionsBySection.get(currentTopic)[currentSlide]
                              .correctAnswer;
                          const selectedValue = selectedAnswers
                            .get(currentTopic)
                            ?.get(questionId);

                          const isCorrect =
                            currentValue?.toLowerCase() ===
                            correctAnswer?.toLowerCase();
                          const isSelected =
                            currentValue?.toLowerCase() ===
                            selectedValue?.toLowerCase();

                          return (
                            <OptionContainer
                              key={optIndex}
                              $hasSubmitted={hasSubmitted}
                              $isCorrect={isCorrect}
                              $isSelected={isSelected}
                            >
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: hasSubmitted
                                    ? "default"
                                    : "pointer",
                                  width: "100%",
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`question${currentSlide + 1}`}
                                  value={currentValue}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (!hasSubmitted && e.target.checked) {
                                      markAnswered(currentSlide);
                                      updateSelectedAnswers(
                                        currentTopic,
                                        questionId,
                                        currentValue,
                                      );
                                    }
                                  }}
                                  disabled={hasSubmitted}
                                  style={{
                                    cursor: hasSubmitted
                                      ? "default"
                                      : "pointer",
                                  }}
                                />
                                <div
                                  style={{
                                    display: "inline-block",
                                    color: hasSubmitted
                                      ? isCorrect
                                        ? "#4CAF50"
                                        : isSelected && !isCorrect
                                        ? "#f44336"
                                        : "inherit"
                                      : "inherit",
                                  }}
                                >
                                  {option.contents?.map((content, i) => (
                                    <ContentRenderer
                                      key={i}
                                      content={content}
                                    />
                                  ))}
                                </div>
                              </label>
                              {hasSubmitted && (
                                <div
                                  style={{
                                    marginLeft: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {isCorrect && (
                                    <span
                                      style={{
                                        color: "#4CAF50",
                                        fontSize: "20px",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                  {!isCorrect && isSelected && (
                                    <span
                                      style={{
                                        color: "#f44336",
                                        fontSize: "20px",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      ✗
                                    </span>
                                  )}
                                </div>
                              )}
                            </OptionContainer>
                          );
                        })
                    )}
                  </OptionsContentContainer>

                  {/* Solution display */}
                  {hasSubmitted &&
                    questionsBySection.get(currentTopic)[currentSlide]
                      .solutionContent?.length > 0 && (
                      <SolutionContainer>
                        <SolutionHeader>Solution:</SolutionHeader>
                        <div>
                          {questionsBySection
                            .get(currentTopic)
                            [currentSlide].solutionContent?.map(
                              (content, i) => (
                                <ContentRenderer key={i} content={content} />
                              ),
                            )}
                        </div>
                      </SolutionContainer>
                    )}
                </QuestionWrapper>
              )}
            </QuestionArea>
            <NavigationButtons>
              <Button onClick={handleMarkForReview}>
                Mark for Review & Next
              </Button>
              <Button onClick={handleClearResponse}>Clear Response</Button>
              <ConditionalButton
                $hidden={currentSlide === 0}
                onClick={() => goToPrevious()}
              >
                Previous
              </ConditionalButton>
              <Button
                $mobileOnly // Added mobileOnly prop
                onClick={handleSubmitClick}
                style={{
                  // backgroundColor: hasSubmitted ? "#dc3545" : "#28a745", // REMOVED: inconsistent style
                  // color: "white", // REMOVED: inconsistent style
                  float: "right",
                  marginRight: "5px",
                }}
              >
                {hasSubmitted ? "Close" : "Submit"}
              </Button>
              <Button id="next" onClick={() => saveAndNext()}>
                Save and Next
              </Button>
            </NavigationButtons>
          </LeftSection>

          <Sidebar>
            <PersonInfo $desktopOnly>
              <ProfileImage
                src="https://www.digialm.com//OnlineAssessment/images/NewCandidateImage.jpg"
                alt="Profile"
              />
              <div id="cname">{user.email}</div>
            </PersonInfo>

            {/* Add the sidebar summary here */}
            {hasSubmitted && examResults.length > 0 && (
              <SidebarSummary>
                <SidebarResultsTitle>Results Summary</SidebarResultsTitle>
                {(() => {
                  const result = examResults[0];

                  // Use answers instead of sections
                  const sections = result?.answers || {};

                  const totalMarks = Object.values(sections).reduce(
                    (sum, section) => sum + (section?.totalMarks || 0),
                    0,
                  );
                  const totalCorrect = Object.values(sections).reduce(
                    (sum, section) => sum + (section?.correct || 0),
                    0,
                  );
                  const totalAttempted = Object.values(sections).reduce(
                    (sum, section) => sum + (section?.attempted || 0),
                    0,
                  );
                  const totalQuestions = Object.values(sections).reduce(
                    (sum, section) =>
                      sum + (section?.totalSectionQuestions || 0),
                    0,
                  );

                  return (
                    <>
                      <SummaryStat>
                        <SummaryLabel>Total Score:</SummaryLabel>
                        <SummaryValue $color="#ff9800">{totalMarks}</SummaryValue>
                      </SummaryStat>
                      <SummaryStat>
                        <SummaryLabel>Accuracy:</SummaryLabel>
                        <SummaryValue>
                          {totalAttempted
                            ? ((totalCorrect / totalAttempted) * 100).toFixed(
                                2,
                              )
                            : 0}
                          %
                        </SummaryValue>
                      </SummaryStat>
                      <SummaryStat>
                        <SummaryLabel>Prep Level:</SummaryLabel>
                        <SummaryValue>
                          {totalQuestions
                            ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
                            : 0}
                          %
                        </SummaryValue>
                      </SummaryStat>
                      <SummaryStat>
                        <SummaryLabel>Correct:</SummaryLabel>
                        <SummaryValue $color="#4caf50">
                          {totalCorrect} / {totalAttempted}
                        </SummaryValue>
                      </SummaryStat>
                    </>
                  );
                })()}
              </SidebarSummary>
            )}

            <ColorInfo>
              <InfoItem>
                <StatusIconAnswered />
                <StatusText>Answered</StatusText>
              </InfoItem>
              <InfoItem>
                <StatusIconNotAnswered />
                <StatusText>Not Answered</StatusText>
              </InfoItem>
              <InfoItem>
                <StatusIconNotVisited />
                <StatusText>Not Visited</StatusText>
              </InfoItem>
              <InfoItem>
                <StatusIconMarkedForReview />
                <StatusText>Marked for Review</StatusText>
              </InfoItem>
              <InfoItem className="long">
                <StatusIconAnsweredAndMarked />
                <StatusText>
                  Answered & Marked for Review (will be considered for
                  evaluation)
                </StatusText>
              </InfoItem>
            </ColorInfo>

            <div>
              <PaletteHeader>{currentTopic || "Section"}</PaletteHeader>
              <QuestionPalette>
                <ChooseText>Choose a Question</ChooseText>
                <PaletteGrid>
                  {Object.keys(questionsBySection.get(currentTopic) || {}).map(
                    (_, index) => {
                      const status = !hasSubmitted
                        ? questionStatuses.get(currentTopic)?.get(index) || "nv"
                        : questionStatuses
                            .get(currentTopic)
                            ?.get(index.toString()) || "nv";

                      if (!filterQuestions(status, index)) return null; // Apply the filter

                      return (
                        <QuestionNumber
                          key={index}
                          className={status}
                          onClick={() => {
                            if (status === "nv" && !hasSubmitted) {
                              markNotAnswered(index);
                            }
                            setCurrentSlide(index);
                          }}
                          style={{
                            borderLeft:
                              currentSlide === index
                                ? "1px solid #3b82f6"
                                : "none",
                            borderRight:
                              currentSlide === index
                                ? "1px solid #3b82f6"
                                : "none",
                          }}
                        >
                          {index + 1}
                        </QuestionNumber>
                      );
                    },
                  )}
                </PaletteGrid>
              </QuestionPalette>
            </div>

            <SidebarFooter>
              {/* Add dropdowns for filtering */}
              <div>
                {hasSubmitted && (
                  <FilterWrapper>
                    <FilterLabel htmlFor="filter">
                      Filter Questions:
                    </FilterLabel>
                    <FilterSelect
                      id="filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="attempted">Attempted</option>
                      <option value="nonAttempted">Non-Attempted</option>
                      <option value="correct">Correct</option>
                      <option value="wrong">Wrong</option>
                      <option value="markedForReview">Marked for Review</option>
                    </FilterSelect>
                  </FilterWrapper>
                )}
              </div>
              <Button
                $desktopOnly // Added desktopOnly prop
                style={{
                  width: "50%",
                  color: hasSubmitted ? "red" : "inherit",
                  // Removed incorrect inline media query
                }}
                ref={submitButtonRef}
                onClick={handleSubmitClick}
              >
                {hasSubmitted ? "Close" : "Submit"}
              </Button>
            </SidebarFooter>
          </Sidebar>
        </ExamContainer>
      )}

      {showExitModal && (
        <Modal>
          <ModalContent>
            <p>You are not allowed to escape fullscreen mode.</p>
            <ModalButton onClick={handleExitModalConfirm}>OK</ModalButton>
          </ModalContent>
        </Modal>
      )}

      {showSubmitModal && (
        <SubmitModal>
          <ModalContent>
            <ModalTitle>Exam Submitted Successfully</ModalTitle>

            <ModalSection>
              <ScoreHeader>
                <ScoreLabel>Total Score: </ScoreLabel>
                <ScoreValue>
                  {Object.values(answersObject || {}).reduce(
                    (sum, section) => sum + (section?.totalMarks || 0),
                    0,
                  )}
                </ScoreValue>
              </ScoreHeader>

              <StatsGrid>
                <StatCard>
                  <StatCardLabel>Attempted</StatCardLabel>
                  <StatCardValue>
                    {Object.values(answersObject || {}).reduce(
                      (sum, section) => sum + (section?.attempted || 0),
                      0,
                    )}{" "}
                    /
                    {Object.values(answersObject || {}).reduce(
                      (sum, section) =>
                        sum + (section?.totalSectionQuestions || 0),
                      0,
                    )}
                  </StatCardValue>
                </StatCard>

                <StatCard>
                  <StatCardLabel>Correct</StatCardLabel>
                  <StatCardValue $color="#4caf50">
                    {Object.values(answersObject || {}).reduce(
                      (sum, section) => sum + (section?.correct || 0),
                      0,
                    )}
                  </StatCardValue>
                </StatCard>

                <StatCard>
                  <StatCardLabel>Positive Marks</StatCardLabel>
                  <StatCardValue $color="#4caf50">
                    {Object.values(answersObject || {}).reduce(
                      (sum, section) => sum + (section?.positiveMarks || 0),
                      0,
                    )}
                  </StatCardValue>
                </StatCard>

                <StatCard>
                  <StatCardLabel>Negative Marks</StatCardLabel>
                  <StatCardValue $color="#f44336">
                    {Object.values(answersObject || {}).reduce(
                      (sum, section) => sum + (section?.negativeMarks || 0),
                      0,
                    )}
                  </StatCardValue>
                </StatCard>
              </StatsGrid>
            </ModalSection>

            {/* Section-wise summary */}
            <SectionSummaryWrapper>
              <SectionSummaryTitle>
                Section-wise Summary
              </SectionSummaryTitle>

              {Object.entries(answersObject || {}).map(([section, data]) => (
                <SectionItemWrapper key={section}>
                  <SectionItemHeader>
                    <SectionName>{section}</SectionName>
                    <SectionScore>{data?.totalMarks || 0} marks</SectionScore>
                  </SectionItemHeader>

                  <SectionStats>
                    <SectionStatItem>
                      Accuracy:{" "}
                      {data?.attempted
                        ? ((data.correct / data.attempted) * 100).toFixed(1)
                        : 0}
                      %
                    </SectionStatItem>
                    <div>
                      Prep level:{" "}
                      {data?.totalSectionQuestions
                        ? (
                            (data.correct / data.totalSectionQuestions) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </SectionStats>
                </SectionItemWrapper>
              ))}
            </SectionSummaryWrapper>

            <ModalButton
              onClick={() => {
                setShowSubmitModal(false);
                setHasSubmitted(true);
                showFeedbackModalWithFeatureFlag();
              }}
            >
              Continue
            </ModalButton>
          </ModalContent>
        </SubmitModal>
      )}

      {showConfirmSubmitModal && (
        <Modal>
          <ModalContent>
            <EarlySubmissionTitle>Early Submission</EarlySubmissionTitle>
            <EarlySubmissionText>
              You still have {Math.floor(timeLeft / 60)} minutes remaining.
            </EarlySubmissionText>
            <EarlySubmissionText $lastItem>
              Are you sure you want to submit?
            </EarlySubmissionText>
            <ButtonContainer>
              <ModalButton
                onClick={() => {
                  setShowConfirmSubmitModal(false);
                  handleSubmit();
                }}
              >
                Yes, Submit
              </ModalButton>
              <ModalButton
                $secondary
                onClick={() => setShowConfirmSubmitModal(false)}
              >
                No, Continue
              </ModalButton>
            </ButtonContainer>
          </ModalContent>
        </Modal>
      )}

      {showFeedbackModal && (
        <FeedbackModalContainer>
          <FeedbackModalContent>
            <h3>Submit Feedback</h3>
            <StarRatingContainer>
              {getStarsData().map(({ star, filled, onClick }) => (
                <Star key={star} $filled={filled} onClick={onClick}>
                  ★
                </Star>
              ))}
            </StarRatingContainer>
            <FeedbackTextArea
              value={feedbackComment}
              onChange={(e) => updateFeedbackComment(e.target.value)}
              placeholder="Enter your feedback here..."
            />
            <ButtonContainer>
              <ModalButton onClick={submitFeedback}>Submit</ModalButton>
              <ModalButton $secondary onClick={cancelFeedback}>
                Cancel
              </ModalButton>
            </ButtonContainer>
          </FeedbackModalContent>
        </FeedbackModalContainer>
      )}
    </>
  );
}

export default ExamInterfacePage;
