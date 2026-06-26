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

module.exports = { envFilePaths, loadEnv };
