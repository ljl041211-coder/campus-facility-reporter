import { useState } from 'react'
import CameraCapture from './CameraCapture.jsx'
import LocationField from './LocationField.jsx'
import { CATEGORIES } from '../constants/categories.js'
import { useGeolocation } from '../hooks/useGeolocation.js'

const DESCRIPTION_MAX_LENGTH = 500

/**
 * The report form, shared by "New report" (Create) and "Edit report" (Update).
 *
 * initialReport / initialPhoto: existing values when editing; empty when creating.
 * autoLocate: ask for the device position as soon as the form opens.
 * onSubmit({ fields, photo, photoChanged }): called with valid data. The page
 * that uses the form decides whether that means createReport() or updateReport().
 */
export default function ReportForm({
  initialReport = null,
  initialPhoto = null,
  autoLocate = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [category, setCategory] = useState(initialReport?.category ?? '')
  const [description, setDescription] = useState(initialReport?.description ?? '')
  const [locationNote, setLocationNote] = useState(initialReport?.locationNote ?? '')
  const [photo, setPhoto] = useState(initialPhoto)
  const [photoChanged, setPhotoChanged] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const hasSavedPosition = initialReport?.latitude != null
  const geo = useGeolocation({
    initialPosition: hasSavedPosition
      ? {
          latitude: initialReport.latitude,
          longitude: initialReport.longitude,
          accuracy: initialReport.accuracy,
        }
      : null,
    autoStart: autoLocate,
  })
  const locating = geo.status === 'locating'

  function handlePhotoCaptured(image) {
    setPhoto(image)
    setPhotoChanged(true)
    setCameraOpen(false)
  }

  function handlePhotoRemoved() {
    setPhoto(null)
    setPhotoChanged(true)
  }

  // Hide a field's error message as soon as the user starts correcting that field.
  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate() {
    const problems = {}
    if (!category) problems.category = 'Choose the type of problem.'
    if (!description.trim()) problems.description = 'Describe the problem.'
    return problems
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    const problems = validate()
    setErrors(problems)
    if (Object.keys(problems).length > 0) return

    setSaving(true)
    setSaveError(null)
    try {
      await onSubmit({
        fields: {
          category,
          description: description.trim(),
          locationNote: locationNote.trim(),
          latitude: geo.position?.latitude ?? null,
          longitude: geo.position?.longitude ?? null,
          accuracy: geo.position?.accuracy ?? null,
        },
        photo,
        photoChanged,
      })
    } catch {
      // For example the device storage is full.
      setSaveError('The report could not be saved. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <form className="report-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2 className="form-section__title">Photo</h2>
          {photo ? (
            <img src={photo} alt="The photo attached to this report" className="photo" />
          ) : (
            <p className="photo photo--empty">No photo yet</p>
          )}
          <div className="button-row">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setCameraOpen(true)}
            >
              {photo ? 'Retake photo' : 'Take photo'}
            </button>
            {photo && (
              <button type="button" className="button button--secondary" onClick={handlePhotoRemoved}>
                Remove photo
              </button>
            )}
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Location</h2>
          <LocationField geo={geo} />
          <label className="field">
            <span className="field__label">Location note (optional)</span>
            <input
              type="text"
              value={locationNote}
              maxLength={120}
              placeholder="e.g. Left of the library entrance"
              onChange={(event) => setLocationNote(event.target.value)}
            />
          </label>
        </section>

        <section className="form-section">
          <fieldset className="category-picker" aria-describedby={errors.category && 'category-error'}>
            <legend className="form-section__title">Type of problem</legend>
            <div className="category-picker__grid">
              {CATEGORIES.map((option) => (
                <label key={option.id} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value={option.id}
                    checked={category === option.id}
                    onChange={() => {
                      setCategory(option.id)
                      clearError('category')
                    }}
                  />
                  <span className="category-option__emoji" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {errors.category && (
            <p id="category-error" className="message message--error" role="alert">
              {errors.category}
            </p>
          )}
        </section>

        <section className="form-section">
          <label className="field">
            <span className="form-section__title">Description</span>
            <textarea
              rows={4}
              value={description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="What is wrong? e.g. The light flickers and goes out at night."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description && 'description-error'}
              onChange={(event) => {
                setDescription(event.target.value)
                clearError('description')
              }}
            />
          </label>
          {errors.description && (
            <p id="description-error" className="message message--error" role="alert">
              {errors.description}
            </p>
          )}
        </section>

        {saveError && (
          <p className="message message--error" role="alert">
            {saveError}
          </p>
        )}

        {locating && <p className="hint">Waiting for your position before the report can be saved…</p>}

        <div className="button-row">
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="button button--primary" disabled={saving || locating}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>

      </form>

      {cameraOpen && (
        <CameraCapture onCapture={handlePhotoCaptured} onCancel={() => setCameraOpen(false)} />
      )}
    </>
  )
}
