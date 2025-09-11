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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Knowledge Base Management</h1>
      <p>Upload and manage context about your company, products, services, and communication examples.</p>

      <form onSubmit={addDoc} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '20px' }}>
        <h2>Add New Document</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Title:</label>
          <input
            type="text"
            value={newDoc.title}
            onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Content:</label>
          <textarea
            value={newDoc.content}
            onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
            rows="10"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={newDoc.tags}
            onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Add Document</button>
      </form>

      <h2>Existing Documents</h2>
      {docs.map(doc => (
        <div key={doc.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
          <h3>{doc.title}</h3>
          <p>{doc.content.substring(0, 200)}...</p>
          <p><strong>Tags:</strong> {doc.tags?.join(', ')}</p>
          <p><small>Created: {new Date(doc.created_at).toLocaleString()}</small></p>
        </div>
      ))}
    </div>
  );
}