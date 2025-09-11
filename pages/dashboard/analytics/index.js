import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const funnelStages = ['new', 'contacted', 'engaged', 'qualified', 'proposal', 'closed_won', 'closed_lost'];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '300' }}>Analytics Dashboard</h1>

        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Lead Funnel</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {funnelStages.map(stage => (
              <div key={stage} style={{
                textAlign: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '20px',
                minWidth: '120px',
                flex: '1'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '500' }}>
                  {stage.replace('_', ' ').toUpperCase()}
                </h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: '300', color: '#bb86fc' }}>
                  {stats.funnel?.[stage] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Key Metrics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '500' }}>Total Interactions</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: '300', color: '#03dac6' }}>
                {stats.totalInteractions || 0}
              </p>
            </div>
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '500' }}>Response Rate</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: '300', color: '#ff9800' }}>
                {stats.responseRate || '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}