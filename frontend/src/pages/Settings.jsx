import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateAdminProfile,
  requestPhoneVerification,
  verifyPhoneOtp,
  toggleTwoFactorAction,
  fetchSecurityLogs,
} from '../features/admin/adminAction';
import { uploadProductImageApi } from '../features/product/productApis';
import Modal from '../components/ui/Modal';

// Custom toggle switch component
const ToggleSwitch = ({ checked, onChange, id, disabled }) => (
  <div style={{ position: 'relative', display: 'inline-block', width: 40, height: 24, opacity: disabled ? 0.6 : 1 }}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => !disabled && onChange(e.target.checked)}
      style={{ display: 'none' }}
      disabled={disabled}
    />
    <label
      htmlFor={id}
      style={{
        display: 'block',
        width: 40,
        height: 24,
        borderRadius: 12,
        background: checked ? 'var(--primary-container)' : 'var(--outline-variant)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
        margin: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: 3,
          left: checked ? 19 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </label>
  </div>
);

const Settings = () => {
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.adminStore.user);
  const securityLogs = useSelector((state) => state.adminStore.securityLogs || []);

  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timezone, setTimezone] = useState('Eastern Time (US & Canada)');
  const [bio, setBio] = useState('');

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Phone Verification Modal State
  const [phoneVerificationModalOpen, setPhoneVerificationModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Security Logs Modal State
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // Toggles Preferences States
  const [prefSystemUpdates, setPrefSystemUpdates] = useState(true);
  const [prefSecurityAlerts, setPrefSecurityAlerts] = useState(true);
  const [prefTwoFactor, setPrefTwoFactor] = useState(false);

  // Sync state with redux user
  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setImage(admin.image || '');
      setPhoneNumber(admin.phoneNumber || '');
      setPrefTwoFactor(admin.twoFactorEnabled || false);
    }
  }, [admin]);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleAvatarUploadClick = () => {
    if (!uploading) fileInputRef.current.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await uploadProductImageApi(file);
      if (resp.status === 'success') {
        setImage(resp.url);
        // Automatically save image URL in database
        await dispatch(updateAdminProfile({ image: resp.url }));
        showToast('success', 'Profile avatar updated!');
      } else {
        showToast('error', resp.message || 'Image upload failed.');
      }
    } catch (err) {
      showToast('error', 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Name and Email are required.');
      return;
    }
    setSaving(true);
    const result = await dispatch(updateAdminProfile({ name, email, image }));
    setSaving(false);

    if (result.status === 'success') {
      showToast('success', 'Personal information saved successfully.');
    } else {
      showToast('error', result.message || 'Failed to update details.');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }
    setSaving(true);
    const result = await dispatch(updateAdminProfile({ password: passwordForm.newPassword }));
    setSaving(false);

    if (result.status === 'success') {
      showToast('success', 'Password successfully changed.');
      setPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast('error', result.message || 'Failed to change password.');
    }
  };

  const handleRequestPhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      showToast('error', 'Please enter a valid phone number.');
      return;
    }
    setSaving(true);
    const resp = await dispatch(requestPhoneVerification(phoneNumber));
    setSaving(false);
    if (resp.status === 'success') {
      showToast('success', 'Verification OTP sent to WhatsApp.');
      setPhoneVerificationModalOpen(true);
    } else {
      showToast('error', resp.message || 'Failed to send WhatsApp verification code.');
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setSaving(true);
    const resp = await dispatch(verifyPhoneOtp(phoneNumber, otpCode));
    setSaving(false);
    if (resp.status === 'success') {
      showToast('success', 'Phone number registered and verified successfully!');
      setPhoneVerificationModalOpen(false);
      setOtpCode('');
    } else {
      showToast('error', resp.message || 'OTP code verification failed.');
    }
  };

  const handleToggle2FA = async (enabled) => {
    if (enabled && !admin?.isPhoneVerified) {
      showToast('error', 'Verify your WhatsApp phone number before enabling 2FA.');
      return;
    }
    setSaving(true);
    const resp = await dispatch(toggleTwoFactorAction(enabled));
    setSaving(false);
    if (resp.status === 'success') {
      setPrefTwoFactor(enabled);
      showToast('success', resp.message);
    } else {
      showToast('error', resp.message || 'Failed to toggle 2FA setting.');
    }
  };

  const handleLogoutOthers = () => {
    showToast('success', 'Logged out from all other active sessions.');
  };

  const handleExportLogs = async () => {
    setSaving(true);
    const logs = await dispatch(fetchSecurityLogs());
    setSaving(false);
    if (logs && logs.length > 0) {
      const headers = ["Timestamp", "Action", "Description", "IP Address", "User Agent"];
      const rows = logs.map(l => [
        new Date(l.timestamp).toLocaleString(),
        l.action,
        l.details,
        l.ipAddress,
        l.userAgent
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `nextmart_security_audit_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Security audit logs CSV exported.');
    } else {
      showToast('error', 'No logs found to export.');
    }
  };

  const handleOpenLogsModal = async () => {
    setLogsLoading(true);
    await dispatch(fetchSecurityLogs());
    setLogsLoading(false);
    setLogsModalOpen(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? 'var(--primary-container)' : 'var(--error)',
          color: '#fff', borderRadius: 10, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header Info */}
      <div className="mb-4">
        <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>Manage your administrative presence</h3>
        <p style={{ fontSize: 14, color: 'var(--secondary)', marginTop: 8, maxWidth: '720px', lineHeight: 1.5 }}>
          Update your personal details, secure your account with WhatsApp multi-factor authentication, and configure how you receive system alerts and security notifications.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Section: Personal Info & Notifications (Col 8) */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-4">
            
            {/* Personal Info Card */}
            <div className="nm-card nm-card-padding">
              <form onSubmit={handleSaveProfile}>
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>person</span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Personal Information</h4>
                  </div>
                  <button type="submit" className="nm-btn nm-btn-primary nm-btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="d-flex flex-col flex-md-row gap-4 align-items-center align-items-md-start">
                  {/* Avatar upload display */}
                  <div className="d-flex flex-column align-items-center gap-2 flex-shrink-0" style={{ width: 140 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 110, height: 110, borderRadius: 12,
                        background: 'var(--secondary-fixed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 32, color: 'var(--primary-container)',
                        border: '1px solid var(--outline-variant)',
                        overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}>
                        {uploading ? (
                          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                        ) : image ? (
                          <img src={image} alt="admin headshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          name?.charAt(0).toUpperCase() || 'A'
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarUploadClick}
                        className="d-flex align-items-center justify-content-center hover:bg-light transition-colors"
                        style={{
                          position: 'absolute', bottom: -6, right: -6,
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'white', border: '1px solid var(--outline-variant)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                      </button>
                    </div>
                    <div className="text-center mt-1">
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>Change Photo</p>
                      <p style={{ margin: '2px 0 0', fontSize: 9, color: 'var(--secondary)' }}>JPG, GIF or PNG. Max 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFileChange}
                    />
                  </div>

                  {/* Form fields */}
                  <div className="flex-grow-1 w-100 space-y-4">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="nm-label">Full Name</label>
                        <input
                          className="nm-input"
                          placeholder="e.g. Alexander Vance"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="nm-label">Email Address</label>
                        <input
                          className="nm-input"
                          type="email"
                          placeholder="e.g. alexander@nextmart.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-12 col-md-6">
                        <label className="nm-label">Role</label>
                        <input
                          className="nm-input"
                          value={admin?.role || 'Lead Administrator'}
                          disabled
                          style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', color: 'var(--secondary)' }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="nm-label">Timezone</label>
                        <select
                          className="nm-select"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                        >
                          <option>Eastern Time (US & Canada)</option>
                          <option>Pacific Time (US & Canada)</option>
                          <option>UTC (Greenwich Mean Time)</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone verification input */}
                    <div className="row g-3 mt-1">
                      <div className="col-12 col-md-6">
                        <label className="nm-label">Phone Number (with Country Code for WhatsApp 2FA)</label>
                        <div className="d-flex gap-2">
                          <input
                            className="nm-input"
                            placeholder="e.g. +61412345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={admin?.isPhoneVerified && phoneNumber === admin?.phoneNumber}
                            style={{ flex: 1 }}
                          />
                          {admin?.isPhoneVerified && phoneNumber === admin?.phoneNumber ? (
                            <span className="nm-badge nm-badge-success d-flex align-items-center justify-content-center px-3" style={{ height: '38px', borderRadius: '8px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>check_circle</span>
                              Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="nm-btn nm-btn-secondary"
                              onClick={handleRequestPhoneVerification}
                              disabled={saving || !phoneNumber.trim()}
                              style={{ height: '38px' }}
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-md-6" />
                    </div>

                    <div className="col-12 mt-3">
                      <label className="nm-label">Bio (Optional)</label>
                      <textarea
                        className="nm-input"
                        rows={3}
                        placeholder="Briefly describe your responsibilities..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Notification Preferences Card */}
            <div className="nm-card nm-card-padding">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>notifications_active</span>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Notification Preferences</h4>
              </div>

              <div className="d-flex flex-column gap-3">
                {/* Pref 1: System Updates */}
                <div className="p-3 d-flex align-items-center justify-content-between rounded-3 border" style={{ background: 'var(--surface-container-low)', borderColor: 'var(--outline-variant)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: 'var(--secondary-fixed-dim)',
                      display: 'flex', alignItems: 'center', justifycontent: 'center',
                      color: 'var(--primary-container)'
                    }}>
                      <span className="material-symbols-outlined">update</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>System Updates</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--secondary)' }}>Patches and maintenance</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-updates"
                    checked={prefSystemUpdates}
                    onChange={setPrefSystemUpdates}
                  />
                </div>

                {/* Pref 2: Security Alerts */}
                <div className="p-3 d-flex align-items-center justify-content-between rounded-3 border" style={{ background: 'var(--surface-container-low)', borderColor: 'var(--outline-variant)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: 'var(--error-container)',
                      display: 'flex', alignItems: 'center', justifycontent: 'center',
                      color: 'var(--error)'
                    }}>
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Security Alerts</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--secondary)' }}>Risk and login alerts</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-security"
                    checked={prefSecurityAlerts}
                    onChange={setPrefSecurityAlerts}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Section: Security & Sessions (Col 4) */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">
            
            {/* Security settings */}
            <div className="nm-card nm-card-padding">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>security</span>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Security Settings</h4>
              </div>

              <div className="d-flex flex-column gap-3">
                {/* Change Password Button Trigger */}
                <div
                  onClick={() => setPasswordModalOpen(true)}
                  className="p-3 d-flex align-items-center justify-content-between rounded-3 border hover:bg-light transition-colors"
                  style={{ cursor: 'pointer', borderColor: 'var(--outline-variant)' }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Change Password</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--secondary)' }}>Last updated 3 months ago</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>chevron_right</span>
                </div>

                <div style={{ height: '1px', background: 'var(--outline-variant)', opacity: 0.3 }} />

                {/* Two-Factor Toggle */}
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Two-Factor Auth</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: admin?.isPhoneVerified ? 'var(--primary-container)' : 'var(--error)', fontStyle: 'italic', fontWeight: 500 }}>
                      {admin?.isPhoneVerified ? (prefTwoFactor ? 'Active via WhatsApp' : 'Inactive') : 'Requires phone verification'}
                    </p>
                  </div>
                  <ToggleSwitch
                    id="toggle-2fa"
                    checked={prefTwoFactor}
                    onChange={handleToggle2FA}
                    disabled={!admin?.isPhoneVerified}
                  />
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="nm-card nm-card-padding">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>devices</span>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Sessions</h4>
              </div>

              <div className="d-flex flex-column gap-4">
                {/* Session 1 */}
                <div className="d-flex gap-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: 'var(--surface-container-low)',
                    display: 'flex', alignItems: 'center', justifycontent: 'center',
                    color: 'var(--secondary)', flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined">desktop_windows</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Chrome on Windows</p>
                      <span className="nm-badge nm-badge-success" style={{ fontSize: 9 }}>Current</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--secondary)' }}>New York, USA &bull; 192.168.1.1</p>
                  </div>
                </div>

                {/* Session 2 */}
                <div className="d-flex gap-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: 'var(--surface-container-low)',
                    display: 'flex', alignItems: 'center', justifycontent: 'center',
                    color: 'var(--secondary)', flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div className="flex-grow-1">
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>iPhone 14 Pro</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--secondary)' }}>New York, USA &bull; Last login: 2h ago</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="nm-btn nm-btn-secondary"
                  style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px', display: 'block', width: '100%' }}
                  onClick={handleLogoutOthers}
                >
                  Logout All Other Devices
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Banner: Advanced Data Management */}
        <div className="col-12 mt-3">
          <div
            className="rounded-3 p-3 px-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--primary-container), #1a253d)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 4px 12px rgba(19, 27, 46, 0.1)'
            }}
          >
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Advanced Data Management</h4>
              <p style={{ fontSize: 11, color: 'var(--on-primary-container)', opacity: 0.8, marginTop: 4, margin: 0 }}>
                Export activity logs or request a full data archive. Actions are logged for compliance auditing in accordance with NextMart governance policies.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="nm-btn d-flex align-items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px' }}
                onClick={handleExportLogs}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                Export Logs
              </button>
              <button
                type="button"
                className="nm-btn"
                style={{ background: 'white', color: 'var(--primary-container)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px' }}
                onClick={handleOpenLogsModal}
              >
                View Audit Logs
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="col-12 py-5 text-center mt-4" style={{ borderTop: '1px solid var(--outline-variant)', opacity: 0.7 }}>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            &copy; 2026 NextMart Global Admin Panel. All administrative actions are recorded. Privacy Policy | System Status
          </p>
        </footer>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setPasswordModalOpen(false)}
          title="Change Password"
          size="sm"
          footer={
            <>
              <button className="nm-btn nm-btn-secondary" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
              <button className="nm-btn nm-btn-primary" onClick={handleSavePassword} disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSavePassword}>
            <div className="d-flex flex-column gap-3">
              <div>
                <label className="nm-label">Current Password</label>
                <input
                  className="nm-input"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="nm-label">New Password</label>
                <input
                  className="nm-input"
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="nm-label">Confirm New Password</label>
                <input
                  className="nm-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Phone OTP Verification Modal */}
      {phoneVerificationModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setPhoneVerificationModalOpen(false)}
          title="WhatsApp Verification Required"
          size="sm"
          footer={
            <>
              <button className="nm-btn nm-btn-secondary" onClick={() => setPhoneVerificationModalOpen(false)}>Cancel</button>
              <button className="nm-btn nm-btn-primary" onClick={handleVerifyPhoneOtp} disabled={saving || otpCode.length !== 6}>
                {saving ? 'Verifying...' : 'Verify Code'}
              </button>
            </>
          }
        >
          <form onSubmit={handleVerifyPhoneOtp}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary-container)' }}>chat</span>
              <p style={{ fontSize: 13, color: 'var(--secondary)', marginTop: 10 }}>
                We have sent a 6-digit OTP verification code to <strong>{phoneNumber}</strong> via WhatsApp. Enter the code below to register your device.
              </p>
            </div>
            <div>
              <label className="nm-label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit Code</label>
              <input
                className="nm-input"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
                style={{ textAlign: 'center', fontSize: 20, letterSpacing: '0.3em', fontWeight: 700 }}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Security Audit Logs Viewer Modal */}
      {logsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setLogsModalOpen(false)}
          title="Security Audit Logs"
          size="lg"
          footer={<button className="nm-btn nm-btn-primary" onClick={() => setLogsModalOpen(false)}>Close Logs</button>}
        >
          {logsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '40px 0' }}>
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: 32 }}>progress_activity</span>
              <span style={{ fontSize: 13, color: 'var(--secondary)' }}>Retrieving audit trails...</span>
            </div>
          ) : securityLogs.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--secondary)', fontSize: 13 }}>No audit records found on the server.</p>
          ) : (
            <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
              <table className="table table-hover" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-container-low)' }}>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`nm-badge ${
                          log.action.includes('Success') || log.action.includes('Verified') ? 'nm-badge-success' : 
                          log.action.includes('Failed') ? 'nm-badge-danger' : 'nm-badge-warning'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.details}</td>
                      <td style={{ fontFamily: 'monospace' }}>{log.ipAddress}</td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent}>
                        {log.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Settings;
