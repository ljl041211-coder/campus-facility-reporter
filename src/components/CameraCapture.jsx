import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Modal from './Modal.jsx'
import { readFileAsDataUrl, resizeImage } from '../utils/image.js'

// Passed to getUserMedia(): prefer the rear camera, which faces the problem.
const VIDEO_CONSTRAINTS = {
  facingMode: 'environment',
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

const PHOTO_MAX_SIZE = 1280
const PHOTO_QUALITY = 0.85

/**
 * Full-screen camera (Camera device API through react-webcam).
 *
 * Three states:
 *   live camera -> the user presses "Take photo"
 *   preview     -> the user checks the photo and chooses "Retake" or "Use this photo"
 *   error       -> the camera is denied or missing; the user can pick a photo file instead
 *
 * Nothing is saved here. The chosen photo is handed to the parent with onCapture().
 */
export default function CameraCapture({ onCapture, onCancel }) {
  // useRef keeps a reference to the Webcam component so its getScreenshot() can be called.
  const webcamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [preview, setPreview] = useState(null)

  // useCallback keeps the same function between renders (same pattern as the Week 7 lecture).
  const takePhoto = useCallback(() => {
    const image = webcamRef.current?.getScreenshot()
    if (image) setPreview(image)
  }, [])

  function handleRetake() {
    setPreview(null)
    // The live camera view is created again, so wait for it to be ready again.
    setCameraReady(false)
  }

  function handleCameraError(error) {
    const denied = error?.name === 'NotAllowedError'
    setCameraError(
      denied
        ? 'Camera permission was denied. Allow camera access in your browser settings, or choose a photo instead.'
        : 'The camera could not be started on this device. You can choose a photo instead.',
    )
  }

  async function handleFileChosen(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      // Gallery photos can be several megabytes, so shrink them before storing.
      setPreview(await resizeImage(dataUrl, PHOTO_MAX_SIZE, PHOTO_QUALITY))
    } catch (error) {
      setCameraError(error.message)
    }
  }

  return (
    <Modal labelledBy="camera-title" className="modal--camera" onClose={onCancel}>
      <h2 id="camera-title" className="modal__title">
        {preview ? 'Check your photo' : 'Take a photo of the problem'}
      </h2>

      {preview ? (
        <>
          <img src={preview} alt="Preview of the photo you took" className="camera__view" />
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={handleRetake}>
              Retake
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => onCapture(preview)}
            >
              Use this photo
            </button>
          </div>
        </>
      ) : cameraError ? (
        <>
          <p className="message message--error" role="alert">
            {cameraError}
          </p>
          <label className="button button--primary file-button">
            Choose a photo
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handleFileChosen}
            />
          </label>
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={VIDEO_CONSTRAINTS}
            screenshotFormat="image/jpeg"
            screenshotQuality={PHOTO_QUALITY}
            forceScreenshotSourceSize
            // Passed on to the <video> element: fires when the first frame can be shown.
            // Only then can getScreenshot() return a picture.
            onLoadedData={() => setCameraReady(true)}
            onUserMediaError={handleCameraError}
            className="camera__view"
          />
          <p className="hint">Try to keep people's faces out of the photo.</p>
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={takePhoto}
              disabled={!cameraReady}
            >
              {cameraReady ? 'Take photo' : 'Starting camera…'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
