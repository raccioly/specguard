const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const { resolve } = require('node:path');

const CLI = resolve(__dirname, '../src/index.js');

describe('task tracker', () => {
  it('should show usage without arguments', () => {
    const output = execSync(`node ${CLI}`, { encoding: 'utf-8' });
    assert.match(output, /Usage/);
  });

  it('should add a task', () => {
    const output = execSync(`node ${CLI} add "Test task"`, { encoding: 'utf-8' });
    assert.match(output, /Added/);
  });

  it('should list tasks', () => {
    const output = execSync(`node ${CLI} list`, { encoding: 'utf-8' });
    assert.ok(output.length > 0);
  });
});
