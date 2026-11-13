import { useEffect, useState } from 'react'

export const MAX_PLANT_PHOTO_BYTES = 5 * 1024 * 1024
export const PLANT_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'
const extensions: Record<string, RegExp> = {
  'image/jpeg': /\.jpe?g$/i,
  'image/png': /\.png$/i,
  'image/webp': /\.webp$/i,
}

// Client validation is for usability. Future Storage uploads must also be validated
// and authorised server-side. Keep the File separate from temporary display URLs.
export async function validatePlantPhoto(file: File): Promise<string | null> {
  if (!extensions[file.type]?.test(file.name)) return 'Choose a JPG, PNG or WebP image. Convert HEIC photos to JPG first.'
  if (file.size === 0) return 'This file is empty. Choose another photograph.'
  if (file.size > MAX_PLANT_PHOTO_BYTES) return 'This image is too large. Choose a photograph of 5 MB or less.'
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const matches = file.type === 'image/jpeg'
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : file.type === 'image/png'
      ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
      : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (!matches) return 'The file content does not match its image type. Choose another JPG, PNG or WebP.'
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => image.naturalWidth > 0 ? resolve() : reject(new Error('Empty image'))
      image.onerror = () => reject(new Error('Unreadable image'))
      image.src = url
    })
    return null
  } catch {
    return 'This image could not be opened. Choose another photograph.'
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function useLocalPhotoUrl(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview({ file, url })
    return () => URL.revokeObjectURL(url)
  }, [file])
  return preview?.file === file ? preview.url : undefined
}
