const Modal = ({ title, subtitle, onClose, children, actions }) => (
  <div
    className="modal-backdrop"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="modal">
      <div className="modal-header">
        <div>
          <div className="modal-title">{title}</div>
          {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="modal-body">
        {children}
        {actions && (
          <>
            <div className="modal-divider" />
            <div className="modal-actions">{actions}</div>
          </>
        )}
      </div>
    </div>
  </div>
);

export default Modal;
