/**
 * Validate wait time value
 * @param {any} value - Value to validate
 * @returns {Object} Validation result with isValid and error properties
 */
export function validateWaitTime(value) {
  // Check if value is provided
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: 'Wait time is required'
    };
  }

  // Convert to number
  const numValue = Number(value);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Wait time must be a valid number'
    };
  }

  // Check if it's non-negative
  if (numValue < 0) {
    return {
      isValid: false,
      error: 'Wait time must be non-negative'
    };
  }

  return {
    isValid: true,
    value: numValue
  };
}

/**
 * Validate report submission data
 * @param {Object} data - Report data to validate
 * @returns {Object} Validation result with isValid, errors, and validatedData properties
 */
export function validateReportSubmission(data) {
  const errors = {};

  // Validate locationId
  if (!data.locationId) {
    errors.locationId = 'Location is required';
  } else if (typeof data.locationId !== 'number' && isNaN(Number(data.locationId))) {
    errors.locationId = 'Location ID must be a valid number';
  }

  // Validate waitTimeMinutes
  const waitTimeValidation = validateWaitTime(data.waitTimeMinutes);
  if (!waitTimeValidation.isValid) {
    errors.waitTimeMinutes = waitTimeValidation.error;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors: isValid ? undefined : errors,
    validatedData: isValid ? {
      locationId: Number(data.locationId),
      waitTimeMinutes: waitTimeValidation.value
    } : undefined
  };
}

/**
 * Validate location data for creation or update
 * @param {Object} data - Location data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with isValid, errors, and validatedData properties
 */
export function validateLocationData(data, isUpdate = false) {
  const errors = {};

  // Validate name (required for create, optional for update)
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string') {
      errors.name = 'Location name is required and must be a string';
    } else if (data.name.trim().length === 0) {
      errors.name = 'Location name cannot be empty';
    } else if (data.name.length > 255) {
      errors.name = 'Location name must be 255 characters or less';
    }
  }

  // Validate categoryId (required for create, optional for update)
  if (!isUpdate || data.categoryId !== undefined) {
    if (!data.categoryId) {
      errors.categoryId = 'Category is required';
    } else if (typeof data.categoryId !== 'number' && isNaN(Number(data.categoryId))) {
      errors.categoryId = 'Category ID must be a valid number';
    }
  }

  // Validate isActive (optional)
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.isActive = 'isActive must be a boolean';
  }

  const isValid = Object.keys(errors).length === 0;

  const validatedData = {};
  if (data.name !== undefined) validatedData.name = data.name.trim();
  if (data.categoryId !== undefined) validatedData.categoryId = Number(data.categoryId);
  if (data.isActive !== undefined) validatedData.isActive = data.isActive;

  return {
    isValid,
    errors: isValid ? undefined : errors,
    validatedData: isValid ? validatedData : undefined
  };
}
