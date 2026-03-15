# DocGuard Examples

Three real-world scenarios showing DocGuard in action — from zero docs to full compliance.

| # | Scenario | Starting Score | What You'll Learn |
|---|----------|---------------|-------------------|
| [01](01-express-api/) | Node.js API with **no docs** | ~15 (F) | Cold-start: `generate` → `guard` → instant coverage |
| [02](02-python-flask/) | Python app with **drifted docs** | ~55 (C) | Drift detection: catch when docs lie about the code |
| [03](03-spec-kit-project/) | Full CDD + Spec Kit project | ~92 (A) | Gold standard: what mature compliance looks like |

## How to Run

Each example is a self-contained directory. From the repo root:

```bash
# Example 1: From zero to documented
cd examples/01-express-api
npx docguard-cli guard          # See what's missing
npx docguard-cli generate       # Auto-generate docs
npx docguard-cli guard          # Verify — most checks now pass
npx docguard-cli score          # See the improvement

# Example 2: Catch documentation drift
cd examples/02-python-flask
npx docguard-cli guard          # Catches drift
npx docguard-cli diff           # Shows exactly what diverged
npx docguard-cli diagnose       # AI-ready fix prompts

# Example 3: See the gold standard
cd examples/03-spec-kit-project
npx docguard-cli guard          # All green
npx docguard-cli score          # A grade
npx docguard-cli trace          # Full traceability
```

## Setup Wizard

For a guided experience on any project, use the interactive setup wizard:

```bash
npx docguard-cli setup
```

The wizard walks through 7 steps: project detection, canonical docs, AI skills, slash commands, agent configs, integrations (Spec Kit, Understanding), and git hooks.
