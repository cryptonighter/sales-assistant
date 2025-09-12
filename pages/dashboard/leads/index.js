import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
      // Fetch AI suggestions for each lead
      const suggPromises = data.map(lead => fetch(`/api/ai-suggestions?leadId=${lead.id}`).then(r => r.json()));
      const suggResults = await Promise.all(suggPromises);
      const suggMap = {};
      data.forEach((lead, idx) => {
        suggMap[lead.id] = suggResults[idx].suggestion;
      });
      setSuggestions(suggMap);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (leadId, suggestion) => {
    if (suggestion.action === 'update_status') {
      try {
        await fetch(`/api/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: suggestion.newStatus })
        });
        fetchLeads(); // Refresh
      } catch (error) {
        console.error('Failed to apply suggestion:', error);
      }
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
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '300' }}>Leads Dashboard</h1>
        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Score</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Last Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
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
                  <td style={{ padding: '12px' }}>{lead.score}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link href={`/dashboard/leads/${lead.id}`}>
                      <button style={{
                        backgroundColor: '#bb86fc',
                        color: '#121212',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.3s'
                      }}>View Details</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}