# Test Specification

## Test Strategy

All tests use Node.js built-in test runner (`node:test`).

## Test Categories

### Unit Tests

| Test | File | What It Verifies |
|------|------|-----------------|
| Add task | `tests/basic.test.js` | Task creation with correct fields |
| List tasks | `tests/basic.test.js` | Retrieval of all tasks |
| Complete task | `tests/basic.test.js` | Status transition to done |

### Integration Tests

| Test | What It Verifies |
|------|-----------------|
| CLI add | Running `node src/index.js add` produces correct output |
| CLI list | Running `node src/index.js list` shows tasks |

## Running Tests

```bash
npm test
```
