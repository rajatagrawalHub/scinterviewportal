const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Get application form data for a candidate
router.get('/:id', async (req, res) => {
  try {
    const app = await Application.findOne({ registerNo: req.params.id });
    if (!app) return res.status(404).json({ message: 'Form not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
