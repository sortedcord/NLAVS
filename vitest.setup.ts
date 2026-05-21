import { config } from 'dotenv';

// Load .env into process.env for vitest workers
config();

// Optionally you can validate required env vars here
if (!process.env.GEMINI_API_KEY) {
    // We don't throw to keep tests flexible; just warn so the developer knows
    // to set the key for integration-style tests.
    // eslint-disable-next-line no-console
    console.warn('GEMINI_API_KEY not set; tests that call the Gemini API may fail.');
}
