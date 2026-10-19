const MAX_SIDE = 2560
const JPEG_QUALITIES = [0.8, 0.65, 0.5]
// localStorage allows roughly 5 million characters per origin, so stay well below that.
const MAX_DATA_URL_LENGTH = 3_000_000

/**
 * Resizes an uploaded photo to at most 2560 px on its long side and re-encodes it as a
 * JPEG data URL small enough to keep in localStorage. The photo fills the screen, so a
 * smaller size looks soft on high-density displays. Rejects with a message that is
 * safe to show to the visitor.
 */
export async function compressImage(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error('That file is not an image. Please choose a JPEG, PNG or WebP photo.')
    }

    let bitmap: ImageBitmap
    try {
        bitmap = await createImageBitmap(file)
    } catch {
        throw new Error("That image couldn't be read. Try a JPEG, PNG or WebP photo.")
    }

    try {
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(bitmap.width * scale))
        canvas.height = Math.max(1, Math.round(bitmap.height * scale))

        const context = canvas.getContext('2d')
        if (!context) throw new Error("This browser can't process images.")
        // The default filter skips pixels when a large photo is shrunk, which breaks thin lines
        // such as branches and wires into jagged dashes. 'high' averages them instead.
        context.imageSmoothingQuality = 'high'
        // JPEG has no transparency, so flatten PNG and WebP onto white.
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

        for (const quality of JPEG_QUALITIES) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl
        }
        throw new Error('That photo is still too large after compressing. Try a smaller one.')
    } finally {
        bitmap.close()
    }
}
