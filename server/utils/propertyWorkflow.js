/**
 * Property Workflow Validation
 * Enforces valid status transitions and required fields per status
 */

// Valid status transition rules
const VALID_TRANSITIONS = {
  'draft': ['available', 'withdrawn'],
  'available': ['reserved', 'viewing-scheduled', 'under-contract', 'withdrawn', 'off-market'],
  'reserved': ['under-contract', 'available', 'withdrawn'],
  'viewing-scheduled': ['available', 'reserved', 'withdrawn'],
  'under-contract': ['sold', 'available', 'withdrawn'],
  'sold': [], // Terminal state - no transitions allowed
  'withdrawn': ['available'], // Can be reactivated
  'off-market': ['available'] // Can be reactivated
};

// Required fields for each status
const REQUIRED_FIELDS = {
  'draft': [],
  'available': ['title', 'price', 'location', 'description'],
  'reserved': ['reservedBy', 'reservedAt', 'reservedUntil'],
  'viewing-scheduled': [],
  'under-contract': [],
  'sold': ['soldBy', 'soldByAgentId', 'soldAt', 'salePrice', 'commission'],
  'withdrawn': [],
  'off-market': []
};

/**
 * Validate if a status transition is allowed
 * @param {string} currentStatus - Current property status
 * @param {string} newStatus - Desired new status
 * @returns {Object} - { valid: boolean, error?: string }
 */
const validateTransition = (currentStatus, newStatus) => {
  // Allow same status (no-op)
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Check if transition is valid
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  
  if (!allowedTransitions) {
    return { 
      valid: false, 
      error: `Invalid current status: ${currentStatus}` 
    };
  }

  if (!allowedTransitions.includes(newStatus)) {
    return { 
      valid: false, 
      error: `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * Validate if required fields are present for a status
 * @param {string} status - Property status
 * @param {Object} propertyData - Property data object
 * @returns {Object} - { valid: boolean, missingFields?: string[] }
 */
const validateRequiredFields = (status, propertyData) => {
  const requiredFields = REQUIRED_FIELDS[status] || [];
  const missingFields = [];

  for (const field of requiredFields) {
    // Handle nested fields (e.g., commission)
    if (field === 'commission') {
      if (!propertyData.commission || typeof propertyData.commission !== 'object') {
        missingFields.push(field);
      }
    } else {
      if (!propertyData[field] || propertyData[field] === '') {
        missingFields.push(field);
      }
    }
  }

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      missingFields,
      error: `Missing required fields for status '${status}': ${missingFields.join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * Validate a property status update
 * @param {string} currentStatus - Current property status
 * @param {string} newStatus - Desired new status
 * @param {Object} propertyData - Updated property data
 * @returns {Object} - { valid: boolean, error?: string, missingFields?: string[] }
 */
const validateStatusUpdate = (currentStatus, newStatus, propertyData) => {
  // Validate transition
  const transitionResult = validateTransition(currentStatus, newStatus);
  if (!transitionResult.valid) {
    return transitionResult;
  }

  // Validate required fields for new status
  const fieldsResult = validateRequiredFields(newStatus, propertyData);
  if (!fieldsResult.valid) {
    return fieldsResult;
  }

  return { valid: true };
};

/**
 * Get allowed transitions for a status
 * @param {string} status - Current status
 * @returns {string[]} - Array of allowed next statuses
 */
const getAllowedTransitions = (status) => {
  return VALID_TRANSITIONS[status] || [];
};

/**
 * Check if a status is terminal (no transitions allowed)
 * @param {string} status - Status to check
 * @returns {boolean} - True if terminal status
 */
const isTerminalStatus = (status) => {
  const transitions = VALID_TRANSITIONS[status];
  return transitions && transitions.length === 0;
};

module.exports = {
  VALID_TRANSITIONS,
  REQUIRED_FIELDS,
  validateTransition,
  validateRequiredFields,
  validateStatusUpdate,
  getAllowedTransitions,
  isTerminalStatus
};
