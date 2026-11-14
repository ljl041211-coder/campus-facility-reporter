import Modal from './Modal.jsx'

/** Asks the user to confirm an action that cannot be undone, such as deleting a report. */
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal labelledBy="confirm-dialog-title" className="modal--confirm" onClose={onCancel}>
      <h2 id="confirm-dialog-title" className="modal__title">
        {title}
      </h2>
      <p>{message}</p>
      <div className="button-row">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
