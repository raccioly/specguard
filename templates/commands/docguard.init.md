---
description: Initialize Canonical-Driven Development in a new or existing project
handoffs:
  - label: Generate Docs
    agent: docguard.fix
    prompt: Generate and populate all canonical documentation from codebase
  - label: Check Status
    agent: docguard.guard
    prompt: Run guard to see initial documentation status
---

# /docguard.init — Set Up CDD Documentation

You are an AI agent initializing Canonical-Driven Development (CDD) for a new or existing project.

## Step 1: Initialize Skeleton Files

```bash
npx docguard-cli init
```

This creates the folder structure and template files. The templates are skeletons — they need real content.

## Step 2: Detect and Configure Project Type

```bash
cat package.json
```

Create `.docguard.json` based on what you find:

| Signal | Setting |
|--------|---------|
| Has `bin` field | `projectType: "cli"` |
| Has react/next/vue | `projectType: "webapp"`, `needsE2E: true` |
| Has express/fastify | `projectType: "api"`, `needsEnvVars: true` |
| Has database deps | `needsDatabase: true` |
| Default | `projectType: "library"` |

## Step 3: Write Real Documentation

For each canonical document, generate a research prompt and write real content:

```bash
npx docguard-cli fix --doc architecture
npx docguard-cli fix --doc data-model
npx docguard-cli fix --doc security
npx docguard-cli fix --doc test-spec
npx docguard-cli fix --doc environment
```

For each: read the output, execute RESEARCH STEPS, then write with real project content.

## Step 4: Verify

```bash
npx docguard-cli guard
npx docguard-cli score
```

All checks should pass. Report the final score.

## Step 5: Set Up Git Hooks (Optional)

```bash
npx docguard-cli hooks
```

Installs pre-commit (guard), pre-push (score), and commit-msg (conventional commits) hooks.
