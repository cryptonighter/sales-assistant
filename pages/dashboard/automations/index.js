import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [newAutomation, setNewAutomation] = useState({
    lead_id: '',
    trigger_type: 'manual',
    template_id: '',
    schedule_interval: '3d',
    conditions: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [autoRes, leadsRes, tempRes] = await Promise.all([
        fetch('/api/automations'),
        fetch('/api/leads'),
        fetch('/api/automations/templates')
      ]);
      const autoData = await autoRes.json();
      const leadsData = await leadsRes.json();
      const tempData = await tempRes.json();
      setAutomations(autoData);
      setLeads(leadsData);
      setTemplates(tempData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
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
        setNewAutomation({
          lead_id: '',
          trigger_type: 'manual',
          template_id: '',
          schedule_interval: '3d',
          conditions: {}
        });
        fetchData();
        setError(null);
      } else {
        setError('Failed to create automation');
      }
    } catch (error) {
      console.error('Failed to create automation:', error);
      setError('Error creating automation');
    }
  };

  const toggleAutomation = async (id, enabled) => {
    try {
      await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle automation:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Automation Center
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Schedule follow-ups, emails, SMS, and track automation performance.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create Automation
              </Typography>
              <Box component="form" onSubmit={createAutomation} sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Lead</InputLabel>
                  <Select
                    value={newAutomation.lead_id}
                    onChange={(e) => setNewAutomation({ ...newAutomation, lead_id: e.target.value })}
                    required
                    label="Lead"
                  >
                    <MenuItem value="">Select Lead</MenuItem>
                    {leads.map(lead => (
                      <MenuItem key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name} ({lead.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={newAutomation.trigger_type}
                    onChange={(e) => setNewAutomation({ ...newAutomation, trigger_type: e.target.value })}
                    label="Trigger Type"
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="cadence">Cadence</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="status_change">Status Change</MenuItem>
                    <MenuItem value="time_based">Time Based</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={newAutomation.template_id}
                    onChange={(e) => setNewAutomation({ ...newAutomation, template_id: e.target.value })}
                    label="Template"
                  >
                    <MenuItem value="">No Template</MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Schedule Interval"
                  value={newAutomation.schedule_interval}
                  onChange={(e) => setNewAutomation({ ...newAutomation, schedule_interval: e.target.value })}
                  placeholder="e.g., 3d, 1w"
                  sx={{ mb: 2 }}
                />

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced Conditions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      label="Conditions (JSON)"
                      multiline
                      rows={3}
                      value={JSON.stringify(newAutomation.conditions, null, 2)}
                      onChange={(e) => setNewAutomation({ ...newAutomation, conditions: JSON.parse(e.target.value || '{}') })}
                      placeholder='{"status": "qualified"}'
                    />
                  </AccordionDetails>
                </Accordion>

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                  Create Automation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Active Automations
              </Typography>
              <Grid container spacing={2}>
                {automations.map(auto => (
                  <Grid item xs={12} sm={6} key={auto.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6">
                            {auto.automation_templates?.name || 'Custom'} for Lead {auto.lead_id.slice(0, 8)}...
                          </Typography>
                          <Box>
                            <Tooltip title={auto.enabled ? 'Disable' : 'Enable'}>
                              <IconButton onClick={() => toggleAutomation(auto.id, auto.enabled)}>
                                {auto.enabled ? <StopIcon /> : <PlayArrowIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Trigger: {auto.trigger_type}
                        </Typography>
                        {auto.next_run_at && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Next Run: {new Date(auto.next_run_at).toLocaleString()}
                          </Typography>
                        )}
                        <Chip
                          label={auto.enabled ? 'Enabled' : 'Disabled'}
                          color={auto.enabled ? 'success' : 'warning'}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}