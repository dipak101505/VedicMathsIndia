// src/services/subjectService.jsx
import { API_URLS } from '../config/constants';

export const getSubjects = async () => {
  try {
    // For now, return dummy data
    // In a real implementation, this would make an API call
    return [
      { id: 1, name: "Mathematics", description: "Core mathematics subjects" },
      { id: 2, name: "Physics", description: "Physics and related topics" },
      { id: 3, name: "Chemistry", description: "Chemistry and related topics" },
      { id: 4, name: "Biology", description: "Biology and related topics" }
    ];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Creating subject:', subjectData);
    return { success: true, message: 'Subject created successfully' };
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Updating subject:', subjectId, subjectData);
    return { success: true, message: 'Subject updated successfully' };
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Deleting subject:', subjectId);
    return { success: true, message: 'Subject deleted successfully' };
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
