/**
 * SpecGuard CLI Tests — Tests all commands and flags
 * Run with: npm test
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CLI = join(import.meta.dirname, '..', 'cli', 'specguard.mjs');
const run = (args, cwd) => execSync(`node ${CLI} ${args}`, {
  encoding: 'utf-8',
  cwd: cwd || join(import.meta.dirname, '..'),
  env: { ...process.env, NO_COLOR: '1' },
});

describe('specguard --help', () => {
  it('shows help text', () => {
    const output = run('--help');
    assert.match(output, /Commands:/);
    assert.match(output, /audit/);
    assert.match(output, /guard/);
    assert.match(output, /score/);
    assert.match(output, /diff/);
    assert.match(output, /generate/);
    assert.match(output, /agents/);
    assert.match(output, /hooks/);
  });

  it('shows version', () => {
    const output = run('--version');
    assert.match(output, /specguard v\d+\.\d+\.\d+/);
  });
});

describe('specguard audit', () => {
  it('runs on SpecGuard itself', () => {
    const output = run('audit');
    assert.match(output, /SpecGuard Audit/);
    assert.match(output, /Canonical Documentation/);
  });

  it('shows 100% for SpecGuard project', () => {
    const output = run('audit');
    assert.match(output, /100%/);
  });

  it('shows all categories with --verbose', () => {
    const output = run('audit --verbose');
    assert.match(output, /Implementation Documentation/);
  });
});

describe('specguard score', () => {
  it('runs and shows a score', () => {
    const output = run('score');
    assert.match(output, /CDD Maturity Score:/);
    assert.match(output, /\/100/);
  });

  it('outputs JSON with --format json', () => {
    const output = run('score --format json');
    // Output may contain banner before JSON — extract the JSON part
    const jsonStart = output.indexOf('{');
    assert.ok(jsonStart >= 0, 'Should contain JSON object');
    const json = JSON.parse(output.slice(jsonStart));
    assert.ok(typeof json.score === 'number');
    assert.ok(typeof json.grade === 'string');
    assert.ok(json.score >= 0 && json.score <= 100);
  });
});

describe('specguard diff', () => {
  it('runs without errors', () => {
    const output = run('diff');
    assert.match(output, /SpecGuard Diff/);
  });

  it('shows no false positives on SpecGuard', () => {
    const output = run('diff');
    // Should not flag template words as entities
    assert.ok(!output.includes('− metadata'));
    assert.ok(!output.includes('− tbd'));
    assert.ok(!output.includes('− fields'));
  });
});

describe('specguard init', () => {
  it('creates docs in a temp directory', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'sg-test-'));
    try {
      const output = run(`init --dir ${tmpDir}`);
      assert.match(output, /Created/);
      assert.ok(existsSync(join(tmpDir, 'docs-canonical', 'ARCHITECTURE.md')));
      assert.ok(existsSync(join(tmpDir, 'AGENTS.md')));
      assert.ok(existsSync(join(tmpDir, '.specguard.json')));
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('specguard generate', () => {
  it('generates docs in empty dir', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'sg-gen-'));
    try {
      const output = run(`generate --dir ${tmpDir}`);
      assert.match(output, /Generated: 8/);
      assert.ok(existsSync(join(tmpDir, 'docs-canonical', 'ARCHITECTURE.md')));
      assert.ok(existsSync(join(tmpDir, 'CHANGELOG.md')));
      assert.ok(existsSync(join(tmpDir, 'DRIFT-LOG.md')));
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('skips existing files without --force', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'sg-gen-'));
    try {
      run(`generate --dir ${tmpDir}`);
      const output = run(`generate --dir ${tmpDir}`);
      assert.match(output, /Skipped: 8/);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('specguard hooks', () => {
  it('lists available hooks', () => {
    const output = run('hooks --list');
    assert.match(output, /pre-commit/);
    assert.match(output, /pre-push/);
    assert.match(output, /commit-msg/);
  });
});

describe('specguard guard', () => {
  it('runs all validators', () => {
    try {
      run('guard');
    } catch (e) {
      // guard exits with code 2 for warnings, that's OK
      const output = e.stdout || '';
      assert.match(output, /Structure/);
      assert.match(output, /Freshness/);
    }
  });
});

describe('project type detection', () => {
  it('detects SpecGuard as CLI project', () => {
    const output = run('score --format json');
    const jsonStart = output.indexOf('{');
    const json = JSON.parse(output.slice(jsonStart));
    // If project type is working, score should not penalize missing .env.example
    assert.ok(json.score >= 80, `Score ${json.score} should be ≥80 for properly configured CLI project`);
  });
});
