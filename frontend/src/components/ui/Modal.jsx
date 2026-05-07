export function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="sf-modal__backdrop" role="presentation" onClick={onClose}>
      <div className="sf-modal sf-card sf-card--glow" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
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