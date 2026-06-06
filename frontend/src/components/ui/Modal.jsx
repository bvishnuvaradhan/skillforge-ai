"use client";

import React, { useEffect, useRef } from 'react';

export function Modal({ open, title, children, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const doc = typeof window !== 'undefined' ? window.document : null;
    const previousActiveElement = doc ? doc.activeElement : null;
    const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modalElement = modalRef.current;
    
    if (modalElement) {
      const focusableContent = modalElement.querySelectorAll(focusableElementsSelector);
      if (focusableContent.length > 0) {
        focusableContent[0].focus();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalElement && doc) {
        const focusableContent = modalElement.querySelectorAll(focusableElementsSelector);
        if (focusableContent.length === 0) return;

        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (doc.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (doc.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="sf-modal__backdrop" role="presentation" onClick={onClose}>
      <div 
        ref={modalRef}
        className="sf-modal sf-card sf-card--glow" 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sf-modal__header">
          <h3 className="page-subtitle">{title}</h3>
          <button type="button" className="nav-chip" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>
        <div className="sf-modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;