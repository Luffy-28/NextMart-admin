import React from 'react';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

// Sparkline SVG helpers
const GreenSparkline = () => (
  <svg viewBox="0 0 100 40" className="w-100 h-100">
    <path d="M0,35 Q10,32 20,38 T40,25 T60,15 T80,28 T100,5" fill="none" stroke="#22c55e" strokeWidth="2"/>
    <path d="M0,35 Q10,32 20,38 T40,25 T60,15 T80,28 T100,5 V40 H0 Z" fill="rgba(34,197,94,0.1)"/>
  </svg>
);

const BlueSparkline = () => (
  <svg viewBox="0 0 100 40" className="w-100 h-100">
    <path d="M0,30 T25,25 T50,20 T75,15 T100,8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
    <path d="M0,30 T25,25 T50,20 T75,15 T100,8 V40 H0 Z" fill="rgba(59,130,246,0.1)"/>
  </svg>
);

const RECENT_ORDERS = [
  { id: '#ORD-94821', customer: 'Alex Morgan',    amount: '$1,240.00', status: 'Delivered', initials: 'AM' },
  { id: '#ORD-94820', customer: 'Sarah Jenkins',  amount: '$89.50',    status: 'Shipped',   initials: 'SJ' },
  { id: '#ORD-94819', customer: 'Thomas Wright',  amount: '$542.25',   status: 'Processing',initials: 'TW' },
  { id: '#ORD-94818', customer: 'Lisa Johnson',   amount: '$2,100.00', status: 'Delivered', initials: 'LJ' },
  { id: '#ORD-94817', customer: 'Bill Riley',     amount: '$12.99',    status: 'Cancelled', initials: 'BR' },
];

const SYSTEM_EVENTS = [
  { icon: 'person_add', color: '#2563eb', bg: '#dbeafe', text: 'New Merchant registered: "Organic Delights LLC"', time: '2 mins ago • Registration Module' },
  { icon: 'inventory',  color: '#ca8a04', bg: '#fef9c3', text: 'Stock Alert: MacBook Air M3 (Space Gray) below threshold.', time: '45 mins ago • Inventory Manager' },
  { icon: 'security',   color: '#7c3aed', bg: '#ede9fe', text: 'Security: Admin session timeout for ID #4928.', time: '1 hr ago • System logs' },
  { icon: 'task_alt',   color: '#16a34a', bg: '#dcfce7', text: 'Payout: Monthly settlements completed for 124 vendors.', time: '3 hrs ago • Finance' },
];

const ORDER_COLS = [
  { key: 'id',       label: 'Order ID',  render: r => <span className="nm-text-code">{r.id}</span> },
  {
    key: 'customer', label: 'Customer',
    render: r => (
      <div className="d-flex align-items-center gap-3">
        <span className="nm-avatar-initials">{r.initials}</span>
        <span style={{ fontWeight: 500 }}>{r.customer}</span>
      </div>
    )
  },
  { key: 'amount',   label: 'Amount',   render: r => <strong>{r.amount}</strong> },
  { key: 'status',   label: 'Status',   render: r => <StatusBadge status={r.status} /> },
  {
    key: 'actions', label: 'Actions', sortable: false,
    render: () => (
      <button className="nm-action-btn">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    )
  }
];

const Dashboard = () => (
  <div>
    {/* Page Header */}
    <div className="nm-page-header">
      <div>
        <h2 className="nm-page-title">Dashboard Overview</h2>
        <p className="nm-page-subtitle">Real-time performance metrics for NextMart Retailers.</p>
      </div>
      <div className="d-flex gap-2">
        <button className="nm-btn nm-btn-secondary">
          <span className="material-symbols-outlined">calendar_today</span>
          Last 30 Days
        </button>
        <button className="nm-btn nm-btn-primary">
          <span className="material-symbols-outlined">download</span>
          Export Report
        </button>
      </div>
    </div>

    {/* KPI Cards */}
    <div className="row g-4 mb-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <MetricCard
          label="Total Revenue"
          value="$142,384.50"
          trendValue="12.5%"
          trendDir="up"
          sub="vs $126k last month"
          sparkline={<GreenSparkline />}
        />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <MetricCard
          label="Total Orders"
          value="1,842"
          trendValue="8.2%"
          trendDir="up"
          sub="Processed this month"
          sparkline={<BlueSparkline />}
        />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <MetricCard
          label="Active Users"
          value="24.5k"
          trendValue="0.0%"
          trendDir="flat"
          sub="Active in last 24hrs"
        />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <MetricCard
          label="Pending Reviews"
          value="42"
          sub="Action required today"
          alert
        />
      </div>
    </div>

    {/* Sales Chart */}
    <div className="nm-card nm-card-padding mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="nm-page-section-title">Sales Performance Overview</h3>
          <p className="nm-page-subtitle" style={{ marginTop: 2 }}>Aggregate revenue trajectory across all product categories.</p>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-container)', display: 'inline-block' }}/>
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>This Year</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--outline-variant)', display: 'inline-block' }}/>
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>Last Year</span>
          </div>
        </div>
      </div>
      <div style={{ height: 280, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 260" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   style={{ stopColor: 'rgba(19,27,46,0.12)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(19,27,46,0)',    stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <line x1="0" y1="50"  x2="1000" y2="50"  stroke="#f1f5f9" strokeWidth="1"/>
          <line x1="0" y1="110" x2="1000" y2="110" stroke="#f1f5f9" strokeWidth="1"/>
          <line x1="0" y1="170" x2="1000" y2="170" stroke="#f1f5f9" strokeWidth="1"/>
          <line x1="0" y1="230" x2="1000" y2="230" stroke="#f1f5f9" strokeWidth="1"/>
          {/* Area fill */}
          <path d="M0,220 C100,210 150,160 200,170 C250,180 300,90 400,100 C500,110 600,160 700,140 C800,120 900,55 1000,45 L1000,260 L0,260 Z" fill="url(#grad1)"/>
          {/* Main line */}
          <path d="M0,220 C100,210 150,160 200,170 C250,180 300,90 400,100 C500,110 600,160 700,140 C800,120 900,55 1000,45" fill="none" stroke="var(--primary-container)" strokeWidth="3"/>
          {/* Last year dashed */}
          <path d="M0,240 C100,230 200,210 300,220 C400,230 500,175 600,185 C700,195 800,160 900,150 L1000,140" fill="none" stroke="var(--outline-variant)" strokeWidth="2" strokeDasharray="8,4"/>
        </svg>
        <div className="d-flex justify-content-between mt-2" style={{ fontSize: 10, color: 'var(--secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {['Oct 01','Oct 07','Oct 14','Oct 21','Oct 28'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>

    {/* Bottom: Events + Recent Orders */}
    <div className="row g-4">
      {/* System Events */}
      <div className="col-12 col-xl-4">
        <div className="nm-card nm-card-padding h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="nm-page-section-title">System Events</h3>
            <button className="nm-btn nm-btn-ghost nm-btn-sm" style={{ color: 'var(--primary-container)', fontWeight: 700 }}>
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SYSTEM_EVENTS.map((ev, i) => (
              <div key={i} className="d-flex gap-3">
                <div className="nm-event-dot" style={{ background: ev.bg }}>
                  <span className="material-symbols-outlined" style={{ color: ev.color, fontSize: 16 }}>{ev.icon}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: '1.4', color: 'var(--on-surface)' }} dangerouslySetInnerHTML={{
                    __html: ev.text.replace(/^(\w[\w ]+?):/, '<strong>$1:</strong>')
                  }} />
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--secondary)' }}>{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="col-12 col-xl-8">
        <div className="nm-card h-100">
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
            <h3 className="nm-page-section-title" style={{ margin: 0 }}>Recent Orders</h3>
            <button className="nm-action-btn">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <DataTable
            columns={ORDER_COLS}
            data={RECENT_ORDERS}
            searchFields={['id', 'customer']}
            placeholder="Search orders…"
            pageSize={5}
          />
          <div style={{
            textAlign: 'center', padding: '14px',
            borderTop: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-low)',
            borderRadius: '0 0 12px 12px'
          }}>
            <button className="nm-btn nm-btn-ghost nm-btn-sm" style={{ color: 'var(--primary-container)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
              Load Full Transaction History
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
