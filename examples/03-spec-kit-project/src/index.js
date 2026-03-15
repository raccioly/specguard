const { readFileSync, writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const TASKS_FILE = resolve(__dirname, '../tasks.json');

function loadTasks() {
  if (!existsSync(TASKS_FILE)) return [];
  return JSON.parse(readFileSync(TASKS_FILE, 'utf-8'));
}

function saveTasks(tasks) {
  writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf-8');
}

function addTask(title) {
  const tasks = loadTasks();
  const task = { id: tasks.length + 1, title, status: 'pending', created: new Date().toISOString() };
  tasks.push(task);
  saveTasks(tasks);
  console.log(`Added: [${task.id}] ${title}`);
}

function listTasks(filter) {
  const tasks = loadTasks();
  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;
  if (filtered.length === 0) return console.log('No tasks found.');
  for (const t of filtered) {
    const mark = t.status === 'done' ? '✅' : '⬜';
    console.log(`  ${mark} [${t.id}] ${t.title}`);
  }
}

function completeTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === parseInt(id));
  if (!task) return console.log(`Task ${id} not found.`);
  task.status = 'done';
  task.completed = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Done: [${task.id}] ${task.title}`);
}

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'add':   addTask(args.join(' ')); break;
  case 'list':  listTasks(args[0]); break;
  case 'done':  completeTask(args[0]); break;
  default:      console.log('Usage: node src/index.js <add|list|done> [args]');
}
