import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Lightbulb as LightbulbIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedSuggestions, setExpandedSuggestions] = useState({});

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
      // Fetch AI suggestions for each lead
      const suggPromises = data.map(lead => fetch(`/api/ai-suggestions?leadId=${lead.id}`).then(r => r.json()));
      const suggResults = await Promise.all(suggPromises);
      const suggMap = {};
      data.forEach((lead, idx) => {
        suggMap[lead.id] = suggResults[idx].suggestion;
      });
      setSuggestions(suggMap);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    setFilteredLeads(filtered);
  };

  const applySuggestion = async (leadId, suggestion) => {
    if (suggestion.action === 'update_status') {
      try {
        await fetch(`/api/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: suggestion.newStatus })
        });
        fetchLeads(); // Refresh
      } catch (error) {
        console.error('Failed to apply suggestion:', error);
      }
    }
  };

  const toggleSuggestion = (leadId) => {
    setExpandedSuggestions(prev => ({
      ...prev,
      [leadId]: !prev[leadId]
    }));
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
        Leads Dashboard
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search leads"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="engaged">Engaged</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lead</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Last Contact</TableCell>
                <TableCell>AI Suggestion</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map(lead => (
                <TableRow key={lead.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {lead.first_name[0]}{lead.last_name[0]}
                      </Avatar>
                      <Typography variant="body1">
                        {lead.first_name} {lead.last_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={lead.status}
                      color={
                        lead.status === 'qualified' ? 'success' :
                        lead.status === 'engaged' ? 'warning' : 'primary'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{lead.score}</TableCell>
                  <TableCell>
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {suggestions[lead.id] && (
                      <Box>
                        <Tooltip title="View AI Suggestion">
                          <IconButton
                            size="small"
                            onClick={() => toggleSuggestion(lead.id)}
                            color="secondary"
                          >
                            <LightbulbIcon />
                          </IconButton>
                        </Tooltip>
                        <Collapse in={expandedSuggestions[lead.id]}>
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.800', borderRadius: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              {suggestions[lead.id].description}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckIcon />}
                              onClick={() => applySuggestion(lead.id, suggestions[lead.id])}
                            >
                              Apply
                            </Button>
                          </Box>
                        </Collapse>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        component={Link}
                        href={`/dashboard/leads/${lead.id}`}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}