import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LeadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeadDetail();
    }
  }, [id]);

  const fetchLeadDetail = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      setLead(data.lead);
      setInteractions(data.interactions);
    } catch (error) {
      console.error('Failed to fetch lead detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '300' }}>Lead Details</h1>
        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: '300' }}>{lead.first_name} {lead.last_name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <p><strong>Email:</strong> {lead.email}</p>
            <p><strong>Phone:</strong> {lead.phone || 'N/A'}</p>
            <p><strong>Status:</strong>
              <span style={{
                backgroundColor: lead.status === 'qualified' ? '#4caf50' : lead.status === 'engaged' ? '#ff9800' : '#2196f3',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                marginLeft: '8px'
              }}>
                {lead.status}
              </span>
            </p>
            <p><strong>Score:</strong> {lead.score}</p>
            <p><strong>Source:</strong> {lead.source}</p>
            <p><strong>Created:</strong> {new Date(lead.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Interactions Timeline</h3>
          {interactions.map(int => (
            <div key={int.id} style={{
              backgroundColor: int.direction === 'inbound' ? '#2a2a2a' : '#333',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              borderLeft: `4px solid ${int.direction === 'inbound' ? '#2196f3' : '#4caf50'}`
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                {int.direction === 'inbound' ? '→' : '←'} {int.direction} via {int.channel}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>{int.body}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#bbb' }}>
                {new Date(int.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard/leads')}
          style={{
            backgroundColor: '#bb86fc',
            color: '#121212',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '30px',
            transition: 'background-color 0.3s'
          }}
        >
          Back to Leads
        </button>
      </div>
    </div>
  );
}