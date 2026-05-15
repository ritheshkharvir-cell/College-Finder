import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signup(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>College Finder</span>
          </div>
          <h1 style={styles.tagline}>
            Discover the <span style={styles.highlight}>best colleges</span> in Bangalore
          </h1>
          <p style={styles.sub}>AI-powered search, smart comparisons, and personalized recommendations — all in one place.</p>
          <div style={styles.features}>
            {['🤖 AI Chatbot Assistant', '📊 Smart Comparisons', '🗺️ Interactive Map', '⭐ Personalized Picks'].map(f => (
              <div key={f} style={styles.feature}>{f}</div>
            ))}
          </div>
        </div>
        <div style={styles.glow} />
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p style={styles.formSub}>{mode === 'login' ? 'Sign in to continue' : 'Join thousands of students'}</p>

          <div style={styles.tabs}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'signup' && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? <span style={styles.spinner} /> : null}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.switchBtn}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a2e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 40px', position: 'relative', overflow: 'hidden'
  },
  leftInner: { position: 'relative', zIndex: 1, maxWidth: 480 },
  glow: {
    position: 'absolute', width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderRadius: '50%'
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 },
  logoIcon: { fontSize: 32 },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' },
  tagline: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 20 },
  highlight: { background: 'linear-gradient(90deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feature: { color: 'rgba(255,255,255,0.8)', fontSize: 15, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' },
  right: {
    width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 32px', background: 'var(--bg-primary)'
  },
  formCard: { width: '100%', maxWidth: 380 },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  formSub: { color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 },
  tabs: { display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '8px 16px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  tabActive: { background: 'var(--accent)', color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  input: { padding: '12px 14px', fontSize: 14, width: '100%' },
  submitBtn: {
    padding: '13px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 4, transition: 'all 0.2s'
  },
  spinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  switchText: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' },
  switchBtn: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 },
};
