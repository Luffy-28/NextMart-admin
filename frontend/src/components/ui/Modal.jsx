import React, { useEffect } from 'react';

/**
 * Modal — matches the Stitch admin design glassmorphic modal style.
 * 
 * Props:
 *  isOpen   boolean
 *  onClose  () => void
 *  title    string
 *  children ReactNode  (body content)
 *  footer   ReactNode  (footer buttons)
 *  size     'sm' | 'md' | 'lg'
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = { sm: 'nm-modal-sm', md: 'nm-modal-md', lg: 'nm-modal-lg' };

  return (
    <div className="nm-modal-backdrop" onClick={onClose}>
      <div className={`nm-modal ${sizeMap[size]}`} onClick={e => e.stopPropagation()}>
        <div className="nm-modal-header">
          <h5 className="nm-modal-title">{title}</h5>
          <button className="nm-modal-close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="nm-modal-body">{children}</div>
        {footer && <div className="nm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
