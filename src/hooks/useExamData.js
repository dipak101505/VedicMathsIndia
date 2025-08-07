import { useState, useEffect, useCallback } from 'react';
import { getExam, getExamQuestions, getUserExamResults } from '../services/questionService';

/**
 * Custom hook for managing exam data, results, and question organization
 * @param {Object} config - Configuration object
 * @param {string} config.examId - The exam ID to load
 * @param {Object} config.user - User object for fetching results
 * @param {Function} config.initializeNavigation - Function to initialize navigation with first topic
 * @returns {Object} Exam data state and functions
 */
export const useExamData = ({ 
  examId, 
  user, 
  initializeNavigation 
}) => {
  // Core exam data states
  const [examData, setExamData] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answersObject, setAnswersObject] = useState({});
  
  // Question organization states
  const [subjects, setSubjects] = useState([]);
  const [questionsBySection, setQuestionsBySection] = useState(new Map());
  const [selectedAnswers, setSelectedAnswers] = useState(new Map());
  const [questionStatuses, setQuestionStatuses] = useState(new Map());
  const [questionTimes, setQuestionTimes] = useState(new Map());
  
  // Loading states
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [examError, setExamError] = useState(null);
  const [resultsError, setResultsError] = useState(null);

  // Fetch exam data (metadata + questions)
  const fetchExamData = useCallback(async (examId) => {
    try {
      setIsLoadingExam(true);
      setExamError(null);
      
      // Fetch exam data from DynamoDB
      const examData = await getExam(examId);

      // Fetch questions from DynamoDB using questionService
      const questions = await getExamQuestions(examId);

      // Transform DynamoDB response if needed
      const transformedQuestions = questions?.questions?.map((question) => ({
        id: question.id, // Extract ID from SK
        question: question.contents,
        options: question.options,
        metadata: question.metadata,
        correctAnswer: question.correctAnswer,
        solutionContent: question.solutionContent,
        type: question.type,
      }));
      
      // Combine exam data with questions
      const combinedData = {
        id: examId,
        ...examData,
        questions: transformedQuestions,
      };
      
      setExamData(combinedData);
      return combinedData;
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setExamError(error);
      throw error;
    } finally {
      setIsLoadingExam(false);
    }
  }, []);

  // Fetch user exam results
  const fetchExamResults = useCallback(async (userId, examId) => {
    try {
      setIsLoadingResults(true);
      setResultsError(null);
      
      // Get exam results from DynamoDB
      const results = await getUserExamResults(userId);
      console.log("Raw exam results:", results);
      
      // Transform DynamoDB response
      const transformedResults = results.map((result) => ({
        examId: result.SK.replace("EXAM#", ""),
        userId: result.userId,
        answers: result.answers,
        sections: result.sections,
        statistics: result.statistics,
        submittedAt: result.submittedAt,
        status: result.status,
        questionStatuses: result.questionStatuses,
      }));

      console.log("Transformed exam results:", transformedResults);
      
      // Filter results to get only the current exam results
      const currentExamResults = transformedResults.filter(
        (result) => result.examId === examId,
      );
      console.log("Current exam results:", currentExamResults);
      
      setHasSubmitted(currentExamResults.length > 0);
      setExamResults(currentExamResults);
      
      // If there are results, set the answersObject for immediate display
      if (currentExamResults.length > 0 && currentExamResults[0].answers) {
        setAnswersObject(currentExamResults[0].answers);
      }

      // Restore question statuses if exam was submitted
      if (currentExamResults[0]?.questionStatuses) {
        const statusesMap = new Map();
        Object.entries(currentExamResults[0].questionStatuses).forEach(
          ([topic, statuses]) => {
            statusesMap.set(topic, new Map(Object.entries(statuses)));
          },
        );
        setQuestionStatuses(statusesMap);
      }

      // Restore question times from previous attempt
      if (currentExamResults[0]?.statistics?.questionTimes) {
        const timesMap = new Map();
        Object.entries(
          currentExamResults[0].statistics.questionTimes,
        ).forEach(([topic, questions]) => {
          Object.entries(questions).forEach(([questionIndex, time]) => {
            const key = `${topic}-${questionIndex}`;
            timesMap.set(key, time * 1000);
          });
        });
        setQuestionTimes(timesMap);
      } else {
        setQuestionTimes(new Map());
      }
      
      return currentExamResults;
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setResultsError(error);
      throw error;
    } finally {
      setIsLoadingResults(false);
    }
  }, []);

  // Process exam results to set selectedAnswers
  const processExamResults = useCallback((examResults) => {
    if (examResults.length > 0) {
      const result = examResults[0];

      // Set answersObject from results for displaying in the modal
      if (result.answers) {
        setAnswersObject(result.answers);
      }

      // Convert the answers object back to a Map structure
      const answersMap = new Map();
      Object.entries(result.answers || {}).forEach(([section, sectionData]) => {
        const sectionAnswers = new Map();
        // Filter out metadata properties and only keep answer key-value pairs
        Object.entries(sectionData).forEach(([key, value]) => {
          if (!["totalMarks", "positiveMarks", "negativeMarks", "attempted", "correct", "totalSectionQuestions"].includes(key)) {
            sectionAnswers.set(key, value);
          }
        });
        answersMap.set(section, sectionAnswers);
      });

      setSelectedAnswers(answersMap);
    }
  }, []);

  // Organize questions by sections and create subjects list
  const organizeQuestionData = useCallback((examData) => {
    if (examData?.questions) {
      // Get unique sections from questions
      const uniqueSections = [
        ...new Set(examData.questions.map((q) => q.metadata.sectionName)),
      ];
      const topicsFromSections = uniqueSections
        .map((section) => ({
          id: section,
          name: section,
        }))
        .filter((topic) => topic.id); // Remove any undefined/null sections

      const questionMap = new Map();

      // Group questions by section
      examData.questions.forEach((question) => {
        const section = question.metadata.sectionName;
        if (!questionMap.has(section)) {
          questionMap.set(section, []);
        }
        questionMap.get(section).push(question);
      });

      setQuestionsBySection(questionMap);
      setSubjects(topicsFromSections);
      
      // Initialize navigation with first topic
      if (topicsFromSections[0]?.id && initializeNavigation) {
        initializeNavigation(topicsFromSections[0].id);
      }
      
      return { subjects: topicsFromSections, questionsBySection: questionMap };
    }
    return { subjects: [], questionsBySection: new Map() };
  }, [initializeNavigation]);

  // Refresh exam data
  const refreshExamData = useCallback(async () => {
    if (examId) {
      await fetchExamData(examId);
    }
  }, [examId, fetchExamData]);

  // Refresh exam results
  const refreshExamResults = useCallback(async () => {
    if (user?.uid && examId) {
      const results = await fetchExamResults(user.uid, examId);
      return results;
    }
  }, [user?.uid, examId, fetchExamResults]);

  // Get question by coordinates
  const getQuestion = useCallback((topic, questionIndex) => {
    const sectionQuestions = questionsBySection.get(topic);
    return sectionQuestions?.[questionIndex] || null;
  }, [questionsBySection]);

  // Get total questions count
  const getTotalQuestionsCount = useCallback(() => {
    let total = 0;
    questionsBySection.forEach((questions) => {
      total += questions.length;
    });
    return total;
  }, [questionsBySection]);

  // Get questions count by section
  const getQuestionCountBySection = useCallback((sectionId) => {
    return questionsBySection.get(sectionId)?.length || 0;
  }, [questionsBySection]);

  // Update selected answers
  const updateSelectedAnswers = useCallback((topic, questionId, answer) => {
    setSelectedAnswers(prev => {
      const newAnswers = new Map(prev);
      if (!newAnswers.has(topic)) {
        newAnswers.set(topic, new Map());
      }
      newAnswers.get(topic).set(questionId, answer);
      return newAnswers;
    });
  }, []);

  // Clear selected answer
  const clearSelectedAnswer = useCallback((topic, questionId) => {
    setSelectedAnswers(prev => {
      const newAnswers = new Map(prev);
      if (newAnswers.has(topic)) {
        const sectionAnswers = newAnswers.get(topic);
        sectionAnswers.delete(questionId);
        if (sectionAnswers.size === 0) {
          newAnswers.delete(topic);
        }
      }
      return newAnswers;
    });
  }, []);

  // Update question status
  const updateQuestionStatus = useCallback((topic, questionIndex, status) => {
    setQuestionStatuses(prev => {
      const newStatuses = new Map(prev);
      if (!newStatuses.has(topic)) {
        newStatuses.set(topic, new Map());
      }
      newStatuses.get(topic).set(questionIndex, status);
      return newStatuses;
    });
  }, []);

  // Update question time
  const updateQuestionTime = useCallback((topic, questionIndex, timeMs) => {
    const questionKey = `${topic}-${questionIndex}`;
    setQuestionTimes(prev => {
      const newTimes = new Map(prev);
      newTimes.set(questionKey, timeMs);
      return newTimes;
    });
  }, []);

  // Load initial exam data
  useEffect(() => {
    if (examId) {
      fetchExamData(examId);
    }
  }, [examId, fetchExamData]);

  // Load exam results when user is available
  useEffect(() => {
    if (user?.uid && examId) {
      fetchExamResults(user.uid, examId);
    }
  }, [user?.uid, examId, fetchExamResults]);

  // Process exam results when they're loaded and hasSubmitted changes
  useEffect(() => {
    if (hasSubmitted && examResults.length > 0) {
      processExamResults(examResults);
    }
  }, [hasSubmitted, examResults, processExamResults]);

  // Organize question data when exam data is loaded
  useEffect(() => {
    if (examData) {
      organizeQuestionData(examData);
    }
  }, [examData, organizeQuestionData]);

  return {
    // Core exam data
    examData,
    examResults,
    hasSubmitted,
    answersObject,
    
    // Question organization
    subjects,
    questionsBySection,
    selectedAnswers,
    questionStatuses,
    questionTimes,
    
    // Loading states
    isLoadingExam,
    isLoadingResults,
    examError,
    resultsError,
    
    // Computed values
    totalQuestionsCount: getTotalQuestionsCount(),
    
    // Functions
    refreshExamData,
    refreshExamResults,
    getQuestion,
    getQuestionCountBySection,
    updateSelectedAnswers,
    clearSelectedAnswer,
    updateQuestionStatus,
    updateQuestionTime,
    
    // State setters (for backward compatibility)
    setExamData,
    setExamResults,
    setHasSubmitted,
    setAnswersObject,
    setSubjects,
    setQuestionsBySection,
    setSelectedAnswers,
    setQuestionStatuses,
    setQuestionTimes
  };
};

export default useExamData;