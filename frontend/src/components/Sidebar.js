import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/colleges', icon: '🏫', label: 'Colleges' },
  { path: '/chat', icon: '🤖', label: 'AI Chatbot' },
  { path: '/compare', icon: '⚖️', label: 'Compare' },
  { path: '/map', icon: '🗺️', label: 'Map View' },
  { path: '/recommend', icon: '🎯', label: 'Recommend' },
  { path: '/favorites', icon: '❤️', label: 'Favorites' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 70 : 260 }}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <span style={styles.logoIcon}>🎓</span>
        {!collapsed && <span style={styles.logoText}>College Finder</span>}
        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navActive : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            title={collapsed ? item.label : ''}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <button onClick={toggleTheme} style={styles.themeBtn} title="Toggle theme">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && (
          <div style={styles.userArea}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0,
    transition: 'width 0.25s ease', zIndex: 100, overflow: 'hidden',
  },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px',
    borderBottom: '1px solid var(--border)', minHeight: 68,
  },
  logoIcon: { fontSize: 24, flexShrink: 0 },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap' },
  collapseBtn: {
    background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
    width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto',
  },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
    transition: 'all 0.15s', textDecoration: 'none', whiteSpace: 'nowrap',
  },
  navActive: { background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 600 },
  navIcon: { fontSize: 18, flexShrink: 0 },
  navLabel: {},
  bottom: { padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 },
  themeBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'all 0.15s', width: '100%',
  },
  userArea: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-hover)' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
    background: 'transparent', border: 'none', color: 'var(--error)',
    cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', width: '100%',
  },
};
