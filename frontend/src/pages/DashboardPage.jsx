import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/axios';
import StressAlert from '../components/StressAlert';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, Brain, Calendar, Loader2, Activity } from 'lucide-react';

const STRESS_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#f43f5e' };
const MOOD_COLORS   = { happy: '#3b82f6', neutral: '#f59e0b', stressed: '#f43f5e' };

function StatCard({ icon: Icon, label, value, sub, color = '#3b82f6' }) {
  return (
    <div className="glass" style={{ padding: '1.25rem 1.5rem', display:'flex', gap:'1rem', alignItems:'center' }}>
      <div style={{ background: `${color}20`, borderRadius:'12px', padding:'0.75rem', flexShrink:0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize:'0.75rem', color:'var(--color-muted)', fontWeight:500 }}>{label}</p>
        <p style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--color-text)', lineHeight:1.2 }}>{value}</p>
        {sub && <p style={{ fontSize:'0.75rem', color:'var(--color-muted)', marginTop:'2px' }}>{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e293b', border:'1px solid rgba(148,163,184,0.15)', borderRadius:'10px', padding:'0.75rem 1rem' }}>
      <p style={{ color:'var(--color-muted)', fontSize:'0.75rem', marginBottom:'0.5rem' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, fontSize:'0.875rem' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [logs, setLogs]       = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [latestStress, setLatestStress] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/mood/get-history?limit=30');
        setLogs(data.logs || []);
        setSummary(data.summary || {});
        if (data.logs?.length) {
          setLatestStress(data.logs[0].predictedStress);
          
          let totalAnx = 0;
          let totalEne = 0;
          data.logs.forEach(l => { totalAnx += l.anxietyLevel||0; totalEne += l.energyLevel||0; });
          setSummary(prev => ({ 
            ...prev, 
            avgAnxiety: (totalAnx / data.logs.length).toFixed(1),
            avgEnergy: (totalEne / data.logs.length).toFixed(1)
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Transform logs for chart (last 14 entries reversed for oldest→newest)
  const timelineData = [...logs].slice(0, 14).reverse().map((l, i) => ({
    day: new Date(l.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    stress: l.predictedStress === 'Low' ? 1 : l.predictedStress === 'Medium' ? 2 : 3,
    stressLabel: l.predictedStress || 'N/A',
    sleep: l.sleepHours,
    study: l.studyHours,
  }));

  const moodPieData = ['happy', 'neutral', 'stressed']
    .filter(k => summary[k] > 0)
    .map(k => ({ name: k.charAt(0).toUpperCase()+k.slice(1), value: summary[k], color: MOOD_COLORS[k] }));

  const stressBarData = ['Low', 'Medium', 'High']
    .map(k => ({ name: k, count: summary[k] || 0, color: STRESS_COLORS[k] }));

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'0.75rem' }}>
          <Loader2 size={24} color="#3b82f6" style={{ animation:'spin 1s linear infinite' }} />
          <p style={{ color:'var(--color-muted)' }}>Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth:'1100px' }}>
        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
            <div style={{ background:'linear-gradient(135deg,#3b82f6,#10b981)', borderRadius:'10px', padding:'0.5rem', display:'flex' }}>
              <LayoutDashboard size={20} color="white" />
            </div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--color-text)' }}>Dashboard</h1>
          </div>
          <p style={{ color:'var(--color-muted)', fontSize:'0.9rem' }}>
            Welcome back, <strong style={{ color:'#60a5fa' }}>{user?.name}</strong>! Here's your mental wellness overview.
          </p>
        </div>

        {/* High stress alert */}
        {!alertDismissed && latestStress === 'High' && (
          <div style={{ marginBottom:'1.5rem' }}>
            <StressAlert stressLevel="High" onClose={() => setAlertDismissed(true)} />
          </div>
        )}

        {logs.length === 0 ? (
          <div className="glass" style={{ padding:'3rem', textAlign:'center' }}>
            <span style={{ fontSize:'3rem' }}>🌱</span>
            <p style={{ color:'var(--color-text)', fontWeight:600, fontSize:'1.1rem', marginTop:'1rem' }}>No mood logs yet</p>
            <p style={{ color:'var(--color-muted)', fontSize:'0.875rem', marginTop:'0.5rem' }}>
              Head over to Mood Tracker to log your first entry and get AI insights.
            </p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              <StatCard icon={Calendar}   label="Total Entries"    value={logs.length}              color="#3b82f6" />
              <StatCard icon={Brain}      label="Latest Stress"    value={latestStress || '—'}      color={STRESS_COLORS[latestStress] || '#94a3b8'} />
              <StatCard icon={Activity}   label="Avg Anxiety"      value={`${summary.avgAnxiety||0}/10`} color="#f59e0b" />
              <StatCard icon={TrendingUp} label="High Stress Days" value={summary.High || 0}        color="#f43f5e" />
            </div>

            {/* Charts row */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
              {/* Timeline chart */}
              <div className="glass" style={{ padding:'1.5rem' }}>
                <p style={{ fontWeight:600, color:'var(--color-text)', marginBottom:'1rem', fontSize:'0.95rem' }}>
                  📈 Stress Level Over Time
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} />
                    <YAxis domain={[0,4]} ticks={[1,2,3]} tickFormatter={v => ['','Low','Med','High'][v]} tick={{ fontSize:11, fill:'#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="stress" name="Stress" stroke="#3b82f6" fill="url(#stressGrad)" strokeWidth={2} dot={{ fill:'#3b82f6', r:3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mood pie */}
              <div className="glass" style={{ padding:'1.5rem' }}>
                <p style={{ fontWeight:600, color:'var(--color-text)', marginBottom:'1rem', fontSize:'0.95rem' }}>
                  🍩 Mood Distribution
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={moodPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {moodPieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color:'var(--color-muted)', fontSize:'0.8rem' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stress bar */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
              <div className="glass" style={{ padding:'1.5rem' }}>
                <p style={{ fontWeight:600, color:'var(--color-text)', marginBottom:'1rem', fontSize:'0.95rem' }}>
                  📊 Stress Level Summary
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stressBarData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} />
                    <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Days" radius={[6,6,0,0]}>
                      {stressBarData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sleep vs study */}
              <div className="glass" style={{ padding:'1.5rem' }}>
                <p style={{ fontWeight:600, color:'var(--color-text)', marginBottom:'1rem', fontSize:'0.95rem' }}>
                  💤 Sleep vs Study Hours
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={timelineData.slice(-7)} barGap={4} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} />
                    <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} domain={[0,'dataMax+2']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sleep" name="Sleep" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="study" name="Study" fill="#10b981" radius={[4,4,0,0]} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color:'var(--color-muted)', fontSize:'0.8rem' }}>{v}</span>} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent logs table */}
            <div className="glass" style={{ padding:'1.5rem', overflowX:'auto' }}>
              <p style={{ fontWeight:600, color:'var(--color-text)', marginBottom:'1rem', fontSize:'0.95rem' }}>
                🗂️ Recent Mood Logs
              </p>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(148,163,184,0.15)' }}>
                    {['Date','Mood','Primary Symptom','Anxiety','Energy','Stress Level'].map(h => (
                      <th key={h} style={{ color:'var(--color-muted)', textAlign:'left', padding:'0.5rem 0.75rem', fontWeight:500, fontSize:'0.75rem', letterSpacing:'0.05em', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log._id} style={{ borderBottom:'1px solid rgba(148,163,184,0.08)', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(148,163,184,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'0.75rem', color:'var(--color-muted)', whiteSpace:'nowrap' }}>
                        {new Date(log.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                      </td>
                      <td style={{ padding:'0.75rem' }}>
                        <span style={{ color: MOOD_COLORS[log.mood], fontWeight:600, textTransform:'capitalize' }}>
                          {log.mood === 'happy' ? '😊' : log.mood === 'neutral' ? '😐' : '😟'} {log.mood}
                        </span>
                      </td>
                      <td style={{ padding:'0.75rem', color:'var(--color-text)', textTransform:'capitalize' }}>{log.physicalSymptoms?.replace('_',' ') || 'None'}</td>
                      <td style={{ padding:'0.75rem', color: log.anxietyLevel > 6 ? '#f43f5e' : 'var(--color-text)' }}>{log.anxietyLevel || 0}/10</td>
                      <td style={{ padding:'0.75rem', color: log.energyLevel < 4 ? '#f43f5e' : 'var(--color-text)' }}>{log.energyLevel || 0}/10</td>
                      <td style={{ padding:'0.75rem' }}>
                        <span className={`badge badge-${(log.predictedStress||'low').toLowerCase()}`}>
                          {log.predictedStress || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
