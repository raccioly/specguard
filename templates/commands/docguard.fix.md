---
description: Find and fix all CDD documentation issues using AI-driven research
handoffs:
  - label: Verify Fixes
    agent: docguard.guard
    prompt: Run guard to verify all fixes pass
  - label: Check Score
    agent: docguard.score
    prompt: Show score improvement after fixes
---

# /docguard.fix — Find and Fix CDD Documentation Issues

You are an AI agent responsible for maintaining documentation quality using DocGuard.

## Step 1: Assess Current State

```bash
npx docguard-cli diagnose
```

Parse the output to identify all issues — categorized as errors or warnings with AI-ready fix prompts.

If no issues found, report "All CDD documentation is up to date" and stop.

## Step 2: Fix Each Issue

For each issue, determine the fix type:

| Issue Type | Action |
|-----------|--------|
| `missing-file` | Run `npx docguard-cli fix --doc <name>` to generate |
| `empty-doc` / `partial-doc` | Proceed to Step 3 for codebase research |
| `missing-config` | Create `.docguard.json` based on project type |
| `stale-doc` | Update `docguard:last-reviewed` date and content |
| `quality-issue` | Fix negation language, add missing sections |

## Step 3: Write Real Content

For each document that needs content:

```bash
npx docguard-cli fix --doc <name>
```

Where `<name>` is: `architecture`, `data-model`, `security`, `test-spec`, `environment`

Read the output carefully — it contains:
- **RESEARCH STEPS**: Exactly what files to read and commands to run
- **WRITE THE DOCUMENT**: Expected structure and content for each section

Execute the research steps, then write with REAL project content. No placeholders.

## Step 4: Verify (Iterate up to 3 times)

```bash
npx docguard-cli guard
npx docguard-cli score
```

All checks should pass. If any fail, read the output and fix remaining issues. Report the final CDD score.
