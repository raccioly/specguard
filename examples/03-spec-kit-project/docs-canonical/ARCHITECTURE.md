# Architecture

## System Overview

Task Tracker is a CLI application for managing tasks via a JSON file store.

## Tech Stack

- **Language**: JavaScript (Node.js 18+)
- **Storage**: JSON file (`tasks.json`)
- **Testing**: `node:test` (built-in)
- **Dependencies**: Zero — pure Node.js built-ins only

## Components

| Component | File | Purpose |
|-----------|------|---------|
| CLI Entry | `src/index.js` | Command parsing and dispatch |
| Task Store | `tasks.json` | Persistent task storage |

## Layer Boundaries

```
CLI Arguments → Command Dispatch → File I/O → JSON Storage
```

## Data Flow

### Adding a Task
1. User runs `node src/index.js add "Task title"`
2. CLI parses command and arguments
3. `addTask()` loads existing tasks from `tasks.json`
4. New task appended with auto-incremented ID
5. Tasks array saved back to `tasks.json`

### Completing a Task
1. User runs `node src/index.js done <id>`
2. `completeTask()` loads tasks, finds by ID
3. Status changed to `done`, timestamp added
4. Updated array saved to file
