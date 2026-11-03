import { useEffect, useId, useRef } from 'react'

/**
 * Reusable confirmation pop-up for destructive actions (red confirm button),
 * built on the browser's own <dialog> element.
 * showModal() greys out the page, keeps keyboard focus inside the dialog and
 * lets the Esc key close it, so we do not need a library for this.
 *
 * The parent controls it with the `open` prop.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isBusy = false,
}) {
  const dialogRef = useRef(null)
  const id = useId()

  // Keep the real <dialog> in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // The Esc key fires a "cancel" event. Stop the browser closing the dialog by
  // itself and let the parent update its state instead.
  function handleEscape(event) {
    event.preventDefault()
    if (!isBusy) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      onCancel={handleEscape}
    >
      <h2 id={`${id}-title`} className="dialog__title">
        {title}
      </h2>
      <p id={`${id}-message`}>{message}</p>

      {/* Cancel comes first, so it gets focus when the dialog opens –
          the safe choice for a destructive action. */}
      <div className="button-row">
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={isBusy}>
          Cancel
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm} disabled={isBusy}>
          {isBusy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
