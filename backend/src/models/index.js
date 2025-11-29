// Type definitions for data models

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {number} displayOrder
 */

/**
 * @typedef {Object} Location
 * @property {number} id
 * @property {string} name
 * @property {number} categoryId
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} WaitTimeReport
 * @property {number} id
 * @property {number} locationId
 * @property {number} waitTimeMinutes
 * @property {Date} submittedAt
 */

/**
 * @typedef {Object} AggregatedLocationData
 * @property {number} id
 * @property {string} name
 * @property {string} category
 * @property {number|null} averageWaitTime
 * @property {number} reportCount
 * @property {'high'|'medium'|'low'|'none'} confidenceLevel
 * @property {Date|null} lastReportTime
 */

export {};
