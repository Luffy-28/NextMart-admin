import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',           icon: 'dashboard' },
  { to: '/products',   label: 'Product Management',  icon: 'inventory_2' },
  { to: '/users',      label: 'User Management',     icon: 'group' },
  { to: '/orders',     label: 'Orders & Payments',   icon: 'payments' },
  { to: '/reviews',    label: 'Review Moderation',   icon: 'rate_review' },
  { to: '/deals',      label: 'Deals Management',    icon: 'sell' },
  { to: '/refunds',    label: 'Refund Approvals',    icon: 'assignment_return' },
  { to: '/settings',   label: 'System Settings',     icon: 'settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
   const dispatch = useDispatch();
  const admin = useSelector((state) => state.adminStore.user);

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
             {admin?.image ? (
              <img
                src={admin.image}
                alt={admin?.name || 'Admin'}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              admin?.name?.charAt(0).toUpperCase() ?? 'A'
            )}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{admin?.name}</div>
              <div style={{ color: 'var(--on-primary-container)', fontSize: 11, opacity: 0.7 }}>{admin?.role}</div>
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
