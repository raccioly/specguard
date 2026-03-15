const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// List users
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
  ]);
});

// Create user
app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  res.status(201).json({ id: Date.now(), name, role: role || 'user' });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) return res.json({ id: 1, name: 'Alice', role: 'admin' });
  if (id === 2) return res.json({ id: 2, name: 'Bob', role: 'user' });
  res.status(404).json({ error: 'User not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
