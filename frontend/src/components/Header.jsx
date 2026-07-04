import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_META = {
  '/dashboard': { title: 'Dashboard Overview',        placeholder: 'Search orders, customers, or reports...' },
  '/products':  { title: 'Product Management',        placeholder: 'Search products, SKUs, or categories...' },
  '/orders':    { title: 'Orders & Payments',         placeholder: 'Search order IDs, customers or emails...' },
  '/reviews':   { title: 'Review Moderation',         placeholder: 'Search reviews, users, or products...' },
  '/deals':     { title: 'Deals Management',          placeholder: 'Search coupons or campaign names...' },
  '/refunds':   { title: 'Refund Approvals',          placeholder: 'Search refund IDs, orders, or reasons...' },
};

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const admin = useSelector((state) => state.adminStore.user);
  const meta = ROUTE_META[pathname] || { title: 'NextMart Admin', placeholder: 'Search...' };
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { icon: 'rate_review', color: '#2563eb', bg: '#dbeafe', text: 'New review flagged on "Titan Mech-X Keyboard"',     time: '2 mins ago' },
    { icon: 'sell',        color: '#ca8a04', bg: '#fef9c3', text: 'Deal "WINTER30" is expiring in 3 days',             time: '1 hr ago'   },
    { icon: 'payments',    color: '#dc2626', bg: '#fee2e2', text: 'Order #ORD-90214 was fully refunded',               time: '3 hrs ago'  },
  ];

  return (
    <header className="nm-topbar">
      {/* Global Search */}
      <div className="nm-search-bar">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder={meta.placeholder} />
      </div>

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="nm-icon-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="nm-notification-dot" />
          </button>

          {notifOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                onClick={() => setNotifOpen(false)}
              />
              <div style={{
                position: 'absolute', right: 0, top: 48, width: 340, zIndex: 1000,
                background: 'var(--surface-container-lowest)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}>
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid var(--outline-variant)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--surface-container-low)', borderRadius: '12px 12px 0 0'
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                  <span className="nm-badge nm-badge-danger">{notifications.length} new</span>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{
                    padding: '14px 18px',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                    display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span className="material-symbols-outlined" style={{ color: n.color, fontSize: 16 }}>{n.icon}</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: '1.4', color: 'var(--on-surface)' }}>{n.text}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--secondary)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '10px 18px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: '0 0 12px 12px' }}>
                  <button className="nm-btn nm-btn-ghost nm-btn-sm" onClick={() => setNotifOpen(false)}>
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button className="nm-icon-btn" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* Vertical Divider */}
        <div className="nm-divider-v" />

        {/* Admin Profile */}
         <div className="nm-topbar-profile">
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', lineHeight: 1 }}>{admin?.name}</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--secondary)' }}>{admin?.email}</p>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--secondary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: 'var(--primary-container)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer'
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
        </div>
      </div>
    </header>
  );
};

export default Header;
