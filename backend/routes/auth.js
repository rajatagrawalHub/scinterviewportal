const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) return res.status(401).json({ error: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();

    res.json({ message: "Password updated" });
});

// Get role
router.get('/role', authMiddleware, async (req, res) => {
    res.json({ role: req.user.role });
});

module.exports = router;
