import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeadsDashboard() {
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
      <h1>Leads Dashboard</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Score</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Contact</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {lead.first_name} {lead.last_name}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{lead.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{lead.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{lead.score}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(lead.updated_at).toLocaleDateString()}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <Link href={`/dashboard/leads/${lead.id}`}>
                  <button>View Details</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}