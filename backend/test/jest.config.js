module.exports = {
  // Configuration pour tous les tests
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],

  // Configuration spécifique aux tests unitaires
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unitaires/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
      setupFiles: ['<rootDir>/test/integration/setup/db.setup.js'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
      setupFiles: ['<rootDir>/test/integration/setup/db.setup.js'],
    }
  ]
};
