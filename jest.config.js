module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    // stub out react-native and expo modules not needed for unit tests
    '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.js',
    '^expo-notifications$': '<rootDir>/__tests__/__mocks__/expo-notifications.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/__mocks__/async-storage.js',
  },
};
