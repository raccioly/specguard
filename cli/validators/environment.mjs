/**
 * Environment Validator — Checks ENVIRONMENT.md docs and .env.example
 * Now respects projectTypeConfig (e.g., skip env checks for CLI tools)
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function validateEnvironment(projectDir, config) {
  const results = { name: 'environment', errors: [], warnings: [], passed: 0, total: 0 };
  const ptc = config.projectTypeConfig || {};

  const envDocPath = resolve(projectDir, 'docs-canonical/ENVIRONMENT.md');
  if (!existsSync(envDocPath)) {
    return results; // Structure validator catches missing files
  }

  const content = readFileSync(envDocPath, 'utf-8');

  // Check for required sections
  results.total++;
  if (content.includes('## Prerequisites') || content.includes('## Setup Steps')) {
    results.passed++;
  } else {
    results.warnings.push('ENVIRONMENT.md: missing "## Prerequisites" or "## Setup Steps" section');
  }

  results.total++;
  if (content.includes('## Environment Variables') || content.includes('## Setup Steps')) {
    results.passed++;
  } else {
    results.warnings.push('ENVIRONMENT.md: missing "## Environment Variables" section');
  }

  // Only check .env.example if the project type needs it
  if (ptc.needsEnvExample !== false && ptc.needsEnvVars !== false) {
    // Check if .env.example is referenced and exists
    if (content.includes('.env.example')) {
      results.total++;
      if (existsSync(resolve(projectDir, '.env.example'))) {
        results.passed++;
      } else {
        results.warnings.push(
          'ENVIRONMENT.md references .env.example but the file does not exist'
        );
      }
    }

    // Check if any .env file exists but no .env.example is provided
    results.total++;
    const hasEnvFile = ['.env', '.env.local', '.env.development'].some(f =>
      existsSync(resolve(projectDir, f))
    );
    const hasEnvExample = existsSync(resolve(projectDir, '.env.example'));

    if (hasEnvFile && !hasEnvExample) {
      results.warnings.push(
        '.env file exists but no .env.example template — new contributors won\'t know what vars to set'
      );
    } else {
      results.passed++;
    }
  } else {
    // CLI/library project — just verify doc exists and has basic content
    results.total++;
    results.passed++;
  }

  return results;
}
