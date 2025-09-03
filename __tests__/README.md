# Poll Actions Tests

This directory contains comprehensive tests for the poll actions in `lib/actions/polls.ts`.

## Test Structure

- `lib/actions/polls.test.ts` - Unit tests for all poll actions
- `integration/polls.integration.test.ts` - Integration tests (placeholder for future implementation)
- `utils/test-utils.ts` - Test utilities and mock data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The tests cover:

### createPoll
- ✅ Successful poll creation with valid data
- ✅ Error handling for missing title
- ✅ Error handling for insufficient options
- ✅ Database error handling

### vote
- ✅ Successful voting with valid data
- ✅ Error handling for missing poll/option IDs
- ✅ Error handling for poll not found
- ✅ Error handling for expired polls
- ✅ Error handling for rate limit exceeded

### deletePoll
- ✅ Successful deletion when user is owner
- ✅ Error handling for poll not found
- ✅ Error handling for unauthorized deletion

### createShareCode
- ✅ Successful share code creation when user is owner
- ✅ Error handling for poll not found
- ✅ Error handling for unauthorized sharing

## Mocking Strategy

The tests use Jest mocks to isolate the actions from external dependencies:

- `supabaseAdmin` is mocked to simulate database responses
- FormData is mocked using `formdata-node` for server-side compatibility
- Next.js navigation is mocked for client-side components

## Future Enhancements

- Add integration tests with real database connections
- Add performance tests for large datasets
- Add security tests for RLS policies
- Add tests for edge cases and error scenarios
