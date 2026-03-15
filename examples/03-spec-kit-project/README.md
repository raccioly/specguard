# Task Tracker

A lightweight task management CLI built with Canonical-Driven Development (CDD).

## Quick Start

```bash
node src/index.js add "Review pull request"
node src/index.js list
node src/index.js done 1
```

## Features

- Add, list, and complete tasks
- JSON file-based storage
- Status filtering (pending, done)

## Documentation

All canonical documentation lives in `docs-canonical/`:

| Document | Purpose |
|----------|---------|
| ARCHITECTURE.md | System design and components |
| TEST-SPEC.md | Test requirements and coverage |

## CDD Compliance

This project uses [DocGuard](https://github.com/raccioly/docguard) for documentation enforcement:

```bash
npx docguard-cli guard    # Validate docs
npx docguard-cli score    # Check maturity
```
