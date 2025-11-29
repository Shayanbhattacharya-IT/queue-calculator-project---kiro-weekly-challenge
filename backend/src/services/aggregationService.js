import LocationRepository from '../repositories/LocationRepository.js';
import WaitTimeReportRepository from '../repositories/WaitTimeReportRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';

/**
 * Calculate confidence level based on report count
 * @param {number} reportCount - Number of reports
 * @returns {'high'|'medium'|'low'|'none'} Confidence level
 */
export function calculateConfidenceLevel(reportCount) {
  if (reportCount === 0) return 'none';
  if (reportCount < 3) return 'low';
  if (reportCount < 10) return 'medium';
  return 'high';
}

/**
 * Categorize wait time severity
 * @param {number|null} waitTimeMinutes - Wait time in minutes
 * @returns {'short'|'moderate'|'long'|'unknown'} Severity category
 */
export function categorizeWaitTime(waitTimeMinutes) {
  if (waitTimeMinutes === null || waitTimeMinutes === undefined) return 'unknown';
  if (waitTimeMinutes <= 10) return 'short';
  if (waitTimeMinutes <= 30) return 'moderate';
  return 'long';
}

/**
 * Get aggregated location data with wait time statistics
 * @param {Object} filters - Optional filters
 * @param {number} filters.categoryId - Filter by category ID
 * @param {string} filters.search - Search by location name
 * @param {boolean} filters.activeOnly - Only return active locations (default: true)
 * @returns {Promise<Array<AggregatedLocationData>>} Array of aggregated location data
 */
export async function getAggregatedLocationData(filters = {}) {
  const { categoryId, search, activeOnly = true } = filters;

  // Get locations based on filters
  const locations = activeOnly 
    ? LocationRepository.findActive()
    : LocationRepository.findAll({ categoryId, search });

  // Apply additional filters if needed
  let filteredLocations = locations;
  if (categoryId) {
    filteredLocations = filteredLocations.filter(loc => loc.categoryId === categoryId);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredLocations = filteredLocations.filter(loc => 
      loc.name.toLowerCase().includes(searchLower)
    );
  }

  // Get category names
  const categories = CategoryRepository.findAll();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.id] = cat.name;
  });

  // Aggregate wait time data for each location
  const aggregatedData = filteredLocations.map(location => {
    const reportCount = WaitTimeReportRepository.countReports(location.id, 2);
    const averageWaitTime = WaitTimeReportRepository.calculateAverage(location.id, 2);
    const recentReports = WaitTimeReportRepository.findRecentByLocation(location.id, 2);
    
    const lastReportTime = recentReports.length > 0 
      ? recentReports[0].submittedAt 
      : null;

    return {
      id: location.id,
      name: location.name,
      category: categoryMap[location.categoryId] || 'Unknown',
      averageWaitTime,
      reportCount,
      confidenceLevel: calculateConfidenceLevel(reportCount),
      severity: categorizeWaitTime(averageWaitTime),
      lastReportTime
    };
  });

  return aggregatedData;
}

/**
 * Get aggregated data for a single location
 * @param {number} locationId - Location ID
 * @returns {AggregatedLocationData|null} Aggregated location data or null if not found
 */
export function getLocationAggregatedData(locationId) {
  const location = LocationRepository.findById(locationId);
  if (!location) return null;

  const category = CategoryRepository.findById(location.categoryId);
  const reportCount = WaitTimeReportRepository.countReports(locationId, 2);
  const averageWaitTime = WaitTimeReportRepository.calculateAverage(locationId, 2);
  const recentReports = WaitTimeReportRepository.findRecentByLocation(locationId, 2);
  
  const lastReportTime = recentReports.length > 0 
    ? recentReports[0].submittedAt 
    : null;

  return {
    id: location.id,
    name: location.name,
    category: category ? category.name : 'Unknown',
    averageWaitTime,
    reportCount,
    confidenceLevel: calculateConfidenceLevel(reportCount),
    severity: categorizeWaitTime(averageWaitTime),
    lastReportTime
  };
}
