import { useEffect, useId, useRef, useState } from 'react'
import LocationField from './LocationField.jsx'
import PhotoField from './PhotoField.jsx'
import { CATEGORIES } from '../constants/categories.js'
import { useGeolocation } from '../hooks/useGeolocation.js'

export const DESCRIPTION_MIN = 10
export const DESCRIPTION_MAX = 500
export const LOCATION_NOTE_MAX = 100

const EMPTY_VALUES = { category: '', description: '', locationNote: '', photo: null, location: null }

// Fields in the order they appear, used to focus the first one with an error.
const FIELD_ORDER = ['category', 'description', 'locationNote']

/**
 * Checks the form values and returns an object of error messages.
 * An empty object means the form is valid.
 */
function validate(values) {
  const errors = {}
  const descriptionLength = values.description.trim().length

  if (!values.category) {
    errors.category = 'Choose the type of problem.'
  }

  if (descriptionLength === 0) {
    errors.description = 'Describe the problem.'
  } else if (descriptionLength < DESCRIPTION_MIN) {
    errors.description = `Please add a little more detail (at least ${DESCRIPTION_MIN} characters).`
  } else if (descriptionLength > DESCRIPTION_MAX) {
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`
  }

  if (values.locationNote.trim().length > LOCATION_NOTE_MAX) {
    errors.locationNote = `Keep the location note under ${LOCATION_NOTE_MAX} characters.`
  }

  return errors
}

/**
 * Reusable form for creating AND editing a report.
 * The parent decides what happens on submit (create or update), so the same
 * fields and validation are used in both places.
 *
 * Props:
 *   initialValues – values to start with (empty for a new report)
 *   autoLocate    – true: ask for the GPS position as soon as the form opens
 *   submitLabel   – text of the submit button
 *   onSubmit      – async function that saves the values
 *   onCancel      – optional; shows a Cancel button when given
 */
export default function ReportForm({ initialValues = EMPTY_VALUES, autoLocate = false, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
  const geo = useGeolocation({ requestOnMount: autoLocate })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const formRef = useRef(null)
  const id = useId() // unique ids so labels and error messages are linked correctly

  // The location can come from GPS or from the map pin. Whenever a new GPS
  // position arrives, it becomes the report's location; dragging the pin
  // afterwards replaces it again (see LocationField).
  useEffect(() => {
    if (geo.position) {
      setValues((previous) => ({ ...previous, location: { ...geo.position, source: 'gps' } }))
    }
  }, [geo.position])

  function setLocation(location) {
    setValues((previous) => ({ ...previous, location }))
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    // Hide a field's error as soon as the student starts fixing it.
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validate(values)
    setErrors(newErrors)

    const firstInvalidField = FIELD_ORDER.find((name) => newErrors[name])
    if (firstInvalidField) {
      // Move focus to the first problem so screen reader and keyboard users find it.
      formRef.current.querySelector(`[name="${firstInvalidField}"]`).focus()
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      await onSubmit(values)
    } catch (error) {
      setSaveError(`Could not save the report: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form ref={formRef} className="report-form" onSubmit={handleSubmit} noValidate>
      <p className="form-hint">Fields marked * are required.</p>

      <PhotoField
        photo={values.photo}
        onChange={(photo) => setValues((previous) => ({ ...previous, photo }))}
        disabled={isSaving}
      />

      <LocationField
        location={values.location}
        category={values.category}
        status={geo.status}
        errorMessage={geo.errorMessage}
        onRequest={geo.requestLocation}
        onChange={setLocation}
        disabled={isSaving}
      />

      {/* Category: a group of radio buttons */}
      <fieldset
        className="form-field"
        aria-describedby={errors.category ? `${id}-category-error` : undefined}
      >
        <legend className="form-label">Type of problem *</legend>
        <div className="category-options">
          {CATEGORIES.map((category) => (
            <label key={category.id} className="category-option">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={values.category === category.id}
                onChange={handleChange}
                aria-invalid={errors.category ? true : undefined}
              />
              <span className="category-option__emoji" aria-hidden="true">
                {category.emoji}
              </span>
              <span>{category.label}</span>
            </label>
          ))}
        </div>
        {errors.category && (
          <p id={`${id}-category-error`} className="field-error">
            {errors.category}
          </p>
        )}
      </fieldset>

      {/* Description */}
      <div className="form-field">
        <label htmlFor={`${id}-description`} className="form-label">
          Description *
        </label>
        <textarea
          id={`${id}-description`}
          name="description"
          className="text-input"
          rows={4}
          maxLength={DESCRIPTION_MAX}
          placeholder="What is wrong? For example: the light has been off for three nights."
          value={values.description}
          onChange={handleChange}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={`${id}-description-count${errors.description ? ` ${id}-description-error` : ''}`}
        />
        <p id={`${id}-description-count`} className="field-count">
          {values.description.length} / {DESCRIPTION_MAX}
        </p>
        {errors.description && (
          <p id={`${id}-description-error`} className="field-error">
            {errors.description}
          </p>
        )}
      </div>

      {/* Location note (optional) */}
      <div className="form-field">
        <label htmlFor={`${id}-locationNote`} className="form-label">
          Location note (optional)
        </label>
        <input
          id={`${id}-locationNote`}
          name="locationNote"
          type="text"
          className="text-input"
          maxLength={LOCATION_NOTE_MAX}
          placeholder="For example: left of the library entrance"
          value={values.locationNote}
          onChange={handleChange}
          aria-invalid={errors.locationNote ? true : undefined}
          aria-describedby={errors.locationNote ? `${id}-locationNote-error` : undefined}
        />
        {errors.locationNote && (
          <p id={`${id}-locationNote-error`} className="field-error">
            {errors.locationNote}
          </p>
        )}
      </div>

      {saveError && (
        <p className="error-text" role="alert">
          {saveError}
        </p>
      )}

      <div className="button-row">
        <button type="submit" className="button button--primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="button button--secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
