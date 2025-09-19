// Global Jest setup for all test environments (unit, integration, e2e)
// This file runs once before all test suites.
// For example, you might set up global mocks or environment variables here.

// Ensure environment variables are loaded for all tests
require('dotenv').config({ path: './backend/test/.env.test' });

// You can add other global setup here if needed
// For example, if you have a global mock for a third-party service
// jest.mock('some-external-library', () => ({
//   someFunction: jest.fn(),
// }));
