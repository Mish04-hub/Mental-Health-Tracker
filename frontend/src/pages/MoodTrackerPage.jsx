import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StressAlert from '../components/StressAlert';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';
import { SmilePlus, Loader2, Send, Activity, BrainCircuit } from 'lucide-react';

const MOODS = [
  { value: 'happy',   emoji: '😊', label: 'Happy',   color: '#10b981' },
  { value: 'neutral', emoji: '😐', label: 'Neutral',  color: '#f59e0b' },
  { value: 'stressed',emoji: '😟', label: 'Stressed', color: '#f43f5e' },
];

const SOCIAL = ['none', 'low', 'moderate', 'high'];
const SYMPTOMS = [
  { value: 'none', label: 'None' },
  { value: 'headaches', label: 'Tension/Headaches' },
  { value: 'stomach', label: 'Stomach Issues' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'rapid_heartbeat', label: 'Rapid Heartbeat' },
];
const DIET = ['poor', 'average', 'good'];

export default function MoodTrackerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    mood: '',
    sleepHours: 7,
    studyHours: 4,
    exercised: false,
    socialInteraction: 'moderate',
    anxietyLevel: 0,
    energyLevel: 5,
    physicalSymptoms: 'none',
    dietQuality: 'average',
    notes: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mood) { toast.error('Please select a mood.'); return; }

    setLoading(true);
    setResult(null);
    setAlertVisible(true);

    try {
      const { data } = await api.post('/mood/add-mood', form);
      setResult(data.prediction);
      toast.success('Professional log saved successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log data.');
    } finally {
      setLoading(false);
    }
  };

  const setVal = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#3b82f6,#10b981)', borderRadius:'10px', padding:'0.5rem', display:'flex' }}>
              <SmilePlus size={20} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Advanced Tracker</h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Complete this professional mental health assessment to receive AI-powered clinical insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* SECTION 1: Psychological State */}
          <section>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#60a5fa', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <BrainCircuit size={18} /> Psychological State
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mood selector */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  1. Primary Emotion *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {MOODS.map(({ value, emoji, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVal('mood', value)}
                      style={{
                        padding: '1.25rem', borderRadius: '14px',
                        border: `2px solid ${form.mood === value ? color : 'rgba(148,163,184,0.15)'}`,
                        background: form.mood === value ? `${color}18` : 'var(--color-surface2)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        transform: form.mood === value ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <span style={{ fontSize: '2.25rem' }}>{emoji}</span>
                      <span style={{ fontWeight: 600, color: form.mood === value ? color : 'var(--color-muted)', fontSize: '0.875rem' }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anxiety & Social */}
              <div className="glass" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    Anxiety / Nervousness: <strong style={{ color: form.anxietyLevel > 6 ? '#f43f5e' : '#60a5fa' }}>{form.anxietyLevel}/10</strong>
                  </label>
                  <input
                    type="range" min="0" max="10" step="1"
                    value={form.anxietyLevel}
                    onChange={(e) => setVal('anxietyLevel', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: form.anxietyLevel > 6 ? '#f43f5e' : '#60a5fa' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                    <span>Calm</span><span>Severe</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    Social Interaction Level
                  </label>
                  <select
                    className="input-field"
                    value={form.socialInteraction}
                    onChange={(e) => setVal('socialInteraction', e.target.value)}
                  >
                    {SOCIAL.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>


          {/* SECTION 2: Physical Wellbeing */}
          <section>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#10b981', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Activity size={18} /> Physical Wellbeing
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Energy & Diet */}
              <div className="glass" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    Energy Level: <strong style={{ color: form.energyLevel < 4 ? '#f43f5e' : '#10b981' }}>{form.energyLevel}/10</strong>
                  </label>
                  <input
                    type="range" min="0" max="10" step="1"
                    value={form.energyLevel}
                    onChange={(e) => setVal('energyLevel', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: form.energyLevel < 4 ? '#f43f5e' : '#10b981' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                    <span>Exhausted</span><span>Dynamic</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    Diet & Hydration Quality
                  </label>
                  <select
                    className="input-field"
                    value={form.dietQuality}
                    onChange={(e) => setVal('dietQuality', e.target.value)}
                  >
                    {DIET.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Symptoms */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '1rem' }}>
                  Dominant Physical Symptoms
                </label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
                  {SYMPTOMS.map((symp) => (
                    <button
                      key={symp.value} type="button"
                      onClick={() => setVal('physicalSymptoms', symp.value)}
                      style={{
                        padding:'0.5rem 1rem', borderRadius:'99px', fontSize:'0.85rem', fontWeight:500,
                        border: `1px solid ${form.physicalSymptoms === symp.value ? '#10b981' : 'rgba(148,163,184,0.3)'}`,
                        background: form.physicalSymptoms === symp.value ? 'rgba(16,185,129,0.1)' : 'transparent',
                        color: form.physicalSymptoms === symp.value ? '#10b981' : 'var(--color-text)',
                        cursor:'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {symp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep & Study & Exercise */}
              <div className="glass" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    😴 Sleep: <strong>{form.sleepHours}h</strong>
                  </label>
                  <input type="range" min="0" max="14" step="0.5" value={form.sleepHours} onChange={e => setVal('sleepHours', parseFloat(e.target.value))} style={{width:'100%'}} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    📚 Focus: <strong>{form.studyHours}h</strong>
                  </label>
                  <input type="range" min="0" max="16" step="0.5" value={form.studyHours} onChange={e => setVal('studyHours', parseFloat(e.target.value))} style={{width:'100%'}} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    🏃 Exercised?
                  </label>
                  <div style={{display:'flex', gap:'0.5rem'}}>
                    {[true, false].map(v => (
                      <button
                        key={String(v)} type="button" onClick={() => setVal('exercised', v)}
                        style={{ flex:1, padding:'0.4rem', borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:600,
                          background: form.exercised === v ? (v?'rgba(16,185,129,0.15)':'rgba(244,63,94,0.15)') : 'var(--color-surface2)',
                          color: form.exercised === v ? (v?'#10b981':'#f43f5e') : 'var(--color-muted)'
                        }}
                      >
                        {v?'Yes':'No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Notes & Submit */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
              📝 Clinical Notes (optional)
            </label>
            <textarea
              className="input-field" rows={3}
              placeholder="Record any specific stress triggers or therapy notes here..."
              value={form.notes} onChange={(e) => setVal('notes', e.target.value)}
            />
          </div>

          <button
            type="submit" className="btn-primary" disabled={loading}
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding:'1rem 2rem', fontSize:'1rem' }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            {loading ? 'Analyzing Profile...' : 'Save & Analyze Profile'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="animate-fade-in" style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass" style={{ padding: '1.5rem', borderLeft:`4px solid ${result.stressLevel==='High'?'#f43f5e':result.stressLevel==='Medium'?'#f59e0b':'#10b981'}` }}>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Clinical AI Assessment
              </p>
              <h2 style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--color-text)', marginTop:'0.25rem' }}>
                {result.stressLevel} Risk Profile
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop:'0.5rem' }}>
                Based on your 9-factor analysis, our model determined a {result.probability * 100}% confidence level in this evaluation.
              </p>
            </div>
            {alertVisible && result.stressLevel === 'High' && (
              <StressAlert stressLevel={result.stressLevel} onClose={() => setAlertVisible(false)} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
