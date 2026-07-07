import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import {
  fetchAllProducts,
  addProduct,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  updateStatus as updateStatusAction,
  updateStock as updateStockAction,
} from '../features/product/productAction';
import {
  fetchAllCategories,
  fetchAllCategoriesList,
  createCategory as createCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
} from '../features/category/categoryAction';
import {
  fetchAllSubCategoriesList,
  createSubCategory as createSubCategoryAction,
  updateSubCategory as updateSubCategoryAction,
  toggleSubCategoryStatus as toggleSubCategoryStatusAction,
  deleteSubCategory as deleteSubCategoryAction,
} from '../features/subCategory/subCategoryActions';
import { uploadCategoryImageApi } from '../features/category/categoryApis';
import { uploadSubCategoryImageApi } from '../features/subCategory/subCategoryApi';
import { uploadProductImageApi } from '../features/product/productApis';


const BLANK = {
  name: '', description: '',
  category: '', subCategory: '',
  brand: '', color: '', size: '',
  basePrice: '', discountedPrice: '',
  stock: '',
  features: [],
  specifications: [],
  tags: [],
  image: '',
  featured: false,
  isActive: true,
  metaTitle: '', metaDescription: '',
};

/* ─── Image picker ────────────────────────────────────── */
// uploadFn: (file: File) => Promise<string>  — must return the final public URL
const ImagePicker = ({ value, onChange, uploadFn, size = 80, label = 'Image' }) => {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    e.target.value = ''; // reset so same file can be re-selected
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadFn(f);  // upload to S3, get back the public URL
      onChange(url);
    } catch (err) {
      setUploadError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="nm-label">{label}</label>
      <div className="d-flex align-items-center gap-3">
        {/* Preview box */}
        <div
          onClick={() => !uploading && ref.current.click()}
          style={{
            width: size, height: size, borderRadius: 8,
            cursor: uploading ? 'not-allowed' : 'pointer',
            border: `2px dashed ${uploadError ? 'var(--error)' : 'var(--outline-variant)'}`,
            background: 'var(--surface-container-low)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, position: 'relative',
          }}
          title={uploading ? 'Uploading…' : 'Click to upload'}
        >
          {uploading ? (
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 26,
              animation: 'spin 1s linear infinite' }}>progress_activity</span>
          ) : value ? (
            <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ color: 'var(--outline)', fontSize: 26 }}>add_photo_alternate</span>
          )}
        </div>

        {/* Buttons */}
        <div>
          <button type="button" className="nm-btn nm-btn-secondary nm-btn-sm"
            onClick={() => ref.current.click()} disabled={uploading}>
            <span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'upload'}</span>
            {uploading ? 'Uploading…' : value ? 'Change' : 'Upload'}
          </button>
          {value && !uploading && (
            <button type="button" className="nm-btn nm-btn-ghost nm-btn-sm ms-1" onClick={() => onChange('')}>
              <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 18 }}>delete</span>
            </button>
          )}
          {uploadError && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--error)' }}>{uploadError}</p>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"
        style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
};

/* ─── Collapsible Category Row ──────────────────────────────── */
const CategoryRow = ({ cat, subCats, onEditCat, onDeleteCat, onEditSub, onDeleteSub, onAddSub }) => {
  const [open, setOpen] = useState(false);
  const mySubs = subCats.filter(s => (s.category?._id || s.category) === (cat._id || cat.id));

  return (
    <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      {/* Header — click to collapse/expand */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ background: 'var(--surface-container-low)', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="d-flex align-items-center gap-3">
          {/* Expand chevron */}
          <span className="material-symbols-outlined" style={{
            fontSize: 18, color: 'var(--secondary)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>chevron_right</span>

          {/* Category image */}
          <div style={{ width: 38, height: 38, borderRadius: 7, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline-variant)' }}>
            {cat.image
              ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>folder</span>
                </div>
            }
          </div>

          <div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</span>
            <span className="nm-badge nm-badge-default ms-2">{mySubs.length} sub</span>
            {!cat.isActive && <span className="nm-badge nm-badge-danger ms-1">Inactive</span>}
          </div>
        </div>

        {/* Actions — stop propagation so click doesn't toggle */}
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button className="nm-action-btn" title="Add Sub-Category" onClick={() => onAddSub(cat)}>
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="nm-action-btn" title="Edit" onClick={() => onEditCat(cat)}>
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="nm-action-btn danger" title="Delete" onClick={() => onDeleteCat(cat._id || cat.id)}>
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>

      {/* Collapsible Sub-categories */}
      {open && (
        <div style={{ padding: '12px 16px', background: 'var(--surface-container-lowest)', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {mySubs.length === 0 && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)', fontStyle: 'italic' }}>
              No sub-categories yet. Click <strong>+</strong> to add one.
            </p>
          )}
          {mySubs.map(sub => (
            <div key={sub._id || sub.id} style={{
              border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 10, background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline-variant)' }}>
                {sub.image
                  ? <img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>folder_open</span>
                    </div>
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</span>
              {!sub.isActive && <span className="nm-badge nm-badge-danger" style={{ fontSize: 9 }}>off</span>}
              <button className="nm-action-btn" title="Edit" style={{ width: 24, height: 24 }} onClick={() => onEditSub(sub)}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
              </button>
              <button className="nm-action-btn danger" title="Delete" style={{ width: 24, height: 24 }} onClick={() => onDeleteSub(sub._id || sub.id)}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Product Form (multi-tab) ──────────────────────────────── */
const TABS = ['Basic Info', 'Details', 'Images', 'SEO'];

const ProductForm = ({ form, setForm, cats, subCats }) => {
  const [tab, setTab] = useState('Basic Info');
  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput]         = useState('');
  const [specInput, setSpecInput]       = useState({ label: '', value: '' });
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const filteredSubs = subCats.filter(s => (s.category?._id || s.category) === form.category);

  const addFeature = () => {
    if (!featureInput.trim()) return;
    set('features', [...(form.features || []), featureInput.trim()]);
    setFeatureInput('');
  };
  const removeFeature = (i) => set('features', form.features.filter((_, idx) => idx !== i));

  const addSpec = () => {
    if (!specInput.label.trim() || !specInput.value.trim()) return;
    set('specifications', [...(form.specifications || []), { ...specInput }]);
    setSpecInput({ label: '', value: '' });
  };
  const removeSpec = (i) => set('specifications', form.specifications.filter((_, idx) => idx !== i));

  const addTag = () => {
    if (!tagInput.trim()) return;
    set('tags', [...(form.tags || []), tagInput.trim().toLowerCase()]);
    setTagInput('');
  };
  const removeTag = (i) => set('tags', form.tags.filter((_, idx) => idx !== i));


  return (
    <div>
      {/* Tabs */}
      <div className="nm-tabs mb-4">
        {TABS.map(t => (
          <button key={t} className={`nm-tab-btn${tab === t ? ' active' : ''}`} type="button" onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {tab === 'Basic Info' && (
        <div className="row g-3">
          <div className="col-12">
            <label className="nm-label">Product Name *</label>
            <input className="nm-input" placeholder="e.g. Vapor Ultra Running Shoes" value={form.name}
              onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="col-12">
            <label className="nm-label">Description *</label>
            <textarea className="nm-input" rows={3} placeholder="Full product description…" value={form.description}
              onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} required />
          </div>
          <div className="col-md-6">
            <label className="nm-label">Category *</label>
            <select className="nm-select" value={form.category}
              onChange={e => { set('category', e.target.value); set('subCategory', ''); }} required>
              <option value="">Select category…</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="nm-label">Sub-Category <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
            <select className="nm-select" value={form.subCategory || ''} onChange={e => set('subCategory', e.target.value)}
              disabled={!form.category}>
              <option value="">None</option>
              {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="nm-label">Base Price ($) *</label>
            <input className="nm-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.basePrice}
              onChange={e => set('basePrice', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="nm-label">Discounted Price ($) <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
            <input className="nm-input" type="number" step="0.01" min="0" placeholder="Leave blank for no discount" value={form.discountedPrice || ''}
              onChange={e => set('discountedPrice', e.target.value || null)} />
          </div>
          <div className="col-md-4">
            <label className="nm-label">Stock *</label>
            <input className="nm-input" type="number" min="0" placeholder="0" value={form.stock}
              onChange={e => set('stock', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="nm-label">Brand</label>
            <input className="nm-input" placeholder="e.g. Nike, Apple…" value={form.brand || ''}
              onChange={e => set('brand', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="nm-label">Color</label>
            <input className="nm-input" placeholder="e.g. Black" value={form.color || ''}
              onChange={e => set('color', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="nm-label">Size</label>
            <input className="nm-input" placeholder="e.g. 10" value={form.size || ''}
              onChange={e => set('size', e.target.value)} />
          </div>

          {/* Toggles */}
          <div className="col-12 d-flex gap-4">
            <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span style={{ fontWeight: 600 }}>Active <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>(visible to customers)</span></span>
            </label>
            <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />
              <span style={{ fontWeight: 600 }}>Featured <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>(show on homepage)</span></span>
            </label>
          </div>
        </div>
      )}

      {/* ── Details ── */}
      {tab === 'Details' && (
        <div className="row g-4">
          {/* Features */}
          <div className="col-12">
            <label className="nm-label">Key Features</label>
            <div className="d-flex gap-2 mb-2">
              <input className="nm-input" placeholder="e.g. Ultra-light foam" value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <button type="button" className="nm-btn nm-btn-secondary" style={{ flexShrink: 0 }} onClick={addFeature}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(form.features || []).map((f, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', background: 'var(--secondary-container)',
                  borderRadius: 99, fontSize: 12, fontWeight: 600, color: 'var(--primary-container)'
                }}>
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>close</span>
                  </button>
                </span>
              ))}
              {(form.features || []).length === 0 && <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)', fontStyle: 'italic' }}>No features added yet.</p>}
            </div>
          </div>

          {/* Specifications */}
          <div className="col-12">
            <label className="nm-label">Specifications</label>
            <div className="d-flex gap-2 mb-2">
              <input className="nm-input" placeholder="Label (e.g. Weight)" value={specInput.label}
                onChange={e => setSpecInput(s => ({ ...s, label: e.target.value }))} style={{ flex: 1 }} />
              <input className="nm-input" placeholder="Value (e.g. 220g)" value={specInput.value}
                onChange={e => setSpecInput(s => ({ ...s, value: e.target.value }))} style={{ flex: 1 }} />
              <button type="button" className="nm-btn nm-btn-secondary" style={{ flexShrink: 0 }} onClick={addSpec}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 8, overflow: 'hidden' }}>
              {(form.specifications || []).length === 0
                ? <p style={{ margin: '14px 16px', fontSize: 12, color: 'var(--secondary)', fontStyle: 'italic' }}>No specifications added.</p>
                : (form.specifications || []).map((sp, i) => (
                  <div key={i} className="d-flex align-items-center" style={{
                    borderBottom: i < form.specifications.length - 1 ? '1px solid var(--outline-variant)' : 'none'
                  }}>
                    <span style={{ flex: 1, padding: '8px 14px', fontSize: 13, fontWeight: 600, background: 'var(--surface-container-low)' }}>{sp.label}</span>
                    <span style={{ flex: 2, padding: '8px 14px', fontSize: 13 }}>{sp.value}</span>
                    <button type="button" className="nm-action-btn danger me-2" onClick={() => removeSpec(i)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Tags */}
          <div className="col-12">
            <label className="nm-label">Tags</label>
            <div className="d-flex gap-2 mb-2">
              <input className="nm-input" placeholder="e.g. running, athletic" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <button type="button" className="nm-btn nm-btn-secondary" style={{ flexShrink: 0 }} onClick={addTag}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(form.tags || []).map((t, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', background: 'var(--surface-container)',
                  borderRadius: 99, fontSize: 12, color: 'var(--on-surface-variant)',
                  border: '1px solid var(--outline-variant)'
                }}>
                  #{t}
                  <button type="button" onClick={() => removeTag(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--secondary)' }}>close</span>
                  </button>
                </span>
              ))}
              {(form.tags || []).length === 0 && <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary)', fontStyle: 'italic' }}>No tags yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Image ── */}
      {tab === 'Images' && (
        <div>
          <ImagePicker
            value={form.image || ''}
            onChange={v => set('image', v)}
            uploadFn={async (file) => {
              const resp = await uploadProductImageApi(file);
              if (resp.status === 'success') return resp.url;
              throw new Error(resp.message);
            }}
            label="Product Image"
            size={120}
          />
        </div>
      )}

      {/* ── SEO ── */}
      {tab === 'SEO' && (
        <div className="row g-3">
          <div className="col-12">
            <div style={{ padding: '12px 16px', background: 'var(--surface-container-low)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginTop: 1 }}>info</span>
              <span>Slug is auto-generated from the product name. These fields help search engines index your product page.</span>
            </div>
          </div>
          <div className="col-12">
            <label className="nm-label">Meta Title</label>
            <input className="nm-input" placeholder="e.g. Buy Vapor Ultra Running Shoes | NextMart" value={form.metaTitle || ''}
              onChange={e => set('metaTitle', e.target.value)} />
            <span style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 3, display: 'block' }}>{(form.metaTitle || '').length}/60 chars recommended</span>
          </div>
          <div className="col-12">
            <label className="nm-label">Meta Description</label>
            <textarea className="nm-input" rows={3} placeholder="A brief description for search results (150–160 chars)…" value={form.metaDescription || ''}
              onChange={e => set('metaDescription', e.target.value)} style={{ resize: 'vertical' }} />
            <span style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 3, display: 'block' }}>{(form.metaDescription || '').length}/160 chars recommended</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Inline Stock Editor ────────────────────────────────────── */
// The backend updateStock uses $inc, so we send the delta (new - current).
const InlineStockEditor = ({ product, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(String(product.stock ?? 0));
  const [status, setStatus]   = useState(null); // null | 'saving' | 'saved' | 'error'
  const inputRef = useRef();

  // Sync if product stock changes externally
  React.useEffect(() => {
    if (!editing) setValue(String(product.stock ?? 0));
  }, [product.stock, editing]);

  const commit = async () => {
    const newStock  = parseInt(value, 10);
    const currStock = product.stock ?? 0;
    if (isNaN(newStock) || newStock < 0) {
      setValue(String(currStock));
      setEditing(false);
      return;
    }
    const delta = newStock - currStock;
    if (delta === 0) { setEditing(false); return; }
    if (delta < 0) {
      // Backend only allows positive increments — show quick error
      setStatus('error');
      setTimeout(() => { setStatus(null); setValue(String(currStock)); setEditing(false); }, 1800);
      return;
    }
    setStatus('saving');
    try {
      const res = await onUpdate(product._id || product.id, { quantity: delta });
      if (res) {
        setStatus('saved');
        setTimeout(() => setStatus(null), 1500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(null), 1800);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 1800);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setValue(String(product.stock ?? 0)); setEditing(false); }
  };

  const outOfStock = (product.stock ?? 0) === 0;

  if (status === 'saving') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--secondary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>hourglass_top</span>
        Saving…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--tertiary, #16a34a)', fontWeight: 700 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
        {product.stock}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--error)', fontWeight: 600 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span>
        Can only increase
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: 72, padding: '3px 8px', fontSize: 13, fontWeight: 700,
            border: '2px solid var(--primary-container)',
            borderRadius: 6, outline: 'none',
            background: 'var(--surface-container-low)',
            color: 'var(--on-surface)',
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Click to edit stock"
          style={{
            fontWeight: 700, fontSize: 13, cursor: 'text',
            padding: '3px 8px', borderRadius: 6,
            border: '1px dashed transparent',
            color: outOfStock ? 'var(--error)' : 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--outline)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
          {outOfStock && <span className="material-symbols-outlined" style={{ fontSize: 15 }}>warning</span>}
          {outOfStock ? 'Out of Stock' : product.stock}
        </span>
      )}
      {!editing && (
        <button
          className="nm-action-btn"
          title="Edit stock"
          style={{ width: 22, height: 22, flexShrink: 0 }}
          onClick={() => { setEditing(true); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
        </button>
      )}
    </div>
  );
};


const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector(state => state.productStore);

  const { categories: cats, allCategories: allCats, loading: catLoading, pagination: catPagination } = useSelector(state => state.categoryStore);
  const { allSubCategories: subCats } = useSelector(state => state.subCategoryStore);

  // Local search + page state (we drive pagination ourselves)
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [catPage, setCatPage] = useState(1);

  const [productModal, setProductModal] = useState(null); // null | 'add' | 'edit'
  const [editProduct, setEditProduct]   = useState(null);
  const [productForm, setProductForm]   = useState(BLANK);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null); // { type: 'success'|'error', msg }

  const [catModal, setCatModal]   = useState(null); // null | 'cat' | 'sub'
  const [editCat, setEditCat]     = useState(null);
  const [editSub, setEditSub]     = useState(null);
  const [defaultParent, setDefaultParent] = useState(null);
  const [catForm, setCatForm]   = useState({ name: '', image: '', isActive: true });
  const [subForm, setSubForm]   = useState({ name: '', image: '', category: '', isActive: true });

  /* ── Show toast ── */
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Fetch products + categories on mount ── */
  useEffect(() => {
    dispatch(fetchAllProducts(page, 10, search));
  }, [dispatch, page, search]);

  useEffect(() => {
    dispatch(fetchAllCategories(catPage, 5)); // 5 items per page for Category panel
  }, [dispatch, catPage]);

  useEffect(() => {
    dispatch(fetchAllCategoriesList()); // full list for selects and mapping
    dispatch(fetchAllSubCategoriesList()); // load all subcategories for rendering
  }, [dispatch]);

  /* ── Product CRUD ── */
  const openAddProduct  = () => { setProductForm({ ...BLANK }); setEditProduct(null); setProductModal('add'); };
  const openEditProduct = (p) => { setEditProduct(p); setProductForm({ ...p }); setProductModal('edit'); };
  const closeProductModal = () => { setProductModal(null); setEditProduct(null); setSaving(false); };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...productForm,
      basePrice: parseFloat(productForm.basePrice) || 0,
      discountedPrice: productForm.discountedPrice ? parseFloat(productForm.discountedPrice) : null,
      stock: parseInt(productForm.stock, 10) || 0,
      slug: productForm.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    };
    try {
      let res;
      if (productModal === 'add') {
        res = await dispatch(addProduct(data));
      } else {
        res = await dispatch(updateProductAction(editProduct._id || editProduct.id, data));
      }
      if (res) {
        showToast('success', productModal === 'add' ? 'Product added!' : 'Product updated!');
        closeProductModal();
      }
    } catch {
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await dispatch(deleteProductAction(id));
      if (res) showToast('success', 'Product deleted.');
    } catch {
      showToast('error', 'Could not delete product.');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      const res = await dispatch(updateStatusAction(product._id || product.id, { isActive: newStatus }));
      if (res) showToast('success', `Product ${newStatus ? 'activated' : 'deactivated'}.`);
    } catch {
      showToast('error', 'Could not update status.');
    }
  };

  /* ── Category CRUD ── */
  const openAddCat  = () => { setCatForm({ name: '', slug: '', image: '', isActive: true }); setEditCat(null); setCatModal('cat'); };
  const openEditCat = (c) => {
    setCatForm({ name: c.name, slug: c.slug || '', image: c.image, isActive: c.isActive });
    setEditCat(c);
    setCatModal('cat');
  };

  const saveCat = async (e) => {
    e.preventDefault();
    const data = {
      ...catForm,
      slug: catForm.slug || catForm.name.toLowerCase().trim().replace(/\s+/g, '-'),
    };
    try {
      let res;
      if (editCat) {
        res = await dispatch(updateCategoryAction(editCat._id || editCat.id, data));
        if (res) showToast('success', 'Category updated!');
      } else {
        res = await dispatch(createCategoryAction(data));
        if (res) showToast('success', 'Category created!');
      }
      if (res) setCatModal(null);
    } catch {
      showToast('error', 'Could not save category.');
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category? (It will be deactivated)')) return;
    try {
      const res = await dispatch(deleteCategoryAction(id));
      if (res) showToast('success', 'Category deactivated.');
    } catch {
      showToast('error', 'Could not delete category.');
    }
  };

  /* ── Sub-category CRUD ── */
  const openAddSub  = (parentCat) => {
    setSubForm({ name: '', image: '', category: parentCat?._id || parentCat?.id || allCats[0]?._id || allCats[0]?.id || '', isActive: true });
    setDefaultParent(parentCat);
    setEditSub(null);
    setCatModal('sub');
  };
  const openEditSub = (s) => { setSubForm({ name: s.name, image: s.image, category: s.category?._id || s.category, isActive: s.isActive }); setEditSub(s); setCatModal('sub'); };
  const saveSub = async (e) => {
    e.preventDefault();
    const data = {
      ...subForm,
      slug: subForm.name.toLowerCase().trim().replace(/\s+/g, '-'),
    };
    try {
      let res;
      if (editSub) {
        res = await dispatch(updateSubCategoryAction(editSub._id || editSub.id, data));
        if (res) showToast('success', 'Sub-category updated!');
      } else {
        res = await dispatch(createSubCategoryAction(data));
        if (res) showToast('success', 'Sub-category created!');
      }
      if (res) setCatModal(null);
    } catch {
      showToast('error', 'Could not save sub-category.');
    }
  };
  const deleteSub = async (id) => {
    if (!window.confirm('Delete this sub-category?')) return;
    try {
      const res = await dispatch(deleteSubCategoryAction(id));
      if (res) showToast('success', 'Sub-category deleted.');
    } catch {
      showToast('error', 'Could not delete sub-category.');
    }
  };

  /* ── Table columns ── */
  const COLS = [
    {
      key: 'name', label: 'Product',
      render: r => {
        const cat = allCats.find(c => (c._id || c.id) === r.category);
        const sub = subCats.find(s => (s._id || s.id) === r.subCategory);
        return (
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)'
            }}>
              {r.image
                ? <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 24 }}>inventory_2</span>
                  </div>
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>
                {cat?.name}{sub ? ` › ${sub.name}` : ''}
                {r.brand ? ` · ${r.brand}` : ''}
              </div>
              <div className="d-flex gap-1 mt-1 flex-wrap">
                {r.featured && <span className="nm-badge nm-badge-purple">⭐ Featured</span>}
                {r.tags?.slice(0, 2).map(t => (
                  <span key={t} className="nm-badge nm-badge-default" style={{ fontSize: 9 }}>#{t}</span>
                ))}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'basePrice', label: 'Price',
      render: r => (
        <div>
          {r.discountedPrice
            ? <>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-container)' }}>${r.discountedPrice.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--secondary)', textDecoration: 'line-through' }}>${r.basePrice.toFixed(2)}</div>
              </>
            : <strong>${r.basePrice.toFixed(2)}</strong>
          }
        </div>
      )
    },
    {
      key: 'stock', label: 'Stock',
      render: r => (
        <InlineStockEditor
          product={r}
          onUpdate={(id, data) => dispatch(updateStockAction(id, data))}
        />
      )
    },
    {
      key: 'rating', label: 'Rating',
      render: r => (
        <div className="d-flex align-items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#FACC15', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{(r.rating ?? 0).toFixed(1)}</span>
          <span style={{ fontSize: 12, color: 'var(--secondary)' }}>({r.reviewCount ?? 0})</span>
        </div>
      )
    },
    {
      key: 'isActive', label: 'Status',
      render: r => (
        <button
          className="nm-btn nm-btn-ghost nm-btn-sm"
          style={{ padding: 0, background: 'none', border: 'none' }}
          title={r.isActive ? 'Click to deactivate' : 'Click to activate'}
          onClick={() => handleToggleStatus(r)}
        >
          <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />
        </button>
      )
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: r => (
        <div className="d-flex gap-1">
          <button className="nm-action-btn" title="Edit product" onClick={() => openEditProduct(r)}>
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="nm-action-btn danger" title="Delete product" onClick={() => handleDeleteProduct(r._id || r.id)}>
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="row g-4" style={{ position: 'relative' }}>

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

      {/* ── LEFT: Product Table ──────────────────────────────── */}
      <div className="col-12 col-xl-7">
        <div className="nm-card nm-card-padding">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="nm-page-section-title">Product Catalogue</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--secondary)' }}>
                {loading ? 'Loading…' : `${pagination.totalItems} products`}
              </p>
            </div>
            <button className="nm-btn nm-btn-primary" onClick={openAddProduct} disabled={loading}>
              <span className="material-symbols-outlined">add</span>
              Add Product
            </button>
          </div>

          {/* Server-side search */}
          <div className="mb-3" style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--secondary)', fontSize: 20, pointerEvents: 'none',
            }}>search</span>
            <input
              className="nm-input"
              style={{ paddingLeft: 40 }}
              placeholder="Search products, brands…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {loading && (
              <span className="material-symbols-outlined" style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--secondary)', fontSize: 18,
              }}>hourglass_top</span>
            )}
          </div>

          <DataTable
            columns={COLS}
            data={products}
            searchFields={[]}
            placeholder=""
            pageSize={pagination.limit || 10}
          />

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between mt-3 pt-3"
              style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--secondary)' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                  Prev
                </button>
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || loading}
                >
                  Next
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Category Panel ────────────────────────────── */}
      <div className="col-12 col-xl-5">
        <div className="nm-card nm-card-padding">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="nm-page-section-title">Category Structure</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--secondary)' }}>Click a row to expand sub-categories</p>
            </div>
            <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={openAddCat}>
              <span className="material-symbols-outlined">create_new_folder</span>
              Add Category
            </button>
          </div>

          {cats.map(cat => (
            <CategoryRow
              key={cat._id || cat.id}
              cat={cat}
              subCats={subCats}
              onEditCat={openEditCat}
              onDeleteCat={deleteCat}
              onEditSub={openEditSub}
              onDeleteSub={deleteSub}
              onAddSub={openAddSub}
            />
          ))}

          {cats.length === 0 && (
            <div className="nm-empty-state"><span className="material-symbols-outlined">folder_off</span><p>No categories yet.</p></div>
          )}

          {/* Category Pagination controls */}
          {catPagination?.totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between mt-3 pt-3"
              style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--secondary)' }}>
                Page {catPagination.currentPage} of {catPagination.totalPages}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  onClick={() => setCatPage(p => Math.max(1, p - 1))}
                  disabled={catPage <= 1 || catLoading}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                  Prev
                </button>
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  onClick={() => setCatPage(p => Math.min(catPagination.totalPages, p + 1))}
                  disabled={catPage >= catPagination.totalPages || catLoading}
                >
                  Next
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Product Modal ── */}
      <Modal
        isOpen={!!productModal}
        onClose={closeProductModal}
        title={productModal === 'add' ? 'Add New Product' : `Edit — ${editProduct?.name}`}
        size="lg"
        footer={
          <>
            <button className="nm-btn nm-btn-secondary" onClick={closeProductModal} disabled={saving}>Cancel</button>
            <button className="nm-btn nm-btn-primary" form="product-form" type="submit" disabled={saving}>
              {saving
                ? <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>hourglass_top</span> Saving…</>
                : productModal === 'add' ? 'Save Product' : 'Update Product'
              }
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={saveProduct}>
          <ProductForm form={productForm} setForm={setProductForm} cats={allCats} subCats={subCats} />
        </form>
      </Modal>

      {/* ── Add/Edit Category Modal ── */}
      <Modal
        isOpen={catModal === 'cat'}
        onClose={() => setCatModal(null)}
        title={editCat ? 'Edit Category' : 'Add Category'}
        size="sm"
        footer={
          <>
            <button className="nm-btn nm-btn-secondary" onClick={() => setCatModal(null)}>Cancel</button>
            <button className="nm-btn nm-btn-primary" form="cat-form" type="submit">
              {editCat ? 'Save' : 'Create'}
            </button>
          </>
        }
      >
        <form id="cat-form" onSubmit={saveCat} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="nm-label">Category Name *</label>
            <input className="nm-input" placeholder="e.g. Footwear" value={catForm.name}
              onChange={e => {
                const name = e.target.value;
                setCatForm(f => ({
                  ...f,
                  name,
                  // auto-generate slug only if user hasn't manually edited it
                  slug: f._slugEdited ? f.slug : name.toLowerCase().trim().replace(/\s+/g, '-'),
                }));
              }} required />
          </div>
          <div>
            <label className="nm-label">Slug *</label>
            <input className="nm-input" placeholder="e.g. footwear" value={catForm.slug || ''}
              onChange={e => setCatForm(f => ({ ...f, slug: e.target.value, _slugEdited: true }))}
              required />
            <span style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 3, display: 'block' }}>
              Auto-generated from name. Edit if needed.
            </span>
          </div>
          <ImagePicker
            value={catForm.image}
            onChange={v => setCatForm(f => ({ ...f, image: v }))}
            uploadFn={async (file) => {
              const resp = await uploadCategoryImageApi(file);
              if (resp.status === 'success') return resp.url;
              throw new Error(resp.message);
            }}
            label="Category Image"
            size={72}
          />
          <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={!!catForm.isActive} onChange={e => setCatForm(f => ({ ...f, isActive: e.target.checked }))} />
            <span style={{ fontWeight: 600 }}>Active</span>
          </label>
        </form>
      </Modal>

      {/* ── Add/Edit Sub-category Modal ── */}
      <Modal
        isOpen={catModal === 'sub'}
        onClose={() => setCatModal(null)}
        title={editSub ? 'Edit Sub-Category' : 'Add Sub-Category'}
        size="sm"
        footer={
          <>
            <button className="nm-btn nm-btn-secondary" onClick={() => setCatModal(null)}>Cancel</button>
            <button className="nm-btn nm-btn-primary" form="sub-form" type="submit">
              {editSub ? 'Save' : 'Create'}
            </button>
          </>
        }
      >
        <form id="sub-form" onSubmit={saveSub} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="nm-label">Parent Category *</label>
            <select className="nm-select" value={subForm.category}
              onChange={e => setSubForm(f => ({ ...f, category: e.target.value }))} required>
              <option value="">Select…</option>
              {allCats.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="nm-label">Sub-Category Name *</label>
            <input className="nm-input" placeholder="e.g. Running" value={subForm.name}
              onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <ImagePicker
            value={subForm.image}
            onChange={v => setSubForm(f => ({ ...f, image: v }))}
            uploadFn={async (file) => {
              const resp = await uploadSubCategoryImageApi(file);
              if (resp.status === 'success') return resp.url;
              throw new Error(resp.message);
            }}
            label="Sub-Category Image"
            size={60}
          />
          <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={subForm.isActive} onChange={e => setSubForm(f => ({ ...f, isActive: e.target.checked }))} />
            <span style={{ fontWeight: 600 }}>Active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
