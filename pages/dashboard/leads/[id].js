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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lead Details</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>{lead.first_name} {lead.last_name}</h2>
        <p>Email: {lead.email}</p>
        <p>Phone: {lead.phone}</p>
        <p>Status: {lead.status}</p>
        <p>Score: {lead.score}</p>
        <p>Source: {lead.source}</p>
        <p>Created: {new Date(lead.created_at).toLocaleString()}</p>
      </div>

      <div>
        <h3>Interactions Timeline</h3>
        {interactions.map(int => (
          <div key={int.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
            <p><strong>{int.direction} via {int.channel}</strong></p>
            <p>{int.body}</p>
            <p>{new Date(int.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <button onClick={() => router.push('/dashboard/leads')}>Back to Leads</button>
    </div>
  );
}