import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { collegesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#f9ca24'];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      setLoading(true);
      collegesAPI.compare(ids.split(','))
        .then(r => { setColleges(r.data.colleges); setSelected(r.data.colleges.map(c => c._id)); })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const searchColleges = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await collegesAPI.getAll({ search: q, limit: 5 });
    setSearchResults(data.colleges.filter(c => !colleges.find(x => x._id === c._id)));
  };

  const addCollege = (college) => {
    if (colleges.length >= 4) { toast.warn('Max 4 colleges'); return; }
    setColleges(prev => [...prev, college]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeCollege = (id) => setColleges(prev => prev.filter(c => c._id !== id));

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('College Comparison Report', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 26);

    const rows = [
      ['Type', ...colleges.map(c => c.type)],
      ['Location', ...colleges.map(c => c.area)],
      ['Rating', ...colleges.map(c => `${c.rating}/5`)],
      ['NIRF Rank', ...colleges.map(c => c.ranking?.nirf ? `#${c.ranking.nirf}` : 'N/A')],
      ['Min Fees', ...colleges.map(c => `₹${c.fees?.min?.toLocaleString()}`)],
      ['Max Fees', ...colleges.map(c => `₹${c.fees?.max?.toLocaleString()}`)],
      ['Placement %', ...colleges.map(c => `${c.placement?.percentage}%`)],
      ['Avg Package', ...colleges.map(c => `₹${c.placement?.avgPackage} LPA`)],
      ['Top Package', ...colleges.map(c => `₹${c.placement?.topPackage} LPA`)],
      ['Affiliation', ...colleges.map(c => c.affiliation)],
      ['Established', ...colleges.map(c => c.established)],
      ['Campus Size', ...colleges.map(c => c.campusSize)],
      ['Students', ...colleges.map(c => c.totalStudents?.toLocaleString())],
      ['Admission', ...colleges.map(c => c.admissionProcess)],
    ];

    autoTable(doc, {
      startY: 32,
      head: [['Parameter', ...colleges.map(c => c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name)]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [108, 99, 255] },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    doc.save('college_comparison.pdf');
    toast.success('Comparison PDF downloaded!');
  };

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;

  const feesData = {
    labels: colleges.map(c => c.name.split(' ').slice(0, 2).join(' ')),
    datasets: [
      {
        label: 'Min Fees (₹)',
        data: colleges.map(c => c.fees?.min || 0),
        backgroundColor: colleges.map((_, i) => `${COLORS[i]}99`),
        borderColor: colleges.map((_, i) => COLORS[i]),
        borderWidth: 2, borderRadius: 6,
      },
      {
        label: 'Max Fees (₹)',
        data: colleges.map(c => c.fees?.max || 0),
        backgroundColor: colleges.map((_, i) => `${COLORS[i]}44`),
        borderColor: colleges.map((_, i) => COLORS[i]),
        borderWidth: 2, borderRadius: 6,
      }
    ]
  };

  const radarData = {
    labels: ['Rating', 'Placement %', 'Avg Pkg', 'Top Pkg', 'NIRF Score'],
    datasets: colleges.map((c, i) => ({
      label: c.name.split(' ').slice(0, 2).join(' '),
      data: [
        (c.rating / 5) * 100,
        c.placement?.percentage || 0,
        Math.min((c.placement?.avgPackage || 0) * 3, 100),
        Math.min((c.placement?.topPackage || 0) * 2, 100),
        c.ranking?.nirf ? Math.max(0, 100 - c.ranking.nirf) : 40,
      ],
      backgroundColor: `${COLORS[i]}33`,
      borderColor: COLORS[i],
      borderWidth: 2,
      pointBackgroundColor: COLORS[i],
    }))
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9090b0', font: { size: 11 } } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9090b0' } }
    }
  };

  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9090b0', backdropColor: 'transparent' }, pointLabels: { color: '#9090b0', font: { size: 11 } } } },
    plugins: { legend: { labels: { color: '#9090b0', font: { size: 11 } } } }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Compare Colleges</h1>
          <p style={styles.sub}>Add up to 4 colleges for side-by-side comparison</p>
        </div>
        {colleges.length >= 2 && (
          <button className="btn btn-primary" onClick={downloadPDF}>📄 Download PDF</button>
        )}
      </div>

      {/* Add colleges */}
      <div style={styles.addArea}>
        <div style={styles.searchBox}>
          <span>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search and add colleges to compare..."
            value={searchQuery}
            onChange={e => searchColleges(e.target.value)}
          />
        </div>
        {searchResults.length > 0 && (
          <div style={styles.dropdown}>
            {searchResults.map(c => (
              <div key={c._id} style={styles.dropItem} onClick={() => addCollege(c)}>
                <div style={styles.dropName}>{c.name}</div>
                <div style={styles.dropSub}>{c.type} • {c.area}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected colleges header */}
      {colleges.length > 0 && (
        <div style={styles.selectedRow}>
          {colleges.map((c, i) => (
            <div key={c._id} style={{ ...styles.selectedCard, borderColor: COLORS[i] }}>
              <div style={{ ...styles.colorDot, background: COLORS[i] }} />
              <div style={styles.selectedName}>{c.name}</div>
              <button onClick={() => removeCollege(c._id)} style={styles.removeBtn}>✕</button>
            </div>
          ))}
        </div>
      )}

      {colleges.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 48 }}>⚖️</div>
          <h3>No colleges selected</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Search and add colleges above to compare them</p>
        </div>
      )}

      {colleges.length >= 2 && (
        <>
          {/* Charts */}
          <div style={styles.chartGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Fees Comparison (₹)</h3>
              <div style={{ height: 240 }}><Bar data={feesData} options={chartOpts} /></div>
            </div>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Overall Performance Radar</h3>
              <div style={{ height: 240 }}><Radar data={radarData} options={radarOpts} /></div>
            </div>
          </div>

          {/* Comparison table */}
          <div style={styles.tableCard}>
            <h3 style={styles.chartTitle}>Detailed Comparison</h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Parameter</th>
                    {colleges.map((c, i) => (
                      <th key={c._id} style={{ ...styles.th, color: COLORS[i] }}>
                        {c.name.split(' ').slice(0, 3).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '🏫 Type', get: c => c.type },
                    { label: '📍 Area', get: c => c.area },
                    { label: '⭐ Rating', get: c => `${c.rating}/5` },
                    { label: '🏆 NIRF Rank', get: c => c.ranking?.nirf ? `#${c.ranking.nirf}` : 'N/A' },
                    { label: '💰 Min Fees', get: c => `₹${c.fees?.min?.toLocaleString()}` },
                    { label: '💳 Max Fees', get: c => `₹${c.fees?.max?.toLocaleString()}` },
                    { label: '💼 Placement', get: c => `${c.placement?.percentage}%` },
                    { label: '📈 Avg Package', get: c => `₹${c.placement?.avgPackage} LPA` },
                    { label: '🚀 Top Package', get: c => `₹${c.placement?.topPackage} LPA` },
                    { label: '📝 Affiliation', get: c => c.affiliation },
                    { label: '📅 Established', get: c => c.established },
                    { label: '🏗️ Campus', get: c => c.campusSize },
                    { label: '🎯 Admission', get: c => c.admissionProcess },
                    { label: '📚 Courses', get: c => c.courses?.slice(0, 3).join(', ') },
                  ].map((row, ri) => (
                    <tr key={row.label} style={ri % 2 === 0 ? styles.trEven : {}}>
                      <td style={styles.tdLabel}>{row.label}</td>
                      {colleges.map(c => (
                        <td key={c._id} style={styles.td}>{row.get(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 },
  addArea: { position: 'relative' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 16px' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', padding: '13px 0', fontSize: 14, color: 'var(--text-primary)', outline: 'none' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, zIndex: 50, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  dropItem: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' },
  dropName: { fontSize: 14, fontWeight: 500 },
  dropSub: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
  selectedRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  selectedCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', border: '2px solid', borderRadius: 10 },
  colorDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  selectedName: { fontSize: 13, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  removeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: 2 },
  empty: { textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 },
  tableCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' },
  tdLabel: { padding: '11px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  trEven: { background: 'var(--bg-hover)' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
};
