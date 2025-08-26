// src/services/centreService.jsx
import { API_URLS } from '../config/constants';

export const getCentres = async () => {
  try {
    // For now, return dummy data
    // In a real implementation, this would make an API call
    return [
      { id: 1, name: "Centre A", location: "Mumbai", description: "Main centre in Mumbai" },
      { id: 2, name: "Centre B", location: "Delhi", description: "Main centre in Delhi" },
      { id: 3, name: "Centre C", location: "Bangalore", description: "Main centre in Bangalore" },
      { id: 4, name: "Centre D", location: "Chennai", description: "Main centre in Chennai" }
    ];
  } catch (error) {
    console.error('Error fetching centres:', error);
    throw error;
  }
};

export const createCentre = async (centreData) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Creating centre:', centreData);
    return { success: true, message: 'Centre created successfully' };
  } catch (error) {
    console.error('Error creating centre:', error);
    throw error;
  }
};

export const updateCentre = async (centreId, centreData) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Updating centre:', centreId, centreData);
    return { success: true, message: 'Centre updated successfully' };
  } catch (error) {
    console.error('Error updating centre:', error);
    throw error;
  }
};

export const deleteCentre = async (centreId) => {
  try {
    // In a real implementation, this would make an API call
    console.log('Deleting centre:', centreId);
    return { success: true, message: 'Centre deleted successfully' };
  } catch (error) {
    console.error('Error deleting centre:', error);
    throw error;
  }
};
