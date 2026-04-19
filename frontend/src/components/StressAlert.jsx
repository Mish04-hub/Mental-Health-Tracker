import { AlertTriangle, X } from 'lucide-react';

export default function StressAlert({ stressLevel, onClose }) {
  if (stressLevel !== 'High') return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.05))',
        border: '1px solid rgba(244,63,94,0.4)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        position: 'relative',
      }}
    >
      {/* Pulsing icon */}
      <div
        className="animate-pulse-ring"
        style={{
          background: 'rgba(244,63,94,0.2)',
          borderRadius: '50%',
          padding: '0.5rem',
          flexShrink: 0,
          marginTop: '0.1rem',
        }}
      >
        <AlertTriangle size={20} color="#f43f5e" />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: '#f43f5e', marginBottom: '0.25rem', fontSize: '1rem' }}>
          ⚠️ High Stress Detected
        </p>
        <p style={{ color: '#fda4af', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Your current responses suggest elevated stress. Consider taking a short break,
          practicing deep breathing, or speaking with a student counselor. You're not alone 💙
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {['🧘 Try Breathing Exercise', '💬 Talk to Someone', '😴 Rest & Recharge'].map((tip) => (
            <span
              key={tip}
              style={{
                background: 'rgba(244,63,94,0.15)',
                color: '#fda4af',
                border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                fontWeight: 500,
              }}
            >
              {tip}
            </span>
          ))}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
