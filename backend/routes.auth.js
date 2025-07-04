const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../backend/models');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log("venkiii", req.body);

  const { username, email, password } = req.body; // ✅ destructure as 'username'

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    console.log("existing", existing);
    if (existing) return res.status(409).json({ message: 'Email already in use.' });

    const hash = await bcrypt.hash(password, 10);
    console.log("-----", { username, email, password_hash: hash });

    const user = await User.create({ username, email, password_hash: hash }); // ✅ use 'username'

    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

module.exports = router;
