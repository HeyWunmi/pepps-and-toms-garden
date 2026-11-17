import { useEffect, useId, useRef, useState } from 'react'
import { Camera, ImagePlus, Sprout, X } from 'lucide-react'
import { PLANT_PHOTO_ACCEPT, useLocalPhotoUrl, validatePlantPhoto } from '../lib/plantPhotos'

export function PlantCover({ file, name = 'Plant', compact = false }: { file: File | null; name?: string; compact?: boolean }) {
  const url = useLocalPhotoUrl(file)
  return <div className={`plant-cover ${compact ? 'compact' : ''}`}>
    {url ? <img src={url} alt={`${name} photograph preview`} /> : <div className="plant-photo-placeholder"><Sprout size={compact ? 24 : 32} aria-hidden="true" /><span>No photograph</span></div>}
  </div>
}

export default function PlantPhoto({ file, onChange, label = 'Plant photograph' }: { file: File | null; onChange: (file: File | null) => void; label?: string }) {
  const id = useId()
  const picker = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const request = useRef(0)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  useEffect(() => () => { request.current++ }, [])
  async function select(file: File | undefined) {
    if (!file) return // Cancelling a device picker keeps the current photo.
    const selection = ++request.current
    setChecking(true)
    setError('')
    let message: string | null
    try { message = await validatePlantPhoto(file) }
    catch { message = 'This photograph could not be read. Please choose another file.' }
    if (selection !== request.current) return
    setChecking(false)
    if (message) { setError(message); return }
    onChange(file)
  }
  function remove() { request.current++; setChecking(false); setError(''); onChange(null) }
  return <fieldset className="plant-photo-field full-width" aria-describedby={`${id}-help ${id}-error`}>
    <legend>{label} <span className="helper">(optional)</span></legend>
    <p id={`${id}-help`} className="helper">JPG, PNG or WebP · maximum 5 MB. Photos stay in this screen’s memory only; they are not uploaded or saved.</p>
    <div className="photo-controls">
      <button className="secondary-button" type="button" onClick={() => picker.current?.click()}><ImagePlus size={17} aria-hidden="true" />Choose photo</button>
      <button className="secondary-button" type="button" onClick={() => camera.current?.click()}><Camera size={17} aria-hidden="true" />Take photo</button>
      {file && <button type="button" className="secondary-button" onClick={remove}><X size={17} aria-hidden="true" />Remove photo</button>}
    </div>
    <input ref={picker} className="visually-hidden" type="file" accept={PLANT_PHOTO_ACCEPT} aria-label={`${label}: choose from device`} aria-describedby={`${id}-help ${id}-error`} onChange={event => { void select(event.target.files?.[0]); event.target.value = '' }} />
    <input ref={camera} className="visually-hidden" type="file" accept={PLANT_PHOTO_ACCEPT} capture="environment" aria-label={`${label}: use camera`} aria-describedby={`${id}-help ${id}-error`} onChange={event => { void select(event.target.files?.[0]); event.target.value = '' }} />
    <p className="helper">Camera capture depends on your phone and browser; a file picker may open instead.</p>
    <p id={`${id}-error`} className="photo-error" role="alert">{error}{error && file ? ' Your previous photograph is still selected.' : ''}</p>
    <p className="helper" role="status">{checking ? 'Checking photograph…' : file ? `Selected locally: ${file.name}` : 'No photograph selected.'}</p>
    <PlantCover file={file} name="Selected plant" />
  </fieldset>
}
