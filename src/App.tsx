import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import Confetti from 'react-confetti'
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import {useRef, useState} from "react";
import {useInterval, useMedia, useWindowSize} from "react-use";
import {differenceInCalendarDays, format, isToday, isTomorrow} from 'date-fns'
import {keyframes, timings, useAnimate} from './animations'
import SettingsPanel from './SettingsPanel'
import Snackbar from './Snackbar'
import {useNotice} from './notice'
import {usePageMeta} from './pageMeta'
import {buildShareUrl, useReceiveSharedTrip} from './shareLink'
import {styles} from './styles'
import {backgroundFor, useTripSettings} from './tripSettings'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// The flip clock is 320px wide with the narrow sizing in styles.ts. The card is 90% of the
// screen (up to 500px) minus 2 * 1rem of padding, so the clock is zoomed down to fit on
// small phones. Update NARROW_CLOCK_WIDTH if the clock's font size or digit width changes.
const NARROW_CLOCK_WIDTH = 320
const NARROW_CARD_PADDING = 32

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function describeStatus(takeoffMs: number, nowMs: number, destination: string): string {
    if (takeoffMs <= nowMs) return `Wheels up! Enjoy ${destination}`
    if (isToday(takeoffMs)) return 'Takeoff is today!'
    if (isTomorrow(takeoffMs)) return 'Takeoff is tomorrow!'
    return `${differenceInCalendarDays(takeoffMs, nowMs)} days to go`
}

// The flip clock changes every second, which would be unbearable to hear, so screen
// readers get a sentence that only changes once an hour.
function describeForScreenReader(remainingMs: number, destination: string): string {
    if (remainingMs <= 0) return `Takeoff time for ${destination} has arrived.`
    const days = Math.floor(remainingMs / DAY)
    const hours = Math.floor((remainingMs % DAY) / HOUR)
    return `${plural(days, 'day')} and ${plural(hours, 'hour')} until takeoff to ${destination}.`
}

// Mounted once per photo (the caller sets a key), so a new photo fades in instead of snapping.
function Backdrop({photo, animate}: { photo: string | null, animate: boolean }) {
    const ref = useRef<HTMLDivElement>(null)
    useAnimate(ref, keyframes.fadeIn, timings.fadeIn, animate)
    useAnimate(ref, keyframes.kenBurns, timings.kenBurns, animate)
    return <div ref={ref} data-testid="backdrop" style={{...styles.backdrop, backgroundImage: backgroundFor(photo)}}/>
}

function App() {
    const { settings, isCustom, save, reset } = useTripSettings()
    const { notice, notify, dismiss } = useNotice()
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [confettiDoneFor, setConfettiDoneFor] = useState<string | null>(null)
    const [now, setNow] = useState(() => Date.now())
    const cardRef = useRef<HTMLElement>(null)
    const { width, height } = useWindowSize()
    // No default value: this app never renders on a server, and a default would make the
    // first render ignore the visitor's preference.
    const prefersReducedMotion = useMedia('(prefers-reduced-motion: reduce)')

    useInterval(() => setNow(Date.now()), 1000)
    usePageMeta(settings.destination)
    useAnimate(cardRef, keyframes.rise, timings.rise, !prefersReducedMotion)
    useReceiveSharedTrip({ save, reset, notify })

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(buildShareUrl(settings))
            notify(`Link copied to the clipboard.${settings.photo ? ' Your photo is not included.' : ''}`)
        } catch {
            notify("Couldn't copy the link. Check that this browser allows clipboard access.")
        }
    }

    const takeoffMs = Date.parse(settings.takeoff)
    const remainingMs = takeoffMs - now
    const isFinished = remainingMs <= 0
    const isNarrow = width <= 600
    const narrowCardInnerWidth = Math.min(500, 0.9 * (width - 32)) - NARROW_CARD_PADDING
    const clockZoom = isNarrow ? Math.min(1, narrowCardInnerWidth / NARROW_CLOCK_WIDTH) : 1
    const showConfetti = isFinished && !prefersReducedMotion && confettiDoneFor !== settings.takeoff

    return (
        <div style={styles.page}>
            <Backdrop key={settings.photo ?? 'default'} photo={settings.photo} animate={!prefersReducedMotion} />
            <div style={styles.scrim} />

            <div style={styles.topBar}>
                {/* Only a saved trip can be shared, not the sample countdown. */}
                {isCustom && (
                    <button type="button" onClick={handleShare} style={styles.pillButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.6 13.5 6.8 4" />
                            <path d="m15.4 6.5-6.8 4" />
                        </svg>
                        Share
                    </button>
                )}
                <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => setIsPanelOpen(true)}
                    style={styles.pillButton}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Customize
                </button>
            </div>

            <main ref={cardRef} style={{ ...styles.card, ...(isNarrow && styles.cardNarrow) }}>
                <h1 style={{ ...styles.heading, ...(isNarrow && styles.headingNarrow) }}>
                    <span style={{ ...styles.eyebrow, ...(isNarrow && styles.eyebrowNarrow) }}>
                        Countdown to
                    </span>
                    {settings.destination}
                </h1>

                <div aria-hidden="true" style={{ zoom: clockZoom }}>
                    <FlipClockCountdown
                        key={settings.takeoff}
                        to={takeoffMs}
                        hideOnComplete={false}
                        labelStyle={styles.clockLabel}
                        separatorStyle={styles.clockSeparator}
                        digitBlockStyle={isNarrow ? styles.clockDigitNarrow : styles.clockDigit}
                        style={isNarrow ? styles.clockNarrow : styles.clock}
                    />
                </div>
                <p style={styles.srOnly} role="timer" aria-live="polite" aria-atomic="true">
                    {describeForScreenReader(remainingMs, settings.destination)}
                </p>

                <p style={{ ...styles.status, ...(isNarrow && styles.statusNarrow) }}>
                    {describeStatus(takeoffMs, now, settings.destination)}
                </p>
                <p style={styles.takeoffLine}>
                    {isFinished ? 'Took off' : 'Takeoff'} {format(takeoffMs, "EEEE d MMMM yyyy 'at' HH:mm")}
                </p>

                {isFinished && (
                    <button type="button" onClick={() => setIsPanelOpen(true)} style={styles.planNextButton}>
                        Plan your next trip
                    </button>
                )}
                {!isCustom && !isFinished && (
                    <p style={styles.hint}>
                        This is a sample countdown. Use Customize to plan your own trip.
                    </p>
                )}
            </main>

            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={400}
                    onConfettiComplete={() => setConfettiDoneFor(settings.takeoff)}
                    style={styles.confetti}
                />
            )}

            <Snackbar notice={notice} onDismiss={dismiss} animate={!prefersReducedMotion} />

            {isPanelOpen && (
                <SettingsPanel
                    settings={settings}
                    isCustom={isCustom}
                    onSave={save}
                    onReset={reset}
                    onClose={() => setIsPanelOpen(false)}
                />
            )}
        </div>
    )
}

export default App
