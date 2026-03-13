# /specguard.init — Set up CDD documentation for this project

You are an AI agent initializing Canonical-Driven Development (CDD) for a new or existing project using SpecGuard.

## Step 1: Initialize Skeleton Files

```bash
npx specguard init
```

This creates the folder structure and template files. But the templates are EMPTY — they need real content.

## Step 2: Detect and Configure Project Type

Create `.specguard.json` based on what you find:

```bash
cat package.json
```

Determine:
- `projectType`: "cli" (has `bin` field), "webapp" (has react/next/vue), "api" (has express/fastify), or "library" (default)
- `needsE2E`: true for webapps, false for CLIs/libraries
- `needsEnvVars`: true for APIs/webapps with env config, false for CLIs
- `needsDatabase`: true if database dependencies found

Write `.specguard.json` with these settings.

## Step 3: Write Real Documentation

For each canonical document, generate an AI prompt and write real content:

```bash
npx specguard fix --doc architecture
```

Read the output, execute the RESEARCH STEPS, then write the ARCHITECTURE.md with real project content.

Repeat for each document:
```bash
npx specguard fix --doc data-model
npx specguard fix --doc security
npx specguard fix --doc test-spec
npx specguard fix --doc environment
```

## Step 4: Verify Everything

```bash
npx specguard guard
npx specguard score
```

All checks should pass. Report the final score.

## Step 5: Set Up Git Hooks (Optional)

```bash
npx specguard hooks
```

This installs pre-commit (guard), pre-push (score), and commit-msg (conventional commits) hooks.
