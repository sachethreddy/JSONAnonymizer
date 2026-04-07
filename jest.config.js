module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@faker-js/faker$': '<rootDir>/tests/__mocks__/faker.js'
  }
};