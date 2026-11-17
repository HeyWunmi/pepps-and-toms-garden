import { useState } from 'react'
import { Badge, Panel, PreviewNote } from '../../components/UI'
import PlantPhoto from '../../components/PlantPhoto'
import type { PlantAdviceDraft } from './types'

export default function PlantAdvicePreview() {
  const [draft, setDraft] = useState<PlantAdviceDraft>({ plantId: 'tomato', observations: '', photos: [], soilMoisture: 'unknown', adminReviewRequested: false })
  return <Panel title="Ask about my plant" action={<Badge>Planned</Badge>}>
    <PreviewNote>Future care-advice interface. You can explore a local draft, but no AI is connected, no diagnosis is generated and nothing is submitted. Admin review and notifications are not available.</PreviewNote>
    <form onSubmit={event => event.preventDefault()}>
      <div className="form-grid">
        <label>Plant<select value={draft.plantId} onChange={event => setDraft({ ...draft, plantId: event.target.value })}><option value="tomato">Cherry tomato · Nursery</option><option value="pepper">Sweet pepper · Nursery</option><option value="basil">Sweet basil · Personal</option></select></label>
        <label>Soil moisture observation<select value={draft.soilMoisture} onChange={event => setDraft({ ...draft, soilMoisture: event.target.value as PlantAdviceDraft['soilMoisture'] })}><option value="unknown">Not checked</option><option value="dry">Feels dry</option><option value="damp">Feels damp</option><option value="wet">Feels wet</option></select></label>
        <label className="full-width">Observations<textarea rows={3} placeholder="Describe what you have noticed" value={draft.observations} onChange={event => setDraft({ ...draft, observations: event.target.value })} /></label>
        <PlantPhoto label="Care question photograph" file={draft.photos[0] ?? null} onChange={file => setDraft(previous => ({ ...previous, photos: file ? [file] : [] }))} />
      </div>
      <label className="advice-review"><input type="checkbox" disabled checked={false} readOnly />Request admin review <Badge>Planned</Badge></label>
      <div className="form-footer"><button className="button" type="submit" disabled>Care advice is not connected</button><span>This draft is discarded when you leave this screen or reload.</span></div>
    </form>
  </Panel>
}
