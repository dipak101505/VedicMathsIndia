import { useState, useCallback } from 'react';
import posthog from 'posthog-js';

/**
 * Custom hook for managing exam feedback functionality
 * @param {Object} config - Configuration object
 * @param {string} config.examId - Current exam ID
 * @param {Object} config.user - User object
 * @param {Object} config.examData - Exam data object
 * @param {Object} config.answersObject - Answers and results object
 * @param {Function} config.navigate - Navigation function
 * @param {Function} config.exitFullscreen - Function to exit fullscreen mode
 * @returns {Object} Feedback state and functions
 */
export const useFeedback = ({
  examId,
  user,
  examData,
  answersObject,
  navigate,
  exitFullscreen
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Helper function to escape Telegram markdown
  const escapeTelegramMarkdownV1 = useCallback((text) => {
    if (typeof text !== 'string') return text;
    // Escapes _, *, [, ], `, \
    return text.replace(/([_*[\]`\\])/g, '\\$1');
  }, []);

  // Format results for Telegram notification
  const formatResultsForTelegram = useCallback((results) => {
    if (!results || Object.keys(results).length === 0) {
      return "No results available.";
    }

    let overallTotalMarks = 0;
    let overallPositiveMarks = 0;
    let overallNegativeMarks = 0;
    let overallAttempted = 0;
    let overallCorrect = 0;
    let overallTotalQuestions = 0;

    let sectionDetails = "";

    for (const sectionName in results) {
      const data = results[sectionName];
      overallTotalMarks += data.totalMarks || 0;
      overallPositiveMarks += data.positiveMarks || 0;
      overallNegativeMarks += data.negativeMarks || 0;
      overallAttempted += data.attempted || 0;
      overallCorrect += data.correct || 0;
      overallTotalQuestions += data.totalSectionQuestions || 0;

      const accuracy = data.attempted ? ((data.correct / data.attempted) * 100).toFixed(1) : 0;
      const prepLevel = data.totalSectionQuestions ? ((data.correct / data.totalSectionQuestions) * 100).toFixed(1) : 0;

      sectionDetails += `\n--- ${sectionName} ---
`;
      sectionDetails += `  Score: ${data.totalMarks || 0}\n`;
      sectionDetails += `  Accuracy: ${accuracy}%\n`;
      sectionDetails += `  Prep Level: ${prepLevel}%\n`;
      sectionDetails += `  Attempted: ${data.attempted || 0}/${data.totalSectionQuestions || 0}\n`;
      sectionDetails += `  Correct: ${data.correct || 0}\n`;
    }

    const overallAccuracy = overallAttempted ? ((overallCorrect / overallAttempted) * 100).toFixed(1) : 0;
    const overallPrepLevel = overallTotalQuestions ? ((overallCorrect / overallTotalQuestions) * 100).toFixed(1) : 0;

    let resultsString = `*Overall Summary*\n`;
    resultsString += `Accuracy: ${overallAccuracy}%\n`;
    resultsString += `Prep Level: ${overallPrepLevel}%\n`;
    
    if (sectionDetails) {
      resultsString += `\n*Section-wise Performance*${sectionDetails}`;
    }
    
    return resultsString;
  }, []);

  // Show feedback modal based on feature flag
  const showFeedbackModalWithFeatureFlag = useCallback(() => {
    // Check PostHog feature flag for feedback modal
    posthog.onFeatureFlags(function() {
      if (posthog.isFeatureEnabled('Exam-Feedback')) {
        posthog.capture('exam_feedback_modal_shown', {
          exam_id: examId,
          user_id: user?.uid,
          feature_flag: 'Exam-Feedback'
        });
        setShowFeedbackModal(true);
      } else {
        posthog.capture('exam_feedback_modal_skipped', {
          exam_id: examId,
          user_id: user?.uid,
          feature_flag: 'Exam-Feedback',
          reason: 'feature_flag_disabled'
        });
        // Exit fullscreen and navigate directly if feature flag is disabled
        handleDirectNavigation();
      }
    });

    // Fallback: direct check in case onFeatureFlags doesn't work immediately
    setTimeout(() => {
      if (posthog.isFeatureEnabled('Exam-Feedback')) {
        posthog.capture('exam_feedback_modal_shown_fallback', {
          exam_id: examId,
          user_id: user?.uid,
          feature_flag: 'Exam-Feedback'
        });
        setShowFeedbackModal(true);
      } else {
        posthog.capture('exam_feedback_modal_skipped_fallback', {
          exam_id: examId,
          user_id: user?.uid,
          feature_flag: 'Exam-Feedback',
          reason: 'feature_flag_disabled'
        });
        // Exit fullscreen and navigate directly if feature flag is disabled
        handleDirectNavigation();
      }
    }, 100);
  }, [examId, user]);

  // Direct navigation without feedback
  const handleDirectNavigation = useCallback(() => {
    if (exitFullscreen) {
      exitFullscreen();
    }
    if (navigate) {
      navigate("/");
    }
  }, [exitFullscreen, navigate]);

  // Submit feedback
  const submitFeedback = useCallback(async () => {
    console.log("Feedback Rating:", feedbackRating);
    console.log("Feedback Comment:", feedbackComment);

    // Track feedback submission with PostHog
    posthog.capture('exam_feedback_submitted', {
      exam_id: examId,
      user_id: user?.uid,
      rating: feedbackRating,
      has_comment: feedbackComment.length > 0,
      comment_length: feedbackComment.length,
      feature_flag: 'Exam-Feedback'
    });

    // Send Telegram notification
    const botToken = "7124569099:AAEjdRfILNIa2HcIDo4MbMFM0SEcUnNRDLc"; // Note: Should use environment variables in production
    const chatId = "7345131891"; // Note: Should use environment variables in production
    
    const studentInfo = escapeTelegramMarkdownV1(user?.email || "Unknown Student");
    const examNameInfo = escapeTelegramMarkdownV1(examData?.name || "Unknown Exam");
    const commentText = escapeTelegramMarkdownV1(feedbackComment);
    const formattedResults = escapeTelegramMarkdownV1(formatResultsForTelegram(answersObject));

    const message = `*Exam Feedback Submitted*\n\n*Student:* ${studentInfo}\n*Exam:* ${examNameInfo}\n*Rating:* ${feedbackRating} Stars\n*Comment:* ${commentText}\n\n--- *Exam Results* ---\n${formattedResults}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.ok) {
        console.log("Telegram notification sent successfully!");
        posthog.capture('exam_feedback_telegram_sent', {
          exam_id: examId,
          user_id: user?.uid,
          success: true
        });
      } else {
        console.error("Error sending Telegram notification:", data);
        posthog.capture('exam_feedback_telegram_failed', {
          exam_id: examId,
          user_id: user?.uid,
          error: data.description || 'Unknown error'
        });
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      posthog.capture('exam_feedback_telegram_failed', {
        exam_id: examId,
        user_id: user?.uid,
        error: error.message
      });
    }

    // Reset feedback state and navigate
    setShowFeedbackModal(false);
    setFeedbackRating(0);
    setFeedbackComment("");
    handleDirectNavigation();
  }, [
    feedbackRating, 
    feedbackComment, 
    examId, 
    user, 
    examData, 
    answersObject, 
    escapeTelegramMarkdownV1, 
    formatResultsForTelegram, 
    handleDirectNavigation
  ]);

  // Cancel feedback
  const cancelFeedback = useCallback(() => {
    posthog.capture('exam_feedback_cancelled', {
      exam_id: examId,
      user_id: user?.uid,
      rating: feedbackRating,
      has_comment: feedbackComment.length > 0,
      feature_flag: 'Exam-Feedback'
    });
    setShowFeedbackModal(false);
    handleDirectNavigation();
  }, [examId, user, feedbackRating, feedbackComment, handleDirectNavigation]);

  // Set star rating
  const setStarRating = useCallback((rating) => {
    setFeedbackRating(rating);
  }, []);

  // Update feedback comment
  const updateFeedbackComment = useCallback((comment) => {
    setFeedbackComment(comment);
  }, []);

  // Render stars helper
  const getStarsData = useCallback(() => {
    return [1, 2, 3, 4, 5].map((star) => ({
      star,
      filled: star <= feedbackRating,
      onClick: () => setStarRating(star)
    }));
  }, [feedbackRating, setStarRating]);

  return {
    // State
    showFeedbackModal,
    feedbackRating,
    feedbackComment,
    
    // Functions
    showFeedbackModalWithFeatureFlag,
    submitFeedback,
    cancelFeedback,
    setStarRating,
    updateFeedbackComment,
    getStarsData,
    
    // Direct state setters (for backward compatibility)
    setShowFeedbackModal,
    setFeedbackRating,
    setFeedbackComment
  };
};

export default useFeedback;