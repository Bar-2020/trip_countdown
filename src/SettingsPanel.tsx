import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { compressImage } from './imageUtils'
import { styles } from './styles'
import { MAX_DESTINATION_LENGTH, backgroundFor, fromDateTimeLocal, toDateTimeLocal } from './tripSettings'
import type { SaveResult, TripSettings } from './tripSettings'

interface SettingsPanelProps {
    settings: TripSettings
    /** True when a trip has been saved, false while the sample countdown is showing. */
    isCustom: boolean
    onSave: (next: TripSettings) => SaveResult
    onReset: () => void
    /** Called once the dialog has closed, however it was closed. */
    onClose: () => void
}

function SettingsPanel({ settings, isCustom, onSave, onReset, onClose }: SettingsPanelProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pressStartedOnOverlay = useRef(false)

    // The panel is mounted only while open, so the draft always starts from the saved trip.
    const [destination, setDestination] = useState(settings.destination)
    const [takeoffLocal, setTakeoffLocal] = useState(() => toDateTimeLocal(settings.takeoff))
    const [photo, setPhoto] = useState(settings.photo)
    const [error, setError] = useState<string | null>(null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [confirmingReset, setConfirmingReset] = useState(false)

    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog && !dialog.open) dialog.showModal()
    }, [])

    // Closing through the dialog lets the browser return focus to the Customize button.
    const requestClose = () => dialogRef.current?.close()

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = '' // lets the same file be chosen again
        if (!file) return

        setError(null)
        setIsCompressing(true)
        try {
            setPhoto(await compressImage(file))
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "That photo couldn't be used.")
        } finally {
            setIsCompressing(false)
        }
    }

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        const name = destination.trim()
        const takeoff = fromDateTimeLocal(takeoffLocal)
        if (!name) return setError('Please enter a destination.')
        if (!takeoff) return setError('Please choose a valid takeoff date and time.')

        const result = onSave({ destination: name, takeoff, photo })
        if (result.ok) requestClose()
        else setError(result.error)
    }

    const handleReset = () => {
        if (!confirmingReset) return setConfirmingReset(true)
        onReset()
        requestClose()
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="trip-settings-title"
            onClose={onClose}
            style={styles.dialog}
        >
            <div
                // Only a press that starts and ends on the dimmed overlay closes the dialog, so
                // dragging a text selection out of a field does not throw the draft away.
                onMouseDown={(event) => {
                    pressStartedOnOverlay.current = event.target === event.currentTarget
                }}
                onClick={(event) => {
                    if (pressStartedOnOverlay.current && event.target === event.currentTarget) requestClose()
                }}
                style={styles.dialogWrapper}
            >
                <form onSubmit={handleSubmit} style={styles.dialogPanel}>
                    <div>
                        <h2 id="trip-settings-title" style={styles.dialogTitle}>
                            Customize your trip
                        </h2>
                        <p style={styles.dialogIntro}>
                            Saved in this browser only. One trip is kept at a time, so saving replaces the previous one.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="trip-destination" style={styles.label}>Destination</label>
                        <input
                            id="trip-destination"
                            type="text"
                            required
                            maxLength={MAX_DESTINATION_LENGTH}
                            value={destination}
                            onChange={(event) => setDestination(event.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label htmlFor="trip-takeoff" style={styles.label}>Takeoff date and time</label>
                        <input
                            id="trip-takeoff"
                            type="datetime-local"
                            required
                            value={takeoffLocal}
                            onChange={(event) => setTakeoffLocal(event.target.value)}
                            style={styles.input}
                        />
                        <p style={styles.helpText}>Uses this device's time zone.</p>
                    </div>

                    <fieldset style={styles.fieldset}>
                        <legend style={styles.legend}>Destination photo</legend>
                        <div
                            role="img"
                            aria-label="Preview of the background"
                            style={{ ...styles.photoPreview, backgroundImage: backgroundFor(photo) }}
                        />
                        <div style={styles.photoActions}>
                            <button
                                type="button"
                                disabled={isCompressing}
                                onClick={() => fileInputRef.current?.click()}
                                style={{ ...styles.smallButton, ...(isCompressing && styles.buttonDisabled) }}
                            >
                                {isCompressing ? 'Optimizing photo…' : photo ? 'Choose another photo' : 'Upload a photo'}
                            </button>
                            {photo && (
                                <button type="button" onClick={() => setPhoto(null)} style={styles.smallButton}>
                                    Use default background
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                data-testid="photo-input"
                                onChange={handleFile}
                            />
                        </div>
                        <p style={styles.photoNote}>
                            Large photos are resized and compressed so they fit in your browser's storage.
                        </p>
                    </fieldset>

                    {error && <p role="alert" style={styles.error}>{error}</p>}

                    <div style={styles.actions}>
                        {isCustom && (
                            <button type="button" onClick={handleReset} style={styles.resetButton}>
                                {confirmingReset ? 'Click again to erase your trip' : 'Reset to defaults'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={requestClose}
                            style={{ ...styles.cancelButton, ...(!isCustom && styles.pushRight) }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCompressing}
                            style={{ ...styles.primaryButton, ...(isCompressing && styles.buttonDisabled) }}
                        >
                            Save trip
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}

export default SettingsPanel
