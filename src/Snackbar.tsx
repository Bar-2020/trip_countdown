import { useEffect, useRef } from 'react'
import { keyframes, timings, useAnimate } from './animations'
import type { Notice } from './notice'
import { styles } from './styles'

const MESSAGE_MS = 5_000
// A message with an Undo stays longer, so there is time to read it and decide.
const ACTION_MS = 10_000

interface SnackbarProps {
    notice: Notice | null
    onDismiss: () => void
    animate: boolean
}

function Message({ notice, onDismiss, animate }: SnackbarProps & { notice: Notice }) {
    const ref = useRef<HTMLDivElement>(null)
    const { action } = notice
    useAnimate(ref, keyframes.slideUp, timings.slideUp, animate)

    useEffect(() => {
        const timer = setTimeout(onDismiss, action ? ACTION_MS : MESSAGE_MS)
        return () => clearTimeout(timer)
    }, [action, onDismiss])

    return (
        <div ref={ref} style={styles.snackbar}>
            <span>{notice.message}</span>
            {action && (
                <button
                    type="button"
                    onClick={() => {
                        action.onClick()
                        onDismiss()
                    }}
                    style={styles.snackbarAction}
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}

function Snackbar({ notice, onDismiss, animate }: SnackbarProps) {
    // The live region is always mounted, so screen readers announce each message as it appears.
    return (
        <div role="status" style={styles.snackbarRegion}>
            {notice && <Message key={notice.id} notice={notice} onDismiss={onDismiss} animate={animate} />}
        </div>
    )
}

export default Snackbar
