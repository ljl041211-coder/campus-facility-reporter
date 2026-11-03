import { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { resizeImage } from '../utils/image.js'

// Prefer the rear ("environment") camera – the student points it at the problem.
// `ideal` means "use it if there is one", so laptops fall back to the front camera.
const VIDEO_CONSTRAINTS = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1280 },
  height: { ideal: 960 },
}

const FALLBACK_HINT = 'You can still choose a photo from your gallery instead.'

// Check before asking for the camera: getUserMedia only exists on HTTPS pages.
function getSupportError() {
  if (!window.isSecureContext) {
    return `The camera needs a secure (HTTPS) connection. ${FALLBACK_HINT}`
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return `This browser cannot open the camera. ${FALLBACK_HINT}`
  }
  return ''
}

// Turns getUserMedia errors into messages a student can act on.
function describeCameraError(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return `Camera permission was denied. To allow it, open your browser or phone settings for this site. ${FALLBACK_HINT}`
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return `No camera was found on this device. ${FALLBACK_HINT}`
    case 'NotReadableError':
    case 'TrackStartError':
      return `The camera is being used by another app. Close that app and try again. ${FALLBACK_HINT}`
    default:
      return `The camera could not be started. ${FALLBACK_HINT}`
  }
}

/**
 * Live camera view with a Capture button (react-webcam wraps getUserMedia).
 * Calls onCapture(blob) with the resized photo, or onCancel() to close.
 * When this component is removed, react-webcam stops the camera stream,
 * so the camera light turns off.
 */
export default function CameraCapture({ onCapture, onCancel }) {
  const webcamRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(getSupportError)

  async function handleCapture() {
    // getCanvas() draws the current video frame onto a canvas.
    const canvas = webcamRef.current?.getCanvas()
    if (!canvas) {
      setErrorMessage('The photo could not be taken. Please try again.')
      return
    }
    setIsCapturing(true)
    try {
      onCapture(await resizeImage(canvas))
    } catch {
      setErrorMessage('The photo could not be saved. Please try again.')
      setIsCapturing(false)
    }
  }

  return (
    <div className="camera">
      {errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : (
        <div className="camera__viewport">
          <Webcam
            ref={webcamRef}
            className="camera__video"
            audio={false}
            mirrored={false}
            videoConstraints={VIDEO_CONSTRAINTS}
            forceScreenshotSourceSize
            onUserMedia={() => setIsReady(true)}
            onUserMediaError={(error) => setErrorMessage(describeCameraError(error))}
          />
          {!isReady && (
            <p className="camera__status" role="status">
              Starting camera…
            </p>
          )}
        </div>
      )}

      <div className="button-row">
        {!errorMessage && (
          <button
            type="button"
            className="button button--primary"
            onClick={handleCapture}
            disabled={!isReady || isCapturing}
          >
            {isCapturing ? 'Saving…' : 'Capture'}
          </button>
        )}
        <button type="button" className="button button--secondary" onClick={onCancel}>
          {errorMessage ? 'Close camera' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}
