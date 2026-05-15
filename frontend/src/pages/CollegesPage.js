import React, { useState, useEffect, useCallback } from 'react';
import { collegesAPI } from '../utils/api';
import CollegeCard from '../components/CollegeCard';
import { useNavigate } from 'react-router-dom';

const TYPES = ['All', 'Engineering', 'Medical', 'Arts & Science', 'Commerce', 'Law', 'Business School', 'Liberal Arts', 'Research Institute', 'Deemed University'];
const SORTS = [
  { val: 'rating', label: 'Highest Rated' },
  { val: 'fees_low', label: 'Fees: Low to High' },
  { val: 'fees_high', label: 'Fees: High to Low' },
  { val: 'placement', label: 'Best Placement' },
  { val: 'ranking', label: 'NIRF Ranking' },
];

export default function CollegesPage() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', maxFees: '', minRating: '', sort: 'rating' });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchInput, setSearchInput] = useState('');

  const fetchColleges = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await collegesAPI.getAll({ ...filters, ...params, limit: 12 });
      setColleges(data.colleges);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchColleges(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search: searchInput }));
  };

  const toggleCompare = (college) => {
    setCompareList(prev => {
      if (prev.find(c => c._id === college._id)) return prev.filter(c => c._id !== college._id);
      if (prev.length >= 4) { alert('Max 4 colleges to compare'); return prev; }
      return [...prev, college];
    });
  };

  const goCompare = () => {
    const ids = compareList.map(c => c._id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bangalore Colleges</h1>
          <p style={styles.sub}>{pagination.total} colleges found</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={styles.searchRow}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by name, course, location..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '' })); }} style={styles.clearBtn}>✕</button>
          )}
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Type</label>
          <select
            style={styles.select}
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value === 'All' ? '' : e.target.value }))}
          >
            {TYPES.map(t => <option key={t} value={t === 'All' ? '' : t}>{t}</option>)}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Max Fees (₹/yr)</label>
          <select style={styles.select} value={filters.maxFees} onChange={e => setFilters(f => ({ ...f, maxFees: e.target.value }))}>
            <option value="">Any</option>
            <option value="100000">Under ₹1L</option>
            <option value="200000">Under ₹2L</option>
            <option value="500000">Under ₹5L</option>
            <option value="1000000">Under ₹10L</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Min Rating</label>
          <select style={styles.select} value={filters.minRating} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value }))}>
            <option value="">Any</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort By</label>
          <select style={styles.select} value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
            {SORTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
          </select>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => { setFilters({ search: '', type: '', maxFees: '', minRating: '', sort: 'rating' }); setSearchInput(''); }}>
          Reset
        </button>
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div style={styles.compareBar}>
          <div style={styles.compareNames}>
            {compareList.map(c => (
              <div key={c._id} style={styles.compareChip}>
                {c.name.split(' ').slice(0, 2).join(' ')}
                <button onClick={() => toggleCompare(c)} style={styles.chipRemove}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={goCompare} disabled={compareList.length < 2}>
            Compare {compareList.length} colleges →
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : colleges.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3>No colleges found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {colleges.map(c => (
            <CollegeCard
              key={c._id}
              college={c}
              onCompareToggle={toggleCompare}
              inCompare={!!compareList.find(x => x._id === c._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchColleges({ page: p })}
              style={{ ...styles.pageBtn, ...(pagination.page === p ? styles.pageBtnActive : {}) }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 },
  searchRow: { display: 'flex', gap: 12 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 14px', gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 14, color: 'var(--text-primary)', outline: 'none' },
  clearBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: 4 },
  filters: { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 },
  filterLabel: { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  select: { padding: '9px 12px', minWidth: 140, cursor: 'pointer' },
  compareBar: { display: 'flex', alignItems: 'center', gap: 16, background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: 12, padding: '14px 20px', flexWrap: 'wrap' },
  compareNames: { flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' },
  compareChip: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  chipRemove: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  pagination: { display: 'flex', justifyContent: 'center', gap: 8 },
  pageBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  pageBtnActive: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
};
