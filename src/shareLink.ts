import { useLayoutEffect } from 'react'
import type { NoticeAction } from './notice'
import { isValidDestination, isValidTakeoff, loadSettings } from './tripSettings'
import type { SaveResult, TripSettings } from './tripSettings'

const DESTINATION_PARAM = 'destination'
const TAKEOFF_PARAM = 'takeoff'

/**
 * The link that shares a trip: this page with the destination and takeoff as query
 * parameters. The photo is left out on purpose. Even after compression a photo is a
 * base64 string of about 190 KB for a smooth shot and 1.7 MB for a very detailed one
 * (3 MB at most), which would turn a link of about 100 characters into one of hundreds
 * of thousands. Chat apps break such links and CloudFront answers URLs over 8,192 bytes
 * with a 414.
 */
export function buildShareUrl(trip: TripSettings, pageUrl = window.location.href): string {
    const url = new URL(pageUrl)
    url.search = ''
    url.hash = ''
    url.searchParams.set(DESTINATION_PARAM, trip.destination)
    url.searchParams.set(TAKEOFF_PARAM, new Date(trip.takeoff).toISOString())
    return url.href
}

export type ShareLink = { kind: 'none' } | { kind: 'invalid' } | { kind: 'trip'; trip: TripSettings }

/** Reads a shared trip from a query string. A link is untrusted input, like stored data. */
export function readShareLink(search: string): ShareLink {
    const params = new URLSearchParams(search)
    const destination = params.get(DESTINATION_PARAM)
    const takeoff = params.get(TAKEOFF_PARAM)
    if (destination === null && takeoff === null) return { kind: 'none' }
    if (!isValidDestination(destination) || !isValidTakeoff(takeoff)) return { kind: 'invalid' }
    return {
        kind: 'trip',
        trip: { destination: destination.trim(), takeoff: new Date(takeoff).toISOString(), photo: null },
    }
}

/** Takes the share parameters out of the address bar, so a reload does not apply the link again. */
function removeShareParams(): void {
    const url = new URL(window.location.href)
    url.searchParams.delete(DESTINATION_PARAM)
    url.searchParams.delete(TAKEOFF_PARAM)
    window.history.replaceState(window.history.state, '', url.href)
}

interface ReceiveSharedTripOptions {
    save: (trip: TripSettings) => SaveResult
    reset: () => void
    notify: (message: string, action?: NoticeAction) => void
}

/**
 * When the page opens from a share link, saves the shared trip, tells the visitor with an
 * Undo for the trip it replaced, and removes the link's parameters from the address bar.
 */
export function useReceiveSharedTrip({ save, reset, notify }: ReceiveSharedTripOptions): void {
    // A layout effect, so the shared trip replaces the old one before the first paint.
    useLayoutEffect(() => {
        const link = readShareLink(window.location.search)
        if (link.kind === 'none') return
        // Removed first, so the second run of this effect in StrictMode finds nothing to do.
        removeShareParams()
        if (link.kind === 'invalid') return notify('That share link is incomplete, so it was ignored.')

        const { trip } = link
        const previous = loadSettings()
        // Opening your own link must not replace the trip with a copy that has lost its photo.
        if (previous && previous.destination === trip.destination && Date.parse(previous.takeoff) === Date.parse(trip.takeoff)) {
            return
        }

        if (!save(trip).ok) return notify("Couldn't save the shared trip. Check that site storage is allowed.")
        notify(`You've been shared a trip to ${trip.destination}.`, {
            label: 'Undo',
            onClick: () => {
                if (!previous) return reset()
                const restored = save(previous)
                if (!restored.ok) notify(restored.error)
            },
        })
    }, [save, reset, notify])
}
