import React, { useState, useEffect } from 'react';

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', tags: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/kb');
      const data = await res.json();
      setDocs(data);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTags = async () => {
    if (!newDoc.title || !newDoc.content) return;
    try {
      const res = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDoc.title, content: newDoc.content })
      });
      if (res.ok) {
        const data = await res.json();
        setNewDoc({ ...newDoc, tags: data.tags.join(', ') });
      }
    } catch (error) {
      console.error('Failed to generate tags:', error);
    }
  };

  const addDoc = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        setNewDoc({ title: '', content: '', tags: '' });
        fetchDocs();
      }
    } catch (error) {
      console.error('Failed to add doc:', error);
    }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/kb/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Failed to delete doc:', error);
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
        <h1 style={{ marginBottom: '10px', fontSize: '2rem', fontWeight: '300' }}>Knowledge Base Management</h1>
        <p style={{ marginBottom: '30px', color: '#bbb' }}>
          Upload and manage context about your company, products, services, and communication examples.
        </p>

        <form onSubmit={addDoc} style={{
          marginBottom: '30px',
          backgroundColor: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Add New Document</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title:</label>
            <input
              type="text"
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Content:</label>
            <textarea
              value={newDoc.content}
              onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
              rows="10"
              required
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tags (comma-separated):</label>
            <input
              type="text"
              value={newDoc.tags}
              onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
              style={{
                width: '70%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '1rem'
              }}
            />
            <button
              type="button"
              onClick={generateTags}
              style={{
                backgroundColor: '#03dac6',
                color: '#121212',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginLeft: '10px',
                transition: 'background-color 0.3s'
              }}
            >
              Auto-Generate
            </button>
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
            Add Document
          </button>
        </form>

        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '300' }}>Existing Documents</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {docs.map(doc => (
            <div key={doc.id} style={{
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <button
                onClick={() => deleteDoc(doc.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#ff4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Delete
              </button>
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '500' }}>{doc.title}</h3>
              <p style={{ marginBottom: '10px', color: '#bbb' }}>
                {doc.content.substring(0, 150)}...
              </p>
              <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                <strong>Tags:</strong> {doc.tags?.join(', ')}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                Created: {new Date(doc.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}