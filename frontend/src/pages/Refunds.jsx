import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import MetricCard from '../components/ui/MetricCard';

/* ─────────────────────────────────────────────────────────────
  Refund workflow (mapped to orderModel):
    1. Order must be "delivered" + paymentStatus "paid"
    2. Customer raises a refund request → refundStatus: "requested"
    3. Admin reviews → "approved" or "rejected"
    4. Only after "approved" → paymentStatus becomes "refunded"
       and orderStatus becomes "returned"
─────────────────────────────────────────────────────────────── */
const INIT_REFUNDS = [
  {
    id: 'rf1',
    orderNumber: 'ORD-94821',
    requestedAt: 'Jun 20, 2026 · 10:14 AM',
    user: { name: 'Alex Morgan',   email: 'alex.m@example.com',  initials: 'AM', phone: '+1 555-001-2345' },
    items: [
      { name: 'Vapor Ultra Running Shoes', color: 'Black', size: '10', price: 129.99, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
      { name: 'Chronos Smartwatch Gen 5',  color: 'Space Gray', size: '44mm', price: 299.00, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
    ],
    totalAmount: 481.89,
    refundAmount: 481.89,
    reason: 'defective_item',
    reasonDetail: 'The smartwatch screen developed a dead pixel within 24 hours of delivery. The running shoes also had a manufacturing defect on the sole.',
    refundStatus: 'requested',
    adminNote: '',
    paymentMethod: 'card',
    deliveredAt: 'Jun 23, 2026',
    evidence: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',
    ],
  },
  {
    id: 'rf2',
    orderNumber: 'ORD-94816',
    requestedAt: 'Jun 19, 2026 · 03:42 PM',
    user: { name: 'Emma Wilson',   email: 'emma.w@mail.org',     initials: 'EW', phone: '+1 555-988-7654' },
    items: [
      { name: 'Chronos Smartwatch Gen 5', color: 'Silver', size: '40mm', price: 299.00, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
    ],
    totalAmount: 338.90,
    refundAmount: 299.00,
    reason: 'wrong_item',
    reasonDetail: 'I received the 44mm size instead of the 40mm I ordered. The packaging was correct but the item inside was wrong.',
    refundStatus: 'requested',
    adminNote: '',
    paymentMethod: 'card',
    deliveredAt: 'Jun 18, 2026',
    evidence: [],
  },
  {
    id: 'rf3',
    orderNumber: 'ORD-94810',
    requestedAt: 'Jun 18, 2026 · 11:05 AM',
    user: { name: 'David Park',    email: 'david.p@work.net',    initials: 'DP', phone: '+1 555-321-6789' },
    items: [
      { name: 'AeroDry Hoodie Pro', color: 'Charcoal', size: 'XL', price: 79.99, quantity: 2, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=60&h=60&fit=crop' },
    ],
    totalAmount: 172.98,
    refundAmount: 172.98,
    reason: 'not_as_described',
    reasonDetail: 'The product color looks completely different from the website photos — it is green not charcoal. Very misleading.',
    refundStatus: 'approved',
    adminNote: 'Verified with warehouse — batch had incorrect color label. Full refund approved.',
    paymentMethod: 'paypal',
    deliveredAt: 'Jun 17, 2026',
    evidence: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&h=120&fit=crop'],
    approvedAt: 'Jun 19, 2026 · 09:30 AM',
  },
  {
    id: 'rf4',
    orderNumber: 'ORD-94805',
    requestedAt: 'Jun 17, 2026 · 02:15 PM',
    user: { name: 'Rachel Gomez',  email: 'rachel.g@inbox.net',  initials: 'RG', phone: '+1 555-654-3210' },
    items: [
      { name: 'Apex Bluetooth Earbuds', color: 'White', size: null, price: 119.50, quantity: 1, image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=60&h=60&fit=crop' },
    ],
    totalAmount: 130.45,
    refundAmount: 119.50,
    reason: 'changed_mind',
    reasonDetail: 'Decided I prefer over-ear headphones. No issues with the product itself.',
    refundStatus: 'rejected',
    adminNote: 'Policy: Changed-mind refunds are not accepted for electronics after 7-day return window. Customer was informed.',
    paymentMethod: 'card',
    deliveredAt: 'Jun 10, 2026',
    evidence: [],
    rejectedAt: 'Jun 18, 2026 · 11:00 AM',
  },
  {
    id: 'rf5',
    orderNumber: 'ORD-94800',
    requestedAt: 'Jun 16, 2026 · 08:50 AM',
    user: { name: 'Chris Tanaka',  email: 'chris.t@email.com',   initials: 'CT', phone: '+1 555-741-8523' },
    items: [
      { name: 'Vapor Ultra Running Shoes', color: 'White', size: '11', price: 149.99, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
    ],
    totalAmount: 164.99,
    refundAmount: 164.99,
    reason: 'defective_item',
    reasonDetail: 'Sole started separating from the upper after first use on a dry track. Clear manufacturing defect.',
    refundStatus: 'refunded',
    adminNote: 'Confirmed defect. Refund processed to original card. Replacement offer declined by customer.',
    paymentMethod: 'card',
    deliveredAt: 'Jun 14, 2026',
    evidence: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop'],
    approvedAt: 'Jun 17, 2026 · 10:00 AM',
    refundedAt:  'Jun 17, 2026 · 10:05 AM',
  },
];

const REASON_LABELS = {
  defective_item:  'Defective / Damaged Item',
  wrong_item:      'Wrong Item Received',
  not_as_described:'Not as Described',
  changed_mind:    'Changed Mind',
  late_delivery:   'Late Delivery',
  other:           'Other',
};

const STATUS_META = {
  requested: { label: 'Awaiting Review', color: '#ca8a04', bg: '#fef9c3', icon: 'hourglass_top' },
  approved:  { label: 'Approved',        color: '#2563eb', bg: '#dbeafe', icon: 'thumb_up'     },
  rejected:  { label: 'Rejected',        color: '#dc2626', bg: '#fee2e2', icon: 'thumb_down'   },
  refunded:  { label: 'Refunded',        color: '#16a34a', bg: '#dcfce7', icon: 'currency_exchange' },
};

const PAY_ICON = { card: 'credit_card', paypal: 'account_balance_wallet', cod: 'local_shipping' };

const TABS = ['requested', 'approved', 'rejected', 'refunded'];

const Refunds = () => {
  const [refunds, setRefunds] = useState(INIT_REFUNDS);
  const [tab, setTab]         = useState('requested');
  const [modal, setModal]     = useState(null); // null | 'review' | 'confirm-approve' | 'confirm-reject'
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [partialAmt, setPartialAmt] = useState('');

  const visible = useMemo(() =>
    refunds.filter(r => r.refundStatus === tab),
  [refunds, tab]);

  const openReview = (r) => {
    setSelected(r);
    setAdminNote(r.adminNote || '');
    setPartialAmt(r.refundAmount.toString());
    setModal('review');
  };

  const doApprove = () => {
    setRefunds(prev => prev.map(r => r.id === selected.id ? {
      ...r,
      refundStatus: 'approved',
      refundAmount: parseFloat(partialAmt) || r.refundAmount,
      adminNote,
      approvedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    } : r));
    setModal(null);
  };

  const doReject = () => {
    setRefunds(prev => prev.map(r => r.id === selected.id ? {
      ...r,
      refundStatus: 'rejected',
      adminNote,
      rejectedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    } : r));
    setModal(null);
  };

  /* Process refund — only available after "approved" */
  const doProcessRefund = (id) => {
    if (!window.confirm('Process this refund? This action marks the payment as refunded and cannot be undone.')) return;
    setRefunds(prev => prev.map(r => r.id === id ? {
      ...r,
      refundStatus: 'refunded',
      refundedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    } : r));
  };

  /* Stats */
  const stats = {
    requested: refunds.filter(r => r.refundStatus === 'requested').length,
    approved:  refunds.filter(r => r.refundStatus === 'approved').length,
    rejected:  refunds.filter(r => r.refundStatus === 'rejected').length,
    refunded:  refunds.filter(r => r.refundStatus === 'refunded').length,
    totalRefunded: refunds.filter(r => r.refundStatus === 'refunded').reduce((a, r) => a + r.refundAmount, 0),
  };

  const RefundCard = ({ r }) => {
    const sm = STATUS_META[r.refundStatus];
    return (
      <div style={{
        background: 'var(--surface-container-lowest)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }} className="nm-card">
        {/* Coloured top bar */}
        <div style={{ height: 4, background: sm.color }} />

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header row */}
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="nm-text-code">{r.orderNumber}</span>
                <span className="nm-badge" style={{ background: sm.bg, color: sm.color }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{sm.icon}</span>
                  {sm.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>
                Requested: {r.requestedAt}
              </p>
            </div>
            {/* Refund amount */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary-container)' }}>
                ${r.refundAmount.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--secondary)' }}>
                of ${r.totalAmount.toFixed(2)} order total
              </div>
            </div>
          </div>

          {/* Customer + order summary */}
          <div className="row g-3">
            <div className="col-md-5">
              <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                <p className="nm-label" style={{ marginBottom: 6 }}>Customer</p>
                <div className="d-flex align-items-center gap-2">
                  <span className="nm-avatar-initials">{r.user.initials}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{r.user.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>{r.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                <p className="nm-label" style={{ marginBottom: 6 }}>Delivered</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{r.deliveredAt}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                <p className="nm-label" style={{ marginBottom: 6 }}>Payment Method</p>
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>{PAY_ICON[r.paymentMethod]}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{r.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="nm-label" style={{ marginBottom: 8 }}>Items in Order</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.items.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-3" style={{
                  padding: '8px 12px', background: 'var(--surface-container-lowest)',
                  border: '1px solid var(--outline-variant)', borderRadius: 8
                }}>
                  <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                    {(item.color || item.size) && (
                      <span style={{ fontSize: 12, color: 'var(--secondary)', marginLeft: 8 }}>
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

          {/* Reason */}
          <div style={{
            padding: '12px 16px', borderRadius: 8,
            background: r.refundStatus === 'rejected' ? 'rgba(186,26,26,0.04)' : 'var(--surface-container-low)',
            borderLeft: `4px solid ${r.refundStatus === 'rejected' ? 'var(--error)' : 'var(--outline-variant)'}`,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)' }}>
              Reason: {REASON_LABELS[r.reason] || r.reason}
            </p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>"{r.reasonDetail}"</p>
          </div>

          {/* Evidence images */}
          {r.evidence?.length > 0 && (
            <div>
              <p className="nm-label" style={{ marginBottom: 8 }}>Evidence / Photos</p>
              <div className="d-flex gap-2 flex-wrap">
                {r.evidence.map((img, i) => (
                  <img key={i} src={img} alt={`evidence-${i}`} style={{
                    width: 80, height: 80, borderRadius: 8, objectFit: 'cover',
                    border: '1px solid var(--outline-variant)', cursor: 'zoom-in'
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Admin note (if exists) */}
          {r.adminNote && (
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: r.refundStatus === 'approved' || r.refundStatus === 'refunded' ? '#dbeafe' : '#fee2e2',
              borderLeft: `4px solid ${r.refundStatus === 'approved' || r.refundStatus === 'refunded' ? '#2563eb' : 'var(--error)'}`,
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>admin_panel_settings</span>
                Admin Note
              </p>
              <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic' }}>{r.adminNote}</p>
              {r.approvedAt && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--secondary)' }}>Approved: {r.approvedAt}</p>}
              {r.rejectedAt && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--secondary)' }}>Rejected: {r.rejectedAt}</p>}
              {r.refundedAt  && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓ Refund processed: {r.refundedAt}</p>}
            </div>
          )}

          {/* Action row */}
          <div className="d-flex justify-content-end gap-2" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 14 }}>
            {/* Pending → Review button */}
            {r.refundStatus === 'requested' && (
              <>
                <button className="nm-btn nm-btn-danger nm-btn-sm" onClick={() => openReview(r)}>
                  <span className="material-symbols-outlined">thumb_down</span> Reject
                </button>
                <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={() => openReview(r)}>
                  <span className="material-symbols-outlined">rate_review</span> Review Request
                </button>
              </>
            )}
            {/* Approved → Process Refund button */}
            {r.refundStatus === 'approved' && (
              <button
                className="nm-btn nm-btn-primary nm-btn-sm"
                style={{ background: '#16a34a' }}
                onClick={() => doProcessRefund(r.id)}
              >
                <span className="material-symbols-outlined">currency_exchange</span>
                Process Refund (${r.refundAmount.toFixed(2)})
              </button>
            )}
            {/* Refunded — badge only */}
            {r.refundStatus === 'refunded' && (
              <span className="nm-badge nm-badge-success" style={{ padding: '8px 16px', fontSize: 13 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                Refund Processed
              </span>
            )}
            {/* Rejected */}
            {r.refundStatus === 'rejected' && (
              <span className="nm-badge nm-badge-danger" style={{ padding: '8px 16px', fontSize: 13 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
                Request Rejected
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div className="nm-page-header">
        <div>
          <h2 className="nm-page-title">Refund Requests</h2>
          <p className="nm-page-subtitle">
            Review customer refund requests. Approve to unlock processing — refunds are only processed after explicit approval.
          </p>
        </div>
      </div>

      {/* Approval flow banner */}
      <div style={{
        padding: '14px 20px', background: 'rgba(37,99,235,0.06)',
        border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: 22, flexShrink: 0, marginTop: 1 }}>info</span>
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: '#1e40af' }}>Two-Step Approval Policy</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)', lineHeight: 1.6 }}>
            <strong>Step 1:</strong> Review the customer's request and evidence, set the refund amount, and <strong>Approve</strong> or <strong>Reject</strong>. &nbsp;
            <strong>Step 2:</strong> Only after approval, click <strong>Process Refund</strong> to finalize the payment reversal. Refunds are only valid for orders with <em>delivered</em> status.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4">
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(202,138,4,0.3)' }}>
            <div className="nm-metric-label">Awaiting Review</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: stats.requested > 0 ? '#ca8a04' : 'var(--on-surface)' }}>{stats.requested}</div>
            <div className="nm-metric-sub">Need admin decision</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(37,99,235,0.3)' }}>
            <div className="nm-metric-label">Approved — Pending Payout</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: '#2563eb' }}>{stats.approved}</div>
            <div className="nm-metric-sub">Ready to process</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Total Refunded (All Time)</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>${stats.totalRefunded.toFixed(2)}</div>
            <div className="nm-metric-sub">From {stats.refunded} completed refunds</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(186,26,26,0.2)' }}>
            <div className="nm-metric-label">Rejected</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: 'var(--error)' }}>{stats.rejected}</div>
            <div className="nm-metric-sub">Requests denied</div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="nm-tabs">
        {TABS.map(t => {
          const sm = STATUS_META[t];
          const count = refunds.filter(r => r.refundStatus === t).length;
          return (
            <button key={t} className={`nm-tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 5 }}>{sm.icon}</span>
              {sm.label}
              {count > 0 && (
                <span className="ms-2 nm-badge" style={{ background: sm.bg, color: sm.color }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="nm-card">
          <div className="nm-empty-state">
            <span className="material-symbols-outlined">currency_exchange</span>
            <h4 style={{ fontWeight: 700, margin: '0 0 8px', fontSize: 16 }}>No {STATUS_META[tab].label} requests</h4>
            <p style={{ margin: 0, fontSize: 13 }}>There are no refund requests in this status right now.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visible.map(r => <RefundCard key={r.id} r={r} />)}
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────── */}
      <Modal
        isOpen={modal === 'review' && !!selected}
        onClose={() => setModal(null)}
        title={`Review Refund — ${selected?.orderNumber}`}
        size="md"
        footer={
          <div className="d-flex justify-content-between w-100">
            <button
              className="nm-btn nm-btn-danger nm-btn-sm"
              onClick={doReject}
              disabled={!adminNote.trim()}
              title={!adminNote.trim() ? 'Add an admin note before rejecting' : ''}
            >
              <span className="material-symbols-outlined">thumb_down</span> Reject Request
            </button>
            <button
              className="nm-btn nm-btn-primary nm-btn-sm"
              style={{ background: '#2563eb' }}
              onClick={doApprove}
              disabled={!adminNote.trim() || !partialAmt || parseFloat(partialAmt) <= 0}
              title={!adminNote.trim() ? 'Add an admin note before approving' : ''}
            >
              <span className="material-symbols-outlined">thumb_up</span> Approve & Set Amount
            </button>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Order summary */}
            <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="nm-text-code">{selected.orderNumber}</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 15 }}>{selected.user.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--secondary)' }}>{selected.user.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)' }}>Order Total</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-mono)' }}>${selected.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div style={{ padding: '12px 16px', background: 'var(--surface-container-low)', borderRadius: 8, borderLeft: '4px solid var(--outline-variant)' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>
                Customer Reason: {REASON_LABELS[selected.reason]}
              </p>
              <p style={{ margin: 0, fontSize: 13 }}>"{selected.reasonDetail}"</p>
            </div>

            {/* Evidence */}
            {selected.evidence?.length > 0 && (
              <div>
                <p className="nm-label" style={{ marginBottom: 8 }}>Customer Evidence</p>
                <div className="d-flex gap-2 flex-wrap">
                  {selected.evidence.map((img, i) => (
                    <img key={i} src={img} alt={`ev-${i}`} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--outline-variant)' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Refund amount (editable — allows partial refunds) */}
            <div>
              <label className="nm-label">
                Refund Amount ($)
                <span style={{ fontWeight: 400, color: 'var(--secondary)', marginLeft: 6 }}>
                  (max: ${selected.totalAmount.toFixed(2)} — edit for partial refund)
                </span>
              </label>
              <input
                type="number" step="0.01" min="0.01" max={selected.totalAmount}
                className="nm-input"
                value={partialAmt}
                onChange={e => setPartialAmt(e.target.value)}
              />
              {parseFloat(partialAmt) < selected.refundAmount && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#ca8a04', fontWeight: 600 }}>
                  ⚠ Partial refund: customer requested ${selected.refundAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Admin note (required) */}
            <div>
              <label className="nm-label">
                Admin Decision Note <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <textarea
                className="nm-input" rows={3}
                placeholder="Required: Explain your decision (e.g. 'Defect confirmed by warehouse. Full refund approved.' or 'Outside 7-day return window.')"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              {!adminNote.trim() && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--error)' }}>A decision note is required before approving or rejecting.</p>
              )}
            </div>

            {/* Warning */}
            <div style={{ padding: '10px 14px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 8, fontSize: 12, color: '#1e40af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>lock</span>
              <strong>Approving</strong> does not immediately transfer funds — you will still need to click <strong>Process Refund</strong> on the approved card. <strong>Rejecting</strong> closes the request permanently.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Refunds;
