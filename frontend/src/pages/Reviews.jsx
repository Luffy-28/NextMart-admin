import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/ui/StatusBadge';

/* ─── Backend reviewModel aligned data ─────────────────────────
   isApproved: "pending" | "approved" | "rejected"
   comment (not body), images[], user, product, order refs
──────────────────────────────────────────────────────────────── */
const INIT_REVIEWS = [
  {
    id: 'r1',
    user:    { name: 'Alex Rivera',  email: 'alex.r@example.com',  initials: 'AR' },
    product: { name: 'Titan Mech-X Keyboard',          id: '#TMX-9942', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88100' },
    rating: 4,
    comment: 'The keys feel amazing, very tactile and responsive. However, the RGB software is a bit clunky on macOS. Build quality is exceptional for the price point.',
    isApproved: 'pending',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop',
    ],
    createdAt: '2 mins ago',
    flagged: false,
  },
  {
    id: 'r2',
    user:    { name: 'Jordan Smith', email: 'j.smith@webmail.com',  initials: 'JS' },
    product: { name: 'CloudPods Pro',                  id: '#CP-0021',  image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88095' },
    rating: 1,
    comment: 'NEVER BUY THIS!!!! IT EXPLODED!!!! JUST KIDDING BUT IT DOES NOT WORK. WASTE OF MONEY. GO TO COMPETITOR.COM INSTEAD FOR BETTER DEALS!!!!!',
    isApproved: 'pending',
    images: [],
    createdAt: '15 mins ago',
    flagged: true,
  },
  {
    id: 'r3',
    user:    { name: 'Maria Santos', email: 'maria.s@email.org',    initials: 'MS' },
    product: { name: 'Vapor Ultra Running Shoes',      id: '#VAP-901', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88080' },
    rating: 5,
    comment: 'Absolutely love these shoes! Lightweight, extremely comfortable for long distances, and the design is top-notch.',
    isApproved: 'approved',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'],
    createdAt: '1 hr ago',
    flagged: false,
  },
  {
    id: 'r4',
    user:    { name: 'Tom Bradley',  email: 'tom.b@gmail.com',      initials: 'TB' },
    product: { name: 'AeroDry Hoodie Pro',             id: '#AER-402', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88072' },
    rating: 2,
    comment: 'The material is OK but the sizing runs small. I ordered a Large and it fits like a Medium. Customer service was helpful though.',
    isApproved: 'pending',
    images: [],
    createdAt: '2 hrs ago',
    flagged: false,
  },
  {
    id: 'r5',
    user:    { name: 'Sofia Reyes',  email: 'sofia.r@inbox.net',    initials: 'SR' },
    product: { name: 'Chronos Smartwatch Gen 5',       id: '#CHR-005', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88061' },
    rating: 5,
    comment: 'Absolutely stunning watch. The AMOLED display is crystal clear. Battery easily lasts 6 days with moderate GPS use.',
    isApproved: 'approved',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'],
    createdAt: '3 hrs ago',
    flagged: false,
  },
  {
    id: 'r6',
    user:    { name: 'Pete Nolan',   email: 'pete.n@corp.io',       initials: 'PN' },
    product: { name: 'Apex Bluetooth Earbuds',         id: '#APX-818', image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=80&h=80&fit=crop' },
    order:   { orderNumber: 'ORD-88044' },
    rating: 1,
    comment: 'Stopped working after 2 weeks. Very disappointed.',
    isApproved: 'rejected',
    images: [],
    createdAt: '1 day ago',
    flagged: false,
  },
];

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span
        key={i}
        className="material-symbols-outlined"
        style={{
          fontSize: 17,
          color: i <= rating ? '#FACC15' : 'var(--outline-variant)',
          fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0",
        }}
      >star</span>
    ))}
  </div>
);

const APPROVAL_MAP = {
  pending:  { badge: 'Pending',  color: '#ca8a04', bg: '#fef9c3' },
  approved: { badge: 'Approved', color: '#16a34a', bg: '#dcfce7' },
  rejected: { badge: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
};

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: 'rate_review'  },
  { key: 'approved', label: 'Approved', icon: 'check_circle' },
  { key: 'rejected', label: 'Rejected', icon: 'block'        },
];

const STATS = [
  { label: 'Total Pending',  getValue: rs => rs.filter(r => r.isApproved === 'pending').length  },
  { label: 'Approved',       getValue: rs => rs.filter(r => r.isApproved === 'approved').length },
  { label: 'Rejected',       getValue: rs => rs.filter(r => r.isApproved === 'rejected').length, error: true },
  { label: 'Flagged / Spam', getValue: rs => rs.filter(r => r.flagged).length,                  warn: true  },
];

const Reviews = () => {
  const [reviews, setReviews] = useState(INIT_REVIEWS);
  const [tab, setTab]         = useState('pending');
  const [search, setSearch]   = useState('');

  const update = (id, isApproved) =>
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved } : r));

  const visible = useMemo(() => {
    let list = reviews.filter(r => r.isApproved === tab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.user.name.toLowerCase().includes(q) ||
        r.product.name.toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviews, tab, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div className="row g-4">
        {STATS.map((s, i) => {
          const val = s.getValue(reviews);
          return (
            <div key={i} className="col-6 col-xl-3">
              <div className="nm-metric-card">
                <div className="nm-metric-label">{s.label}</div>
                <div className="nm-metric-value" style={{ marginTop: 8, color: s.error ? 'var(--error)' : s.warn ? '#ca8a04' : 'var(--on-surface)' }}>{val}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div className="nm-tabs" style={{ flex: 1 }}>
          {TABS.map(t => {
            const count = reviews.filter(r => r.isApproved === t.key).length;
            return (
              <button key={t.key} className={`nm-tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>{t.icon}</span>
                {t.label}
                {count > 0 && (
                  <span className={`ms-2 nm-badge${t.key === 'pending' ? ' nm-badge-warning' : t.key === 'rejected' ? ' nm-badge-danger' : ' nm-badge-success'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="nm-input-group" style={{ maxWidth: 300 }}>
          <span className="material-symbols-outlined">search</span>
          <input className="nm-input" placeholder="Search reviews…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Review Cards */}
      {visible.length === 0 ? (
        <div className="nm-card">
          <div className="nm-empty-state">
            <span className="material-symbols-outlined">rate_review</span>
            <h4 style={{ fontWeight: 700, margin: '0 0 8px', fontSize: 16 }}>No {tab} reviews</h4>
            <p style={{ margin: 0, fontSize: 13 }}>
              {search ? 'Try a different search term.' : `All reviews are in a different status.`}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visible.map(rev => {
            const ap = APPROVAL_MAP[rev.isApproved];
            return (
              <div key={rev.id} className="nm-review-card">
                {/* Status accent bar */}
                <div className="nm-review-flag" style={{ background: rev.flagged ? 'var(--error)' : ap.color }} />

                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    {/* Product info */}
                    <div className="d-flex gap-3 align-items-start">
                      <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline-variant)' }}>
                        {rev.product.image
                          ? <img src={rev.product.image} alt={rev.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 26 }}>inventory_2</span>
                            </div>
                        }
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700 }}>{rev.product.name}</h4>
                        <span className="nm-text-code">{rev.product.id}</span>
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <Stars rating={rev.rating} />
                          <strong style={{ fontSize: 13 }}>{rev.rating}.0</strong>
                          {rev.flagged && (
                            <span className="nm-badge nm-badge-danger">
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>report</span>
                              Spam / Abuse
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reviewer info */}
                    <div className="text-end">
                      <div className="d-flex align-items-center gap-2 justify-content-end">
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{rev.user.name}</p>
                          <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--secondary)' }}>{rev.user.email}</p>
                          <p style={{ margin: '0', fontSize: 11, color: 'var(--outline)' }}>
                            {rev.createdAt} · Order: <span className="nm-text-code">{rev.order.orderNumber}</span>
                          </p>
                        </div>
                        <span className="nm-avatar-initials">{rev.user.initials}</span>
                      </div>
                      <div className="mt-2">
                        <span className="nm-badge" style={{ background: ap.bg, color: ap.color }}>{ap.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment body */}
                  <div style={{
                    background: rev.flagged ? 'rgba(186,26,26,0.04)' : 'var(--surface-container-low)',
                    padding: '12px 16px', borderRadius: 8,
                    borderLeft: `4px solid ${rev.flagged ? 'var(--error)' : 'var(--outline-variant)'}`,
                  }}>
                    {rev.flagged && (
                      <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>report</span>
                        Potential Spam / Abuse Detected
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--on-surface)' }}>
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Attached images (images[]) */}
                  {rev.images.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap">
                      {rev.images.map((img, i) => (
                        <img key={i} src={img} alt={`review-img-${i}`} style={{
                          width: 80, height: 80, borderRadius: 8, objectFit: 'cover',
                          border: '1px solid var(--outline-variant)', cursor: 'zoom-in'
                        }} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex justify-content-end gap-2" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 12 }}>
                    {rev.flagged && rev.isApproved === 'pending' && (
                      <button className="nm-btn nm-btn-danger nm-btn-sm" onClick={() => update(rev.id, 'rejected')}>
                        <span className="material-symbols-outlined">person_off</span> Ban User
                      </button>
                    )}
                    {rev.isApproved !== 'rejected' && (
                      <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => update(rev.id, 'rejected')}>
                        <span className="material-symbols-outlined">block</span> Reject
                      </button>
                    )}
                    {rev.isApproved !== 'approved' && (
                      <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={() => update(rev.id, 'approved')}>
                        <span className="material-symbols-outlined">check_circle</span> Approve
                      </button>
                    )}
                    {rev.isApproved !== 'pending' && (
                      <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => update(rev.id, 'pending')}>
                        <span className="material-symbols-outlined">undo</span> Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
