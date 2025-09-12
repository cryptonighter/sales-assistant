import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '300' }}>Sales Assistant Dashboard</h1>
        <Link href="/dashboard/leads">
          <button style={{
            backgroundColor: '#bb86fc',
            color: '#121212',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '30px',
            transition: 'background-color 0.3s'
          }}>Go to Leads</button>
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Recent Leads</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px' }}>
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td style={{ padding: '12px' }}>{lead.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: lead.status === 'qualified' ? '#4caf50' : lead.status === 'engaged' ? '#ff9800' : '#2196f3',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(lead.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Quick Actions</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link href="/dashboard/leads" style={{ color: '#bb86fc', textDecoration: 'none' }}>View All Leads</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="/dashboard/kb" style={{ color: '#bb86fc', textDecoration: 'none' }}>Manage Knowledge Base</a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="/dashboard/analytics" style={{ color: '#bb86fc', textDecoration: 'none' }}>View Analytics</a>
              </li>
              <li>
                <a href="/dashboard/settings" style={{ color: '#bb86fc', textDecoration: 'none' }}>Settings</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}