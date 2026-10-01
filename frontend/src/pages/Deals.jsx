import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllDeals, loadPickerData,
  createDeal, updateDeal, toggleDealStatus, deleteDeal,
} from '../features/deals/dealsAction';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import MetricCard from '../components/ui/MetricCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/* ─────────────────────────────────────────────────────────────────
  Deals Page — wired to Redux
  Admin can create a deal targeting:
    • Individual products
    • Whole categories (all products in that category get the discount)
    • Or both at the same time
──────────────────────────────────────────────────────────────────── */

const BLANK = {
  title: '',
  description: '',
  bannerImage: '',
  products: [],
  categories: [],
  discountType: 'percentage',
  discountValue: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

// Converts a backend Deal object to form state
const dealToForm = (d) => ({
  title:         d.title         || '',
  description:   d.description   || '',
  bannerImage:   d.bannerImage   || '',
  products:      (d.products   || []).map((p) => (typeof p === 'object' ? p._id : p)),
  categories:    (d.categories || []).map((c) => (typeof c === 'object' ? c._id : c)),
  discountType:  d.discountType  || 'percentage',
  discountValue: d.discountValue ?? '',
  startsAt:      d.startsAt ? d.startsAt.slice(0, 10) : '',
  endsAt:        d.endsAt   ? d.endsAt.slice(0,   10) : '',
  isActive:      d.isActive ?? true,
});

/* ── Multi-item checkbox picker ─────────────────────────────────── */
const ItemPicker = ({ items, selected, onChange, nameKey = 'name', imageKey = 'images', subKey = null }) => {
  const [search, setSearch] = useState('');
  const filtered = items.filter((item) =>
    (item[nameKey] || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="nm-input-group" style={{ marginBottom: 4 }}>
        <span className="material-symbols-outlined">search</span>
        <input
          className="nm-input"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)' }}>No items found.</p>
        )}
        {filtered.map((item) => {
          const id      = item._id;
          const checked = selected.includes(id);
          const thumb   = Array.isArray(item[imageKey]) ? item[imageKey][0] : item[imageKey];
          const sub     = subKey ? item[subKey] : null;
          return (
            <label key={id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${checked ? 'var(--primary-container)' : 'var(--outline-variant)'}`,
              background: checked ? 'rgba(19,27,200,0.04)' : 'var(--surface-container-lowest)',
              transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={checked}
                style={{ width: 16, height: 16, flexShrink: 0 }}
                onChange={() => toggle(id)}
              />
              {thumb ? (
                <img
                  src={thumb}
                  alt={item[nameKey]}
                  style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--outline-variant)' }}
                />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: 6, flexShrink: 0, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--secondary)' }}>inventory_2</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item[nameKey]}
                </div>
                {sub && (
                  <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{sub}</div>
                )}
              </div>
              {checked && (
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 18 }}>check_circle</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

/* ── Banner image picker ────────────────────────────────────────── */
const BannerPicker = ({ value, onChange }) => {
  const ref = useRef();
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) onChange(URL.createObjectURL(f));
    e.target.value = '';
  };
  return (
    <div>
      <label className="nm-label">
        Banner Image <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
      </label>
      <div
        onClick={() => ref.current.click()}
        style={{
          width: '100%', height: 120, borderRadius: 10, cursor: 'pointer',
          border: '2px dashed var(--outline-variant)',
          background: 'var(--surface-container-low)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {value
          ? <img src={value} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_photo_alternate</span>
              <span style={{ fontSize: 12 }}>Click to upload banner (600×200 recommended)</span>
            </div>
          )
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

/* ── Main Deals page ─────────────────────────────────────────────── */
const Deals = () => {
  const dispatch = useDispatch();
  const { deals, loading, stats, allProducts, allCategories } = useSelector((s) => s.dealsStore);

  const [modal,   setModal]   = useState(null); // 'add' | 'edit' | 'detail'
  const [editRow, setEditRow] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK);

  // 'products' or 'categories' — which picker mode is active in the form
  const [pickerMode, setPickerMode] = useState('products');

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Load deals and picker data on mount
  useEffect(() => {
    dispatch(fetchAllDeals());
    dispatch(loadPickerData());
  }, [dispatch]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const openAdd = () => {
    setForm({ ...BLANK });
    setPickerMode('products');
    setModal('add');
  };

  const openEdit = (d) => {
    setEditRow(d);
    setForm(dealToForm(d));
    setPickerMode('products');
    setModal('edit');
  };

  const openDetail = (d) => { setSelected(d); setModal('detail'); };
  const close = () => { setModal(null); setEditRow(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.products.length === 0 && form.categories.length === 0) {
      alert('Please select at least one product or one category.');
      return;
    }
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
    };
    setSaving(true);
    let ok;
    if (modal === 'add') {
      ok = await dispatch(createDeal(payload));
    } else {
      ok = await dispatch(updateDeal(editRow._id, payload));
    }
    setSaving(false);
    if (ok) close();
  };

  const handleToggle = async (deal) => {
    await dispatch(toggleDealStatus(deal._id, !deal.isActive));
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm('Delete this deal?')) return;
    setDeleting(dealId);
    await dispatch(deleteDeal(dealId));
    setDeleting(null);
  };

  /* ── Table columns ─── */
  const COLS = [
    {
      key: 'title', label: 'Deal',
      render: (r) => (
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
            {r.bannerImage
              ? <img src={r.bannerImage} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 20 }}>sell</span>
                </div>
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'scope', label: 'Applies To', sortable: false,
      render: (r) => {
        const prods = r.products   || [];
        const cats  = r.categories || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cats.length > 0 && (
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--secondary)' }}>category</span>
                {cats.map((c) => (
                  <span key={c._id || c} className="nm-badge" style={{ fontSize: 10 }}>
                    {c.name || 'Category'}
                  </span>
                ))}
              </div>
            )}
            {prods.length > 0 && (
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--secondary)' }}>inventory_2</span>
                <span style={{ fontSize: 12, color: 'var(--secondary)' }}>{prods.length} product{prods.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'discountValue', label: 'Discount',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16, color: 'var(--primary-container)' }}>
          {r.discountType === 'percentage' ? `${r.discountValue}%` : `$${r.discountValue}`}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--secondary)', marginLeft: 4 }}>
            {r.discountType === 'percentage' ? 'OFF' : 'FLAT'}
          </span>
        </span>
      ),
    },
    {
      key: 'startsAt', label: 'Duration', sortable: false,
      render: (r) => (
        <div style={{ fontSize: 12 }}>
          <div><strong>{r.startsAt ? new Date(r.startsAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong></div>
          <div style={{ color: 'var(--outline)', margin: '2px 0' }}>→</div>
          <div><strong>{r.endsAt ? new Date(r.endsAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong></div>
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Status',
      render: (r) => <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="nm-action-btn" title="Preview" onClick={() => openDetail(r)}>
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button className="nm-action-btn" title="Edit" onClick={() => openEdit(r)}>
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="nm-action-btn" title={r.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(r)}>
            <span className="material-symbols-outlined">{r.isActive ? 'pause_circle' : 'play_circle'}</span>
          </button>
          <button
            className="nm-action-btn danger"
            title="Delete"
            disabled={deleting === r._id}
            onClick={() => handleDelete(r._id)}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ),
    },
  ];

  /* ── Deal form (used in Add + Edit modal) ─── */
  const DealForm = () => (
    <form id="deal-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="row g-3">
        <div className="col-12">
          <label className="nm-label">Deal Title *</label>
          <input className="nm-input" placeholder="e.g. Runner's Bundle Deal" value={form.title}
            onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="col-12">
          <label className="nm-label">Description</label>
          <textarea className="nm-input" rows={2} placeholder="Brief description…" value={form.description}
            onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <BannerPicker value={form.bannerImage} onChange={(v) => set('bannerImage', v)} />

      {/* ── Picker mode toggle ── */}
      <div>
        <label className="nm-label" style={{ marginBottom: 8 }}>Apply Deal To *</label>
        <div className="nm-tabs mb-3">
          <button
            type="button"
            className={`nm-tab-btn${pickerMode === 'products' ? ' active' : ''}`}
            onClick={() => setPickerMode('products')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>inventory_2</span>
            Products
            {form.products.length > 0 && (
              <span className="ms-2 nm-badge nm-badge-info">{form.products.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`nm-tab-btn${pickerMode === 'categories' ? ' active' : ''}`}
            onClick={() => setPickerMode('categories')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>category</span>
            Categories
            {form.categories.length > 0 && (
              <span className="ms-2 nm-badge nm-badge-info">{form.categories.length}</span>
            )}
          </button>
        </div>

        {pickerMode === 'products' ? (
          <>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--secondary)' }}>
              Select individual products. The discount applies to their base price.
            </p>
            <ItemPicker
              items={allProducts}
              selected={form.products}
              onChange={(v) => set('products', v)}
              nameKey="name"
              imageKey="images"
              subKey={null}
            />
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--secondary)' }}>
              Select whole categories. <strong>Every product in the selected categories</strong> will get the discount.
            </p>
            <ItemPicker
              items={allCategories}
              selected={form.categories}
              onChange={(v) => set('categories', v)}
              nameKey="name"
              imageKey="image"
              subKey="slug"
            />
          </>
        )}

        {form.products.length === 0 && form.categories.length === 0 && (
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--error)' }}>
            Select at least one product or one category.
          </p>
        )}
      </div>

      {/* Discount + dates */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="nm-label">Discount Type *</label>
          <select className="nm-select" value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
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
              value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} required />
          </div>
        </div>
        <div className="col-md-6">
          <label className="nm-label">Starts At *</label>
          <input type="date" className="nm-input" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="nm-label">Ends At *</label>
          <input type="date" className="nm-input" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} required />
        </div>
        <div className="col-12">
          <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
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
          <MetricCard label="Total Deals"       value={stats.totalDeals}     sub="All time" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Active Deals"      value={stats.activeDeals}    sub="Currently live" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Products on Deal"  value={stats.productsOnDeal} sub="Unique SKUs covered" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Inactive Deals"    value={stats.inactiveDeals}  sub="Paused / Expired" alert={stats.inactiveDeals > 0} />
        </div>
      </div>

      {/* Table */}
      <div className="nm-card nm-card-padding">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="nm-page-section-title">Deals &amp; Promotions</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--secondary)' }}>
              Apply discounts to individual products or entire categories.
            </p>
          </div>
          <button className="nm-btn nm-btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined">add</span> Create Deal
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={COLS}
            data={deals}
            searchFields={['title', 'description']}
            placeholder="Search deals…"
            pageSize={8}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal === 'add' || modal === 'edit'}
        onClose={close}
        title={modal === 'add' ? 'Create New Deal' : `Edit — ${editRow?.title}`}
        size="lg"
        footer={
          <>
            <button className="nm-btn nm-btn-secondary" onClick={close} disabled={saving}>Cancel</button>
            <button className="nm-btn nm-btn-primary" form="deal-form" type="submit" disabled={saving}>
              <span className="material-symbols-outlined">{saving ? 'hourglass_top' : 'check'}</span>
              {saving ? 'Saving…' : (modal === 'add' ? 'Launch Deal' : 'Save Changes')}
            </button>
          </>
        }
      >
        <DealForm />
      </Modal>

      {/* Detail Preview Modal */}
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

            {/* Discount hero */}
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

            {/* Categories included */}
            {selected.categories?.length > 0 && (
              <div>
                <p className="nm-label" style={{ marginBottom: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>category</span>
                  Categories ({selected.categories.length})
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {selected.categories.map((cat) => (
                    <div key={cat._id || cat} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>
                      {cat.image && (
                        <img src={cat.image} alt={cat.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                      )}
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name || '—'}</span>
                      <span style={{ fontSize: 11, color: 'var(--secondary)' }}>All products</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products included */}
            {selected.products?.length > 0 && (
              <div>
                <p className="nm-label" style={{ marginBottom: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>inventory_2</span>
                  Products ({selected.products.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selected.products.map((p) => {
                    const basePrice = p.basePrice || 0;
                    const discounted = selected.discountType === 'percentage'
                      ? basePrice * (1 - selected.discountValue / 100)
                      : basePrice - selected.discountValue;
                    return (
                      <div key={p._id || p} className="d-flex align-items-center gap-3" style={{ padding: '10px 14px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name || '—'}</div>
                        </div>
                        {basePrice > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-container)' }}>
                              ${Math.max(0, discounted).toFixed(2)}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--secondary)', textDecoration: 'line-through' }}>
                              ${basePrice.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta grid */}
            <div className="row g-2">
              {[
                { label: 'Status',     value: <StatusBadge status={selected.isActive ? 'Active' : 'Inactive'} /> },
                { label: 'Starts At',  value: selected.startsAt ? new Date(selected.startsAt).toLocaleDateString('en-AU') : '—' },
                { label: 'Ends At',    value: selected.endsAt   ? new Date(selected.endsAt).toLocaleDateString('en-AU')   : '—' },
                { label: 'Scope',      value: `${selected.products?.length || 0} products · ${selected.categories?.length || 0} categories` },
              ].map((m) => (
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
