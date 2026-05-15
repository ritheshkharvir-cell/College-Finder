import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collegesAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

function createIcon(color) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function FlyToUser({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 13); }, [coords, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collegesAPI.getAll({ limit: 50 })
      .then(r => setColleges(r.data.colleges))
      .finally(() => setLoading(false));
  }, []);

  const findNearby = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        const { data } = await collegesAPI.getNearby({ lat: latitude, lng: longitude, radius: 15 });
        setNearby(data.colleges);
        setLocating(false);
      },
      () => { alert('Could not get location'); setLocating(false); }
    );
  };

  const displayed = filter
    ? colleges.filter(c => c.type === filter)
    : colleges;

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>College Map</h1>
          <p style={styles.sub}>Click markers to see college info</p>
        </div>
        <div style={styles.actions}>
          <select style={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Types</option>
            {Object.keys(typeColors).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-primary" onClick={findNearby} disabled={locating}>
            {locating ? '📡 Locating...' : '📍 Find Nearest'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: color }} />
            <span style={styles.legendLabel}>{type}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={styles.mapWrap}>
        <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {userCoords && <FlyToUser coords={userCoords} />}

          {/* User location marker */}
          {userCoords && (
            <Marker
              position={userCoords}
              icon={L.divIcon({
                html: `<div style="width:16px;height:16px;background:#43e97b;border:3px solid white;border-radius:50%;box-shadow:0 0 10px #43e97b"></div>`,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup><strong>📍 Your Location</strong></Popup>
            </Marker>
          )}

          {/* College markers */}
          {displayed.map(college => (
            <Marker
              key={college._id}
              position={[college.lat, college.lng]}
              icon={createIcon(typeColors[college.type] || '#6c63ff')}
            >
              <Popup maxWidth={280}>
                <div style={popupStyles.wrap}>
                  <div style={{ ...popupStyles.badge, background: `${typeColors[college.type]}20`, color: typeColors[college.type] }}>
                    {college.type}
                  </div>
                  <h3 style={popupStyles.name}>{college.name}</h3>
                  <p style={popupStyles.loc}>📍 {college.area}</p>
                  <div style={popupStyles.row}>
                    <span>⭐ {college.rating}</span>
                    <span>💼 {college.placement?.percentage}%</span>
                    <span>💰 ₹{(college.fees?.min/1000).toFixed(0)}K/yr</span>
                  </div>
                  <button
                    onClick={() => navigate(`/colleges/${college._id}`)}
                    style={popupStyles.btn}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Nearby list */}
      {nearby.length > 0 && (
        <div style={styles.nearbySection}>
          <h3 style={styles.nearbyTitle}>📍 Nearest Colleges (within 15km)</h3>
          <div style={styles.nearbyGrid}>
            {nearby.slice(0, 6).map(c => (
              <div key={c._id} style={styles.nearbyCard} onClick={() => navigate(`/colleges/${c._id}`)}>
                <div style={styles.nearbyDist}>{c.distance} km</div>
                <div style={styles.nearbyName}>{c.name}</div>
                <div style={styles.nearbySub}>{c.type} • ⭐ {c.rating}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, height: '100vh', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 },
  actions: { display: 'flex', gap: 12, alignItems: 'center' },
  select: { padding: '9px 12px', minWidth: 140 },
  legend: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },
  legendLabel: { fontSize: 11, color: 'var(--text-secondary)' },
  mapWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 420 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  nearbySection: { display: 'flex', flexDirection: 'column', gap: 12 },
  nearbyTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 },
  nearbyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  nearbyCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'all 0.2s' },
  nearbyDist: { fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 },
  nearbyName: { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  nearbySub: { fontSize: 11, color: 'var(--text-secondary)' },
};

const popupStyles = {
  wrap: { fontFamily: 'system-ui, sans-serif', padding: '4px 0' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: 700, margin: '4px 0', lineHeight: 1.3 },
  loc: { fontSize: 11, color: '#666', margin: '4px 0' },
  row: { display: 'flex', gap: 12, fontSize: 11, margin: '8px 0', color: '#444' },
  btn: { width: '100%', padding: '7px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 6 },
};
