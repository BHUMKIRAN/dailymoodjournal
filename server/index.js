const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { authenticate } = require('./middleware');
const authRoutes = require('./auth');

const app = express();
const PORT = 3000;

const entriesPath = path.join(__dirname, 'data', 'entries.json');

// Middleware
app.use(cors());
app.use(express.json()); // This must come before routes
app.use(express.urlencoded({ extended: true })); // Add this for form data

// Ensure entries.json exists
if (!fs.existsSync(entriesPath)) {
  fs.writeFileSync(entriesPath, '[]');
}

// Auth routes (register, login)
app.use('/api/auth', authRoutes);

// Protected Routes
app.get('/api/entries', authenticate, (req, res) => {
  const allEntries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  const userEntries = allEntries.filter(entry => entry.userId === req.userId);
  res.json(userEntries);
});

app.post('/api/entries', authenticate, (req, res) => {
  const newEntry = { ...req.body, userId: req.userId };
  const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  entries.push(newEntry);
  fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
  res.json(newEntry);
});

app.delete('/api/entries', authenticate, (req, res) => {
  let entries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  entries = entries.filter(entry => entry.userId !== req.userId);
  fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
  res.json({ message: 'All entries cleared for user.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("press ctrl + c to stop the server")
});
