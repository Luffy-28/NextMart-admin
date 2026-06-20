import React from 'react';

/**
 * MetricCard — matches Stitch dashboard KPI card design.
 * @param {string} label
 * @param {string|number} value
 * @param {string} [trendValue]     - e.g. "12.5%"
 * @param {'up'|'down'|'flat'} [trendDir]
 * @param {string} [sub]            - subtitle under value
 * @param {boolean} [alert]         - adds error border color for urgent items
 * @param {React.ReactNode} [sparkline] - optional sparkline SVG or element
 */
const MetricCard = ({ label, value, trendValue, trendDir = 'up', sub, alert = false, sparkline }) => {
  return (
    <div className={`nm-metric-card h-100`} style={alert ? { borderColor: 'rgba(186,26,26,0.25)', position: 'relative', overflow: 'hidden' } : {}}>
      {alert && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 64, height: 64,
          background: 'rgba(186,26,26,0.05)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }} />
      )}

      <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: 12 }}>
        <span className="nm-metric-label">{label}</span>

        {trendValue && !alert && (
          <span className={`nm-metric-trend-${trendDir}`}>
            <span className="material-symbols-outlined">
              {trendDir === 'up' ? 'arrow_upward' : trendDir === 'down' ? 'arrow_downward' : 'trending_flat'}
            </span>
            {trendValue}
          </span>
        )}

        {alert && (
          <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
        )}
      </div>

      <div className="d-flex align-items-end justify-content-between">
        <div>
          <div className="nm-metric-value" style={alert ? { color: 'var(--error)' } : {}}>{value}</div>
          {sub && <div className="nm-metric-sub">{sub}</div>}
        </div>
        {sparkline && <div className="nm-sparkline">{sparkline}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
