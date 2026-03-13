# Environment

<!-- specguard:version 0.3.0 -->
<!-- specguard:status active -->
<!-- specguard:last-reviewed 2026-03-12 -->

> SpecGuard is a zero-dependency CLI tool. No environment variables needed.

| Metadata | Value |
|----------|-------|
| **Status** | ![Status](https://img.shields.io/badge/status-active-brightgreen) |
| **Version** | `0.3.0` |

---

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | ≥18.0.0 | [nodejs.org](https://nodejs.org) |
| npm | ≥8 | Included with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com) |

## Environment Variables

> **None required.** SpecGuard is a zero-dependency CLI tool that reads project
> files directly. No `.env` file, no API keys, no database connections.

## Setup Steps

1. Clone the repository: `git clone https://github.com/raccioly/specguard.git`
2. No install needed — uses only Node.js built-in modules
3. Run directly: `node cli/specguard.mjs --help`
4. Or use via npx: `npx specguard --help`

## Development

```bash
# Run CLI locally
node cli/specguard.mjs audit

# Run tests
npm test

# Test a command on a target project
node cli/specguard.mjs score --dir /path/to/project
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.3.0 | 2026-03-12 | @raccioly | Proper CLI environment docs, no env vars |
| 0.1.0 | 2026-03-12 | SpecGuard Generate | Auto-generated (corrected) |
