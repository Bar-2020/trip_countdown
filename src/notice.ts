import { useCallback, useRef, useState } from 'react'

export interface NoticeAction {
    label: string
    onClick: () => void
}

export interface Notice {
    /** Changes with every message, so the snack bar restarts its timer and animation. */
    id: number
    message: string
    action?: NoticeAction
}

/** State for the snack bar. `notify` replaces any message that is already showing. */
export function useNotice() {
    const [notice, setNotice] = useState<Notice | null>(null)
    const nextId = useRef(0)

    const notify = useCallback((message: string, action?: NoticeAction) => {
        nextId.current += 1
        setNotice({ id: nextId.current, message, action })
    }, [])

    const dismiss = useCallback(() => setNotice(null), [])

    return { notice, notify, dismiss }
}
