import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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

  const funnelStages = ['new', 'contacted', 'engaged', 'qualified', 'proposal', 'closed_won', 'closed_lost'];
  const funnelData = funnelStages.map(stage => stats.funnel?.[stage] || 0);

  const chartData = {
    labels: funnelStages.map(stage => stage.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Leads',
        data: funnelData,
        backgroundColor: 'rgba(187, 134, 252, 0.6)',
        borderColor: 'rgba(187, 134, 252, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Lead Funnel Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Lead Funnel Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Lead Funnel
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Key Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.800', borderRadius: 2 }}>
                <Typography variant="h4" color="secondary">
                  {stats.totalInteractions || 0}
                </Typography>
                <Typography variant="body1">Total Interactions</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.800', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#ff9800' }}>
                  {stats.responseRate || '0%'}
                </Typography>
                <Typography variant="body1">Response Rate</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.800', borderRadius: 2 }}>
                <Typography variant="h4" color="primary">
                  {stats.conversionRate || '0%'}
                </Typography>
                <Typography variant="body1">Conversion Rate</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}