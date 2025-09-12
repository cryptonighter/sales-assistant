import React, { useState, useEffect } from 'react';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [newAutomation, setNewAutomation] = useState({
    lead_id: '',
    trigger_type: 'manual',
    template_id: 'followup-1',
    schedule_interval: '3d'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [autoRes, leadsRes] = await Promise.all([
        fetch('/api/automations'),
        fetch('/api/leads')
      ]);
      const autoData = await autoRes.json();
      const leadsData = await leadsRes.json();
      setAutomations(autoData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAutomation)
      });
      if (res.ok) {
        alert('Automation created successfully!');
        setNewAutomation({
          lead_id: '',
          trigger_type: 'manual',
          template_id: 'followup-1',
          schedule_interval: '3d'
        });
        fetchData();
      } else {
        alert('Failed to create automation');
      }
    } catch (error) {
      console.error('Failed to create automation:', error);
      alert('Error creating automation');
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
        <h1 style={{ marginBottom: '10px', fontSize: '2rem', fontWeight: '300' }}>Automation Center</h1>
        <p style={{ marginBottom: '30px', color: '#bbb' }}>
          Schedule follow-ups and track automation performance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Create Automation</h2>
            <form onSubmit={createAutomation}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Lead:</label>
                <select
                  value={newAutomation.lead_id}
                  onChange={(e) => setNewAutomation({ ...newAutomation, lead_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Lead</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} ({lead.status})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Trigger:</label>
                <select
                  value={newAutomation.trigger_type}
                  onChange={(e) => setNewAutomation({ ...newAutomation, trigger_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="manual">Manual</option>
                  <option value="cadence">Cadence</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Template:</label>
                <select
                  value={newAutomation.template_id}
                  onChange={(e) => setNewAutomation({ ...newAutomation, template_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="followup-1">Follow-up 1</option>
                  <option value="demo-invite">Demo Invite</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Interval:</label>
                <input
                  type="text"
                  value={newAutomation.schedule_interval}
                  onChange={(e) => setNewAutomation({ ...newAutomation, schedule_interval: e.target.value })}
                  placeholder="e.g., 3d, 1w"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button
                type="submit"
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
                Create Automation
              </button>
            </form>
          </div>

          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Active Automations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {automations.map(auto => (
                <div key={auto.id} style={{
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                    {auto.template_id} for Lead {auto.lead_id.slice(0, 8)}...
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#bbb' }}>
                    Trigger: {auto.trigger_type}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: '#bbb' }}>
                    Next Run: {new Date(auto.next_run_at).toLocaleString()}
                  </p>
                  <span style={{
                    backgroundColor: auto.enabled ? '#4caf50' : '#ff9800',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {auto.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}