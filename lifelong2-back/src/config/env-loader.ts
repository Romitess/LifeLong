import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

export const envFilePaths = [
  resolve(process.cwd(), '..', '.env'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', '.env'),
].filter((envPath) => existsSync(envPath));

export function loadEnv(): void {
  for (const envPath of envFilePaths) {
    config({ path: envPath, override: false });
  }
}
