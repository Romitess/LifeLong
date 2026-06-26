const path = require('node:path');
const { existsSync } = require('node:fs');
const dotenv = require('dotenv');

const envFilePaths = [
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env'),
].filter((envPath) => existsSync(envPath));

function loadEnv(options = {}) {
  for (const envPath of envFilePaths) {
    dotenv.config({ path: envPath, override: false, ...options });
  }
}

function requiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value || value.includes('PLACEHOLDER')) {
    throw new Error(`Missing required environment variable: ${name}${fallbackName ? ` or ${fallbackName}` : ''}`);
  }
  return value;
}

function optionalEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value.includes('PLACEHOLDER')) {
    return fallback;
  }
  return value;
}

module.exports = { envFilePaths, loadEnv, requiredEnv, optionalEnv };
