import { useEffect, useRef } from 'react'

/**
 * Reusable modal window built on the native <dialog> element.
 * showModal() gives accessibility features for free: focus stays inside the
 * dialog, the page behind it cannot be used, and Esc asks to close it.
 */
export default function Modal({ labelledBy, className = '', onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function handleCancel(event) {
    // "cancel" fires when the user presses Esc. Let the parent decide what closing means.
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
    >
      {children}
    </dialog>
  )
}
