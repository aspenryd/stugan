module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./unittest/jest.setup.js'],
  testMatch: ['**/unittest/**/*.test.js'],
};
