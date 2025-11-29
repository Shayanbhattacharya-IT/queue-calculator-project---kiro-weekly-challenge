const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch all locations with optional filters
 * @param {Object} filters - Optional filters
 * @param {number} filters.category - Category ID
 * @param {string} filters.search - Search query
 * @returns {Promise<Array>} Array of location objects
 */
export async function fetchLocations(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.append('category', filters.category);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  const url = `${API_BASE_URL}/locations${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch locations');
  }
  
  return response.json();
}

/**
 * Submit a wait time report
 * @param {Object} reportData - Report data
 * @param {number} reportData.locationId - Location ID
 * @param {number} reportData.waitTimeMinutes - Wait time in minutes
 * @returns {Promise<Object>} Success response
 */
export async function submitReport(reportData) {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to submit report');
  }
  
  return response.json();
}

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch categories');
  }
  
  return response.json();
}

/**
 * Join a queue at a location
 * @param {Object} queueData - Queue data
 * @param {number} queueData.locationId - Location ID
 * @param {string} queueData.userId - User ID
 * @returns {Promise<Object>} Queue entry response
 */
export async function joinQueue(queueData) {
  const response = await fetch(`${API_BASE_URL}/queue/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queueData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to join queue');
  }
  
  return response.json();
}

/**
 * Get user's queue status
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of queue entries
 */
export async function getQueueStatus(userId) {
  const response = await fetch(`${API_BASE_URL}/queue/status/${userId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get queue status');
  }
  
  return response.json();
}

/**
 * Complete a queue entry
 * @param {number} entryId - Queue entry ID
 * @returns {Promise<Object>} Success response
 */
export async function completeQueueEntry(entryId) {
  const response = await fetch(`${API_BASE_URL}/queue/complete/${entryId}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to complete queue entry');
  }
  
  return response.json();
}

/**
 * Get queue length at a location
 * @param {number} locationId - Location ID
 * @returns {Promise<Object>} Queue length data
 */
export async function getQueueLength(locationId) {
  const response = await fetch(`${API_BASE_URL}/queue/length/${locationId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get queue length');
  }
  
  return response.json();
}
