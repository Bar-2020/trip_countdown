import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import { compressImage } from './imageUtils'
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

const labelStyle: CSSProperties = {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '0.35rem',
}

// 16px text stops iOS Safari from zooming the page when a field is focused.
const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 0.75rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    color: '#16202e',
    background: '#fff',
    colorScheme: 'light',
    border: '1px solid #94a3b8',
    borderRadius: '0.6rem',
}

const buttonStyle: CSSProperties = {
    padding: '0.65rem 1.1rem',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '0.6rem',
    border: '1px solid transparent',
}

const primaryButtonStyle: CSSProperties = { ...buttonStyle, background: '#0f766e', color: '#fff' }
const secondaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    background: '#fff',
    color: '#16202e',
    borderColor: '#94a3b8',
}

function SettingsPanel({ settings, isCustom, onSave, onReset, onClose }: SettingsPanelProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pressStartedOnBackdrop = useRef(false)

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
            className="trip-dialog"
            aria-labelledby="trip-settings-title"
            onClose={onClose}
            // Only a press that starts and ends on the backdrop closes it, so dragging a
            // text selection out of a field does not throw the draft away.
            onMouseDown={(event) => {
                pressStartedOnBackdrop.current = event.target === event.currentTarget
            }}
            onClick={(event) => {
                if (pressStartedOnBackdrop.current && event.target === event.currentTarget) requestClose()
            }}
            style={{
                width: 'min(92vw, 30rem)',
                maxHeight: '92dvh',
                padding: 0,
                border: 'none',
                borderRadius: '1.25rem',
                color: '#16202e',
                background: '#fff',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '1.5rem' }}
            >
                <div>
                    <h2 id="trip-settings-title" style={{ margin: 0, fontSize: '1.35rem' }}>
                        Customize your trip
                    </h2>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#334155' }}>
                        Saved in this browser only. One trip is kept at a time, so saving replaces the previous one.
                    </p>
                </div>

                <div>
                    <label htmlFor="trip-destination" style={labelStyle}>Destination</label>
                    <input
                        id="trip-destination"
                        type="text"
                        required
                        maxLength={MAX_DESTINATION_LENGTH}
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label htmlFor="trip-takeoff" style={labelStyle}>Takeoff date and time</label>
                    <input
                        id="trip-takeoff"
                        type="datetime-local"
                        required
                        value={takeoffLocal}
                        onChange={(event) => setTakeoffLocal(event.target.value)}
                        style={inputStyle}
                    />
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#334155' }}>
                        Uses this device's time zone.
                    </p>
                </div>

                <fieldset style={{ margin: 0, padding: 0, border: 'none', minWidth: 0 }}>
                    <legend style={{ ...labelStyle, padding: 0 }}>Destination photo</legend>
                    <div
                        role="img"
                        aria-label="Preview of the background"
                        style={{
                            height: '9rem',
                            borderRadius: '0.75rem',
                            backgroundImage: backgroundFor(photo),
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                        <button
                            type="button"
                            className="trip-btn"
                            disabled={isCompressing}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ ...secondaryButtonStyle, padding: '0.5rem 0.9rem', fontSize: '0.9rem' }}
                        >
                            {isCompressing ? 'Optimizing photo…' : photo ? 'Choose another photo' : 'Upload a photo'}
                        </button>
                        {photo && (
                            <button
                                type="button"
                                className="trip-btn"
                                onClick={() => setPhoto(null)}
                                style={{ ...secondaryButtonStyle, padding: '0.5rem 0.9rem', fontSize: '0.9rem' }}
                            >
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
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#334155' }}>
                        Large photos are resized and compressed so they fit in your browser's storage.
                    </p>
                </fieldset>

                {error && (
                    <p role="alert" style={{ margin: 0, padding: '0.6rem 0.75rem', borderRadius: '0.5rem', background: '#fee2e2', color: '#7f1d1d', fontSize: '0.9rem' }}>
                        {error}
                    </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
                    {isCustom && (
                        <button
                            type="button"
                            className="trip-btn"
                            onClick={handleReset}
                            style={{ ...secondaryButtonStyle, color: '#991b1b', borderColor: '#fca5a5', marginRight: 'auto' }}
                        >
                            {confirmingReset ? 'Click again to erase your trip' : 'Reset to defaults'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="trip-btn"
                        onClick={requestClose}
                        style={{ ...secondaryButtonStyle, marginLeft: isCustom ? 0 : 'auto' }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="trip-btn" disabled={isCompressing} style={primaryButtonStyle}>
                        Save trip
                    </button>
                </div>
            </form>
        </dialog>
    )
}

export default SettingsPanel
