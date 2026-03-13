/**
 * SpecGuard VS Code Extension
 * 
 * Features:
 * - Status bar CDD score (live updates)
 * - Inline diagnostics for missing/stale docs
 * - Commands: audit, guard, score, badge, init
 * - File watcher for auto-refresh on doc changes
 */

const vscode = require('vscode');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let statusBarItem;
let diagnosticCollection;
let outputChannel;
let fileWatcher;

// ── Activation ─────────────────────────────────────────────────────────────

function activate(context) {
  outputChannel = vscode.window.createOutputChannel('SpecGuard');

  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left, 100
  );
  statusBarItem.command = 'specguard.score';
  statusBarItem.tooltip = 'Click to see CDD score details';
  context.subscriptions.push(statusBarItem);

  // Diagnostics
  diagnosticCollection = vscode.languages.createDiagnosticCollection('specguard');
  context.subscriptions.push(diagnosticCollection);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('specguard.audit', () => runCommand('audit')),
    vscode.commands.registerCommand('specguard.guard', () => runGuard()),
    vscode.commands.registerCommand('specguard.score', () => runCommand('score')),
    vscode.commands.registerCommand('specguard.badge', () => runBadge()),
    vscode.commands.registerCommand('specguard.init', () => runInit()),
    vscode.commands.registerCommand('specguard.refresh', () => refreshScore()),
  );

  // File watcher for auto-refresh
  const config = vscode.workspace.getConfiguration('specguard');
  if (config.get('autoRefresh')) {
    fileWatcher = vscode.workspace.createFileSystemWatcher(
      '**/docs-canonical/**/*.md'
    );
    fileWatcher.onDidChange(() => refreshScore());
    fileWatcher.onDidCreate(() => refreshScore());
    fileWatcher.onDidDelete(() => refreshScore());
    context.subscriptions.push(fileWatcher);

    // Also watch root docs
    const rootWatcher = vscode.workspace.createFileSystemWatcher(
      '**/{CHANGELOG,AGENTS,DRIFT-LOG,ROADMAP}.md'
    );
    rootWatcher.onDidChange(() => refreshScore());
    rootWatcher.onDidCreate(() => refreshScore());
    rootWatcher.onDidDelete(() => refreshScore());
    context.subscriptions.push(rootWatcher);
  }

  // Initial refresh
  if (config.get('showStatusBar')) {
    refreshScore();
  }

  outputChannel.appendLine('SpecGuard extension activated');
}

function deactivate() {
  if (statusBarItem) statusBarItem.dispose();
  if (diagnosticCollection) diagnosticCollection.dispose();
  if (outputChannel) outputChannel.dispose();
  if (fileWatcher) fileWatcher.dispose();
}

// ── Core Functions ─────────────────────────────────────────────────────────

function getWorkspaceDir() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showWarningMessage('SpecGuard: No workspace folder open');
    return null;
  }
  return folders[0].uri.fsPath;
}

function getNodePath() {
  return vscode.workspace.getConfiguration('specguard').get('nodePath') || 'node';
}

function findSpecguard(workspaceDir) {
  // Check local node_modules first
  const localBin = path.join(workspaceDir, 'node_modules', '.bin', 'specguard');
  if (fs.existsSync(localBin)) return localBin;

  // Try npx
  return null;
}

function execSpecguard(workspaceDir, args) {
  const nodePath = getNodePath();
  const localBin = findSpecguard(workspaceDir);

  let cmd;
  if (localBin) {
    cmd = `"${localBin}" ${args}`;
  } else {
    // Try npx first, then global
    cmd = `${nodePath} -e "try{require('child_process').execSync('npx -y specguard ${args}',{stdio:'inherit'})}catch{}" 2>/dev/null || specguard ${args}`;
    // Simpler: just try npx directly
    cmd = `npx -y specguard ${args}`;
  }

  try {
    return execSync(cmd, {
      cwd: workspaceDir,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
      timeout: 30000,
    });
  } catch (e) {
    outputChannel.appendLine(`SpecGuard error: ${e.message}`);
    return e.stdout || '';
  }
}

// ── Score Refresh ──────────────────────────────────────────────────────────

function refreshScore() {
  const dir = getWorkspaceDir();
  if (!dir) return;

  try {
    const output = execSpecguard(dir, 'score --format json');
    const jsonStart = output.indexOf('{');
    if (jsonStart < 0) {
      statusBarItem.text = '$(shield) CDD: ?';
      statusBarItem.show();
      return;
    }

    const data = JSON.parse(output.slice(jsonStart));
    const score = data.score;
    const grade = data.grade;
    const threshold = vscode.workspace.getConfiguration('specguard').get('scoreThreshold') || 60;

    // Update status bar
    let icon;
    if (score >= 90) icon = '$(verified)';
    else if (score >= 80) icon = '$(pass)';
    else if (score >= threshold) icon = '$(info)';
    else icon = '$(warning)';

    statusBarItem.text = `${icon} CDD: ${score}/100 (${grade})`;
    statusBarItem.backgroundColor = score < threshold
      ? new vscode.ThemeColor('statusBarItem.warningBackground')
      : undefined;
    statusBarItem.show();

    // Run diagnostics
    runDiagnostics(dir);

    outputChannel.appendLine(`Score refreshed: ${score}/100 (${grade})`);
  } catch (e) {
    statusBarItem.text = '$(shield) CDD: ?';
    statusBarItem.show();
    outputChannel.appendLine(`Score refresh error: ${e.message}`);
  }
}

// ── Diagnostics ────────────────────────────────────────────────────────────

function runDiagnostics(workspaceDir) {
  diagnosticCollection.clear();

  const requiredFiles = [
    'docs-canonical/ARCHITECTURE.md',
    'docs-canonical/DATA-MODEL.md',
    'docs-canonical/SECURITY.md',
    'docs-canonical/TEST-SPEC.md',
    'docs-canonical/ENVIRONMENT.md',
    'AGENTS.md',
    'CHANGELOG.md',
    'DRIFT-LOG.md',
  ];

  // Check for missing required files
  const diagnosticsMap = new Map();

  for (const file of requiredFiles) {
    const fullPath = path.join(workspaceDir, file);
    if (!fs.existsSync(fullPath)) {
      // Report missing file diagnostics on the workspace root config
      addRootDiagnostic(
        workspaceDir, diagnosticsMap,
        `Missing required CDD document: ${file}. Run 'SpecGuard: Initialize CDD Docs' to create it.`,
        vscode.DiagnosticSeverity.Warning
      );
    }
  }

  // Check existing docs for template placeholders
  for (const file of requiredFiles) {
    const fullPath = path.join(workspaceDir, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    const fileDiags = [];

    lines.forEach((line, i) => {
      // Check for unfilled template placeholders
      if (line.includes('<!-- TODO') || line.includes('<!-- e.g.')) {
        const range = new vscode.Range(i, 0, i, line.length);
        const diag = new vscode.Diagnostic(
          range,
          `Template placeholder — fill in with real content`,
          vscode.DiagnosticSeverity.Information
        );
        diag.source = 'SpecGuard';
        diag.code = 'unfilled-placeholder';
        fileDiags.push(diag);
      }

      // Check for draft status
      if (line.includes('specguard:status draft')) {
        const range = new vscode.Range(i, 0, i, line.length);
        const diag = new vscode.Diagnostic(
          range,
          `Document is in draft status — review and promote to 'active'`,
          vscode.DiagnosticSeverity.Hint
        );
        diag.source = 'SpecGuard';
        diag.code = 'draft-status';
        fileDiags.push(diag);
      }
    });

    if (fileDiags.length > 0) {
      diagnosticCollection.set(vscode.Uri.file(fullPath), fileDiags);
    }
  }

  // Apply root diagnostics
  for (const [uri, diags] of diagnosticsMap) {
    diagnosticCollection.set(uri, diags);
  }
}

function addRootDiagnostic(workspaceDir, diagnosticsMap, message, severity) {
  // Report on .specguard.json or package.json or any root file
  const rootFile = ['package.json', '.specguard.json', 'README.md']
    .map(f => path.join(workspaceDir, f))
    .find(f => fs.existsSync(f));

  if (!rootFile) return;

  const uri = vscode.Uri.file(rootFile);
  if (!diagnosticsMap.has(uri)) {
    diagnosticsMap.set(uri, []);
  }

  const range = new vscode.Range(0, 0, 0, 0);
  const diag = new vscode.Diagnostic(range, message, severity);
  diag.source = 'SpecGuard';
  diag.code = 'missing-doc';
  diagnosticsMap.get(uri).push(diag);
}

// ── Commands ───────────────────────────────────────────────────────────────

function runCommand(cmd) {
  const dir = getWorkspaceDir();
  if (!dir) return;

  outputChannel.clear();
  outputChannel.show(true);
  outputChannel.appendLine(`$ specguard ${cmd}\n`);

  const output = execSpecguard(dir, cmd);
  outputChannel.appendLine(output);
}

function runGuard() {
  const dir = getWorkspaceDir();
  if (!dir) return;

  outputChannel.clear();
  outputChannel.show(true);
  outputChannel.appendLine('$ specguard guard\n');

  const output = execSpecguard(dir, 'guard');
  outputChannel.appendLine(output);

  // Also refresh diagnostics
  runDiagnostics(dir);
  refreshScore();

  // Show result notification
  if (output.includes('PASS')) {
    vscode.window.showInformationMessage('SpecGuard: All checks passed ✅');
  } else if (output.includes('WARN')) {
    vscode.window.showWarningMessage('SpecGuard: Guard found warnings ⚠️');
  } else {
    vscode.window.showErrorMessage('SpecGuard: Guard found errors ❌');
  }
}

function runBadge() {
  const dir = getWorkspaceDir();
  if (!dir) return;

  const output = execSpecguard(dir, 'badge --format json');
  const jsonStart = output.indexOf('{');
  if (jsonStart < 0) {
    vscode.window.showErrorMessage('SpecGuard: Could not generate badges');
    return;
  }

  try {
    const data = JSON.parse(output.slice(jsonStart));
    const snippet = data.readmeSnippet;

    // Copy to clipboard
    vscode.env.clipboard.writeText(snippet).then(() => {
      vscode.window.showInformationMessage(
        `SpecGuard: Badge markdown copied to clipboard! Score: ${data.score}/100 (${data.grade})`
      );
    });
  } catch (e) {
    outputChannel.appendLine(`Badge error: ${e.message}`);
  }
}

function runInit() {
  const dir = getWorkspaceDir();
  if (!dir) return;

  outputChannel.clear();
  outputChannel.show(true);
  outputChannel.appendLine('$ specguard init\n');

  const output = execSpecguard(dir, 'init');
  outputChannel.appendLine(output);

  // Refresh after init
  refreshScore();

  vscode.window.showInformationMessage(
    'SpecGuard: CDD documentation initialized! Check the docs-canonical/ folder.'
  );
}

module.exports = { activate, deactivate };
