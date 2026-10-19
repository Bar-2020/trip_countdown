import './App.css'
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import Confetti from 'react-confetti'
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import {useState} from "react";
import type {CSSProperties} from "react";
import {useInterval, useMedia, useWindowSize} from "react-use";
import {differenceInCalendarDays, format, isToday, isTomorrow} from 'date-fns'
import SettingsPanel from './SettingsPanel'
import {usePageMeta} from './pageMeta'
import {backgroundFor, useTripSettings} from './tripSettings'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// The flip clock is 320px wide with the narrow sizing below. The card is 90% of the screen
// (up to 500px) minus 2 * 1rem of padding, so the clock is zoomed down to fit on small phones.
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

const primaryButtonStyle: CSSProperties = {
    padding: '0.65rem 1.1rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    background: '#0f766e',
    border: '1px solid transparent',
    borderRadius: '0.6rem',
}

function App() {
    const { settings, isCustom, save, reset } = useTripSettings()
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [confettiDoneFor, setConfettiDoneFor] = useState<string | null>(null)
    const [now, setNow] = useState(() => Date.now())
    const { width, height } = useWindowSize()
    const prefersReducedMotion = useMedia('(prefers-reduced-motion: reduce)', false)

    useInterval(() => setNow(Date.now()), 1000)
    usePageMeta(settings.destination)

    const takeoffMs = Date.parse(settings.takeoff)
    const remainingMs = takeoffMs - now
    const isFinished = remainingMs <= 0
    const isNarrow = width <= 600
    const narrowCardInnerWidth = Math.min(500, 0.9 * (width - 32)) - NARROW_CARD_PADDING
    const clockZoom = isNarrow ? Math.min(1, narrowCardInnerWidth / NARROW_CLOCK_WIDTH) : 1
    const showConfetti = isFinished && !prefersReducedMotion && confettiDoneFor !== settings.takeoff

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                minHeight: '100dvh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                boxSizing: 'border-box',
                background: '#0f172a',
            }}
        >
            {/* The photo is keyed so a new one fades in instead of snapping. */}
            <div
                key={settings.photo ?? 'default'}
                className="trip-backdrop"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: backgroundFor(settings.photo),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(8, 15, 28, 0.35) 0%, rgba(8, 15, 28, 0.1) 45%, rgba(8, 15, 28, 0.5) 100%)',
                }}
            />

            <button
                type="button"
                className="trip-btn"
                aria-haspopup="dialog"
                onClick={() => setIsPanelOpen(true)}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: 'rgba(255, 255, 255, 0.82)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '999px',
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Customize
            </button>

            <main
                className="trip-rise"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: '1.5rem',
                    padding: isNarrow ? '1.25rem 1rem' : '2rem 2.25rem',
                    color: '#0f172a',
                    backgroundColor: 'rgba(255, 255, 255, 0.78)',
                    backdropFilter: 'blur(14px) saturate(1.2)',
                    border: '1px solid rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '90%',
                    maxWidth: '500px',
                    boxSizing: 'border-box',
                }}
            >
                <h1 style={{
                    margin: isNarrow ? '0 0 1rem 0' : '0 0 1.5rem 0',
                    textAlign: 'center',
                    lineHeight: 1.15,
                    fontSize: isNarrow ? '1.7rem' : '2.4rem',
                    overflowWrap: 'anywhere',
                }}>
                    <span style={{
                        display: 'block',
                        marginBottom: '0.3rem',
                        fontSize: isNarrow ? '0.7rem' : '0.8rem',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#115e59',
                    }}>
                        Countdown to
                    </span>
                    {settings.destination}
                </h1>

                <div aria-hidden="true" style={{ zoom: clockZoom }}>
                    <FlipClockCountdown
                        key={settings.takeoff}
                        to={takeoffMs}
                        hideOnComplete={false}
                        labelStyle={{ color: 'black' }}
                        style={{
                            fontSize: isNarrow ? '0.45rem' : '0.9rem',
                            // @ts-expect-error Added to adjust countdown width
                            '--fcc-digit-block-width': isNarrow ? '30px' : '40px',
                        }}
                    />
                </div>
                <p className="trip-sr-only" role="timer" aria-live="polite" aria-atomic="true">
                    {describeForScreenReader(remainingMs, settings.destination)}
                </p>

                <p style={{ margin: isNarrow ? '1rem 0 0' : '1.4rem 0 0', fontSize: isNarrow ? '1.15rem' : '1.4rem', fontWeight: 700, textAlign: 'center' }}>
                    {describeStatus(takeoffMs, now, settings.destination)}
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#334155', textAlign: 'center' }}>
                    {isFinished ? 'Took off' : 'Takeoff'} {format(takeoffMs, "EEEE d MMMM yyyy 'at' HH:mm")}
                </p>

                {isFinished && (
                    <button
                        type="button"
                        className="trip-btn"
                        onClick={() => setIsPanelOpen(true)}
                        style={{ ...primaryButtonStyle, marginTop: '1.1rem' }}
                    >
                        Plan your next trip
                    </button>
                )}
                {!isCustom && !isFinished && (
                    <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: '#334155', textAlign: 'center' }}>
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
                    style={{ position: 'fixed', zIndex: 3, pointerEvents: 'none' }}
                />
            )}

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
