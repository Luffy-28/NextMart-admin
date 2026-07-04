import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 py-5 text-center">
      <div className="position-relative" style={{ width: 60, height: 60 }}>
        <div className="spinner-border position-absolute" role="status" style={{ width: '100%', height: '100%', border: '4px solid rgba(139,92,246,0.1)', borderTop: '4px solid var(--nex-purple)', borderRadius: '50%' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow position-absolute text-info" role="status" style={{ width: '50%', height: '50%', top: '25%', left: '25%', opacity: 0.4 }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="nex-gradient-text fw-bold small text-uppercase mb-0" style={{ letterSpacing: '0.15em', animation: 'pulse 1.5s infinite' }}>
        Loading NextMart...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center position-fixed" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(7, 7, 15, 0.75)', backdropFilter: 'blur(10px)' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
