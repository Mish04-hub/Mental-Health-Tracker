const express = require('express');
const protect = require('../middleware/auth');
const MoodLog = require('../models/MoodLog');
const { predictStress } = require('../model/stressModel');

const router = express.Router();

// All mood routes require authentication
router.use(protect);

// ── POST /api/mood/add-mood ──────────────────────────────────────────────────
router.post('/add-mood', async (req, res) => {
  try {
    const { 
      mood, sleepHours, studyHours, exercised, socialInteraction, notes,
      anxietyLevel, energyLevel, physicalSymptoms, dietQuality
    } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required.' });
    }

    // Get AI stress prediction
    const features = {
      mood,
      sleepHours: sleepHours ?? 7,
      studyHours: studyHours ?? 4,
      exercised: exercised ?? false,
      socialInteraction: socialInteraction ?? 'moderate',
      anxietyLevel: anxietyLevel ?? 0,
      energyLevel: energyLevel ?? 5,
      physicalSymptoms: physicalSymptoms ?? 'none',
      dietQuality: dietQuality ?? 'average',
    };
    const { stressLevel, probability } = predictStress(features);

    const log = await MoodLog.create({
      userId: req.user.id,
      mood,
      sleepHours: features.sleepHours,
      studyHours: features.studyHours,
      exercised: features.exercised,
      socialInteraction: features.socialInteraction,
      anxietyLevel: features.anxietyLevel,
      energyLevel: features.energyLevel,
      physicalSymptoms: features.physicalSymptoms,
      dietQuality: features.dietQuality,
      notes: notes ?? '',
      predictedStress: stressLevel,
      stressProbability: probability,
    });

    res.status(201).json({
      message: 'Mood logged successfully.',
      log,
      prediction: { stressLevel, probability },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/mood/get-history ────────────────────────────────────────────────
router.get('/get-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      MoodLog.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MoodLog.countDocuments({ userId: req.user.id }),
    ]);

    // Build mood summary stats
    const summary = { happy: 0, neutral: 0, stressed: 0, Low: 0, Medium: 0, High: 0 };
    logs.forEach((l) => {
      if (l.mood) summary[l.mood] = (summary[l.mood] || 0) + 1;
      if (l.predictedStress) summary[l.predictedStress] = (summary[l.predictedStress] || 0) + 1;
    });

    res.json({
      logs,
      summary,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/mood/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const log = await MoodLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ error: 'Log not found.' });
    res.json({ message: 'Log deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
