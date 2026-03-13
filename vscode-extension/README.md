# SpecGuard for VS Code

> Canonical-Driven Development (CDD) enforcement directly in your editor.

![CDD Score](https://img.shields.io/badge/CDD_Score-89%2F100_(A)-green)
![Type](https://img.shields.io/badge/type-cli-blue)
![SpecGuard](https://img.shields.io/badge/guarded_by-SpecGuard-cyan)

## Features

### 📊 Status Bar Score
Live CDD maturity score in the status bar — auto-refreshes when you edit documentation files.

### 🔍 Inline Diagnostics
- **Unfilled placeholders** — highlights `<!-- TODO -->` and `<!-- e.g. -->` in canonical docs
- **Draft status** — hints when documents are still in draft
- **Missing docs** — warnings for required CDD documents

### ⚡ Commands

| Command | Description |
|---------|-------------|
| `SpecGuard: Audit Documentation` | Scan project documentation status |
| `SpecGuard: Guard (Validate)` | Run all validators with pass/fail notification |
| `SpecGuard: Show CDD Score` | Display score breakdown in output |
| `SpecGuard: Generate Badges` | Copy badge markdown to clipboard |
| `SpecGuard: Initialize CDD Docs` | Create CDD documentation from templates |
| `SpecGuard: Refresh Score` | Manually refresh the status bar score |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `specguard.autoRefresh` | `true` | Auto-refresh score when docs change |
| `specguard.showStatusBar` | `true` | Show CDD score in status bar |
| `specguard.nodePath` | `node` | Path to Node.js executable |
| `specguard.scoreThreshold` | `60` | Below this score shows warning background |

## Requirements

- Node.js ≥ 18
- SpecGuard installed globally (`npm i -g specguard`) or as project dependency

## How It Works

1. Extension activates when it detects `.specguard.json`, `docs-canonical/`, or `AGENTS.md`
2. Runs `specguard score --format json` to get the CDD score
3. Watches for file changes and auto-refreshes
4. Reports inline diagnostics on canonical documentation files
