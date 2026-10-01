import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRefunds, processRefund } from '../features/refund/refundAction';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_META = {
  pending:  { label: 'Awaiting Review', color: '#ca8a04', bg: '#fef9c3', icon: 'hourglass_top' },
  approved: { label: 'Full Refund',     color: '#16a34a', bg: '#dcfce7', icon: 'check_circle' },
  partial:  { label: 'Partial Refund',  color: '#2563eb', bg: '#dbeafe', icon: 'pie_chart' },
  rejected: { label: 'Rejected',        color: '#dc2626', bg: '#fee2e2', icon: 'cancel' },
};

const TABS = ['all', 'pending', 'approved', 'partial', 'rejected'];

const Refunds = () => {
  const dispatch = useDispatch();
  const { refunds = [], counts = {}, loading } = useSelector((state) => state.refundStore);

  const [tab, setTab]             = useState('all');
  const [modal, setModal]         = useState(null); // null | 'review' | 'image-preview'
  const [selected, setSelected]   = useState(null);
  const [previewImg, setPreviewImg] = useState('');
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'partial' | 'reject'
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNote, setAdminNote]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]     = useState({ message: '', type: '' });

  useEffect(() => {
    dispatch(fetchAllRefunds());
  }, [dispatch]);

  const visible = useMemo(() => {
    if (tab === 'all') return refunds;
    return refunds.filter((r) => r.status === tab);
  }, [refunds, tab]);

  const openReview = (reqItem) => {
    setSelected(reqItem);
    setActionType('approve');
    const orderTotal = reqItem.order?.totalAmount || 0;
    setRefundAmount(orderTotal.toString());
    setAdminNote('');
    setFeedback({ message: '', type: '' });
    setModal('review');
  };

  const handleActionChange = (newAction) => {
    setActionType(newAction);
    const orderTotal = selected?.order?.totalAmount || 0;
    if (newAction === 'approve') {
      setRefundAmount(orderTotal.toString());
    } else if (newAction === 'partial') {
      setRefundAmount((orderTotal / 2).toFixed(2));
    } else {
      setRefundAmount('0');
    }
  };

  const handleSubmitDecision = async () => {
    if (!adminNote.trim()) {
      setFeedback({ message: 'Please provide an admin note explaining your decision.', type: 'error' });
      return;
    }

    if (actionType === 'partial') {
      const amt = parseFloat(refundAmount);
      const total = selected?.order?.totalAmount || 0;
      if (isNaN(amt) || amt <= 0 || amt > total) {
        setFeedback({
          message: `Please enter a valid partial refund amount between $0.01 and $${total.toFixed(2)}.`,
          type: 'error',
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        action: actionType,
        adminNote: adminNote.trim(),
        refundAmount: actionType === 'partial' ? parseFloat(refundAmount) : undefined,
      };

      const res = await dispatch(processRefund(selected._id, payload));
      if (res && res.status === 'success') {
        setModal(null);
      } else {
        setFeedback({ message: res?.message || 'Failed to process refund request', type: 'error' });
      }
    } catch (err) {
      setFeedback({ message: err.message || 'Error occurred', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalRefundedSum = useMemo(() => {
    return refunds
      .filter((r) => r.status === 'approved' || r.status === 'partial')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  }, [refunds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="nm-page-header">
        <div>
          <h2 className="nm-page-title">Refund & Return Management</h2>
          <p className="nm-page-subtitle">
            Review customer cancellation and item return requests. Inspect customer evidence, determine item condition, and issue full or partial refunds.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4">
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(202,138,4,0.3)' }}>
            <div className="nm-metric-label">Awaiting Review</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: (counts.pending || 0) > 0 ? '#ca8a04' : 'var(--on-surface)' }}>
              {counts.pending || 0}
            </div>
            <div className="nm-metric-sub">Pending admin decisions</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(22,163,74,0.3)' }}>
            <div className="nm-metric-label">Full Refunds Approved</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: '#16a34a' }}>
              {counts.approved || 0}
            </div>
            <div className="nm-metric-sub">100% reimbursed</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(37,99,235,0.3)' }}>
            <div className="nm-metric-label">Partial Refunds Approved</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: '#2563eb' }}>
              {counts.partial || 0}
            </div>
            <div className="nm-metric-sub">Condition-based payouts</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Total Amount Refunded</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>
              ${totalRefundedSum.toFixed(2)}
            </div>
            <div className="nm-metric-sub">{counts.rejected || 0} requests rejected</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="nm-tabs">
        {TABS.map((t) => {
          const count = t === 'all' ? refunds.length : counts[t] || 0;
          return (
            <button
              key={t}
              className={`nm-tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'all' ? 'All Requests' : STATUS_META[t]?.label || t}
              {count > 0 && (
                <span
                  className="ms-2 nm-badge"
                  style={{
                    background: t === 'all' ? 'var(--surface-container-high)' : STATUS_META[t]?.bg,
                    color: t === 'all' ? 'var(--on-surface)' : STATUS_META[t]?.color,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && refunds.length === 0 ? (
        <div className="nm-card d-flex justify-content-center p-5">
          <LoadingSpinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="nm-card">
          <div className="nm-empty-state">
            <span className="material-symbols-outlined">currency_exchange</span>
            <h4 style={{ fontWeight: 700, margin: '0 0 8px', fontSize: 16 }}>No requests found</h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)' }}>
              There are currently no refund or return requests in this category.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visible.map((reqItem) => {
            const sm = STATUS_META[reqItem.status] || STATUS_META.pending;
            const isReturn = reqItem.type === 'return';
            const order = reqItem.order || {};
            const user = reqItem.user || {};

            return (
              <div
                key={reqItem._id}
                style={{
                  background: 'var(--surface-container-lowest)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
                className="nm-card"
              >
                {/* Colored Top Bar */}
                <div style={{ height: 4, background: sm.color }} />

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header Row */}
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="nm-text-code" style={{ fontSize: 14 }}>
                          Order #{order.orderNumber || 'N/A'}
                        </span>
                        <span
                          className="nm-badge"
                          style={{
                            background: isReturn ? '#ede9fe' : '#e0f2fe',
                            color: isReturn ? '#7c3aed' : '#0284c7',
                            fontWeight: 700,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13, marginRight: 3 }}>
                            {isReturn ? 'assignment_return' : 'cancel'}
                          </span>
                          {isReturn ? 'Return Request' : 'Order Cancellation'}
                        </span>
                        <span className="nm-badge" style={{ background: sm.bg, color: sm.color }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, marginRight: 3 }}>
                            {sm.icon}
                          </span>
                          {sm.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>
                        Submitted on {new Date(reqItem.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Amount info */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary-container)' }}>
                        {reqItem.status === 'pending'
                          ? `$${(order.totalAmount || 0).toFixed(2)}`
                          : `$${(reqItem.refundAmount || 0).toFixed(2)}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--secondary)' }}>
                        {reqItem.status === 'pending'
                          ? `Order Total: $${(order.totalAmount || 0).toFixed(2)}`
                          : `Refunded out of $${(order.totalAmount || 0).toFixed(2)}`}
                      </div>
                    </div>
                  </div>

                  {/* Customer and Order Summary */}
                  <div className="row g-3">
                    <div className="col-md-5">
                      <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                        <p className="nm-label" style={{ marginBottom: 4 }}>Customer</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{user.name || 'Anonymous'}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                        <p className="nm-label" style={{ marginBottom: 4 }}>Payment Method</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>
                          {order.paymentMethod || 'card'}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--secondary)' }}>
                          Status: {order.paymentStatus || 'paid'}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                        <p className="nm-label" style={{ marginBottom: 4 }}>Order Status</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                          {order.orderStatus || 'N/A'}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--secondary)' }}>
                          {reqItem.stripeRefundId ? `Stripe: ${reqItem.stripeRefundId}` : 'No Stripe ID'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <p className="nm-label" style={{ marginBottom: 8 }}>Items in Order</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="d-flex align-items-center gap-3"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--surface-container-lowest)',
                              border: '1px solid var(--outline-variant)',
                              borderRadius: 8,
                            }}
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</span>
                              {(item.color || item.size) && (
                                <span style={{ fontSize: 11, color: 'var(--secondary)', marginLeft: 8 }}>
                                  {[item.color, item.size].filter(Boolean).join(' / ')}
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                              ×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Reason */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      background: 'var(--surface-container-low)',
                      borderLeft: '4px solid var(--primary)',
                    }}
                  >
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>
                      Customer's Reason for {isReturn ? 'Return' : 'Cancellation'}:
                    </p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                      "{reqItem.reason}"
                    </p>
                  </div>

                  {/* Evidence / Photos */}
                  {reqItem.images && reqItem.images.length > 0 && (
                    <div>
                      <p className="nm-label" style={{ marginBottom: 8 }}>
                        Item Condition Evidence ({reqItem.images.length} photos)
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        {reqItem.images.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt={`evidence-${i}`}
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '1px solid var(--outline-variant)',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease',
                            }}
                            onClick={() => {
                              setPreviewImg(imgUrl);
                              setModal('image-preview');
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Note if resolved */}
                  {reqItem.adminNote && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: reqItem.status === 'rejected' ? '#fee2e2' : '#dcfce7',
                        borderLeft: `4px solid ${reqItem.status === 'rejected' ? 'var(--error)' : '#16a34a'}`,
                      }}
                    >
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>
                          admin_panel_settings
                        </span>
                        Admin Note & Assessment
                      </p>
                      <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic' }}>
                        {reqItem.adminNote}
                      </p>
                      {reqItem.resolvedAt && (
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--secondary)' }}>
                          Decided on: {new Date(reqItem.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="d-flex justify-content-end gap-2" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 14 }}>
                    {reqItem.status === 'pending' ? (
                      <button
                        className="nm-btn nm-btn-primary nm-btn-sm"
                        onClick={() => openReview(reqItem)}
                      >
                        <span className="material-symbols-outlined">gavel</span>
                        Review & Process Refund
                      </button>
                    ) : (
                      <span className="nm-badge" style={{ background: sm.bg, color: sm.color, padding: '8px 16px', fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>
                          {sm.icon}
                        </span>
                        {sm.label} {reqItem.status !== 'rejected' && `($${(reqItem.refundAmount || 0).toFixed(2)})`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Review & Decision Modal ────────────────────────────── */}
      <Modal
        isOpen={modal === 'review' && !!selected}
        onClose={() => setModal(null)}
        title={`Process Refund — Order #${selected?.order?.orderNumber || ''}`}
        size="lg"
        footer={
          <div className="d-flex justify-content-between w-100">
            <button
              className="nm-btn nm-btn-secondary nm-btn-sm"
              onClick={() => setModal(null)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="nm-btn nm-btn-primary nm-btn-sm"
              style={{
                background:
                  actionType === 'approve'
                    ? '#16a34a'
                    : actionType === 'partial'
                    ? '#2563eb'
                    : '#dc2626',
              }}
              onClick={handleSubmitDecision}
              disabled={submitting}
            >
              {submitting ? (
                'Processing...'
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>
                    {actionType === 'reject' ? 'block' : 'check'}
                  </span>
                  Confirm {actionType === 'approve' ? 'Full Refund' : actionType === 'partial' ? 'Partial Refund' : 'Rejection'}
                </>
              )}
            </button>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {feedback.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
                  color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
                }}
              >
                {feedback.message}
              </div>
            )}

            {/* Request Summary Card */}
            <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="nm-text-code">Order #{selected.order?.orderNumber}</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 15 }}>
                    {selected.user?.name} ({selected.user?.email})
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--secondary)' }}>
                    Type: <strong style={{ textTransform: 'capitalize' }}>{selected.type}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>Order Total</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-mono)' }}>
                    ${(selected.order?.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Reason */}
            <div>
              <p className="nm-label" style={{ marginBottom: 4 }}>Customer's Explanation</p>
              <div style={{ padding: '12px 14px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13 }}>{selected.reason}</p>
              </div>
            </div>

            {/* Evidence Photos */}
            {selected.images && selected.images.length > 0 && (
              <div>
                <p className="nm-label" style={{ marginBottom: 6 }}>
                  Item Condition Photos (Click to Enlarge)
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  {selected.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`ev-${i}`}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 8,
                        objectFit: 'cover',
                        border: '1px solid var(--outline-variant)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setPreviewImg(img);
                        setModal('image-preview');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Decision Selector */}
            <div>
              <label className="nm-label mb-2">Select Decision Action</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`nm-btn nm-btn-sm ${actionType === 'approve' ? 'nm-btn-primary' : 'nm-btn-outline'}`}
                  style={{ flex: 1, background: actionType === 'approve' ? '#16a34a' : 'transparent' }}
                  onClick={() => handleActionChange('approve')}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Full Refund (${(selected.order?.totalAmount || 0).toFixed(2)})
                </button>
                <button
                  type="button"
                  className={`nm-btn nm-btn-sm ${actionType === 'partial' ? 'nm-btn-primary' : 'nm-btn-outline'}`}
                  style={{ flex: 1, background: actionType === 'partial' ? '#2563eb' : 'transparent' }}
                  onClick={() => handleActionChange('partial')}
                >
                  <span className="material-symbols-outlined">pie_chart</span>
                  Partial Refund
                </button>
                <button
                  type="button"
                  className={`nm-btn nm-btn-sm ${actionType === 'reject' ? 'nm-btn-danger' : 'nm-btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => handleActionChange('reject')}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Reject Request
                </button>
              </div>
            </div>

            {/* Partial Amount Input */}
            {actionType === 'partial' && (
              <div>
                <label className="nm-label">
                  Partial Refund Amount ($) <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selected.order?.totalAmount || 0}
                    className="nm-input"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Enter amount based on condition of returned item"
                  />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--secondary)' }}>
                  Maximum allowed: ${(selected.order?.totalAmount || 0).toFixed(2)}. This amount will be credited back to the customer.
                </p>
              </div>
            )}

            {/* Admin Assessment / Decision Note */}
            <div>
              <label className="nm-label">
                Decision Note & Condition Assessment <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <textarea
                className="nm-input"
                rows={3}
                placeholder="Explain the decision (e.g., 'Item was returned in mint condition, full refund approved.' or 'Item had signs of wear; 50% partial refund issued as per policy.')"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--secondary)' }}>
                This note will be recorded in the system and emailed to the customer.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Photo Preview Modal ────────────────────────────── */}
      <Modal
        isOpen={modal === 'image-preview'}
        onClose={() => setModal(selected ? 'review' : null)}
        title="Evidence Image Preview"
        size="md"
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={previewImg}
            alt="Evidence full size"
            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, objectFit: 'contain' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Refunds;
