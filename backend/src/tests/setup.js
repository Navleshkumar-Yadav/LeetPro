// Test setup file
const mongoose = require('mongoose');

// Mock mongoose for tests
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    close: jest.fn()
  },
  Schema: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn()
  })),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mockObjectId')
  }
}));

// Global test timeout
jest.setTimeout(10000);

// Console error suppression for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});