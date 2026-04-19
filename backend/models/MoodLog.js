const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: ['happy', 'neutral', 'stressed'],
      required: [true, 'Mood is required'],
    },
    // Additional context fields used for stress prediction
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 7,
    },
    studyHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 4,
    },
    exercised: {
      type: Boolean,
      default: false,
    },
    socialInteraction: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high'],
      default: 'moderate',
    },
    anxietyLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    energyLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    physicalSymptoms: {
      type: String,
      enum: ['none', 'headaches', 'stomach', 'rapid_heartbeat', 'fatigue', 'other'],
      default: 'none',
    },
    dietQuality: {
      type: String,
      enum: ['poor', 'average', 'good'],
      default: 'average',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Stress prediction result
    predictedStress: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: null,
    },
    stressProbability: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient time-based queries
moodSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MoodLog', moodSchema);
