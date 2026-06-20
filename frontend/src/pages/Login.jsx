import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('admin@nextmart.com');
  const [password, setPassword]   = useState('password123');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@nextmart.com' && password === 'password123') {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    }, 1200);
  };

  return (
    <div className="nm-login-bg">
      {/* Atmospheric blobs */}
      <div className="nm-login-blob-1" />
      <div className="nm-login-blob-2" />

      <main style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div style={{
            width: 52, height: 52,
            background: 'var(--primary-container)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            NextMart
          </h1>
          <p style={{ fontSize: 14, color: 'var(--secondary)', margin: 0 }}>Admin Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="nm-login-card">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', margin: '0 0 6px' }}>Admin Login</h2>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', margin: 0 }}>
              Enter your credentials to access the control panel
            </p>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 20,
              background: 'var(--error-container)',
              border: '1px solid rgba(186,26,26,0.2)',
              color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label className="nm-label" htmlFor="email">Email Address</label>
              <div className="nm-input-group">
                <span className="material-symbols-outlined">mail</span>
                <input
                  id="email"
                  className="nm-input"
                  type="email"
                  placeholder="admin@nextmart.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="nm-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: 'var(--primary-container)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <div className="nm-input-group" style={{ position: 'relative' }}>
                <span className="material-symbols-outlined">lock</span>
                <input
                  id="password"
                  className="nm-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'var(--outline)', display: 'flex', alignItems: 'center', padding: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="d-flex align-items-center gap-2">
              <input type="checkbox" id="remember" style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Remember this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="nm-btn nm-btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 15 }}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                    <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div style={{
            marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--outline-variant)',
            display: 'flex', gap: 12, alignItems: 'flex-start'
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-primary-container)', fontSize: 18, fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>
              shield
            </span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: '1.5' }}>
              This is a restricted administrative area. All access attempts are logged and monitored for security purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="d-flex justify-content-between align-items-center mt-4" style={{ fontSize: 12, color: 'var(--secondary)' }}>
          <span>© 2026 NextMart Global. All rights reserved.</span>
          <div className="d-flex gap-3">
            <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>Support</a>
            <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>Privacy</a>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
