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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Analytics Dashboard</h1>

      <h2>Lead Funnel</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {funnelStages.map(stage => (
          <div key={stage} style={{ textAlign: 'center', border: '1px solid #ddd', padding: '10px', minWidth: '100px' }}>
            <h3>{stage.replace('_', ' ').toUpperCase()}</h3>
            <p style={{ fontSize: '24px' }}>{stats.funnel?.[stage] || 0}</p>
          </div>
        ))}
      </div>

      <h2>Key Metrics</h2>
      <ul>
        <li>Total Interactions: {stats.totalInteractions || 0}</li>
        <li>Response Rate: {stats.responseRate || '0%'}</li>
      </ul>
    </div>
  );
}