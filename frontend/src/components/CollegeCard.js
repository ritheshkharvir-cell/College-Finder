import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../utils/api';
import { toast } from 'react-toastify';

const typeColors = {
  'Engineering': '#6c63ff',
  'Medical': '#ff6584',
  'Arts & Science': '#43e97b',
  'Commerce': '#a0a0ff',
  'Law': '#f9ca24',
  'Business School': '#fd9644',
  'Liberal Arts': '#45aaf2',
  'Deemed University': '#a29bfe',
  'Research Institute': '#ff7675',
};

export default function CollegeCard({ college, onCompareToggle, inCompare, showCompare = true }) {
  const navigate = useNavigate();
  const [faved, setFaved] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const typeColor = typeColors[college.type] || '#6c63ff';

  const handleFav = async (e) => {
    e.stopPropagation();
    setFavLoading(true);
    try {
      if (faved) {
        await favoritesAPI.remove(college._id);
        setFaved(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.add(college._id);
        setFaved(true);
        toast.success('Added to favorites!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setFavLoading(false);
    }
  };

  const stars = '★'.repeat(Math.round(college.rating)) + '☆'.repeat(5 - Math.round(college.rating));

  return (
    <div style={styles.card} onClick={() => navigate(`/colleges/${college._id}`)}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ ...styles.typeBadge, background: `${typeColor}20`, color: typeColor }}>
          {college.type}
        </div>
        <button
          onClick={handleFav}
          style={{ ...styles.favBtn, color: faved ? '#ff6584' : 'var(--text-secondary)' }}
          disabled={favLoading}
        >
          {faved ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Name */}
      <h3 style={styles.name}>{college.name}</h3>
      <p style={styles.location}>📍 {college.area}, {college.location}</p>

      {/* Rating */}
      <div style={styles.ratingRow}>
        <span style={styles.stars}>{stars}</span>
        <span style={styles.ratingNum}>{college.rating}</span>
        {college.ranking?.nirf && (
          <span style={styles.rankBadge}>NIRF #{college.ranking.nirf}</span>
        )}
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statVal}>₹{(college.fees?.min / 1000).toFixed(0)}K</div>
          <div style={styles.statLabel}>Min Fees/yr</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <div style={styles.statVal}>{college.placement?.percentage}%</div>
          <div style={styles.statLabel}>Placement</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <div style={styles.statVal}>₹{college.placement?.avgPackage}L</div>
          <div style={styles.statLabel}>Avg Package</div>
        </div>
      </div>

      {/* Courses */}
      <div style={styles.courses}>
        {college.courses?.slice(0, 4).map(c => (
          <span key={c} style={styles.courseTag}>{c}</span>
        ))}
        {college.courses?.length > 4 && (
          <span style={styles.moreTag}>+{college.courses.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.viewBtn}
          onClick={(e) => { e.stopPropagation(); navigate(`/colleges/${college._id}`); }}
        >
          View Details →
        </button>
        {showCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onCompareToggle?.(college); }}
            style={{ ...styles.compareBtn, ...(inCompare ? styles.compareBtnActive : {}) }}
          >
            {inCompare ? '✓ Added' : '+ Compare'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
    padding: 20, cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
    flexDirection: 'column', gap: 12,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  favBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2 },
  name: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 },
  location: { fontSize: 12, color: 'var(--text-secondary)' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 8 },
  stars: { color: '#f9ca24', fontSize: 13 },
  ratingNum: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  rankBadge: { fontSize: 10, padding: '2px 8px', background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderRadius: 10, fontWeight: 600, marginLeft: 'auto' },
  stats: { display: 'flex', gap: 0, background: 'var(--bg-hover)', borderRadius: 10, overflow: 'hidden' },
  stat: { flex: 1, padding: '10px 8px', textAlign: 'center' },
  statVal: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 },
  statDivider: { width: 1, background: 'var(--border)', margin: '10px 0' },
  courses: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  courseTag: { padding: '3px 8px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 10, color: 'var(--text-secondary)' },
  moreTag: { padding: '3px 8px', background: 'var(--accent-glow)', borderRadius: 6, fontSize: 10, color: 'var(--accent)' },
  footer: { display: 'flex', gap: 8, marginTop: 4 },
  viewBtn: { flex: 1, padding: '8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600 },
  compareBtn: { padding: '8px 12px', background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 },
  compareBtnActive: { background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderColor: 'var(--accent)' },
};
