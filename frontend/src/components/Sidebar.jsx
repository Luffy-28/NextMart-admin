import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',           icon: 'dashboard' },
  { to: '/products',   label: 'Product Management',  icon: 'inventory_2' },
  { to: '/orders',     label: 'Orders & Payments',   icon: 'payments' },
  { to: '/reviews',    label: 'Review Moderation',   icon: 'rate_review' },
  { to: '/deals',      label: 'Deals Management',    icon: 'sell' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="nm-sidebar">
      {/* Brand */}
      <div className="nm-brand">
        <div className="d-flex align-items-center gap-3">
          <div className="nm-brand-logo">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_cart
            </span>
          </div>
          <div>
            <div className="nm-brand-title">NextMart</div>
            <div className="nm-brand-subtitle">Admin Control Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nm-nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nm-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="nm-system-status">
        <p style={{ color: 'var(--on-primary-container)', fontSize: '11px', fontWeight: 600, marginBottom: 8 }}>
          System Status
        </p>
        <div className="d-flex align-items-center gap-2">
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#22c55e', display: 'inline-block',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.25)'
          }} />
          <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            All Systems Operational
          </span>
        </div>
      </div>

      {/* User profile footer */}
      <div className="nm-sidebar-user">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: 'var(--secondary-fixed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: 'var(--primary-container)'
            }}>
              SS
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Shankar Singh</div>
              <div style={{ color: 'var(--on-primary-container)', fontSize: 11, opacity: 0.7 }}>Super Admin</div>
            </div>
          </div>
          <button
            className="nm-action-btn"
            title="Logout"
            onClick={() => navigate('/')}
            style={{ color: 'var(--on-primary-container)' }}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
