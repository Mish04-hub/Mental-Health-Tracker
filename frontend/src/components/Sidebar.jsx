import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, SmilePlus, LogOut, Brain } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/mood-tracker',  label: 'Mood Tracker', icon: SmilePlus },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--color-surface)',
        borderRight: '1px solid rgba(148,163,184,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
          borderRadius: '10px',
          padding: '0.5rem',
          display: 'flex',
        }}>
          <Brain size={20} color="white" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1 }}>MindTrack</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '2px' }}>Mental Health AI</p>
        </div>
      </div>

      {/* User pill */}
      <div style={{
        background: 'var(--color-surface2)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
      }}>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || 'Student'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              marginBottom: '0.25rem',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.1))' : 'transparent',
              color: isActive ? '#60a5fa' : 'var(--color-muted)',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'none',
          border: 'none',
          color: 'var(--color-muted)',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.9rem',
          width: '100%',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-muted)'; }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
