import { useCallback, useState } from 'react'

export interface TripSettings {
    destination: string
    /** The takeoff instant as a UTC ISO 8601 string. */
    takeoff: string
    /** A compressed data URL for an uploaded photo, or null for the default background. */
    photo: string | null
}

export type SaveResult = { ok: true } | { ok: false; error: string }

export const MAX_DESTINATION_LENGTH = 50

/** The background shown until a visitor uploads a photo. */
export const DEFAULT_BACKGROUND = 'linear-gradient(135deg, #0f766e 0%, #0369a1 55%, #312e81 100%)'

/** The CSS `background-image` value for a trip's photo, or the default gradient. */
export const backgroundFor = (photo: string | null) => (photo ? `url("${photo}")` : DEFAULT_BACKGROUND)

// Bump the version in the key if the stored shape ever changes.
const STORAGE_KEY = 'tripCountdown:v1'
const STORAGE_VERSION = 1
const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

const pad = (n: number) => String(n).padStart(2, '0')

/** What a visitor sees until they save a trip: a sample countdown 30 days out. */
export function createDefaultSettings(now = new Date()): TripSettings {
    const takeoff = new Date(now)
    takeoff.setDate(takeoff.getDate() + 30)
    takeoff.setHours(9, 0, 0, 0)
    return {
        destination: 'Your Next Adventure',
        takeoff: takeoff.toISOString(),
        photo: null,
    }
}

/** Formats an instant for `<input type="datetime-local">`, in the device's time zone. */
export function toDateTimeLocal(iso: string): string {
    const d = new Date(iso)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Reads a `datetime-local` value as device-local time. Returns null if it is not a valid date. */
export function fromDateTimeLocal(value: string): string | null {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Stored data is untrusted: it may be hand-edited, truncated or from an older version.
function parseStored(value: unknown): TripSettings | null {
    if (typeof value !== 'object' || value === null) return null
    const { version, destination, takeoff, photo } = value as Record<string, unknown>
    if (version !== STORAGE_VERSION) return null
    if (typeof destination !== 'string' || !destination.trim() || destination.length > MAX_DESTINATION_LENGTH) return null
    if (typeof takeoff !== 'string' || Number.isNaN(Date.parse(takeoff))) return null
    if (photo !== null && (typeof photo !== 'string' || !DATA_URL_PATTERN.test(photo))) return null
    return { destination, takeoff, photo }
}

export function loadSettings(): TripSettings | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw === null ? null : parseStored(JSON.parse(raw))
    } catch {
        return null
    }
}

// There is only one key, so saving always replaces the previous trip. A failed write
// leaves the previously saved trip untouched.
export function saveSettings(settings: TripSettings): SaveResult {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...settings }))
        return { ok: true }
    } catch (error) {
        const isQuota =
            error instanceof DOMException &&
            (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        return {
            ok: false,
            error: isQuota
                ? 'That photo is too big to store in this browser. Try a smaller one.'
                : 'This browser blocked saving. Check that site storage is allowed.',
        }
    }
}

export function clearSettings(): void {
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Storage is unavailable, so there is nothing to clear.
    }
}

export function useTripSettings() {
    const [saved, setSaved] = useState<TripSettings | null>(loadSettings)
    // Computed once per page load so the sample countdown does not move while it is open.
    const [defaults] = useState(() => createDefaultSettings())

    const save = useCallback((next: TripSettings): SaveResult => {
        const result = saveSettings(next)
        if (result.ok) setSaved(next)
        return result
    }, [])

    const reset = useCallback(() => {
        clearSettings()
        setSaved(null)
    }, [])

    return { settings: saved ?? defaults, isCustom: saved !== null, save, reset }
}
