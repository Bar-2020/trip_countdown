import type { CSSProperties } from 'react'

const baseButton = {
    padding: '0.65rem 1.1rem',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '0.6rem',
    border: '1px solid transparent',
} satisfies CSSProperties

const primaryButton = { ...baseButton, color: '#fff', background: '#0f766e' } satisfies CSSProperties

const secondaryButton = {
    ...baseButton,
    color: '#16202e',
    background: '#fff',
    borderColor: '#94a3b8',
} satisfies CSSProperties

const label = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.9rem',
    fontWeight: 600,
} satisfies CSSProperties

const smallText = {
    fontSize: '0.8rem',
    color: '#334155',
} satisfies CSSProperties

// Every style in the app lives here. Variants for narrow screens (`*Narrow`) and states
// are separate keys that the components spread on top of the base. Only values that come
// from runtime data (a photo URL, the clock zoom) are set where they are used.
export const styles = {
    // Page
    page: {
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
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    scrim: {
        position: 'absolute',
        inset: 0,
        background:
            'linear-gradient(180deg, rgba(8, 15, 28, 0.35) 0%, rgba(8, 15, 28, 0.1) 45%, rgba(8, 15, 28, 0.5) 100%)',
    },
    customizeButton: {
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
    },

    // Countdown card
    card: {
        position: 'relative',
        zIndex: 1,
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
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
    },
    cardNarrow: { padding: '1.25rem 1rem' },
    heading: {
        margin: '0 0 1.5rem 0',
        textAlign: 'center',
        lineHeight: 1.15,
        fontSize: '2.4rem',
        overflowWrap: 'anywhere',
    },
    headingNarrow: { margin: '0 0 1rem 0', fontSize: '1.7rem' },
    eyebrow: {
        display: 'block',
        marginBottom: '0.3rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#115e59',
    },
    eyebrowNarrow: { fontSize: '0.7rem' },

    // Flip clock, passed to its style props
    clock: { fontSize: '0.9rem' },
    clockNarrow: { fontSize: '0.45rem' },
    clockDigit: { width: '40px' },
    clockDigitNarrow: { width: '30px' },
    clockLabel: { color: 'black' },
    clockSeparator: { color: 'black' },

    status: { margin: '1.4rem 0 0', fontSize: '1.4rem', fontWeight: 700, textAlign: 'center' },
    statusNarrow: { margin: '1rem 0 0', fontSize: '1.15rem' },
    takeoffLine: { margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#334155', textAlign: 'center' },
    hint: { margin: '1rem 0 0', fontSize: '0.85rem', color: '#334155', textAlign: 'center' },
    primaryButton,
    planNextButton: { ...primaryButton, marginTop: '1.1rem' },
    confetti: { position: 'fixed', zIndex: 3, pointerEvents: 'none' },
    // Read by screen readers, invisible on screen.
    srOnly: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
    },

    // Customize dialog. The <dialog> is the full-screen dim overlay, since a ::backdrop
    // cannot be styled inline. dialogWrapper centers the panel and catches outside clicks.
    dialog: {
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        margin: 0,
        padding: 0,
        border: 'none',
        background: 'rgba(8, 15, 28, 0.56)',
        backdropFilter: 'blur(4px)',
    },
    dialogWrapper: {
        boxSizing: 'border-box',
        minHeight: '100%',
        padding: '4dvh 4vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogPanel: {
        boxSizing: 'border-box',
        width: 'min(100%, 30rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        padding: '1.5rem',
        borderRadius: '1.25rem',
        color: '#16202e',
        background: '#fff',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
    },
    dialogTitle: { margin: 0, fontSize: '1.35rem' },
    dialogIntro: { margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#334155' },
    label,
    // 16px text stops iOS Safari from zooming the page when a field is focused.
    input: {
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
    },
    helpText: { ...smallText, margin: '0.35rem 0 0' },
    fieldset: { margin: 0, padding: 0, border: 'none', minWidth: 0 },
    legend: { ...label, padding: 0 },
    photoPreview: {
        height: '9rem',
        borderRadius: '0.75rem',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    photoActions: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.6rem',
    },
    smallButton: { ...secondaryButton, padding: '0.5rem 0.9rem', fontSize: '0.9rem' },
    photoNote: { ...smallText, margin: '0.5rem 0 0' },
    error: {
        margin: 0,
        padding: '0.6rem 0.75rem',
        borderRadius: '0.5rem',
        background: '#fee2e2',
        color: '#7f1d1d',
        fontSize: '0.9rem',
    },
    actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' },
    resetButton: { ...secondaryButton, color: '#991b1b', borderColor: '#fca5a5', marginRight: 'auto' },
    cancelButton: secondaryButton,
    pushRight: { marginLeft: 'auto' },
    buttonDisabled: { cursor: 'progress', opacity: 0.7 },
} satisfies Record<string, CSSProperties>
