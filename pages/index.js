import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    createLead();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/analytics')
      ]);
      const leadsData = await leadsRes.json();
      const statsData = await statsRes.json();
      setLeads(leadsData.slice(0, 5));
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Web',
        last_name: 'User',
        email: `web${Date.now()}@example.com`,
        source: 'web'
      })
    });
    if (res.ok) {
      const lead = await res.json();
      setLeadId(lead.id);
    }
  };

  const sendMessage = async () => {
    if (!input || !leadId) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const res = await fetch('/api/webchat-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, leadId })
    });

    if (res.ok) {
      const data = await res.json();
      const botMessage = { text: data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  if (loading) return <div style={{ backgroundColor: '#121212', color: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      display: 'flex'
    }}>
      {/* Main Dashboard */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '300' }}>Sales Assistant Dashboard</h1>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '300', color: '#bb86fc' }}>
              {stats.totalInteractions || 0}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Interactions</p>
          </div>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '300', color: '#03dac6' }}>
              {leads.length}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Leads</p>
          </div>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '300', color: '#ff9800' }}>
              {stats.responseRate || '0%'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Response Rate</p>
          </div>
        </div>

        {/* Recent Leads */}
        <div style={{
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Recent Leads</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {leads.map(lead => (
              <div key={lead.id} style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{lead.first_name} {lead.last_name}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#bbb' }}>{lead.email}</p>
                <span style={{
                  backgroundColor: lead.status === 'qualified' ? '#4caf50' : lead.status === 'engaged' ? '#ff9800' : '#2196f3',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link href="/dashboard/leads">
            <button style={{
              backgroundColor: '#bb86fc',
              color: '#121212',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}>View All Leads</button>
          </Link>
          <Link href="/dashboard/kb">
            <button style={{
              backgroundColor: '#03dac6',
              color: '#121212',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}>Manage KB</button>
          </Link>
          <Link href="/dashboard/analytics">
            <button style={{
              backgroundColor: '#ff9800',
              color: '#121212',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}>View Analytics</button>
          </Link>
        </div>
      </div>

      {/* Collapsible Webchat */}
      <div style={{
        width: chatExpanded ? '400px' : '60px',
        backgroundColor: '#1e1e1e',
        borderLeft: '1px solid #333',
        transition: 'width 0.3s',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setChatExpanded(!chatExpanded)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '10px',
            backgroundColor: '#bb86fc',
            color: '#121212',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 10
          }}
        >
          {chatExpanded ? '←' : '💬'}
        </button>

        {chatExpanded && (
          <div style={{ padding: '20px', paddingTop: '80px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', fontWeight: '300' }}>Web Chat</h3>
            <div style={{
              flex: 1,
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              overflowY: 'auto',
              maxHeight: '400px'
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '10px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: msg.sender === 'user' ? '#bb86fc' : '#333',
                    color: msg.sender === 'user' ? '#121212' : '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    maxWidth: '80%'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: '#03dac6',
                  color: '#121212',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}