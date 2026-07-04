import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import {
  fetchDashboardStats,
  fetchDashboardRevenue,
  fetchDashboardBestSelling,
  fetchDashboardLatestOrders,
} from '../features/dashboard/dashboardAction';

// ─── Sparkline built from real revenue data ───────────────────────────────────
const RevenueSparkline = ({ data = [] }) => {
  if (!data.length) return null;
  const values = data.map(d => d.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const W = 100, H = 40;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = points.join(' ');
  const area = `${points[0].split(',')[0]},${H} ` + polyline + ` ${points[points.length - 1].split(',')[0]},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-100 h-100">
      <polygon points={area} fill="rgba(34,197,94,0.12)" />
      <polyline points={polyline} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
};

const BlueSparkline = () => (
  <svg viewBox="0 0 100 40" className="w-100 h-100">
    <path d="M0,30 T25,25 T50,20 T75,15 T100,8" fill="none" stroke="#3b82f6" strokeWidth="2" />
    <path d="M0,30 T25,25 T50,20 T75,15 T100,8 V40 H0 Z" fill="rgba(59,130,246,0.1)" />
  </svg>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ h = 20, w = '100%', radius = 8, mb = 0 }) => (
  <div style={{
    height: h, width: w, borderRadius: radius,
    background: 'var(--surface-container)',
    marginBottom: mb,
    animation: 'nm-skeleton-pulse 1.5s ease-in-out infinite',
  }} />
);

// ─── Revenue chart from real data ─────────────────────────────────────────────
const RevenueChart = ({ data = [] }) => {
  if (!data.length) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: 14 }}>
      No revenue data available
    </div>
  );
  const W = 1000, H = 260;
  const values = data.map(d => d.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.revenue - min) / range) * (H - 30) - 10;
    return { x, y, d };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${W},${H} L0,${H} Z`;

  // Pick evenly spaced date labels (max 6)
  const step = Math.max(1, Math.floor(data.length / 5));
  const labels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div style={{ height: 280, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--primary-container)', stopOpacity: 0.18 }} />
            <stop offset="100%" style={{ stopColor: 'var(--primary-container)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="var(--outline-variant)" strokeWidth="1" opacity="0.5" />
        ))}
        <path d={areaPath} fill="url(#revGrad)" />
        <path d={linePath} fill="none" stroke="var(--primary-container)" strokeWidth="3" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary-container)" opacity="0.7" />
        ))}
      </svg>
      <div className="d-flex justify-content-between mt-2" style={{ fontSize: 10, color: 'var(--secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {labels.map(d => <span key={d.date}>{d.date}</span>)}
      </div>
    </div>
  );
};

// ─── Table column defs ────────────────────────────────────────────────────────
const ORDER_COLS = [
  {
    key: 'orderNumber', label: 'Order ID',
    render: r => <span className="nm-text-code">#{r.orderNumber}</span>
  },
  {
    key: 'customer', label: 'Customer',
    render: r => (
      <div className="d-flex align-items-center gap-3">
        <span className="nm-avatar-initials">{r.initials}</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.customer}</div>
          <div style={{ fontSize: 11, color: 'var(--secondary)' }}>{r.email}</div>
        </div>
      </div>
    )
  },
  { key: 'amount', label: 'Amount', render: r => <strong>{r.amount}</strong> },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'paymentStatus', label: 'Payment', render: r => <StatusBadge status={r.paymentStatus} /> },
];

const PRODUCT_COLS = [
  {
    key: 'name', label: 'Product',
    render: r => (
      <div className="d-flex align-items-center gap-3">
        {r.image?.[0] ? (
          <img src={r.image[0]} alt={r.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--outline-variant)' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>inventory_2</span>
          </div>
        )}
        <span style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</span>
      </div>
    )
  },
  { key: 'unitsSold', label: 'Units Sold', render: r => <strong>{r.unitsSold}</strong> },
  { key: 'revenue', label: 'Revenue', render: r => <span style={{ color: 'var(--primary-container)', fontWeight: 600 }}>${r.revenue?.toLocaleString()}</span> },
  {
    key: 'stock', label: 'Stock',
    render: r => (
      <span style={{ color: r.stock < 10 ? 'var(--error)' : 'var(--secondary)', fontWeight: r.stock < 10 ? 700 : 400 }}>
        {r.stock ?? '—'}
      </span>
    )
  },
];

// ─── Date range presets ──────────────────────────────────────────────────────
const DATE_PRESETS = [
  { label: 'Last 7 Days',   days: 7,   period: 'daily'   },
  { label: 'Last 30 Days',  days: 30,  period: 'daily'   },
  { label: 'Last 90 Days',  days: 90,  period: 'weekly'  },
  { label: 'Last 6 Months', days: 180, period: 'weekly'  },
  { label: 'Last 1 Year',   days: 365, period: 'monthly' },
];

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, revenue, bestSelling, latestOrders, loading, error } = useSelector(state => state.dashboardStore);

  const [selectedPreset, setSelectedPreset] = useState(DATE_PRESETS[1]);
  const [pickerOpen, setPickerOpen]         = useState(false);
  const [orderSearch, setOrderSearch]       = useState('');
  const [productSearch, setProductSearch]   = useState('');
  const [exporting, setExporting]           = useState(false);

  // Fetch everything based on the selected preset
  const fetchAll = (preset) => {
    dispatch(fetchDashboardStats(preset.days));
    dispatch(fetchDashboardRevenue(preset.period, preset.days));
    dispatch(fetchDashboardBestSelling(5));
    dispatch(fetchDashboardLatestOrders(8));
  };

  useEffect(() => {
    fetchAll(selectedPreset);
  }, [dispatch]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setPickerOpen(false);
    fetchAll(preset);
  };

  // ── Derived metric values ──────────────────────────────────────────────────
  const totalRevenue = stats?.totalRevenue != null
    ? `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  const revTrend    = stats?.revenueTrend;
  const revTrendDir = revTrend == null ? 'flat' : revTrend >= 0 ? 'up' : 'down';

  // ── Excel export ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toLocaleDateString('en-AU').replace(/\//g, '-');
      const rangeLabel = selectedPreset.label.replace(/\s+/g, '_');

      // Sheet 1 — Summary / KPI
      const summaryData = [
        ['NextMart Admin — Dashboard Report'],
        [`Period: ${selectedPreset.label}`, `Generated: ${new Date().toLocaleString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Revenue', stats?.totalRevenue != null ? `$${stats.totalRevenue.toFixed(2)}` : 'N/A'],
        ['Total Orders', stats?.totalOrders ?? 'N/A'],
        ['Active Users', stats?.activeUsers ?? 'N/A'],
        ['Pending Reviews', stats?.pendingReviews ?? 'N/A'],
        ['Revenue Trend (%)', stats?.revenueTrend != null ? `${stats.revenueTrend > 0 ? '+' : ''}${stats.revenueTrend}%` : 'N/A'],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 22 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // Sheet 2 — Revenue Over Time
      if (revenue?.length) {
        const revenueRows = [
          ['Date', 'Revenue ($)', 'Orders'],
          ...revenue.map(r => [r.date, r.revenue, r.orders]),
        ];
        const wsRevenue = XLSX.utils.aoa_to_sheet(revenueRows);
        wsRevenue['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, wsRevenue, 'Revenue Over Time');
      }

      // Sheet 3 — Best Selling Products
      if (bestSelling?.length) {
        const productRows = [
          ['Rank', 'Product Name', 'Units Sold', 'Revenue ($)', 'Stock'],
          ...bestSelling.map((p, i) => [
            i + 1,
            p.name,
            p.unitsSold,
            p.revenue,
            p.stock ?? 'N/A',
          ]),
        ];
        const wsProducts = XLSX.utils.aoa_to_sheet(productRows);
        wsProducts['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 12 }, { wch: 14 }, { wch: 8 }];
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Best Selling Products');
      }

      // Sheet 4 — Latest Orders
      if (latestOrders?.length) {
        const orderRows = [
          ['Order #', 'Customer', 'Email', 'Amount', 'Order Status', 'Payment Status', 'Date'],
          ...latestOrders.map(o => [
            o.orderNumber,
            o.customer,
            o.email,
            o.amount,
            o.status,
            o.paymentStatus,
            o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
          ]),
        ];
        const wsOrders = XLSX.utils.aoa_to_sheet(orderRows);
        wsOrders['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsOrders, 'Latest Orders');
      }

      XLSX.writeFile(wb, `NextMart_Dashboard_${rangeLabel}_${dateStr}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [stats, revenue, bestSelling, latestOrders, selectedPreset]);


  const filteredOrders = (latestOrders || []).filter(o => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      String(o.orderNumber ?? '').toLowerCase().includes(q) ||
      String(o.customer   ?? '').toLowerCase().includes(q) ||
      String(o.email      ?? '').toLowerCase().includes(q) ||
      String(o.status     ?? '').toLowerCase().includes(q)
    );
  });

  const filteredProducts = (bestSelling || []).filter(p => {
    if (!productSearch) return true;
    return String(p.name ?? '').toLowerCase().includes(productSearch.toLowerCase());
  });

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="nm-page-header">
        <div>
          <h2 className="nm-page-title">Dashboard Overview</h2>
          <p className="nm-page-subtitle">Real-time performance metrics for NextMart Retailers.</p>
        </div>
        <div className="d-flex gap-2" style={{ position: 'relative' }}>
          {/* Date range picker trigger */}
          <button
            className="nm-btn nm-btn-secondary"
            onClick={() => setPickerOpen(o => !o)}
            style={{ minWidth: 160, justifyContent: 'space-between' }}
          >
            <span className="material-symbols-outlined">calendar_today</span>
            {selectedPreset.label}
            <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.6, marginLeft: 4 }}>
              {pickerOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown */}
          {pickerOpen && (
            <>
              {/* Click-outside overlay */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setPickerOpen(false)}
              />
              <div style={{
                position: 'absolute', right: 120, top: '110%', zIndex: 100,
                background: 'var(--surface-container-lowest)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 200,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--outline-variant)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date Range
                  </span>
                </div>
                {DATE_PRESETS.map(preset => (
                  <button
                    key={preset.days}
                    onClick={() => handlePresetSelect(preset)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 16px',
                      background: selectedPreset.days === preset.days ? 'var(--primary-container)' + '18' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: selectedPreset.days === preset.days ? 'var(--primary-container)' : 'var(--on-surface)',
                      fontWeight: selectedPreset.days === preset.days ? 700 : 400,
                      fontSize: 13,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (selectedPreset.days !== preset.days) e.currentTarget.style.background = 'var(--surface-container)'; }}
                    onMouseLeave={e => { if (selectedPreset.days !== preset.days) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{preset.label}</span>
                    {selectedPreset.days === preset.days && (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            className="nm-btn nm-btn-primary"
            onClick={handleExport}
            disabled={exporting || (!stats && !revenue && !bestSelling && !latestOrders)}
          >
            {exporting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="4"/>
                  <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">download</span>
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, marginBottom: 24,
          background: 'var(--error-container)', color: 'var(--error)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          border: '1px solid rgba(186,26,26,0.2)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {error}
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          {loading && !stats ? (
            <div className="nm-metric-card h-100"><Skeleton h={14} mb={12} /><Skeleton h={32} mb={8} /><Skeleton h={12} w="60%" /></div>
          ) : (
            <MetricCard
              label="Total Revenue"
              value={totalRevenue}
              trendValue={revTrend != null ? `${Math.abs(revTrend)}%` : undefined}
              trendDir={revTrendDir}
              sub={`vs previous ${selectedPreset.label.toLowerCase()}`}
              sparkline={<RevenueSparkline data={revenue || []} />}
            />
          )}
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          {loading && !stats ? (
            <div className="nm-metric-card h-100"><Skeleton h={14} mb={12} /><Skeleton h={32} mb={8} /><Skeleton h={12} w="60%" /></div>
          ) : (
            <MetricCard
              label="Total Orders"
              value={stats?.totalOrders?.toLocaleString() ?? '—'}
              trendDir="up"
              sub={`Paid orders — ${selectedPreset.label.toLowerCase()}`}
              sparkline={<BlueSparkline />}
            />
          )}
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          {loading && !stats ? (
            <div className="nm-metric-card h-100"><Skeleton h={14} mb={12} /><Skeleton h={32} mb={8} /><Skeleton h={12} w="60%" /></div>
          ) : (
            <MetricCard
              label="Active Users"
              value={stats?.activeUsers?.toLocaleString() ?? '—'}
              trendDir="flat"
              sub={`Unique buyers — ${selectedPreset.label.toLowerCase()}`}
            />
          )}
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          {loading && !stats ? (
            <div className="nm-metric-card h-100"><Skeleton h={14} mb={12} /><Skeleton h={32} mb={8} /><Skeleton h={12} w="60%" /></div>
          ) : (
            <MetricCard
              label="Pending Reviews"
              value={stats?.pendingReviews ?? '—'}
              sub="Action required today"
              alert
            />
          )}
        </div>
      </div>

      {/* ── Revenue Chart ─────────────────────────────────────────────────── */}
      <div className="nm-card nm-card-padding mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="nm-page-section-title">Revenue Over Time</h3>
            <p className="nm-page-subtitle" style={{ marginTop: 2 }}>
              {selectedPreset.period.charAt(0).toUpperCase() + selectedPreset.period.slice(1)} revenue — {selectedPreset.label.toLowerCase()}.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-container)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>Revenue</span>
          </div>
        </div>
        {loading && !revenue ? (
          <div style={{ height: 280 }}><Skeleton h="100%" radius={12} /></div>
        ) : (
          <RevenueChart data={revenue || []} />
        )}
      </div>

      {/* ── Bottom: Best Selling + Latest Orders ─────────────────────────── */}
      <div className="row g-4">
        {/* Best Selling Products */}
        <div className="col-12 col-xl-5">
          <div className="nm-card h-100">
            <div style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <div className="d-flex justify-content-between align-items-center px-4 py-3">
                <h3 className="nm-page-section-title" style={{ margin: 0 }}>Best Selling Products</h3>
                <span className="nm-badge nm-badge-primary">
                  {productSearch ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}` : 'Top 5'}
                </span>
              </div>
              <div className="nm-input-group" style={{ margin: '0 16px 12px', flex: 1 }}>
                <span className="material-symbols-outlined">search</span>
                <input
                  className="nm-input"
                  type="text"
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </div>
            </div>
            {loading && !bestSelling ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h={44} />)}
              </div>
            ) : (
              <DataTable
                columns={PRODUCT_COLS}
                data={filteredProducts}
                searchFields={[]}
                pageSize={5}
              />
            )}
          </div>
        </div>

        {/* Latest Orders */}
        <div className="col-12 col-xl-7">
          <div className="nm-card h-100">
            <div style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <div className="d-flex justify-content-between align-items-center px-4 py-3">
                <h3 className="nm-page-section-title" style={{ margin: 0 }}>Latest Orders</h3>
                <span style={{ fontSize: 12, color: 'var(--secondary)' }}>
                  {orderSearch
                    ? `${filteredOrders.length} of ${(latestOrders || []).length} orders`
                    : `${(latestOrders || []).length} orders`}
                </span>
              </div>
              <div className="nm-input-group" style={{ margin: '0 16px 12px', flex: 1 }}>
                <span className="material-symbols-outlined">search</span>
                <input
                  className="nm-input"
                  type="text"
                  placeholder="Search by order #, customer or email…"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </div>
            </div>
            {loading && !latestOrders ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h={44} />)}
              </div>
            ) : (
              <DataTable
                columns={ORDER_COLS}
                data={filteredOrders}
                searchFields={[]}
                pageSize={6}
              />
            )}
            <div style={{
              textAlign: 'center', padding: '14px',
              borderTop: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-low)',
              borderRadius: '0 0 12px 12px'
            }}>
              <button className="nm-btn nm-btn-ghost nm-btn-sm" style={{ color: 'var(--primary-container)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                View Full Order History
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nm-skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
