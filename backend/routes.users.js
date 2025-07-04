const express = require('express');
const { User, Task } = require('./models');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username', 'email', 'created_at'] });
  res.json(users);
});

// Get user by id
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: { model: Task, attributes: ['id', 'title', 'status'] } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing required fields.' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists.' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password_hash });
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed', error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { username, email, password } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password_hash = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'User update failed', error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'User deletion failed', error: err.message });
  }
});

module.exports = router;
