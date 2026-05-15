import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../utils/api';
import CollegeCard from '../components/CollegeCard';
import { toast } from 'react-toastify';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.getAll()
      .then(r => setFavorites(r.data.favorites))
      .catch(() => toast.error('Failed to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await favoritesAPI.remove(id);
      setFavorites(prev => prev.filter(c => c._id !== id));
      toast.success('Removed from favorites');
    } catch { toast.error('Error removing'); }
  };

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>❤️ Saved Colleges</h1>
        <p style={styles.sub}>{favorites.length} college{favorites.length !== 1 ? 's' : ''} saved</p>
      </div>

      {favorites.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 64 }}>💔</div>
          <h3>No favorites yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Browse colleges and tap the heart icon to save them here</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {favorites.map(college => (
            <div key={college._id} style={styles.cardWrap}>
              <CollegeCard college={college} showCompare={false} />
              <button
                className="btn btn-danger"
                style={styles.removeBtn}
                onClick={() => handleRemove(college._id)}
              >
                🗑️ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  header: {},
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  cardWrap: { display: 'flex', flexDirection: 'column', gap: 0 },
  removeBtn: { borderRadius: '0 0 14px 14px', width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px' },
};
