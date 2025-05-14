
# Testing Strategy

This document outlines the testing approach for the CRM application.

## Test Types

### 1. Unit Tests
These tests focus on individual functions, components, and reducers in isolation.

Key test files:
- `unit/meetingNoteReducers.test.tsx` - Tests for the meeting note reducers
- `unit/vcReducers.test.tsx` - Tests for the VC reducers
- `unit/scratchpadReducers.test.tsx` - Tests for the scratchpad reducers
- `unit/VCDeleteDialog.test.tsx` - Tests for the VC deletion dialog component
- `unit/MeetingNotesModal.test.tsx` - Tests for the meeting notes modal component
- `unit/ToastIntegration.test.tsx` - Tests for toast notifications
- `unit/indexReducer.test.tsx` - Tests for the main combined reducer

### 2. Integration Tests
These tests verify that multiple components or functions work together correctly.

Key test files:
- `integration/VCDeletion.test.tsx` - Tests for the complete VC deletion flow
- `integration/MeetingNotesCRUD.test.tsx` - Tests for meeting note operations
- `integration/ScratchpadPersistence.test.tsx` - Tests for scratchpad data persistence

### 3. Test Utilities
We provide utility functions to simplify test setup and mocking:

- `utils/testUtils.tsx` - Common utilities for test setup
- `utils/persistenceTestUtils.tsx` - Utilities for testing data persistence

## Running Tests

Tests can be run using the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Testing Guidelines

1. **Test business logic thoroughly** - Especially reducers and state management
2. **Test edge cases** - Handle null/undefined values, empty arrays, etc.
3. **Test error handling** - Ensure errors are caught and handled properly
4. **Mock external dependencies** - Use vitest mocking for external services
5. **Keep tests readable** - Use descriptive test names and well-structured setups

## Coverage Goals

We aim for high coverage in critical areas:
- Reducers: ~90%
- Component UI interactions: ~75%
- Utility functions: ~90%
