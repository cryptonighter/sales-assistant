import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [specs, setSpecs] = useState([]);
  const [newSpec, setNewSpec] = useState({ field_name: '', description: '', required: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecs();
  }, []);

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
        <h1 style={{ marginBottom: '10px', fontSize: '2rem', fontWeight: '300' }}>Settings: Lead Info Specifications</h1>
        <p style={{ marginBottom: '30px', color: '#bbb' }}>
          Define what information the bot should extract and save from users.
        </p>

        <form onSubmit={addSpec} style={{
          marginBottom: '30px',
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Add New Specification</h2>
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

        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Existing Specifications</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {specs.map(spec => (
            <div key={spec.id} style={{
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '500' }}>
                {spec.field_name} {spec.required ? <span style={{ color: '#ff9800' }}>(Required)</span> : ''}
              </h3>
              <p style={{ margin: 0, color: '#bbb' }}>{spec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}