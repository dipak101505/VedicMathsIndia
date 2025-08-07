import { useState, useEffect } from 'react';
import { getAllRelevantExams } from '../services/examNotificationService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage exam notifications
 * @param {Object} studentData - Student data including batch information
 * @returns {Object} - Notification state and functions
 */
const useExamNotifications = (studentData) => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pastWeekExams, setPastWeekExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch exams when studentData changes
  useEffect(() => {
    const fetchExams = async () => {
      if (!studentData || !studentData.batch) return;
      
      setLoading(true);
      try {
        const exams = await getAllRelevantExams(studentData.batch, user?.uid);
        setUpcomingExams(exams.upcoming);
        setPastWeekExams(exams.pastWeek);
        setError(null);
      } catch (err) {
        console.error('Error fetching exam notifications:', err);
        setError('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
    
    // Refresh exam data every 30 minutes
    const intervalId = setInterval(fetchExams, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [studentData, user]);
  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };
  
  // Close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
  
  return {
    upcomingExams,
    pastWeekExams,
    examCount: upcomingExams.length + pastWeekExams.length,
    loading,
    error,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown
  };
};

export default useExamNotifications; 