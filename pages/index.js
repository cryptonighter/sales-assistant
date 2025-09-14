import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Drawer,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Avatar,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  LibraryBooks as LibraryBooksIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
    { text: 'Leads', icon: <PeopleIcon />, href: '/dashboard/leads' },
    { text: 'Analytics', icon: <AnalyticsIcon />, href: '/dashboard/analytics' },
    { text: 'Automations', icon: <BusinessIcon />, href: '/dashboard/automations' },
    { text: 'Knowledge Base', icon: <LibraryBooksIcon />, href: '/dashboard/kb' },
    { text: 'Settings', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sales Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} href={item.href} onClick={() => setSidebarOpen(false)}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Typography variant="h3" component="h1" gutterBottom>
            Dashboard Overview
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.totalInteractions || 0}
                  </Typography>
                  <Typography variant="body2">Total Interactions</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {leads.length}
                  </Typography>
                  <Typography variant="body2">Total Leads</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#ff9800' }}>
                    {stats.responseRate || '0%'}
                  </Typography>
                  <Typography variant="body2">Response Rate</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Leads */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Leads
              </Typography>
              <Grid container spacing={2}>
                {leads.map(lead => (
                  <Grid item xs={12} sm={6} md={4} key={lead.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2 }}>
                            {lead.first_name[0]}{lead.last_name[0]}
                          </Avatar>
                          <Typography variant="h6">
                            {lead.first_name} {lead.last_name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {lead.email}
                        </Typography>
                        <Chip
                          label={lead.status}
                          color={
                            lead.status === 'qualified' ? 'success' :
                            lead.status === 'engaged' ? 'warning' : 'primary'
                          }
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Floating Chat Button */}
      <IconButton
        onClick={() => setChatOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
        size="large"
      >
        <ChatIcon />
      </IconButton>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      >
        <Box sx={{ width: 350, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setChatOpen(false)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              Web Chat
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, p: 1, bgcolor: 'grey.800', borderRadius: 1 }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 1,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                }}
              >
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.700',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    p: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              variant="outlined"
            />
            <IconButton onClick={sendMessage} color="primary">
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}