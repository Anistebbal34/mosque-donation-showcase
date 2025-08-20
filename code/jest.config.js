// jest.config.js
module.exports = {
  testEnvironment: "node", // don’t run in jsdom (browser), but in Node
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"], // load setup file before tests
  testMatch: [
    "**/features/**/__tests__/**/*.test.js", // feature tests
    "**/test/**/*.test.js", // global tests if you have them
  ],
};
