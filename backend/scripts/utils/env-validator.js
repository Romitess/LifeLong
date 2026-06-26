/**
 * Environment Variable Validator Utility
 * Validates and retrieves environment variables with proper error handling
 * 
 * @module env-validator
 */

/**
 * Validates and retrieves environment variables
 * @param {string} name - Environment variable name
 * @param {object} options - Configuration options
 * @param {boolean} options.required - Whether the variable is required
 * @param {any} options.fallback - Default value if not set
 * @param {boolean} options.sensitive - Whether this is a sensitive value (password, secret)
 * @returns {string|number} - The environment variable value
 */
function getEnv(name, options = {}) {
  const { required = false, fallback = null, sensitive = false } = options;
  const value = process.env[name];
  
  if (!value) {
    if (sensitive || required) {
      console.error(`❌ ERROR: Required environment variable ${name} is not set`);
      process.exit(1);
    }
    if (fallback !== null) {
      console.warn(`⚠️  WARNING: ${name} not set, using fallback: ${fallback}`);
      return fallback;
    }
  }
  
  return value;
}

module.exports = { getEnv };
