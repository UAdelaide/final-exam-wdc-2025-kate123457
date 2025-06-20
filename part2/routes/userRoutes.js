const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/users/dogs
// Return the list of dogs owned by the currently logged-in owner
router.get('/dogs', async (req, res) => {
  // Make sure the user is logged in and has the role of 'owner'
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const ownerId = req.session.user.id;

  try {
    // Query the database for all dogs belonging to this owner
    const [rows] = await db.query(`
      SELECT dog_id, name, size FROM Dogs
      WHERE owner_id = ?
    `, [ownerId]);

    // Send the result as JSON back to the frontend
    res.json(rows); // e.g., [{ dog_id: 1, name: "Buddy", size: "medium" }, ...]
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

router.get('/dogs', async (req, res) => {
  const [rows] = await db.query('SELECT dog_id, owner_id, name, size FROM Dogs');
  res.json(rows);
});

module.exports = router;