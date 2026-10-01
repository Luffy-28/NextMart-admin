import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../features/order/orderAction';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/* ─────────────────────────────────────────────────────────────────
  Order status flow:
    pending → confirmed → processing → shipped → delivered
    Any of [pending, confirmed, processing] can be cancelled
  Payment status: pending | paid | failed | refunded
  Payment method: card | paypal | cod
──────────────────────────────────────────────────────────────────── */

const ORDER_STATUS_FILTERS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUS_FILTERS = ['All', 'pending', 'paid', 'failed', 'refunded'];

const PAY_METHOD_ICON  = { card: 'credit_card', paypal: 'account_balance_wallet', cod: 'local_shipping' };
const PAY_METHOD_LABEL = { card: 'Credit Card', paypal: 'PayPal', cod: 'Cash on Delivery' };

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, pagination } = useSelector((state) => state.orderStore);

  const [orderFilter, setOrderFilter] = useState('All');
  const [payFilter,   setPayFilter]   = useState('All');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [updating,    setUpdating]    = useState(false); // tracks status update in progress

  // Load orders on mount
  useEffect(() => {
    dispatch(fetchAllOrders(1, 50));
  }, [dispatch]);

  // When selected order changes in the list (after a status update), keep modal in sync
  useEffect(() => {
    if (selected) {
      const fresh = orders.find((o) => o._id === selected._id);
      if (fresh) setSelected(fresh);
    }
  }, [orders]);

  // Client-side filter (we load 50 at once so tabs work without extra API calls)
  const visible = useMemo(() => {
    return orders.filter((o) => {
      const matchOrder = orderFilter === 'All' || o.orderStatus === orderFilter;
      const matchPay   = payFilter   === 'All' || o.paymentStatus === payFilter;
      return matchOrder && matchPay;
    });
  }, [orders, orderFilter, payFilter]);

  const openInvoice = (row) => {
    setSelected(row);
    setInvoiceOpen(true);
  };

  // Call the backend to update status, backend sends email automatically
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    await dispatch(updateOrderStatus(orderId, newStatus));
    setUpdating(false);
  };

  // Helper — get name and email from the populated user field
  const getUserName  = (o) => o.user?.name  || '—';
  const getUserEmail = (o) => o.user?.email || '—';
  const getUserInitials = (o) => {
    const name = o.user?.name || '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const COLS = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (r) => <span className="nm-text-code">{r.orderNumber}</span>,
    },
    {
      key: 'user',
      label: 'Customer',
      sortable: false,
      render: (r) => (
        <div className="d-flex align-items-center gap-3">
          <span className="nm-avatar-initials">{getUserInitials(r)}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{getUserName(r)}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{getUserEmail(r)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => new Date(r.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (r) => (
        <div>
          <strong style={{ fontSize: 15 }}>${r.totalAmount?.toFixed(2)}</strong>
          {r.discount > 0 && <div style={{ fontSize: 11, color: '#16a34a' }}>-${r.discount.toFixed(2)} off</div>}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      sortable: false,
      render: (r) => (
        <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>
            {PAY_METHOD_ICON[r.paymentMethod] || 'payment'}
          </span>
          <span style={{ color: 'var(--secondary)', fontSize: 12 }}>
            {PAY_METHOD_LABEL[r.paymentMethod] || r.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (r) => <StatusBadge status={r.paymentStatus} />,
    },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (r) => <StatusBadge status={r.orderStatus} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (r) => (
        <button className="nm-action-btn" title="View Order" onClick={() => openInvoice(r)}>
          <span className="material-symbols-outlined">receipt_long</span>
        </button>
      ),
    },
  ];

  // Summary stats from real data
  const paidOrders     = orders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenue   = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount   = orders.filter((o) => o.orderStatus === 'pending').length;
  const activeCount    = orders.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.orderStatus)).length;
  const problemCount   = orders.filter((o) => ['cancelled', 'returned'].includes(o.orderStatus)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI Row */}
      <div className="row g-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card">
            <div className="nm-metric-label">Total Revenue (Paid)</div>
            <div className="nm-metric-value" style={{ marginTop: 8 }}>
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="nm-metric-sub">From {paidOrders.length} paid orders</div>
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
            <div className="nm-metric-value" style={{ marginTop: 8 }}>{activeCount}</div>
            <div className="nm-metric-sub">Confirmed / Processing / Shipped</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="nm-metric-card" style={{ borderColor: 'rgba(186,26,26,0.25)' }}>
            <div className="nm-metric-label">Cancelled / Returned</div>
            <div className="nm-metric-value" style={{ marginTop: 8, color: 'var(--error)' }}>{problemCount}</div>
            <div className="nm-metric-sub">Cancelled or returned orders</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="nm-card nm-card-padding">
        <div className="nm-page-header">
          <div>
            <h2 className="nm-page-title" style={{ fontSize: 22 }}>Orders &amp; Payments</h2>
            <p className="nm-page-subtitle">Monitor order lifecycle and payment statuses.</p>
          </div>
        </div>

        {/* Order Status Tabs */}
        <div style={{ marginBottom: 8 }}>
          <p className="nm-label" style={{ marginBottom: 4 }}>Filter by Order Status</p>
          <div className="nm-tabs mb-3">
            {ORDER_STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className={`nm-tab-btn${orderFilter === f ? ' active' : ''}`}
                onClick={() => setOrderFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'All' && (
                  <span className="ms-1" style={{ fontSize: 10, background: 'var(--surface-container)', padding: '1px 5px', borderRadius: 99 }}>
                    {orders.filter((o) => o.orderStatus === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Filter Pills */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <span className="nm-label" style={{ margin: 0 }}>Payment:</span>
          {PAYMENT_STATUS_FILTERS.map((f) => (
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

        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={COLS}
            data={visible}
            searchFields={['orderNumber']}
            placeholder="Search by order number…"
            pageSize={10}
          />
        )}
      </div>

      {/* Order Detail / Invoice Modal */}
      <Modal
        isOpen={invoiceOpen && !!selected}
        onClose={() => setInvoiceOpen(false)}
        title={`Order — ${selected?.orderNumber}`}
        size="lg"
        footer={
          <div className="d-flex justify-content-between w-100 align-items-center flex-wrap gap-2">
            {/* Status action buttons — shown based on current orderStatus */}
            <div className="d-flex gap-2 flex-wrap">
              {selected?.orderStatus === 'pending' && (
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selected._id, 'confirmed')}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  {updating ? 'Updating…' : 'Confirm'}
                </button>
              )}
              {selected?.orderStatus === 'confirmed' && (
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selected._id, 'processing')}
                >
                  <span className="material-symbols-outlined">hourglass_top</span>
                  {updating ? 'Updating…' : 'Mark Processing'}
                </button>
              )}
              {selected?.orderStatus === 'processing' && (
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selected._id, 'shipped')}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  {updating ? 'Updating…' : 'Mark Shipped'}
                </button>
              )}
              {selected?.orderStatus === 'shipped' && (
                <button
                  className="nm-btn nm-btn-secondary nm-btn-sm"
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selected._id, 'delivered')}
                >
                  <span className="material-symbols-outlined">done_all</span>
                  {updating ? 'Updating…' : 'Mark Delivered'}
                </button>
              )}
              {['pending', 'confirmed', 'processing'].includes(selected?.orderStatus) && (
                <button
                  className="nm-btn nm-btn-danger nm-btn-sm"
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selected._id, 'cancelled')}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  {updating ? 'Updating…' : 'Cancel Order'}
                </button>
              )}
            </div>
            <button className="nm-btn nm-btn-primary nm-btn-sm" onClick={() => setInvoiceOpen(false)}>
              Done
            </button>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Customer + Address */}
            <div className="row g-3">
              <div className="col-md-6">
                <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
                  <p className="nm-label" style={{ marginBottom: 6 }}>Customer</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{getUserName(selected)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--secondary)' }}>{getUserEmail(selected)}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ padding: '14px 16px', background: 'var(--surface-container-low)', borderRadius: 10 }}>
                  <p className="nm-label" style={{ marginBottom: 6 }}>Shipping Address</p>
                  {selected.shippingAddress ? (
                    <>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                        {selected.shippingAddress.street || selected.shippingAddress.line1 || '—'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--secondary)' }}>
                        {[selected.shippingAddress.city, selected.shippingAddress.state, selected.shippingAddress.postCode].filter(Boolean).join(', ')}
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary)' }}>Not available</p>
                  )}
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
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>
                  {PAY_METHOD_ICON[selected.paymentMethod] || 'payment'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--secondary)' }}>
                  {PAY_METHOD_LABEL[selected.paymentMethod] || selected.paymentMethod}
                </span>
              </div>
              {selected.couponCode && (
                <span className="nm-badge nm-badge-info">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>local_offer</span>
                  {selected.couponCode}
                </span>
              )}
            </div>

            {/* Order Items Table */}
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
                  {selected.items?.map((item, i) => (
                    <tr key={i}>
                      <td style={{ width: 52, paddingRight: 0 }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--outline-variant)' }}
                          />
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ fontSize: 12, color: 'var(--secondary)' }}>
                        {[item.color, item.size].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">${item.price?.toFixed(2)}</td>
                      <td className="text-end" style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div style={{ marginLeft: 'auto', width: '100%', maxWidth: 340 }}>
              {[
                { label: 'Subtotal',     value: `$${selected.subtotal?.toFixed(2) || '0.00'}` },
                { label: 'Shipping Fee', value: selected.shippingFee > 0 ? `$${selected.shippingFee.toFixed(2)}` : 'FREE' },
                { label: 'Tax',          value: `$${selected.tax?.toFixed(2) || '0.00'}` },
                ...(selected.discount > 0
                  ? [{ label: `Discount${selected.couponCode ? ` (${selected.couponCode})` : ''}`, value: `-$${selected.discount.toFixed(2)}`, red: true }]
                  : []
                ),
              ].map((row) => (
                <div
                  key={row.label}
                  className="d-flex justify-content-between"
                  style={{ padding: '6px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 13 }}
                >
                  <span style={{ color: 'var(--secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.red ? '#16a34a' : 'var(--on-surface)' }}>{row.value}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between" style={{ padding: '10px 0 0', fontSize: 16, fontWeight: 800 }}>
                <span>Grand Total</span>
                <span>${selected.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
