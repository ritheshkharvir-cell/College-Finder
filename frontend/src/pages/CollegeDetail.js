import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collegesAPI, favoritesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faved, setFaved] = useState(false);

  useEffect(() => {
    collegesAPI.getById(id)
      .then(r => setCollege(r.data.college))
      .catch(() => toast.error('College not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFav = async () => {
    try {
      if (faved) { await favoritesAPI.remove(id); setFaved(false); toast.success('Removed from favorites'); }
      else { await favoritesAPI.add(id); setFaved(true); toast.success('Added to favorites!'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(college.name, 14, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`${college.type} | ${college.area}, Bangalore`, 14, 32);

    autoTable(doc, {
      startY: 42,
      head: [['Detail', 'Information']],
      body: [
        ['Location', college.address],
        ['Type', college.type],
        ['Established', college.established],
        ['Affiliation', college.affiliation],
        ['Rating', `${college.rating}/5`],
        ['NIRF Ranking', college.ranking?.nirf ? `#${college.ranking.nirf}` : 'Not ranked'],
        ['Fees', `₹${college.fees?.min?.toLocaleString()} - ₹${college.fees?.max?.toLocaleString()} per year`],
        ['Courses', college.courses?.join(', ')],
        ['Placement %', `${college.placement?.percentage}%`],
        ['Avg Package', `₹${college.placement?.avgPackage} LPA`],
        ['Top Package', `₹${college.placement?.topPackage} LPA`],
        ['Admission', college.admissionProcess],
        ['Campus Size', college.campusSize],
        ['Total Students', college.totalStudents?.toLocaleString()],
        ['Website', college.website],
        ['Phone', college.phone],
        ['Email', college.contactEmail],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [108, 99, 255] },
      alternateRowStyles: { fillColor: [245, 245, 255] },
    });

    doc.save(`${college.name.replace(/\s+/g, '_')}_details.pdf`);
    toast.success('PDF downloaded!');
  };

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;
  if (!college) return <div style={styles.center}><p>College not found</p></div>;

  const stars = '★'.repeat(Math.round(college.rating)) + '☆'.repeat(5 - Math.round(college.rating));

  return (
    <div style={styles.page}>
      {/* Back */}
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
        ← Back
      </button>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.typeBadge}>{college.type}</div>
          <h1 style={styles.name}>{college.name}</h1>
          <p style={styles.address}>📍 {college.address}</p>
          <div style={styles.ratingRow}>
            <span style={styles.stars}>{stars}</span>
            <span style={styles.ratingNum}>{college.rating}/5</span>
            {college.ranking?.nirf && <span style={styles.nirfBadge}>NIRF #{college.ranking.nirf}</span>}
          </div>
          <p style={styles.desc}>{college.description}</p>
          <div style={styles.heroActions}>
            <a href={college.website} target="_blank" rel="noreferrer" className="btn btn-primary">
              🌐 Visit Website
            </a>
            <button onClick={handleFav} className="btn btn-outline">
              {faved ? '❤️ Saved' : '🤍 Save'}
            </button>
            <button onClick={downloadPDF} className="btn btn-outline">
              📄 Download PDF
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div style={styles.heroStats}>
          {[
            { label: 'Min Fees', val: `₹${(college.fees?.min/1000).toFixed(0)}K/yr`, icon: '💰' },
            { label: 'Max Fees', val: `₹${(college.fees?.max/1000).toFixed(0)}K/yr`, icon: '💳' },
            { label: 'Placement', val: `${college.placement?.percentage}%`, icon: '💼' },
            { label: 'Avg Package', val: `₹${college.placement?.avgPackage} LPA`, icon: '📈' },
            { label: 'Top Package', val: `₹${college.placement?.topPackage} LPA`, icon: '🚀' },
            { label: 'Campus', val: college.campusSize, icon: '🏗️' },
            { label: 'Students', val: college.totalStudents?.toLocaleString(), icon: '👨‍🎓' },
            { label: 'Est.', val: college.established, icon: '📅' },
          ].map(s => (
            <div key={s.label} style={styles.heroStat}>
              <span style={styles.statEmoji}>{s.icon}</span>
              <div>
                <div style={styles.statVal}>{s.val}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details grid */}
      <div style={styles.detailGrid}>
        {/* Courses */}
        <div style={styles.section}>
          <h3 style={styles.secTitle}>📚 Courses Offered</h3>
          <div style={styles.tagGrid}>
            {college.courses?.map(c => (
              <span key={c} style={styles.courseTag}>{c}</span>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div style={styles.section}>
          <h3 style={styles.secTitle}>🏛️ Facilities</h3>
          <div style={styles.tagGrid}>
            {college.facilities?.map(f => (
              <span key={f} style={styles.facilityTag}>✓ {f}</span>
            ))}
          </div>
        </div>

        {/* Admission */}
        <div style={styles.section}>
          <h3 style={styles.secTitle}>🎯 Admission & Contact</h3>
          <div style={styles.infoList}>
            <div style={styles.infoRow}><span style={styles.infoKey}>Admission Process</span><span style={styles.infoVal}>{college.admissionProcess}</span></div>
            <div style={styles.infoRow}><span style={styles.infoKey}>Affiliation</span><span style={styles.infoVal}>{college.affiliation}</span></div>
            <div style={styles.infoRow}><span style={styles.infoKey}>Phone</span><a href={`tel:${college.phone}`} style={styles.infoLink}>{college.phone}</a></div>
            <div style={styles.infoRow}><span style={styles.infoKey}>Email</span><a href={`mailto:${college.contactEmail}`} style={styles.infoLink}>{college.contactEmail}</a></div>
            <div style={styles.infoRow}><span style={styles.infoKey}>Website</span><a href={college.website} target="_blank" rel="noreferrer" style={styles.infoLink}>Visit →</a></div>
          </div>
        </div>

        {/* Location */}
        <div style={styles.section}>
          <h3 style={styles.secTitle}>🗺️ Location</h3>
          <div style={styles.mapEmbed}>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              📍 {college.address}<br />
              <small>Coordinates: {college.lat}, {college.lng}</small>
            </p>
            <a
              href={`https://maps.google.com?q=${college.lat},${college.lng}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ marginTop: 12 }}
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  hero: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: 14 },
  typeBadge: { display: 'inline-block', padding: '4px 14px', background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderRadius: 20, fontSize: 12, fontWeight: 600, width: 'fit-content' },
  name: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, lineHeight: 1.2 },
  address: { color: 'var(--text-secondary)', fontSize: 14 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 10 },
  stars: { color: '#f9ca24', fontSize: 18 },
  ratingNum: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 },
  nirfBadge: { padding: '3px 12px', background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  desc: { color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 },
  heroActions: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  heroStats: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' },
  heroStat: { display: 'flex', alignItems: 'center', gap: 10 },
  statEmoji: { fontSize: 20, width: 32, textAlign: 'center' },
  statVal: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 },
  statLabel: { fontSize: 11, color: 'var(--text-secondary)' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  section: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 },
  secTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  courseTag: { padding: '6px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', color: 'var(--accent)', borderRadius: 8, fontSize: 12, fontWeight: 500 },
  facilityTag: { padding: '6px 12px', background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.2)', color: '#43e97b', borderRadius: 8, fontSize: 12 },
  infoList: { display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' },
  infoKey: { color: 'var(--text-secondary)', fontSize: 13 },
  infoVal: { fontSize: 13, fontWeight: 500 },
  infoLink: { color: 'var(--accent)', fontSize: 13 },
  mapEmbed: { background: 'var(--bg-hover)', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' },
};
