import { useState, useCallback } from 'react';

/**
 * Custom hook for managing question navigation within an exam interface
 * @param {Object} config - Configuration object
 * @param {Array} config.subjects - Array of exam subjects/sections
 * @param {Map} config.questionsBySection - Map of questions organized by section
 * @param {Function} config.loadTopic - Function to load a specific topic
 * @param {Function} config.markAnswered - Function to mark question as answered
 * @param {Function} config.markNotAnswered - Function to mark question as not answered
 * @param {Map} config.selectedAnswers - Map of selected answers
 * @param {boolean} config.hasSubmitted - Whether exam has been submitted
 * @returns {Object} Navigation state and functions
 */
export const useQuestionNavigation = ({
  subjects = [],
  questionsBySection = new Map(),
  loadTopic,
  markAnswered,
  markNotAnswered,
  selectedAnswers = new Map(),
  hasSubmitted = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTopic, setCurrentTopic] = useState('');

  // Initialize the hook with the first topic
  const initializeNavigation = useCallback((topicId) => {
    setCurrentTopic(topicId);
    setCurrentSlide(0);
  }, []);

  // Navigate to a specific question within current section
  const goToQuestion = useCallback((questionIndex) => {
    setCurrentSlide(questionIndex);
  }, []);

  // Navigate to a specific section and question
  const goToSection = useCallback((topicId, questionIndex = 0) => {
    setCurrentTopic(topicId);
    setCurrentSlide(questionIndex);
    if (loadTopic) {
      loadTopic(topicId);
    }
  }, [loadTopic]);

  // Navigate to previous question
  const goToPrevious = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentSlide]);

  // Navigate to next question with automatic section transition
  const goToNext = useCallback(() => {
    const currentSectionQuestions = questionsBySection.get(currentTopic) || [];
    
    // If there are more questions in current section
    if (currentSlide + 1 < currentSectionQuestions.length) {
      setCurrentSlide(prev => prev + 1);
      return { moved: true, sectionChanged: false };
    }
    
    // Try to move to next section
    const currentTopicIndex = subjects.findIndex(topic => topic.id === currentTopic);
    if (currentTopicIndex + 1 < subjects.length) {
      const nextTopic = subjects[currentTopicIndex + 1];
      setCurrentSlide(0);
      setCurrentTopic(nextTopic.id);
      if (loadTopic) {
        loadTopic(nextTopic.id);
      }
      return { moved: true, sectionChanged: true, newSection: nextTopic.id };
    }
    
    // No more questions or sections
    return { moved: false, sectionChanged: false };
  }, [currentSlide, currentTopic, questionsBySection, subjects, loadTopic]);

  // Save current answer and navigate to next question
  const saveAndNext = useCallback(() => {
    const currentSectionQuestions = questionsBySection.get(currentTopic) || [];
    const currentQuestion = currentSectionQuestions[currentSlide];
    
    if (!currentQuestion || hasSubmitted) {
      return { moved: false };
    }

    // Check if current question has an answer
    let hasAnswer = false;
    
    if (currentQuestion.type === "integer") {
      hasAnswer = !!selectedAnswers.get(currentTopic)?.get(currentQuestion.id);
    } else if (currentQuestion.type === "multiple") {
      const selectedCheckboxes = document.querySelectorAll(
        `input[name="question${currentSlide + 1}"]:checked`
      );
      hasAnswer = selectedCheckboxes.length > 0;
    } else {
      hasAnswer = !!document.querySelector(
        `input[name="question${currentSlide + 1}"]:checked`
      );
    }

    // Mark current question status
    if (hasAnswer && markAnswered) {
      markAnswered(currentSlide);
    } else if (markNotAnswered) {
      markNotAnswered(currentSlide);
    }

    // Navigate to next question
    const navigationResult = goToNext();
    
    // If moved to next question, check and mark its status
    if (navigationResult.moved && !navigationResult.sectionChanged) {
      const nextQuestion = currentSectionQuestions[currentSlide + 1];
      if (nextQuestion) {
        let nextHasAnswer = false;
        
        if (nextQuestion.type === "integer") {
          nextHasAnswer = !!selectedAnswers.get(currentTopic)?.get(nextQuestion.id);
        } else if (nextQuestion.type === "multiple") {
          const nextSelectedCheckboxes = document.querySelectorAll(
            `input[name="question${currentSlide + 2}"]:checked`
          );
          nextHasAnswer = nextSelectedCheckboxes.length > 0;
        } else {
          nextHasAnswer = !!document.querySelector(
            `input[name="question${currentSlide + 2}"]:checked`
          );
        }
        
        if (nextHasAnswer && markAnswered) {
          markAnswered(currentSlide + 1);
        } else if (markNotAnswered) {
          markNotAnswered(currentSlide + 1);
        }
      }
    }

    return navigationResult;
  }, [
    currentSlide, 
    currentTopic, 
    questionsBySection, 
    selectedAnswers, 
    hasSubmitted, 
    markAnswered, 
    markNotAnswered, 
    goToNext
  ]);

  // Mark for review and navigate to next question
  const markForReviewAndNext = useCallback(() => {
    if (hasSubmitted) {
      return { moved: false };
    }

    // Check if current question has an answer
    const hasAnswer = document.querySelector(
      `input[name="question${currentSlide + 1}"]:checked`
    );
    
    // This would need to be passed in or handled differently
    // For now, we'll return the navigation result and let the parent handle marking
    const navigationResult = goToNext();
    
    return {
      ...navigationResult,
      hasAnswer: !!hasAnswer
    };
  }, [currentSlide, hasSubmitted, goToNext]);

  // Get current question data
  const getCurrentQuestion = useCallback(() => {
    const currentSectionQuestions = questionsBySection.get(currentTopic) || [];
    return currentSectionQuestions[currentSlide] || null;
  }, [currentSlide, currentTopic, questionsBySection]);

  // Get navigation state info
  const getNavigationInfo = useCallback(() => {
    const currentSectionQuestions = questionsBySection.get(currentTopic) || [];
    const currentTopicIndex = subjects.findIndex(topic => topic.id === currentTopic);
    
    return {
      currentQuestionIndex: currentSlide,
      currentSectionIndex: currentTopicIndex,
      questionsInCurrentSection: currentSectionQuestions.length,
      totalSections: subjects.length,
      isFirstQuestion: currentSlide === 0 && currentTopicIndex === 0,
      isLastQuestion: currentSlide === currentSectionQuestions.length - 1 && 
                     currentTopicIndex === subjects.length - 1,
      isFirstInSection: currentSlide === 0,
      isLastInSection: currentSlide === currentSectionQuestions.length - 1,
      canGoNext: currentSlide + 1 < currentSectionQuestions.length || 
                currentTopicIndex + 1 < subjects.length,
      canGoPrevious: currentSlide > 0
    };
  }, [currentSlide, currentTopic, questionsBySection, subjects]);

  return {
    // State
    currentSlide,
    currentTopic,
    
    // Navigation functions
    initializeNavigation,
    goToQuestion,
    goToSection,
    goToPrevious,
    goToNext,
    saveAndNext,
    markForReviewAndNext,
    
    // Utility functions
    getCurrentQuestion,
    getNavigationInfo,
    
    // Direct state setters (for backward compatibility)
    setCurrentSlide,
    setCurrentTopic
  };
};

export default useQuestionNavigation;