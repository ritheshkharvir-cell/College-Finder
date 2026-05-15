import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { collegesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CollegeCard from '../components/CollegeCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topColleges, setTopColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([collegesAPI.getStats(), collegesAPI.getTop()])
      .then(([statsRes, topRes]) => {
        setStats(statsRes.data.stats);
        setTopColleges(topRes.data.colleges);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.center}>
      <div className="spinner" />
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading dashboard...</p>
    </div>
  );

  const typeChartData = {
    labels: stats?.byType?.map(t => t._id) || [],
    datasets: [{
      data: stats?.byType?.map(t => t.count) || [],
      backgroundColor: ['#6c63ff','#ff6584','#43e97b','#f9ca24','#fd9644','#45aaf2','#a29bfe','#ff7675'],
      borderWidth: 0,
    }]
  };

  const placementData = {
    labels: stats?.topPlacement?.map(c => c.name.split(' ').slice(0,2).join(' ')) || [],
    datasets: [{
      label: 'Placement %',
      data: stats?.topPlacement?.map(c => c.placement?.percentage) || [],
      backgroundColor: 'rgba(108,99,255,0.7)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0' }, max: 100 }
    }
  };

  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#9090b0', font: { size: 11 }, padding: 12, boxWidth: 12 } }
    }
  };

  return (
    <div style={styles.page}>
      {/* Welcome */}
      <div style={styles.welcome}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={styles.subtitle}>Explore {stats?.total || 20}+ colleges across Bangalore</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/colleges')}>
          Browse All Colleges →
        </button>
      </div>

      {/* Stat cards */}
      <div style={styles.statGrid}>
        {[
          { label: 'Total Colleges', value: stats?.total, icon: '🏫', color: '#6c63ff' },
          { label: 'Avg Rating', value: `${stats?.avgRating}/5`, icon: '⭐', color: '#f9ca24' },
          { label: 'College Types', value: stats?.byType?.length, icon: '📚', color: '#43e97b' },
          { label: 'Top Placement', value: `${stats?.topPlacement?.[0]?.placement?.percentage}%`, icon: '💼', color: '#ff6584' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${s.color}20` }}>{s.icon}</div>
            <div>
              <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Top Placement Colleges</h3>
          <div style={{ height: 220 }}>
            <Bar data={placementData} options={chartOpts} />
          </div>
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Colleges by Type</h3>
          <div style={{ height: 220 }}>
            <Doughnut data={typeChartData} options={pieOpts} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={styles.quickActions}>
        {[
          { icon: '🤖', label: 'Ask AI', sub: 'Chat with College Finder AI', path: '/chat', color: '#6c63ff' },
          { icon: '⚖️', label: 'Compare', sub: 'Side-by-side comparison', path: '/compare', color: '#ff6584' },
          { icon: '🗺️', label: 'Map', sub: 'Find colleges near you', path: '/map', color: '#43e97b' },
          { icon: '🎯', label: 'Recommend', sub: 'Personalized picks', path: '/recommend', color: '#f9ca24' },
        ].map(a => (
          <div key={a.label} style={styles.actionCard} onClick={() => navigate(a.path)}>
            <div style={{ ...styles.actionIcon, background: `${a.color}20` }}>{a.icon}</div>
            <div style={{ ...styles.actionLabel, color: a.color }}>{a.label}</div>
            <div style={styles.actionSub}>{a.sub}</div>
          </div>
        ))}
      </div>

      {/* Top colleges */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Top Rated Colleges</h2>
          <button className="btn btn-outline" onClick={() => navigate('/colleges')}>View All</button>
        </div>
        <div style={styles.collegeGrid}>
          {topColleges.map(c => (
            <CollegeCard key={c._id} college={c} showCompare={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  welcome: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 15 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  statVal: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 },
  statLabel: { color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 20 },
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  actionCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 12px' },
  actionLabel: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 },
  actionSub: { color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 },
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 },
  collegeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
};
