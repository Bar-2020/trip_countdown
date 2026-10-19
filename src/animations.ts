import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

export const keyframes = {
    fadeIn: [{ opacity: 0 }, { opacity: 1 }],
    kenBurns: [
        { transform: 'scale(1.04) translate3d(0, 0, 0)' },
        { transform: 'scale(1.14) translate3d(-1.5%, -1%, 0)' },
    ],
    rise: [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' },
    ],
    slideUp: [
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
    ],
} satisfies Record<string, Keyframe[]>

export const timings = {
    fadeIn: { duration: 900, easing: 'ease-out', fill: 'both' },
    kenBurns: { duration: 40_000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' },
    rise: { duration: 600, easing: 'ease-out', fill: 'both' },
    slideUp: { duration: 250, easing: 'ease-out', fill: 'both' },
} satisfies Record<string, KeyframeAnimationOptions>

/**
 * Plays a Web Animations API animation on the referenced element while `enabled` is true.
 * It runs in a layout effect so the first frame is already animated, with no flash of the
 * finished state. Pass `enabled = false` for visitors who prefer reduced motion.
 */
export function useAnimate(
    ref: RefObject<HTMLElement | null>,
    frames: Keyframe[],
    options: KeyframeAnimationOptions,
    enabled: boolean,
): void {
    useLayoutEffect(() => {
        const element = ref.current
        if (!element || !enabled) return
        const animation = element.animate(frames, options)
        return () => animation.cancel()
    }, [ref, frames, options, enabled])
}
