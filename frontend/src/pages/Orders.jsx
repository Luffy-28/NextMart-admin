import React, { useState, useMemo } from 'react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

/* ─── Backend orderModel aligned static data ───────────────────
   orderStatus: pending | confirmed | processing | shipped | delivered | cancelled | returned
   paymentStatus: pending | paid | failed | refunded
   paymentMethod: card | paypal | cod
   items[]: { product, name, image, color, size, price, quantity }
   shippingAddress ref → shown inline for demo
   subtotal, shippingFee, tax, discount, couponCode, totalAmount
──────────────────────────────────────────────────────────────── */
const INIT_ORDERS = [
  {
    id: 'ord1', orderNumber: 'ORD-94821',
    user: { name: 'Alex Morgan',   email: 'alex.m@example.com',  initials: 'AM' },
    shippingAddress: { line1: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
    items: [
      { name: 'Vapor Ultra Running Shoes', color: 'Black',      size: '10',   price: 129.99, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
      { name: 'Chronos Smartwatch Gen 5',  color: 'Space Gray', size: '44mm', price: 299.00, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
    ],
    subtotal: 428.99, shippingFee: 10.00, tax: 42.90, discount: 0, couponCode: null,
    totalAmount: 481.89,
    paymentMethod: 'card', paymentStatus: 'paid',
    orderStatus: 'delivered', createdAt: 'Jun 20, 2026', deliveredAt: 'Jun 23, 2026',
  },
  {
    id: 'ord2', orderNumber: 'ORD-94820',
    user: { name: 'Sarah Jenkins', email: 'sarah.j@webmail.com',  initials: 'SJ' },
    shippingAddress: { line1: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    items: [
      { name: 'AeroDry Hoodie Pro', color: 'Charcoal', size: 'L', price: 64.99, quantity: 1, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=60&h=60&fit=crop' },
    ],
    subtotal: 64.99, shippingFee: 5.00, tax: 6.50, discount: 10, couponCode: 'SAVE10',
    totalAmount: 66.49,
    paymentMethod: 'paypal', paymentStatus: 'paid',
    orderStatus: 'shipped', createdAt: 'Jun 20, 2026',
  },
  {
    id: 'ord3', orderNumber: 'ORD-94819',
    user: { name: 'Thomas Wright', email: 'thomas.w@corp.io',    initials: 'TW' },
    shippingAddress: { line1: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    items: [
      { name: 'Chronos Smartwatch Gen 5', color: 'Black', size: '44mm', price: 299.00, quantity: 2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
    ],
    subtotal: 598.00, shippingFee: 15.00, tax: 59.80, discount: 0, couponCode: null,
    totalAmount: 672.80,
    paymentMethod: 'card', paymentStatus: 'paid',
    orderStatus: 'processing', createdAt: 'Jun 19, 2026',
  },
  {
    id: 'ord4', orderNumber: 'ORD-94818',
    user: { name: 'Lisa Johnson',  email: 'lisa.j@shopping.net', initials: 'LJ' },
    shippingAddress: { line1: '321 Elm St', city: 'Houston', state: 'TX', zip: '77001', country: 'USA' },
    items: [
      { name: 'Apex Bluetooth Earbuds', color: 'White', size: null, price: 119.50, quantity: 10, image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=60&h=60&fit=crop' },
    ],
    subtotal: 1195.00, shippingFee: 20.00, tax: 119.50, discount: 95.00, couponCode: 'BULK15',
    totalAmount: 1239.50,
    paymentMethod: 'card', paymentStatus: 'paid',
    orderStatus: 'confirmed', createdAt: 'Jun 19, 2026',
  },
  {
    id: 'ord5', orderNumber: 'ORD-94817',
    user: { name: 'Bill Riley',    email: 'bill.r@email.com',    initials: 'BR' },
    shippingAddress: { line1: '654 Maple Dr', city: 'Phoenix', state: 'AZ', zip: '85001', country: 'USA' },
    items: [
      { name: 'Vapor Ultra Running Shoes', color: 'White', size: '9', price: 149.99, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop' },
    ],
    subtotal: 149.99, shippingFee: 0, tax: 15.00, discount: 0, couponCode: null,
    totalAmount: 164.99,
    paymentMethod: 'cod', paymentStatus: 'pending',
    orderStatus: 'cancelled', createdAt: 'Jun 18, 2026', cancelledAt: 'Jun 19, 2026',
  },
  {
    id: 'ord6', orderNumber: 'ORD-94816',
    user: { name: 'Emma Wilson',   email: 'emma.w@mail.org',     initials: 'EW' },
    shippingAddress: { line1: '987 Cedar Ln', city: 'Philadelphia', state: 'PA', zip: '19101', country: 'USA' },
    items: [
      { name: 'Chronos Smartwatch Gen 5', color: 'Silver', size: '40mm', price: 299.00, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop' },
    ],
    subtotal: 299.00, shippingFee: 10.00, tax: 29.90, discount: 0, couponCode: null,
    totalAmount: 338.90,
    paymentMethod: 'card', paymentStatus: 'refunded',
    orderStatus: 'returned', createdAt: 'Jun 18, 2026',
  },
  {
    id: 'ord7', orderNumber: 'ORD-94815',
    user: { name: 'James Lee',     email: 'james.l@corp.io',     initials: 'JL' },
    shippingAddress: { line1: '111 Birch Blvd', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    items: [
      { name: 'AeroDry Hoodie Pro', color: 'Navy', size: 'XL', price: 79.99, quantity: 1, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=60&h=60&fit=crop' },
    ],
    subtotal: 79.99, shippingFee: 5.00, tax: 8.00, discount: 0, couponCode: null,
    totalAmount: 92.99,
    paymentMethod: 'paypal', paymentStatus: 'pending',
    orderStatus: 'pending', createdAt: 'Jun 21, 2026',
  },
];

const ORDER_STATUS_FILTERS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUS_FILTERS = ['All', 'pending', 'paid', 'failed', 'refunded'];

const PAY_METHOD_ICON = { card: 'credit_card', paypal: 'account_balance_wallet', cod: 'local_shipping' };
const PAY_METHOD_LABEL = { card: 'Credit Card', paypal: 'PayPal', cod: 'Cash on Delivery' };

const Orders = () => {
  const [orders, setOrders]         = useState(INIT_ORDERS);
  const [orderFilter, setOrderFilter]   = useState('All');
  const [payFilter, setPayFilter]       = useState('All');
  const [invoiceOpen, setInvoiceOpen]   = useState(false);
  const [selected, setSelected]         = useState(null);

  const visible = useMemo(() => {
    return orders.filter(o => {
      const matchOrder = orderFilter === 'All' || o.orderStatus === orderFilter;
      const matchPay   = payFilter   === 'All' || o.paymentStatus === payFilter;
      return matchOrder && matchPay;
    });
  }, [orders, orderFilter, payFilter]);

  const openInvoice = (row) => { setSelected(row); setInvoiceOpen(true); };

  const updateOrderStatus = (id, orderStatus) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus } : o));

  const updatePaymentStatus = (id, paymentStatus) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus } : o));

  const COLS = [
    {
      key: 'orderNumber', label: 'Order #',
      render: r => <span className="nm-text-code">{r.orderNumber}</span>
    },
    {
      key: 'user', label: 'Customer', sortable: false,
      render: r => (
        <div className="d-flex align-items-center gap-3">
          <span className="nm-avatar-initials">{r.user.initials}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{r.user.email}</div>
          </div>
        </div>
      )
    },
    { key: 'createdAt', label: 'Date' },
    {
      key: 'totalAmount', label: 'Total',
      render: r => (
        <div>
          <strong style={{ fontSize: 15 }}>${r.totalAmount.toFixed(2)}</strong>
          {r.discount > 0 && <div style={{ fontSize: 11, color: '#16a34a' }}>-${r.discount.toFixed(2)} off</div>}
        </div>
      )
    },
    {
      key: 'paymentMethod', label: 'Payment', sortable: false,
      render: r => (
        <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>{PAY_METHOD_ICON[r.paymentMethod]}</span>
          <span style={{ color: 'var(--secondary)', fontSize: 12 }}>{PAY_METHOD_LABEL[r.paymentMethod]}</span>
        </div>
      )
    },
    {
      key: 'paymentStatus', label: 'Payment Status',
      render: r => <StatusBadge status={r.paymentStatus} />
    },
    {
      key: 'orderStatus', label: 'Order Status',
      render: r => <StatusBadge status={r.orderStatus} />
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: r => (
        <div className="d-flex gap-1">
          <button className="nm-action-btn" title="View Invoice" onClick={() => openInvoice(r)}>
            <span className="material-symbols-outlined">receipt_long</span>
          </button>
        </div>
      )
    }
  ];

  /* ── Summary stats ── */
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((a, o) => a + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;
  const processingCount = orders.filter(o => ['confirmed','processing','shipped'].includes(o.orderStatus)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI row */}
      <div className="row g-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Total Revenue (Paid)</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="nm-metric-sub">From {orders.filter(o => o.paymentStatus === 'paid').length} paid orders</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">New / Pending</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>{pendingCount}</div>
            <div className="nm-metric-sub">Awaiting confirmation</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">In Progress</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>{processingCount}</div>
            <div className="nm-metric-sub">Confirmed / Processing / Shipped</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(186,26,26,0.25)' }}>
            <div className="nm-metric-label">Refunded / Returned</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: 'var(--error)' }}>
              {orders.filter(o => ['returned','cancelled'].includes(o.orderStatus)).length}
            </div>
            <div className="nm-metric-sub">Cancelled or returned</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="nm-card nm-card-padding">
        <div className="nm-page-header">
          <div>
            <h2 className="nm-page-title" style={{ fontSize: 22 }}>Orders & Payments</h2>
            <p className="nm-page-subtitle">Monitor order lifecycle and payment statuses.</p>
          </div>
        </div>

        {/* Order Status Tabs */}
        <div style={{ marginBottom: 8 }}>
          <p className="nm-label" style={{ marginBottom: 4 }}>Filter by Order Status</p>
          <div className="nm-tabs mb-3">
            {ORDER_STATUS_FILTERS.map(f => (
              <button key={f} className={`nm-tab-btn${orderFilter === f ? ' active' : ''}`} onClick={() => setOrderFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'All' && (
                  <span className="ms-1" style={{ fontSize: 10, background: 'var(--surface-container)', padding: '1px 5px', borderRadius: 99 }}>
                    {orders.filter(o => o.orderStatus === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status Filter Pills */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <span className="nm-label" style={{ margin: 0 }}>Payment:</span>
          {PAYMENT_STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setPayFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${payFilter === f ? 'var(--primary-container)' : 'var(--outline-variant)'}`,
                background: payFilter === f ? 'var(--primary-container)' : 'transparent',
                color: payFilter === f ? '#fff' : 'var(--secondary)',
                transition: 'all 0.15s',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <DataTable
          columns={COLS}
          data={visible}
          searchFields={['orderNumber', 'user.name', 'user.email']}
          placeholder="Search by order number, customer name or email…"
          pageSize={6}
        />
      </div>

      {/* ── Invoice / Detail Modal ── */}
      <Modal
        isOpen={invoiceOpen && !!selected}
        onClose={() => setInvoiceOpen(false)}
        title={`Invoice — ${selected?.orderNumber}`}
        size="lg"
        footer={
          <div className="d-flex justify-content-between w-100 align-items-center">
            {/* Left: Status actions */}
            <div className="d-flex gap-2 flex-wrap">
              {selected?.orderStatus === 'pending' && (
                <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => updateOrderStatus(selected.id, 'confirmed')}>
                  <span className="material-symbols-outlined">check_circle</span> Confirm
                </button>
              )}
              {selected?.orderStatus === 'confirmed' && (
                <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => updateOrderStatus(selected.id, 'processing')}>
                  <span className="material-symbols-outlined">hourglass_top</span> Mark Processing
                </button>
              )}
              {selected?.orderStatus === 'processing' && (
                <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => updateOrderStatus(selected.id, 'shipped')}>
                  <span className="material-symbols-outlined">local_shipping</span> Mark Shipped
                </button>
              )}
              {selected?.orderStatus === 'shipped' && (
                <button className="nm-btn nm-btn-secondary nm-btn-sm" onClick={() => updateOrderStatus(selected.id, 'delivered')}>
                  <span className="material-symbols-outlined">done_all</span> Mark Delivered
                </button>
              )}
              {['pending','confirmed','processing'].includes(selected?.orderStatus) && (
                <button className="nm-btn nm-btn-danger nm-btn-sm" onClick={() => updateOrderStatus(selected.id, 'cancelled')}>
                  <span className="material-symbols-outlined">cancel</span> Cancel
                </button>
              )}
              {selected?.paymentStatus === 'paid' && selected?.orderStatus === 'delivered' && (
                <button className="nm-btn nm-btn-danger nm-btn-sm" onClick={() => updatePaymentStatus(selected.id, 'refunded')}>
                  <span className="material-symbols-outlined">currency_exchange</span> Refund
                </button>
              )}
            </div>
            <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={() => setInvoiceOpen(false)}>Done</button>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top row */}
            <div className="row g-3">
              <div className="col-md-6">
                <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
                  <p className="nm-label" style={{ marginBottom: 6 }}>Customer</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{selected.user.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--secondary)' }}>{selected.user.email}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
                  <p className="nm-label" style={{ marginBottom: 6 }}>Shipping Address</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{selected.shippingAddress.line1}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--secondary)' }}>
                    {selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.zip}
                  </p>
                </div>
              </div>
            </div>

            {/* Status badges row */}
            <div className="d-flex gap-3 flex-wrap align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>Order:</span>
                <StatusBadge status={selected.orderStatus} />
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>Payment:</span>
                <StatusBadge status={selected.paymentStatus} />
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>{PAY_METHOD_ICON[selected.paymentMethod]}</span>
                <span style={{ fontSize: 13, color: 'var(--secondary)' }}>{PAY_METHOD_LABEL[selected.paymentMethod]}</span>
              </div>
              {selected.couponCode && (
                <span className="nm-badge nm-badge-info">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>local_offer</span>
                  {selected.couponCode}
                </span>
              )}
            </div>

            {/* Items */}
            <div className="nm-table-container">
              <table className="nm-table">
                <thead>
                  <tr>
                    <th colSpan="2">Product</th>
                    <th>Color / Size</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ width: 52, paddingRight: 0 }}>
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--outline-variant)' }} />
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ fontSize: 12, color: 'var(--secondary)' }}>
                        {[item.color, item.size].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">${item.price.toFixed(2)}</td>
                      <td className="text-end" style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals breakdown */}
            <div style={{ marginLeft: 'auto', width: '100%', maxWidth: 340 }}>
              {[
                { label: 'Subtotal',     value: `$${selected.subtotal.toFixed(2)}` },
                { label: 'Shipping Fee', value: selected.shippingFee > 0 ? `$${selected.shippingFee.toFixed(2)}` : 'FREE' },
                { label: 'Tax',          value: `$${selected.tax.toFixed(2)}` },
                ...(selected.discount > 0 ? [{ label: `Discount${selected.couponCode ? ` (${selected.couponCode})` : ''}`, value: `-$${selected.discount.toFixed(2)}`, red: true }] : []),
              ].map(row => (
                <div key={row.label} className="d-flex justify-content-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 13 }}>
                  <span style={{ color: 'var(--secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.red ? '#16a34a' : 'var(--on-surface)' }}>{row.value}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between" style={{ padding: '10px 0 0', fontSize: 16, fontWeight: 800 }}>
                <span>Grand Total</span>
                <span>${selected.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
