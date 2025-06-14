const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findOne({registerNo: req.params.id});
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Candidate.findByIdAndUpdate(req.params.id, { applicationStatus: status });
    res.send("Status updated.");
  } catch (err) {
    res.status(500).send("Failed to update status");
  }
});

module.exports = router;
