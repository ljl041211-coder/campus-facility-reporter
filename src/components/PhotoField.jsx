import { useId, useState } from 'react'
import CameraCapture from './CameraCapture.jsx'
import { usePhotoUrl } from '../hooks/usePhotoUrl.js'
import { resizeImage } from '../utils/image.js'

/**
 * The optional photo part of the report form.
 * Two ways to add a photo:
 *   1. "Take photo" – live camera (CameraCapture, the Camera device API)
 *   2. "Choose a photo" – a normal file picker, which also works when the
 *      camera permission was denied or the page is not on HTTPS
 *
 * The photo itself is kept by the parent form (`photo` + `onChange`).
 */
export default function PhotoField({ photo, onChange, disabled }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const photoUrl = usePhotoUrl(photo)
  const id = useId()

  function handleCapture(blob) {
    onChange(blob)
    setIsCameraOpen(false)
    setErrorMessage('')
  }

  async function handleFileChosen(event) {
    const file = event.target.files[0]
    event.target.value = '' // so choosing the same file again still triggers onChange
    if (!file) return // the student cancelled the picker

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.')
      return
    }
    try {
      onChange(await resizeImage(file))
      setErrorMessage('')
    } catch {
      setErrorMessage('That image could not be opened. Please try another one.')
    }
  }

  return (
    <div className="form-field" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="form-label">
        Photo (optional)
      </span>

      {isCameraOpen ? (
        <CameraCapture onCapture={handleCapture} onCancel={() => setIsCameraOpen(false)} />
      ) : (
        <>
          {photoUrl ? (
            <img src={photoUrl} alt="Photo of the problem" className="photo-preview" />
          ) : (
            <p className="form-hint">A photo helps staff find and fix the problem.</p>
          )}

          <div className="button-row">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setIsCameraOpen(true)}
              disabled={disabled}
            >
              {photo ? 'Retake photo' : 'Take photo'}
            </button>

            {/* A <label> around a hidden file input works reliably on iPhone and Android. */}
            <label className={`button button--secondary file-button${disabled ? ' file-button--disabled' : ''}`}>
              <input
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={handleFileChosen}
                disabled={disabled}
              />
              Choose a photo
            </label>

            {photo && (
              <button
                type="button"
                className="button button--danger-outline"
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                Remove photo
              </button>
            )}
          </div>
        </>
      )}

      {errorMessage && (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
