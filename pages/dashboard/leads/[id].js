import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LeadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeadDetail();
    }
    fetchSpecs();
  }, [id]);

  const fetchLeadDetail = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      setLead(data.lead);
      setInteractions(data.interactions);
    } catch (error) {
      console.error('Failed to fetch lead detail:', error);
    }
  };

  const fetchSpecs = async () => {
    try {
      const res = await fetch('/api/info-specs');
      const data = await res.json();
      setSpecs(data);
    } catch (error) {
      console.error('Failed to fetch specs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLead({ ...lead, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const sendMessage = async () => {
    if (!message) return;
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, message, channel: 'manual' })
      });
      if (res.ok) {
        setMessage('');
        fetchLeadDetail(); // Refresh interactions
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value)}
                style={{
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '4px'
                }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="engaged">Engaged</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </p>
            <p><strong>Score:</strong> {lead.score}</p>
            <p><strong>Source:</strong> {lead.source}</p>
            <p><strong>Created:</strong> {new Date(lead.created_at).toLocaleString()}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Gathered Information</h3>
            {specs.map(spec => {
              const gathered = lead.data && lead.data[spec.field_name];
              return (
                <div key={spec.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '6px' }}>
                  <strong>{spec.field_name} {spec.required ? '(Required)' : '(Optional)'}:</strong>
                  {gathered ? (
                    <span style={{ color: '#4caf50', marginLeft: '10px' }}>{gathered}</span>
                  ) : (
                    <span style={{ color: '#ff9800', marginLeft: '10px' }}>Not gathered</span>
                  )}
                </div>
              );
            })}
            <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
              Completion: {specs.filter(spec => lead.data && lead.data[spec.field_name]).length} / {specs.length}
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
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

        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Send Manual Message</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '10px'
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              backgroundColor: '#bb86fc',
              color: '#121212',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}
          >
            Send Message
          </button>
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