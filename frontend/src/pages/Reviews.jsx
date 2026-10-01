import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, approveReview, rejectReview, banUser } from '../features/review/reviewAction';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

/* ─────────────────────────────────────────────────────────────────
  Review Moderation Page
  - Pending tab: Admin can Approve, Reject, or Ban User
  - Approved tab: Admin can Reject a previously approved review
  - Rejected tab: Admin can Re-approve a rejected review
  - Ban User: Rejects the review AND blocks the user account
──────────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: 'rate_review'  },
  { key: 'approved', label: 'Approved', icon: 'check_circle' },
  { key: 'rejected', label: 'Rejected', icon: 'block'        },
];

// Star rating display
const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="material-symbols-outlined"
        style={{
          fontSize: 16,
          color: i <= rating ? '#FACC15' : 'var(--outline-variant)',
          fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        star
      </span>
    ))}
  </div>
);

// Status colour map
const STATUS_STYLE = {
  pending:  { color: '#ca8a04', bg: '#fef9c3', label: 'Pending'  },
  approved: { color: '#16a34a', bg: '#dcfce7', label: 'Approved' },
  rejected: { color: '#dc2626', bg: '#fee2e2', label: 'Rejected' },
};

// Get user initials from a name string
const initials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading, counts } = useSelector((state) => state.reviewStore);

  const [tab,        setTab]        = useState('pending');
  const [search,     setSearch]     = useState('');
  const [actioningId, setActioningId] = useState(null); // which review is in progress

  // Ban modal state
  const [banModal,   setBanModal]   = useState(false);
  const [banTarget,  setBanTarget]  = useState(null);   // { reviewId, userName }
  const [banReason,  setBanReason]  = useState('Violation of terms and conditions');
  const [banning,    setBanning]    = useState(false);

  // Load reviews whenever the tab changes
  useEffect(() => {
    dispatch(fetchReviews(tab));
  }, [dispatch, tab]);

  // Client-side search filter
  const visible = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.user?.name  || '').toLowerCase().includes(q) ||
      (r.product?.name || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q)
    );
  });

  // Approve handler
  const handleApprove = async (reviewId) => {
    setActioningId(reviewId);
    await dispatch(approveReview(reviewId, tab));
    setActioningId(null);
  };

  // Reject handler
  const handleReject = async (reviewId) => {
    setActioningId(reviewId);
    await dispatch(rejectReview(reviewId, tab));
    setActioningId(null);
  };

  // Open ban confirmation modal
  const openBanModal = (review) => {
    setBanTarget({ reviewId: review._id, userName: review.user?.name });
    setBanReason('Violation of terms and conditions');
    setBanModal(true);
  };

  // Confirm ban
  const handleBanConfirm = async () => {
    if (!banTarget) return;
    setBanning(true);
    await dispatch(banUser(banTarget.reviewId, banReason, tab));
    setBanning(false);
    setBanModal(false);
    setBanTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI stat cards */}
      <div className="row g-4">
        <div className="col-6 col-xl-4">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Pending Moderation</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: '#ca8a04' }}>{counts.pending}</div>
          </div>
        </div>
        <div className="col-6 col-xl-4">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Approved Reviews</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: '#16a34a' }}>{counts.approved}</div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Rejected Reviews</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: 'var(--error)' }}>{counts.rejected}</div>
          </div>
        </div>
      </div>

      {/* Tabs + Search bar */}
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div className="nm-tabs" style={{ flex: 1 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`nm-tab-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => { setTab(t.key); setSearch(''); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>
                {t.icon}
              </span>
              {t.label}
              {counts[t.key] > 0 && (
                <span
                  className={`ms-2 nm-badge ${
                    t.key === 'pending' ? 'nm-badge-warning' :
                    t.key === 'rejected' ? 'nm-badge-danger' : 'nm-badge-success'
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="nm-input-group" style={{ maxWidth: 300 }}>
          <span className="material-symbols-outlined">search</span>
          <input
            className="nm-input"
            placeholder="Search by user, product or text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Review cards */}
      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <div className="nm-card">
          <div className="nm-empty-state">
            <span className="material-symbols-outlined">rate_review</span>
            <h4 style={{ fontWeight: 700, margin: '0 0 8px', fontSize: 16 }}>No {tab} reviews</h4>
            <p style={{ margin: 0, fontSize: 13 }}>
              {search ? 'Try a different search term.' : 'Nothing here right now.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visible.map((rev) => {
            const st  = STATUS_STYLE[rev.isApproved] || STATUS_STYLE.pending;
            const busy = actioningId === rev._id;
            const isUserBanned = rev.user?.status === 'block';

            return (
              <div key={rev._id} className="nm-review-card">
                {/* Coloured accent bar on the left */}
                <div className="nm-review-flag" style={{ background: st.color }} />

                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Header row — product info on left, reviewer on right */}
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

                    {/* Product */}
                    <div className="d-flex gap-3 align-items-start">
                      <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline-variant)' }}>
                        {rev.product?.images?.[0] ? (
                          <img src={rev.product.images[0]} alt={rev.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 26 }}>inventory_2</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700 }}>
                          {rev.product?.name || '—'}
                        </h4>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <Stars rating={rev.rating} />
                          <strong style={{ fontSize: 13 }}>{rev.rating}.0</strong>
                        </div>
                        {rev.order?.orderNumber && (
                          <span style={{ fontSize: 11, color: 'var(--secondary)' }}>
                            Order: <span className="nm-text-code">{rev.order.orderNumber}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reviewer */}
                    <div className="text-end">
                      <div className="d-flex align-items-center gap-2 justify-content-end">
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                            {rev.user?.name || '—'}
                            {isUserBanned && (
                              <span className="ms-2 nm-badge nm-badge-danger" style={{ fontSize: 10 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>block</span>
                                Banned
                              </span>
                            )}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--secondary)' }}>{rev.user?.email || '—'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--outline)' }}>
                            {new Date(rev.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="nm-avatar-initials">{initials(rev.user?.name)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="nm-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review comment */}
                  <div style={{
                    background: 'var(--surface-container-low)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    borderLeft: `4px solid ${st.color}`,
                  }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>
                      "{rev.comment || 'No comment provided.'}"
                    </p>
                  </div>

                  {/* Review images (if any) */}
                  {rev.images?.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap">
                      {rev.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`review-img-${i}`}
                          style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--outline-variant)' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="d-flex justify-content-end gap-2 flex-wrap" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 12 }}>

                    {/* Ban User — only show for pending or approved reviews with non-banned users */}
                    {rev.isApproved !== 'rejected' && !isUserBanned && (
                      <button
                        className="nm-btn nm-btn-danger nm-btn-sm"
                        disabled={busy}
                        onClick={() => openBanModal(rev)}
                        title="Reject this review and ban the user"
                      >
                        <span className="material-symbols-outlined">person_off</span>
                        Ban User
                      </button>
                    )}

                    {/* Reject — show when not already rejected */}
                    {rev.isApproved !== 'rejected' && (
                      <button
                        className="nm-btn nm-btn-secondary nm-btn-sm"
                        disabled={busy}
                        onClick={() => handleReject(rev._id)}
                      >
                        <span className="material-symbols-outlined">block</span>
                        {busy ? 'Rejecting…' : 'Reject'}
                      </button>
                    )}

                    {/* Approve — show when not already approved */}
                    {rev.isApproved !== 'approved' && (
                      <button
                        className="nm-btn nm-btn-primary nm-btn-sm"
                        disabled={busy}
                        onClick={() => handleApprove(rev._id)}
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        {busy ? 'Approving…' : 'Approve'}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Ban User Confirmation Modal ── */}
      <Modal
        isOpen={banModal}
        onClose={() => { setBanModal(false); setBanTarget(null); }}
        title="Ban User"
        size="sm"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <button
              className="nm-btn nm-btn-secondary nm-btn-sm"
              onClick={() => { setBanModal(false); setBanTarget(null); }}
              disabled={banning}
            >
              Cancel
            </button>
            <button
              className="nm-btn nm-btn-danger nm-btn-sm"
              onClick={handleBanConfirm}
              disabled={banning || !banReason.trim()}
            >
              <span className="material-symbols-outlined">person_off</span>
              {banning ? 'Banning…' : 'Confirm Ban'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0 }}>
            You are about to <strong>reject this review</strong> and <strong style={{ color: 'var(--error)' }}>ban {banTarget?.userName || 'this user'}</strong> from the platform.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)' }}>
            The user's account will be blocked and they will not be able to log in. Please provide a reason.
          </p>
          <div>
            <label className="nm-label" style={{ marginBottom: 6 }}>Ban Reason</label>
            <textarea
              className="nm-input"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for ban…"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Reviews;
