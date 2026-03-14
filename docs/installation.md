# Installation

## Requirements

- **Node.js** ≥ 18 (required for both npm and Python installations)
- **git** (optional — needed for freshness validation)

## Install via npm

### Option 1: Run directly (no install)

```bash
npx docguard-cli diagnose
```

This downloads and runs DocGuard on demand. Always uses the latest version.

### Option 2: Install globally

```bash
npm i -g docguard-cli
docguard diagnose
```

### Option 3: Dev dependency (pinned version)

```bash
npm install --save-dev docguard-cli
```

Then use via npm scripts in `package.json`:

```json
{
  "scripts": {
    "guard": "docguard guard",
    "score": "docguard score",
    "lint:docs": "docguard ci --threshold 70"
  }
}
```

## Install via Python (PyPI)

```bash
pip install docguard-cli
docguard diagnose
```

> **Note:** The Python package is a thin wrapper that delegates to `npx docguard-cli`. Node.js 18+ must be installed on the system.

The Python wrapper:
- Detects Node.js 18+ on your system
- Runs `npx docguard-cli` with all arguments forwarded
- Provides clear error messages if Node.js is missing

## Install as Spec Kit Extension

If your project uses [GitHub Spec Kit](https://github.com/github/spec-kit):

```bash
specify extension add docguard
```

This installs DocGuard's slash commands into your AI agent's command palette.

## Verify Installation

```bash
npx docguard-cli --version
# Output: docguard v0.9.5
```

## CI/CD Installation

In GitHub Actions or similar:

```yaml
- name: Run DocGuard
  run: npx docguard-cli guard
```

No separate install step needed — `npx` handles it.

## Upgrading

```bash
# If installed as dev dependency
npm update docguard-cli

# If installed globally
npm update -g docguard-cli

# If installed via Python
pip install --upgrade docguard-cli

# If using npx — always runs latest automatically
npx docguard-cli@latest --version
```
