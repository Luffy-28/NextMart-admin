import React from 'react';

/**
 * StatusBadge — matches Stitch pill badge style with rounded-full coloring.
 * @param {string} status  - e.g. 'Active', 'Pending', 'Delivered', 'Cancelled'
 * @param {string} [label] - Override display text
 */
const StatusBadge = ({ status = '', label }) => {
  const s = status.toLowerCase();
  let cls = 'nm-badge ';

  if (['active', 'approved', 'delivered', 'paid', 'completed', 'success'].includes(s)) {
    cls += 'nm-badge-success';
  } else if (['pending', 'processing', 'shipped', 'hold'].includes(s)) {
    cls += 'nm-badge-warning';
  } else if (['failed', 'cancelled', 'rejected', 'inactive', 'banned', 'error'].includes(s)) {
    cls += 'nm-badge-danger';
  } else if (['refunded', 'info'].includes(s)) {
    cls += 'nm-badge-info';
  } else if (['upcoming', 'scheduled'].includes(s)) {
    cls += 'nm-badge-blue';
  } else if (['flagged', 'flagged'].includes(s)) {
    cls += 'nm-badge-purple';
  } else {
    cls += 'nm-badge-default';
  }

  return <span className={cls}>{label || status}</span>;
};

export default StatusBadge;
