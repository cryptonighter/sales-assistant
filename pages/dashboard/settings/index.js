import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [specs, setSpecs] = useState([]);
  const [newSpec, setNewSpec] = useState({ field_name: '', description: '', required: false });
  const [config, setConfig] = useState({
    SMTP_HOST: '',
    SMTP_PORT: '',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM: '',
    TELEGRAM_BOT_TOKEN: '',
    OPENROUTER_API_KEY: '',
    ALLOWED_DOMAINS: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecs();
    fetchConfig();
  }, []);

  const fetchSpecs = async () => {
    try {
      const res = await fetch('/api/info-specs');
      const data = await res.json();
      setSpecs(data);
    } catch (error) {
      console.error('Failed to fetch specs:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSpec = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/info-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpec)
      });
      if (res.ok) {
        setNewSpec({ field_name: '', description: '', required: false });
        fetchSpecs();
      }
    } catch (error) {
      console.error('Failed to add spec:', error);
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
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
        <h1 style={{ marginBottom: '10px', fontSize: '2rem', fontWeight: '300' }}>Settings</h1>
        <p style={{ marginBottom: '30px', color: '#bbb' }}>
          Manage lead info specifications and system configurations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Lead Info Specifications</h2>
            <form onSubmit={addSpec} style={{
              marginBottom: '30px',
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Add New Specification</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Field Name:</label>
            <input
              type="text"
              value={newSpec.field_name}
              onChange={(e) => setNewSpec({ ...newSpec, field_name: e.target.value })}
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
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description:</label>
            <textarea
              value={newSpec.description}
              onChange={(e) => setNewSpec({ ...newSpec, description: e.target.value })}
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={newSpec.required}
                onChange={(e) => setNewSpec({ ...newSpec, required: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              Required
            </label>
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
                Add Specification
              </button>
            </form>

            <div style={{
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Existing Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {specs.map(spec => (
                  <div key={spec.id} style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>{spec.field_name}</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#bbb' }}>{spec.description}</p>
                    <span style={{
                      backgroundColor: spec.required ? '#ff9800' : '#4caf50',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {spec.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>System Configuration</h2>
            <form onSubmit={saveConfig} style={{
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px' }}>SMTP Settings</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SMTP Host:</label>
                <input
                  type="text"
                  value={config.SMTP_HOST}
                  onChange={(e) => setConfig({ ...config, SMTP_HOST: e.target.value })}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SMTP Port:</label>
                <input
                  type="text"
                  value={config.SMTP_PORT}
                  onChange={(e) => setConfig({ ...config, SMTP_PORT: e.target.value })}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SMTP User:</label>
                <input
                  type="text"
                  value={config.SMTP_USER}
                  onChange={(e) => setConfig({ ...config, SMTP_USER: e.target.value })}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SMTP Password:</label>
                <input
                  type="password"
                  value={config.SMTP_PASS}
                  onChange={(e) => setConfig({ ...config, SMTP_PASS: e.target.value })}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SMTP From:</label>
                <input
                  type="text"
                  value={config.SMTP_FROM}
                  onChange={(e) => setConfig({ ...config, SMTP_FROM: e.target.value })}
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

              <h3 style={{ marginBottom: '15px' }}>API Keys</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telegram Bot Token:</label>
                <input
                  type="password"
                  value={config.TELEGRAM_BOT_TOKEN}
                  onChange={(e) => setConfig({ ...config, TELEGRAM_BOT_TOKEN: e.target.value })}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>OpenRouter API Key:</label>
                <input
                  type="password"
                  value={config.OPENROUTER_API_KEY}
                  onChange={(e) => setConfig({ ...config, OPENROUTER_API_KEY: e.target.value })}
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

              <h3 style={{ marginBottom: '15px' }}>Security</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Allowed Domains (comma-separated):</label>
                <input
                  type="text"
                  value={config.ALLOWED_DOMAINS}
                  onChange={(e) => setConfig({ ...config, ALLOWED_DOMAINS: e.target.value })}
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
                  backgroundColor: '#03dac6',
                  color: '#121212',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s'
                }}
              >
                Save Configuration
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}