import React, { useState } from 'react';
import { collegesAPI } from '../utils/api';
import CollegeCard from '../components/CollegeCard';

const COURSES = ['B.Tech', 'B.E', 'MBBS', 'MBA', 'BBA', 'B.Com', 'BA', 'B.Sc', 'LLB', 'MCA', 'M.Tech', 'PhD'];
const AREAS = ['North Bangalore', 'South Bangalore', 'East Bangalore', 'West Bangalore', 'Central Bangalore'];

export default function RecommendPage() {
  const [form, setForm] = useState({ budget: '', course: '', area: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (form.budget) params.budget = parseInt(form.budget);
      if (form.course) params.course = form.course;
      if (form.area) params.area = form.area;
      const { data } = await collegesAPI.recommend(params);
      setResults(data.colleges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎯 Personalized Recommendations</h1>
        <p style={styles.sub}>Tell us your preferences and we'll find the best colleges for you</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>💰 Annual Budget (₹)</label>
            <select style={styles.select} value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}>
              <option value="">Any budget</option>
              <option value="100000">Under ₹1 Lakh</option>
              <option value="200000">Under ₹2 Lakhs</option>
              <option value="500000">Under ₹5 Lakhs</option>
              <option value="1000000">Under ₹10 Lakhs</option>
              <option value="9999999">No limit</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>📚 Course Interest</label>
            <select style={styles.select} value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
              <option value="">Any course</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>📍 Preferred Area</label>
            <select style={styles.select} value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}>
              <option value="">Any area</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
          {loading ? <><div style={styles.spinner} /> Finding colleges...</> : '🎯 Find Best Colleges'}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div style={styles.center}><div className="spinner" /></div>
      )}

      {searched && !loading && results.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 48 }}>😔</div>
          <h3>No colleges found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try relaxing your filters</p>
        </div>
      )}

      {results.length > 0 && (
        <div style={styles.results}>
          <h2 style={styles.resultsTitle}>
            ✅ Found {results.length} colleges matching your preferences
          </h2>
          <div style={styles.grid}>
            {results.map((c, i) => (
              <div key={c._id} style={styles.cardWrap}>
                <div style={styles.rank}>#{i + 1}</div>
                <CollegeCard college={c} showCompare={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {!searched && (
        <div style={styles.tips}>
          <h3 style={styles.tipsTitle}>💡 How it works</h3>
          <div style={styles.tipsGrid}>
            {[
              { icon: '💰', title: 'Set your budget', desc: 'Tell us your annual fee budget and we filter accordingly' },
              { icon: '📚', title: 'Choose a course', desc: 'Select your preferred program or field of study' },
              { icon: '📍', title: 'Pick a location', desc: 'Choose your preferred area in Bangalore' },
              { icon: '🎯', title: 'Get recommendations', desc: 'Receive a ranked list of colleges that match your criteria' },
            ].map(t => (
              <div key={t.title} style={styles.tipCard}>
                <div style={styles.tipIcon}>{t.icon}</div>
                <h4 style={styles.tipTitle}>{t.title}</h4>
                <p style={styles.tipDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' },
  header: { textAlign: 'center' },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: 15, marginTop: 8 },
  form: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' },
  select: { padding: '12px 14px', width: '100%' },
  submitBtn: { fontSize: 16, padding: '14px 32px', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8 },
  spinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  center: { display: 'flex', justifyContent: 'center', padding: 40 },
  empty: { textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  results: { display: 'flex', flexDirection: 'column', gap: 16 },
  resultsTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  cardWrap: { position: 'relative' },
  rank: { position: 'absolute', top: -10, left: -10, width: 28, height: 28, background: 'var(--accent)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, zIndex: 10, boxShadow: '0 2px 8px rgba(108,99,255,0.4)' },
  tips: { display: 'flex', flexDirection: 'column', gap: 16 },
  tipsTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  tipCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' },
  tipIcon: { fontSize: 32, marginBottom: 12 },
  tipTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 8 },
  tipDesc: { color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 },
};
