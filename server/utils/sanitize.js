const validator = require('validator');

/**
 * Sanitize a general string input
 * - Trims whitespace
 * - Escapes HTML special characters to prevent XSS
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(validator.trim(str));
};

/**
 * Sanitize and validate email address
 * - Normalizes email format (lowercase, trim)
 * - Validates email format
 * @param {string} email - Email address to sanitize
 * @returns {string|null} - Sanitized email or null if invalid
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return null;
  
  const trimmed = validator.trim(email);
  const normalized = validator.normalizeEmail(trimmed, {
    all_lowercase: true,
    gmail_remove_dots: false
  });
  
  if (!normalized || !validator.isEmail(normalized)) {
    return null;
  }
  
  return normalized;
};

/**
 * Sanitize and validate Philippine phone number
 * - Validates Philippine phone format
 * - Accepts formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX
 * - Fallback: Accepts 10-15 digit numbers for international customers
 * @param {string} phone - Phone number to sanitize
 * @returns {string|null} - Sanitized phone or null if invalid
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return null;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Philippine mobile number patterns
  // 09XXXXXXXXX (11 digits starting with 09)
  // 639XXXXXXXXX (12 digits starting with 63)
  if (/^09\d{9}$/.test(cleaned)) {
    return cleaned; // 09XXXXXXXXX format
  }
  
  if (/^639\d{9}$/.test(cleaned)) {
    return '0' + cleaned.substring(2); // Convert 639XX to 09XX
  }
  
  // Fallback: Accept 10-15 digit numbers for international customers
  // This allows flexibility for non-Philippine numbers while maintaining some validation
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned;
  }
  
  return null;
};

/**
 * Sanitize message/description input
 * - Trims whitespace
 * - Escapes HTML to prevent XSS
 * - Limits length to prevent abuse
 * Note: validator.escape() handles all XSS vectors including script tags,
 * event handlers, iframes, etc. No need for manual tag removal.
 * @param {string} message - Message to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 5000)
 * @returns {string} - Sanitized message
 */
const sanitizeMessage = (message, maxLength = 5000) => {
  if (typeof message !== 'string') return '';
  
  // Trim whitespace
  let cleaned = validator.trim(message);
  
  // Limit length BEFORE escaping to prevent entity truncation issues
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  // Escape HTML special characters - this protects against all XSS vectors
  // including <script>, <iframe>, event handlers like onclick, etc.
  cleaned = validator.escape(cleaned);
  
  return cleaned;
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeMessage
};
