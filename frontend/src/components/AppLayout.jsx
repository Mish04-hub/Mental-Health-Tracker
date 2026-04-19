import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '2rem',
          minHeight: '100vh',
          background: 'var(--color-bg)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
