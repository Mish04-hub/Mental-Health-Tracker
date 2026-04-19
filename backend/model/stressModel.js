/**
 * Stress Level Prediction Model (Advanced)
 * ─────────────────────────────
 * Uses a Random Forest classifier trained on 9 parameters mapping to
 * student mental health, predicting stress level: Low / Medium / High.
 *
 * Features (9):
 * 0: moodScore        (happy=0, neutral=1, stressed=2)
 * 1: sleepHours       (0-24)
 * 2: studyHours       (0-24)
 * 3: exercised        (bool: 0/1)
 * 4: socialScore      (none=0, low=1, moderate=2, high=3)
 * 5: anxietyLevel     (0-10)
 * 6: energyLevel      (0-10)
 * 7: physSymptoms     (none=0, avg/minor=1, severe=2)
 * 8: dietScore        (poor=0, average=1, good=2)
 *
 * Labels:  0 = Low, 1 = Medium, 2 = High
 */

const { RandomForestClassifier } = require('ml-random-forest');

const MOOD_MAP   = { happy: 0, neutral: 1, stressed: 2 };
const SOCIAL_MAP = { none: 0, low: 1, moderate: 2, high: 3 };
const DIET_MAP   = { poor: 0, average: 1, good: 2 };
const PHYS_MAP   = {
  none: 0,
  headaches: 1, stomach: 1, fatigue: 1,
  rapid_heartbeat: 2, other: 1
};
const STRESS_LABELS = ['Low', 'Medium', 'High'];

function encodeFeatures(features) {
  return [
    MOOD_MAP[features.mood] ?? 1,
    Number(features.sleepHours) || 7,
    Number(features.studyHours) || 4,
    features.exercised ? 1 : 0,
    SOCIAL_MAP[features.socialInteraction] ?? 2,
    Number(features.anxietyLevel) || 0,
    Number(features.energyLevel) || 5,
    PHYS_MAP[features.physicalSymptoms] ?? 0,
    DIET_MAP[features.dietQuality] ?? 1,
  ];
}

function generateTrainingData() {
  const X = [];
  const y = [];

  // [mood, sleep, study, ex, soc, anx, ene, phys, diet]
  const samples = [
    // --- LOW STRESS ---
    // Good sleep, low anxiety, high energy, good diet, no symptoms
    ...[...Array(100)].map(() => [
      0,                                      // happy
      7 + Math.random() * 3,                  // 7-10 sleep
      1 + Math.random() * 4,                  // 1-5 study
      Math.random() > 0.4 ? 1 : 0,            // active
      2 + Math.round(Math.random()),          // mod-high social
      Math.random() * 3,                      // 0-3 anxiety
      7 + Math.random() * 3,                  // 7-10 energy
      0,                                      // no phys symptoms
      1 + Math.round(Math.random()),          // avg-good diet
    ]).map(f => ({ features: f, label: 0 })),

    // --- MEDIUM STRESS ---
    // Avg sleep, moderate anxiety, medium energy, some study load
    ...[...Array(100)].map(() => [
      Math.round(Math.random()),              // happy(0) or neutral(1)
      5 + Math.random() * 3,                  // 5-8 sleep
      4 + Math.random() * 4,                  // 4-8 study
      Math.random() > 0.6 ? 1 : 0,
      1 + Math.round(Math.random()),          // low-mod social
      3 + Math.random() * 4,                  // 3-7 anxiety
      4 + Math.random() * 3,                  // 4-7 energy
      Math.round(Math.random()),              // none(0) or minor(1) symptoms
      Math.round(Math.random() * 2),          // any diet
    ]).map(f => ({ features: f, label: 1 })),

    // --- HIGH STRESS ---
    // High anxiety, low energy, poor diet, physical tension
    ...[...Array(120)].map(() => [
      1 + Math.round(Math.random()),          // neutral(1) or stressed(2)
      2 + Math.random() * 4,                  // 2-6 sleep
      6 + Math.random() * 6,                  // 6-12 study
      Math.random() > 0.8 ? 1 : 0,            // mostly inactive
      Math.round(Math.random()),              // none-low social
      7 + Math.random() * 3,                  // 7-10 anxiety
      1 + Math.random() * 4,                  // 1-5 energy
      1 + Math.round(Math.random()),          // minor(1) or severe(2) symptoms
      Math.round(Math.random()),              // poor(0) or avg(1) diet
    ]).map(f => ({ features: f, label: 2 })),
  ];

  samples.forEach(({ features, label }) => {
    X.push(features);
    y.push(label);
  });
  return { X, y };
}

let _classifier = null;

function getClassifier() {
  if (_classifier) return _classifier;
  console.log('🤖 Training Advanced Random Forest stress model (9 parameters)...');
  const { X, y } = generateTrainingData();
  _classifier = new RandomForestClassifier({
    nEstimators: 120,
    maxDepth: 10,
    minSamplesSplit: 3,
    seed: 42,
  });
  _classifier.train(X, y);
  console.log(`✅ Model trained on ${X.length} complex samples.`);
  return _classifier;
}

function predictStress(features) {
  const clf = getClassifier();
  const encoded = encodeFeatures(features);
  const prediction = clf.predict([encoded]);
  const labelIndex = prediction[0];

  const treeVotes = clf.estimators
    ? clf.estimators.map((tree) => tree.predict([encoded])[0])
    : [];

  let probability = 0.80;
  if (treeVotes.length > 0) {
    const votes = treeVotes.filter((v) => v === labelIndex).length;
    probability = votes / treeVotes.length;
  }

  return {
    stressLevel: STRESS_LABELS[labelIndex],
    probability: Math.round(probability * 100) / 100,
  };
}

getClassifier();

module.exports = { predictStress };
