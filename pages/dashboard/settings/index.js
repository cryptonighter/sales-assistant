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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Settings: Lead Info Specifications</h1>
      <p>Define what information the bot should extract and save from users.</p>

      <form onSubmit={addSpec} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '20px' }}>
        <h2>Add New Specification</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Field Name:</label>
          <input
            type="text"
            value={newSpec.field_name}
            onChange={(e) => setNewSpec({ ...newSpec, field_name: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Description:</label>
          <textarea
            value={newSpec.description}
            onChange={(e) => setNewSpec({ ...newSpec, description: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={newSpec.required}
              onChange={(e) => setNewSpec({ ...newSpec, required: e.target.checked })}
            />
            Required
          </label>
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Add Specification</button>
      </form>

      <h2>Existing Specifications</h2>
      <ul>
        {specs.map(spec => (
          <li key={spec.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
            <strong>{spec.field_name}</strong> {spec.required ? '(Required)' : ''}<br />
            {spec.description}
          </li>
        ))}
      </ul>
    </div>
  );
}