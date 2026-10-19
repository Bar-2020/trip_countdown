import { useEffect } from 'react'

const escapeXml = (text: string) =>
    text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

// A rounded square with the destination's first letter, so each trip gets its own tab icon.
function faviconFor(destination: string): string {
    const initial = escapeXml(Array.from(destination.trim())[0]?.toUpperCase() ?? '✈')
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#0369a1"/>` +
        `</linearGradient></defs>` +
        `<rect width="64" height="64" rx="16" fill="url(#g)"/>` +
        `<text x="32" y="45" font-size="36" font-weight="700" font-family="system-ui, sans-serif" ` +
        `text-anchor="middle" fill="#fff">${initial}</text></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Keeps the browser tab title and icon in sync with the destination. */
export function usePageMeta(destination: string): void {
    useEffect(() => {
        document.title = `${destination} Countdown`
        const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
        if (link) {
            link.type = 'image/svg+xml'
            link.href = faviconFor(destination)
        }
    }, [destination])
}
