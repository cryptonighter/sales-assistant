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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sales Assistant Dashboard</h1>
      <Link href="/dashboard/leads">
        <button style={{ padding: '10px', marginBottom: '20px' }}>Go to Leads</button>
      </Link>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Recent Leads</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map(lead => (
                <tr key={lead.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{lead.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{lead.status}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Quick Actions</h2>
          <ul>
            <li><Link href="/dashboard/leads">View All Leads</Link></li>
            <li><a href="/dashboard/kb">Manage Knowledge Base</a></li>
            <li><a href="/dashboard/analytics">View Analytics</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}