const express = require('express');
const protect = require('../middleware/auth');
const { predictStress } = require('../model/stressModel');

const router = express.Router();

// ── POST /api/predict/predict-stress ────────────────────────────────────────
// Public endpoint – can also be called without auth for quick demos
router.post('/predict-stress', async (req, res) => {
  try {
    const { 
      mood, sleepHours, studyHours, exercised, socialInteraction,
      anxietyLevel, energyLevel, physicalSymptoms, dietQuality
    } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood field is required.' });
    }

    const features = {
      mood,
      sleepHours:        sleepHours        ?? 7,
      studyHours:        studyHours        ?? 4,
      exercised:         exercised         ?? false,
      socialInteraction: socialInteraction ?? 'moderate',
      anxietyLevel:      anxietyLevel      ?? 0,
      energyLevel:       energyLevel       ?? 5,
      physicalSymptoms:  physicalSymptoms  ?? 'none',
      dietQuality:       dietQuality       ?? 'average',
    };

    const result = predictStress(features);

    res.json({
      input: features,
      prediction: result,
      alert: result.stressLevel === 'High'
        ? '⚠️ High stress detected! Please consider taking a break, speaking to a counselor, or practicing mindfulness.'
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
