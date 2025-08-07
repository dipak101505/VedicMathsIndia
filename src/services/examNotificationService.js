/**
 * This service is used to get the upcoming and past week exams for a student
 * It is used to display the exams in the exam notification page
 * It is also used to display the exams in the exam page
 * It is also used to display the exams in the exam result page
 * It is also used to display the exams in the exam result page
 */

import { getExams } from './questionService';
import { batchGetUserExamResults } from './questionService';
import { auth } from '../firebase/config';

// Cache to store exam data
let examsCache = {
  data: null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
};

/**
 * Helper function to get exams with caching
 * @returns {Promise<Array>} - Array of all exams
 */
const getCachedExams = async () => {
  const currentTime = Date.now();
  // If cache is expired or empty, fetch new data
  if (!examsCache.data || (currentTime - examsCache.timestamp > examsCache.expiryTime)) {
    examsCache.data = await getExams();
    examsCache.timestamp = currentTime;
  }
  return examsCache.data;
};

/**
 * Fetches upcoming exams for the current week
 * @param {string} studentBatch - The student's batch to filter exams
 * @param {string} userId - The current user's ID to check for submitted exams
 * @returns {Promise<Array>} - Array of upcoming exams
 */
export const getUpcomingExams = async (studentBatch, userId = null) => {
  try {
    // Get all exams with caching
    const allExams = await getCachedExams();
    
    // Filter exams by student batch
    const studentExams = allExams.filter(exam => 
      studentBatch.includes(exam.batch)
    );

    // Get current date and date 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Filter exams scheduled within the next 7 days
    const upcomingExams = studentExams.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate >= today && examDate <= nextWeek;
    });
    
    // Sort by date (closest first)
    upcomingExams.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add hasQuestions property to all exams
    const examsWithQuestionStatus = upcomingExams.map(exam => ({
      ...exam,
      hasQuestions: Boolean(
        (exam.questions && exam.questions.length > 0) || 
        (exam.examMetadata && exam.examMetadata.questionCount > 0)
      )
    }));
    
    // Check if exams have been submitted if userId is provided (in a single batch)
    if (userId && auth.currentUser && examsWithQuestionStatus.length > 0) {
      const examIds = examsWithQuestionStatus.map(exam => exam.id);
      const resultsMap = await batchGetUserExamResults(userId, examIds);
      
      // Update the exams with submission status
      return examsWithQuestionStatus.map(exam => ({
        ...exam,
        isSubmitted: !!resultsMap[exam.id]
      }));
    }

    return examsWithQuestionStatus;
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    return [];
  }
};

/**
 * Fetches past week exams
 * @param {string} studentBatch - The student's batch to filter exams
 * @param {string} userId - The current user's ID to check for submitted exams
 * @returns {Promise<Array>} - Array of past week exams
 */
export const getPastWeekExams = async (studentBatch, userId = null) => {
  try {
    // Get all exams with caching
    const allExams = await getCachedExams();
    
    // Filter exams by student batch
    const studentExams = allExams.filter(exam => 
      studentBatch.includes(exam.batch)
    );

    // Get current date and date 7 days ago
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Filter exams scheduled within the past 7 days
    const pastWeekExams = studentExams.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate >= lastWeek && examDate < today;
    });
    
    // Sort by date (most recent first)
    pastWeekExams.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add hasQuestions property to all exams
    const examsWithQuestionStatus = pastWeekExams.map(exam => ({
      ...exam,
      hasQuestions: Boolean(
        (exam.questions && exam.questions.length > 0) || 
        (exam.examMetadata && exam.examMetadata.questionCount > 0)
      ),
      isPast: true
    }));
    
    // Check if exams have been submitted if userId is provided (in a single batch)
    if (userId && auth.currentUser && examsWithQuestionStatus.length > 0) {
      const examIds = examsWithQuestionStatus.map(exam => exam.id);
      const resultsMap = await batchGetUserExamResults(userId, examIds);
      
      // Update the exams with submission status
      return examsWithQuestionStatus.map(exam => ({
        ...exam,
        isSubmitted: !!resultsMap[exam.id]
      }));
    }

    return examsWithQuestionStatus;
  } catch (error) {
    console.error('Error fetching past week exams:', error);
    return [];
  }
};

/**
 * Gets all exams (both upcoming and past week)
 * @param {string} studentBatch - The student's batch to filter exams
 * @param {string} userId - The current user's ID to check for submitted exams
 * @returns {Promise<Object>} - Object containing upcoming and past week exams
 */
export const getAllRelevantExams = async (studentBatch, userId = null) => {
  try {
    // Get all exams once with caching
    const allExams = await getCachedExams();
    
    // Filter exams by student batch
    const studentExams = allExams.filter(exam => 
      studentBatch.includes(exam.batch)
    );
    
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Filter and process exams in one pass with hasQuestions property
    const upcoming = [];
    const pastWeek = [];
    
    for (const exam of studentExams) {
      const examDate = new Date(exam.date);
      const hasQuestions = Boolean(
        (exam.questions && exam.questions.length > 0) || 
        (exam.examMetadata && exam.examMetadata.questionCount > 0)
      );
      
      const examWithStatus = {
        ...exam,
        hasQuestions
      };
      
      if (examDate >= today && examDate <= nextWeek) {
        upcoming.push(examWithStatus);
      } else if (examDate >= lastWeek && examDate < today) {
        pastWeek.push({
          ...examWithStatus,
          isPast: true
        });
      }
    }
    
    // Sort by date
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    pastWeek.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Check all exam submissions in a single batch if userId is provided
    if (userId && auth.currentUser) {
      const allExamIds = [...upcoming.map(exam => exam.id), ...pastWeek.map(exam => exam.id)];
      
      if (allExamIds.length > 0) {
        const resultsMap = await batchGetUserExamResults(userId, allExamIds);
        
        // Update the exam arrays with submission status
        const upcomingWithSubmitStatus = upcoming.map(exam => ({
          ...exam,
          isSubmitted: !!resultsMap[exam.id]
        }));
        
        const pastWeekWithSubmitStatus = pastWeek.map(exam => ({
          ...exam,
          isSubmitted: !!resultsMap[exam.id]
        }));
        
        return {
          upcoming: upcomingWithSubmitStatus,
          pastWeek: pastWeekWithSubmitStatus
        };
      }
    }
    
    return {
      upcoming,
      pastWeek
    };
  } catch (error) {
    console.error('Error fetching all relevant exams:', error);
    return {
      upcoming: [],
      pastWeek: []
    };
  }
};

/**
 * Gets the count of upcoming exams
 * @param {string} studentBatch - The student's batch to filter exams
 * @returns {Promise<number>} - Number of upcoming exams
 */
export const getUpcomingExamsCount = async (studentBatch) => {
  const exams = await getUpcomingExams(studentBatch);
  return exams.length;
}; 