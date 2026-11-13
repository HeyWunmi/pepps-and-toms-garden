import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge, Panel } from './UI'
import { tasks } from '../data'
const events = [
  ...tasks.map(task => ({ date: task.date, title: task.title, plant: task.plant, type: 'Care' })),
  { date: '2026-11-05', title: 'Plant sweet pepper', plant: 'Sweet pepper', type: 'Planting' },
  { date: '2026-11-20', title: 'Harvest window begins', plant: 'Cherry tomato', type: 'Harvest' },
  { date: '2026-11-27', title: 'Harvest window ends', plant: 'Cherry tomato', type: 'Harvest' },
]
function key(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` }
export default function Calendar() {
  const [view, setView] = useState<'month' | 'week'>('month')
  const [anchor, setAnchor] = useState(new Date(2026,10,13))
  const [selected, setSelected] = useState('2026-11-14')
  const [kind, setKind] = useState('All')
  const first = new Date(anchor.getFullYear(),anchor.getMonth(),view === 'month' ? 1 : anchor.getDate())
  first.setDate(first.getDate() - (first.getDay()+6)%7)
  const days = Array.from({length: view === 'month' ? 42 : 7},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i))
  const move = (direction: number) => { const next = new Date(anchor); if(view==='month') { next.setDate(1); next.setMonth(next.getMonth()+direction) } else next.setDate(next.getDate()+direction*7); setAnchor(next) }
  const matching = events.filter(event => event.date===selected && (kind==='All' || event.type===kind))
  return <><Panel title="Care calendar" action={<div className="segmented" aria-label="Calendar view">{(['month','week'] as const).map(mode=><button key={mode} onClick={()=>setView(mode)} aria-pressed={view===mode}>{mode==='month'?'Month':'Week'}</button>)}</div>}>
    <div className="calendar-toolbar"><div className="calendar-date"><button className="icon-button" aria-label="Previous period" onClick={()=>move(-1)}><ChevronLeft size={18} /></button><h3>{anchor.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</h3><button className="icon-button" aria-label="Next period" onClick={()=>move(1)}><ChevronRight size={18} /></button></div><label className="compact-label">Event type<select value={kind} onChange={e=>setKind(e.target.value)}>{['All','Planting','Care','Harvest'].map(t=><option key={t}>{t}</option>)}</select></label></div>
    <p className="helper">Illustrative schedule: November 2026. Select a date to inspect sample events.</p>
    <div className="calendar-grid weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d}>{d}</span>)}</div>
    <div className={`calendar-grid ${view}`} >{days.map(date=>{const id=key(date);const entries=events.filter(event=>event.date===id&&(kind==='All'||event.type===kind));return <button key={id} className={`calendar-day ${date.getMonth()!==anchor.getMonth()?'outside':''} ${selected===id?'selected':''}`} onClick={()=>setSelected(id)} aria-pressed={selected===id} aria-label={`${date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}, ${entries.length} sample events`}><span>{date.getDate()}</span><div className="event-dots">{entries.map((event,i)=><i key={i} className={event.type.toLowerCase()} />)}</div><span className="calendar-event-text">{entries[0]?.title}</span></button>})}</div>
    <div className="calendar-legend"><span><i className="planting" />Planting</span><span><i className="care" />Care task</span><span><i className="harvest" />Harvest window</span></div>
    </Panel><Panel title={`Selected date · ${new Date(selected+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`}>
      {matching.length ? matching.map(event=><div className="list-row" key={event.title}><div><h3>{event.title}</h3><p>{event.plant}</p></div><Badge tone={event.type==='Harvest'?'red':''}>{event.type}</Badge></div>):<p className="empty-state">No sample events for this date and filter.</p>}
    </Panel></>
}
