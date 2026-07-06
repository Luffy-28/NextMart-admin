import React, { useState, useRef } from 'react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import MetricCard from '../components/ui/MetricCard';

/* ─── Backend dealsModel aligned data ──────────────────────────
   title (NOT name), description, bannerImage
   products[]  ← array of Product refs (no category-level support in model)
   discountType: "percentage" | "fixed"  ← lowercase
   discountValue, startsAt (Date), endsAt (Date), isActive
──────────────────────────────────────────────────────────────── */
const ALL_PRODUCTS = [
  { id: 'p1', name: 'Vapor Ultra Running Shoes', category: 'Footwear',    basePrice: 149.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
  { id: 'p2', name: 'Chronos Smartwatch Gen 5',  category: 'Electronics', basePrice: 299.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
  { id: 'p3', name: 'AeroDry Hoodie Pro',         category: 'Apparel',     basePrice: 79.99,  image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=60&h=60&fit=crop' },
  { id: 'p4', name: 'Apex Bluetooth Earbuds',     category: 'Electronics', basePrice: 119.50, image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=60&h=60&fit=crop' },
  { id: 'p5', name: 'Element Compression Shorts', category: 'Apparel',     basePrice: 34.50,  image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=60&h=60&fit=crop' },
  { id: 'p6', name: 'Pace Trainer Sneaker v2',    category: 'Footwear',    basePrice: 95.00,  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
];

const INIT_DEALS = [
  {
    id: 'd1',
    title: 'Runner\'s Bundle Deal',
    description: 'Special pricing on our top-rated running footwear for the season.',
    bannerImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=200&fit=crop',
    products: ['p1', 'p6'],
    discountType: 'percentage',
    discountValue: 20,
    startsAt: '2026-06-15',
    endsAt:   '2026-06-30',
    isActive: true,
  },
  {
    id: 'd2',
    title: 'Tech Upgrade Festival',
    description: 'Massive savings on all Electronics — smartwatches, earbuds and more.',
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=200&fit=crop',
    products: ['p2', 'p4'],
    discountType: 'percentage',
    discountValue: 25,
    startsAt: '2026-07-01',
    endsAt:   '2026-07-31',
    isActive: false,
  },
  {
    id: 'd3',
    title: 'Smartwatch Flash Price',
    description: 'One-day flash deal — $50 flat off the Chronos Smartwatch Gen 5.',
    bannerImage: '',
    products: ['p2'],
    discountType: 'fixed',
    discountValue: 50,
    startsAt: '2026-06-21',
    endsAt:   '2026-06-21',
    isActive: true,
  },
  {
    id: 'd4',
    title: 'Summer Apparel Sale',
    description: 'Stay cool with 15% off all Apparel products this summer.',
    bannerImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=200&fit=crop',
    products: ['p3', 'p5'],
    discountType: 'percentage',
    discountValue: 15,
    startsAt: '2026-06-01',
    endsAt:   '2026-08-31',
    isActive: true,
  },
];

const BLANK = {
  title: '', description: '',
  bannerImage: '',
  products: [],
  discountType: 'percentage',
  discountValue: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

/* ── Product multi-checkbox selector ──────────────────────────── */
const ProductSelector = ({ selected, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', padding: '2px 0' }}>
    {ALL_PRODUCTS.map(p => {
      const checked = selected.includes(p.id);
      return (
        <label key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${checked ? 'var(--primary-container)' : 'var(--outline-variant)'}`,
          background: checked ? 'rgba(19,27,46,0.04)' : 'var(--surface-container-lowest)',
          transition: 'all 0.15s',
        }}>
          <input type="checkbox" checked={checked} style={{ width: 16, height: 16, flexShrink: 0 }}
            onChange={() => onChange(checked ? selected.filter(id => id !== p.id) : [...selected, p.id])} />
          <img src={p.image} alt={p.name} style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--outline-variant)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{p.category} · ${p.basePrice.toFixed(2)}</div>
          </div>
        </label>
      );
    })}
  </div>
);

/* ── Banner image picker ────────────────────────────────────── */
const BannerPicker = ({ value, onChange }) => {
  const ref = useRef();
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) onChange(URL.createObjectURL(f));
    e.target.value = '';
  };
  return (
    <div>
      <label className="nm-label">Banner Image <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
      <div
        onClick={() => ref.current.click()}
        style={{
          width: '100%', height: 120, borderRadius: 10, cursor: 'pointer',
          border: '2px dashed var(--outline-variant)',
          background: 'var(--surface-container-low)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
        }}
      >
        {value
          ? <img src={value} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_photo_alternate</span>
              <span style={{ fontSize: 12 }}>Click to upload banner (600×200 recommended)</span>
            </div>
        }
      </div>
      <div className="d-flex gap-2 mt-2">
        <button type="button" className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => ref.current.click()}>
          <span className="material-symbols-outlined">upload</span> {value ? 'Change' : 'Upload'}
        </button>
        {value && (
          <button type="button" className="nm-btn nm-btn-ghost nm-btn-sm" onClick={() => onChange('')}>
            <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>delete</span> Remove
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
};

/* ── Main Deals page ──────────────────────────────────────────── */
const Deals = () => {
  const [deals, setDeals] = useState(INIT_DEALS);
  const [modal, setModal] = useState(null);
  const [editRow, setEditRow]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(BLANK);

  const openAdd    = () => { setForm({ ...BLANK }); setModal('add'); };
  const openEdit   = (d) => { setEditRow(d); setForm({ ...d }); setModal('edit'); };
  const openDetail = (d) => { setSelected(d); setModal('detail'); };
  const close      = () => { setModal(null); setEditRow(null); setSelected(null); };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    const data = { ...form, discountValue: +form.discountValue };
    if (modal === 'add') {
      setDeals(prev => [{ ...data, id: `d${Date.now()}` }, ...prev]);
    } else {
      setDeals(prev => prev.map(d => d.id === editRow.id ? { ...d, ...data } : d));
    }
    close();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this deal?')) setDeals(prev => prev.filter(d => d.id !== id));
  };

  const toggleActive = (id) =>
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));

  /* Stats */
  const activeCount  = deals.filter(d => d.isActive).length;
  const totalProds   = [...new Set(deals.flatMap(d => d.products))].length;

  const COLS = [
    {
      key: 'title', label: 'Deal',
      render: r => (
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 56, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
            border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)'
          }}>
            {r.bannerImage
              ? <img src={r.bannerImage} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 20 }}>sell</span>
                </div>
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'products', label: 'Products', sortable: false,
      render: r => {
        const prods = ALL_PRODUCTS.filter(p => r.products.includes(p.id));
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {prods.slice(0, 3).map(p => (
              <img key={p.id} src={p.image} alt={p.name} title={p.name}
                style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--outline-variant)' }} />
            ))}
            {prods.length > 3 && (
              <span style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--secondary)' }}>
                +{prods.length - 3}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'discountValue', label: 'Discount',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16, color: 'var(--primary-container)' }}>
          {r.discountType === 'percentage' ? `${r.discountValue}%` : `$${r.discountValue}`}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--secondary)', marginLeft: 4 }}>
            {r.discountType === 'percentage' ? 'OFF' : 'FLAT'}
          </span>
        </span>
      )
    },
    {
      key: 'startsAt', label: 'Duration', sortable: false,
      render: r => (
        <div style={{ fontSize: 12 }}>
          <div><strong>{r.startsAt}</strong></div>
          <div style={{ color: 'var(--outline)', margin: '2px 0' }}>→</div>
          <div><strong>{r.endsAt}</strong></div>
        </div>
      )
    },
    {
      key: 'isActive', label: 'Status',
      render: r => <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: r => (
        <div className="d-flex gap-1">
          <button className="nm-action-btn" title="Preview deal" onClick={() => openDetail(r)}>
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button className="nm-action-btn" title="Edit" onClick={() => openEdit(r)}>
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="nm-action-btn" title={r.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(r.id)}>
            <span className="material-symbols-outlined">{r.isActive ? 'pause_circle' : 'play_circle'}</span>
          </button>
          <button className="nm-action-btn danger" title="Delete" onClick={() => handleDelete(r.id)}>
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      )
    }
  ];

  const DealForm = () => (
    <form id="deal-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="row g-3">
        <div className="col-12">
          <label className="nm-label">Deal Title *</label>
          <input className="nm-input" placeholder="e.g. Runner's Bundle Deal" value={form.title}
            onChange={e => set('title', e.target.value)} required />
        </div>
        <div className="col-12">
          <label className="nm-label">Description</label>
          <textarea className="nm-input" rows={2} placeholder="Brief description of the deal…" value={form.description}
            onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <BannerPicker value={form.bannerImage} onChange={v => set('bannerImage', v)} />

      <div>
        <label className="nm-label">Products in this Deal *</label>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--secondary)' }}>
          Select which products are included. The discount applies to the <strong>basePrice</strong> of each.
        </p>
        <ProductSelector selected={form.products} onChange={v => set('products', v)} />
        {form.products.length === 0 && (
          <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--error)' }}>Select at least one product.</p>
        )}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="nm-label">Discount Type *</label>
          <select className="nm-select" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="nm-label">Discount Value *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--secondary)', fontSize: 14 }}>
              {form.discountType === 'percentage' ? '%' : '$'}
            </span>
            <input type="number" min="0" max={form.discountType === 'percentage' ? 100 : undefined}
              step={form.discountType === 'percentage' ? '1' : '0.01'}
              className="nm-input" placeholder="0" style={{ paddingLeft: 28 }}
              value={form.discountValue} onChange={e => set('discountValue', e.target.value)} required />
          </div>
        </div>
        <div className="col-md-6">
          <label className="nm-label">Starts At *</label>
          <input type="date" className="nm-input" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="nm-label">Ends At *</label>
          <input type="date" className="nm-input" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} required />
        </div>
        <div className="col-12">
          <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            <span style={{ fontWeight: 600 }}>Active <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>(deal is live immediately)</span></span>
          </label>
        </div>
      </div>
    </form>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div className="row g-4">
        <div className="col-6 col-xl-3">
          <MetricCard label="Total Deals" value={deals.length} sub="All time" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Active Deals" value={activeCount} sub="Currently live" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Products on Deal" value={totalProds} sub="Unique SKUs covered" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Inactive Deals" value={deals.length - activeCount} sub="Paused / Expired" alert={deals.length - activeCount > 0} />
        </div>
      </div>

      {/* Table */}
      <div className="nm-card nm-card-padding">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="nm-page-section-title">Deals & Promotions</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--secondary)' }}>
              Select products for each deal — discounts apply to their base price.
            </p>
          </div>
          <button className="nm-btn nm-btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined">add</span> Create Deal
          </button>
        </div>

        <DataTable
          columns={COLS}
          data={deals}
          searchFields={['title', 'description']}
          placeholder="Search deals…"
          pageSize={5}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal === 'add' || modal === 'edit'}
        onClose={close}
        title={modal === 'add' ? 'Create New Deal' : `Edit — ${editRow?.title}`}
        size="lg"
        footer={
          <>
            <button className="nm-btn nm-btn-secondary" onClick={close}>Cancel</button>
            <button className="nm-btn nm-btn-primary" form="deal-form" type="submit">
              {modal === 'add' ? 'Launch Deal' : 'Save Changes'}
            </button>
          </>
        }
      >
        <DealForm />
      </Modal>

      {/* Deal Detail Preview */}
      <Modal
        isOpen={modal === 'detail' && !!selected}
        onClose={close}
        title="Deal Preview"
        size="md"
        footer={
          <div className="d-flex justify-content-between w-100">
            <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => { close(); openEdit(selected); }}>
              <span className="material-symbols-outlined">edit</span> Edit Deal
            </button>
            <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={close}>Close</button>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selected.bannerImage && (
              <img src={selected.bannerImage} alt="banner" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--outline-variant)' }} />
            )}
            <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--surface-container-low)', borderRadius: 12 }}>
              <div style={{ fontSize: 44, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary-container)', lineHeight: 1 }}>
                {selected.discountType === 'percentage' ? `${selected.discountValue}%` : `$${selected.discountValue}`}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', marginTop: 4 }}>
                {selected.discountType === 'percentage' ? 'Percentage Off' : 'Flat Amount Off'}
              </div>
              <h3 style={{ margin: '12px 0 4px', fontSize: 18, fontWeight: 700 }}>{selected.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--secondary)' }}>{selected.description}</p>
            </div>

            {/* Products list */}
            <div>
              <p className="nm-label" style={{ marginBottom: 10 }}>Products Included ({selected.products.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ALL_PRODUCTS.filter(p => selected.products.includes(p.id)).map(p => {
                  const discounted = selected.discountType === 'percentage'
                    ? p.basePrice * (1 - selected.discountValue / 100)
                    : p.basePrice - selected.discountValue;
                  return (
                    <div key={p.id} className="d-flex align-items-center gap-3" style={{ padding: '10px 14px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>
                      <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{p.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-container)' }}>
                          ${Math.max(0, discounted).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--secondary)', textDecoration: 'line-through' }}>
                          ${p.basePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="row g-2">
              {[
                { label: 'Status',    value: <StatusBadge status={selected.isActive ? 'Active' : 'Inactive'} /> },
                { label: 'Starts At', value: selected.startsAt },
                { label: 'Ends At',   value: selected.endsAt   },
                { label: 'Products',  value: `${selected.products.length} product${selected.products.length !== 1 ? 's' : ''}` },
              ].map(m => (
                <div key={m.label} className="col-6">
                  <div style={{ padding: '10px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)' }}>{m.label}</p>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Deals;
