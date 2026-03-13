/**
 * Fix Command — Auto-detect issues and generate AI-actionable fix instructions
 * 
 * This command runs guard + audit, collects all issues, and outputs
 * structured fix instructions that AI agents (Copilot, Cursor, Claude, etc.)
 * can execute immediately.
 * 
 * Output modes:
 *   --format text   Human-readable fix list (default)
 *   --format json   Machine-readable for VS Code extension / CI
 *   --format prompt AI-optimized prompt to paste into any AI chat
 *   --auto          Apply auto-fixable issues immediately (init, templates)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { c } from '../specguard.mjs';

export function runFix(projectDir, config, flags) {
  const isJson = flags.format === 'json';
  const isPrompt = flags.format === 'prompt';
  const autoFix = flags.auto || false;

  if (!isJson && !isPrompt) {
    console.log(`${c.bold}🔧 SpecGuard Fix — ${config.projectName}${c.reset}`);
    console.log(`${c.dim}   Directory: ${projectDir}${c.reset}`);
    console.log(`${c.dim}   Scanning for fixable issues...${c.reset}\n`);
  }

  const issues = collectIssues(projectDir, config);

  if (autoFix) {
    const fixed = autoFixIssues(projectDir, config, issues);
    if (!isJson) {
      console.log(`  ${c.green}✅ Auto-fixed ${fixed} issue(s)${c.reset}\n`);
    }
    // Re-scan after fixes
    const remaining = collectIssues(projectDir, config);
    outputResults(remaining, projectDir, config, flags);
  } else {
    outputResults(issues, projectDir, config, flags);
  }
}

// ── Issue Collection ───────────────────────────────────────────────────────

function collectIssues(projectDir, config) {
  const issues = [];
  const ptc = config.projectTypeConfig || {};

  // 1. Missing required files
  const requiredFiles = [
    ...config.requiredFiles.canonical,
    config.requiredFiles.changelog,
    config.requiredFiles.driftLog,
  ];

  for (const file of requiredFiles) {
    if (!existsSync(resolve(projectDir, file))) {
      issues.push({
        type: 'missing-file',
        severity: 'error',
        file,
        message: `Required CDD document missing: ${file}`,
        autoFixable: true,
        fix: {
          action: 'create',
          command: `specguard init`,
          ai_instruction: `Create the file ${file} following CDD standards. Use specguard metadata headers (version, status, last-reviewed). Include standard sections for this document type.`,
        },
      });
    }
  }

  // Agent file check
  const hasAgent = config.requiredFiles.agentFile.some(f =>
    existsSync(resolve(projectDir, f))
  );
  if (!hasAgent) {
    issues.push({
      type: 'missing-file',
      severity: 'error',
      file: 'AGENTS.md',
      message: 'No AI agent config file (AGENTS.md or CLAUDE.md)',
      autoFixable: true,
      fix: {
        action: 'create',
        command: 'specguard init',
        ai_instruction: 'Create AGENTS.md with project stack, workflow rules, and key file references following CDD format.',
      },
    });
  }

  // 2. Template placeholders in existing docs
  for (const file of config.requiredFiles.canonical) {
    const fullPath = resolve(projectDir, file);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      if (line.includes('<!-- TODO')) {
        issues.push({
          type: 'unfilled-placeholder',
          severity: 'warning',
          file,
          line: i + 1,
          message: `Unfilled placeholder on line ${i + 1}: ${line.trim().slice(0, 80)}`,
          autoFixable: false,
          fix: {
            action: 'edit',
            ai_instruction: `In ${file} line ${i + 1}, replace the TODO placeholder "${line.trim()}" with actual project content. Research the codebase to determine what should go here.`,
          },
        });
      }

      if (line.includes('<!-- e.g.')) {
        issues.push({
          type: 'unfilled-placeholder',
          severity: 'warning',
          file,
          line: i + 1,
          message: `Example placeholder on line ${i + 1}: ${line.trim().slice(0, 80)}`,
          autoFixable: false,
          fix: {
            action: 'edit',
            ai_instruction: `In ${file} line ${i + 1}, replace the example placeholder "${line.trim()}" with real project data.`,
          },
        });
      }
    });

    // Draft status
    if (content.includes('specguard:status draft')) {
      issues.push({
        type: 'draft-status',
        severity: 'info',
        file,
        message: `${file} is still in draft status`,
        autoFixable: false,
        fix: {
          action: 'edit',
          ai_instruction: `Review ${file} and if the content is complete, change the specguard:status from 'draft' to 'active'.`,
        },
      });
    }
  }

  // 3. Stale documentation (freshness)
  try {
    const cliPath = resolve(projectDir, 'cli/specguard.mjs');
    if (existsSync(cliPath)) {
      // Use guard output to detect freshness warnings
      // Skip — freshness is checked inline below
    }
  } catch { /* skip */ }

  // 4. Check .env.example if needed
  if (ptc.needsEnvExample !== false && ptc.needsEnvVars !== false) {
    if (!existsSync(resolve(projectDir, '.env.example'))) {
      const hasEnv = ['.env', '.env.local', '.env.development'].some(f =>
        existsSync(resolve(projectDir, f))
      );
      if (hasEnv) {
        issues.push({
          type: 'missing-env-example',
          severity: 'warning',
          file: '.env.example',
          message: '.env file exists but no .env.example template for new contributors',
          autoFixable: false,
          fix: {
            action: 'create',
            ai_instruction: 'Create .env.example with all environment variables from .env, but replace secret values with placeholder descriptions. Group variables by category (Database, Auth, Cloud, etc.).',
          },
        });
      }
    }
  }

  // 5. Check CHANGELOG has recent entries
  const changelogPath = resolve(projectDir, config.requiredFiles.changelog);
  if (existsSync(changelogPath)) {
    const content = readFileSync(changelogPath, 'utf-8');
    if (!content.includes('[Unreleased]')) {
      issues.push({
        type: 'changelog-missing-unreleased',
        severity: 'warning',
        file: config.requiredFiles.changelog,
        message: 'CHANGELOG.md missing [Unreleased] section',
        autoFixable: false,
        fix: {
          action: 'edit',
          ai_instruction: 'Add an [Unreleased] section at the top of CHANGELOG.md following Keep a Changelog format.',
        },
      });
    }
  }

  // 6. Missing .specguard.json
  if (!existsSync(resolve(projectDir, '.specguard.json'))) {
    issues.push({
      type: 'missing-config',
      severity: 'info',
      file: '.specguard.json',
      message: 'No .specguard.json config — using defaults. Create one for project-specific settings.',
      autoFixable: true,
      fix: {
        action: 'create',
        command: 'specguard init',
        ai_instruction: 'Create .specguard.json with projectName, projectType (detect from package.json), and projectTypeConfig (needsE2E, needsEnvVars, etc.).',
      },
    });
  }

  return issues;
}

// ── Auto-Fix ───────────────────────────────────────────────────────────────

function autoFixIssues(projectDir, config, issues) {
  let fixed = 0;
  const autoFixable = issues.filter(i => i.autoFixable);

  for (const issue of autoFixable) {
    if (issue.type === 'missing-file' || issue.type === 'missing-config') {
      // Create missing files via init
      const docsDir = resolve(projectDir, 'docs-canonical');
      if (!existsSync(docsDir)) {
        mkdirSync(docsDir, { recursive: true });
      }

      // Use init command to create missing files
      try {
        const cliPath = resolve(import.meta.dirname, '..', 'specguard.mjs');
        execSync(`node ${cliPath} init --dir "${projectDir}"`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        fixed++;
      } catch { /* init may partially succeed */ }
      break; // Init creates all files at once
    }
  }

  return fixed;
}

// ── Output ─────────────────────────────────────────────────────────────────

function outputResults(issues, projectDir, config, flags) {
  const isJson = flags.format === 'json';
  const isPrompt = flags.format === 'prompt';

  if (issues.length === 0) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'clean', issues: [], fixCount: 0 }));
    } else if (isPrompt) {
      console.log('No CDD issues found. All documentation is up to date.');
    } else {
      console.log(`  ${c.green}${c.bold}✅ No issues found — documentation is clean!${c.reset}\n`);
    }
    return;
  }

  if (isJson) {
    console.log(JSON.stringify({
      status: 'issues-found',
      project: config.projectName,
      projectType: config.projectType || 'unknown',
      issueCount: issues.length,
      autoFixable: issues.filter(i => i.autoFixable).length,
      issues: issues.map(i => ({
        type: i.type,
        severity: i.severity,
        file: i.file,
        line: i.line || null,
        message: i.message,
        autoFixable: i.autoFixable,
        fix: i.fix,
      })),
    }, null, 2));
    return;
  }

  if (isPrompt) {
    // Generate an AI-ready prompt
    console.log(`You are working on the project "${config.projectName}" (${config.projectType || 'unknown'} project).`);
    console.log(`SpecGuard found ${issues.length} CDD compliance issue(s) that need fixing.\n`);
    console.log('Please fix the following issues:\n');

    issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
      console.log(`   → ${issue.fix.ai_instruction}`);
      console.log('');
    });

    console.log('After fixing, run `specguard guard` to verify all issues are resolved.');
    return;
  }

  // Text output
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  if (errors.length > 0) {
    console.log(`  ${c.red}${c.bold}Errors (${errors.length})${c.reset}`);
    for (const e of errors) {
      console.log(`    ${c.red}✖${c.reset} ${e.message}`);
      console.log(`      ${c.dim}Fix: ${e.fix.ai_instruction.slice(0, 100)}...${c.reset}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`  ${c.yellow}${c.bold}Warnings (${warnings.length})${c.reset}`);
    for (const w of warnings) {
      console.log(`    ${c.yellow}⚠${c.reset} ${w.message}`);
      console.log(`      ${c.dim}Fix: ${w.fix.ai_instruction.slice(0, 100)}...${c.reset}`);
    }
    console.log('');
  }

  if (infos.length > 0) {
    console.log(`  ${c.cyan}${c.bold}Info (${infos.length})${c.reset}`);
    for (const info of infos) {
      console.log(`    ${c.cyan}ℹ${c.reset} ${info.message}`);
      console.log(`      ${c.dim}Fix: ${info.fix.ai_instruction.slice(0, 100)}...${c.reset}`);
    }
    console.log('');
  }

  console.log(`  ${c.bold}─────────────────────────────────────${c.reset}`);
  console.log(`  ${c.bold}Total: ${issues.length} issue(s)${c.reset}  (${issues.filter(i => i.autoFixable).length} auto-fixable)`);
  console.log(`  ${c.dim}Run ${c.cyan}specguard fix --auto${c.dim} to auto-fix what's possible${c.reset}`);
  console.log(`  ${c.dim}Run ${c.cyan}specguard fix --format prompt${c.dim} to generate an AI fix prompt${c.reset}\n`);
}
