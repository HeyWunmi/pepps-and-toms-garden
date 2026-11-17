import { useState } from 'react'
import { Bell, Mail } from 'lucide-react'
import { tasks, shortDate, plants } from '../data'
import type { TaskStatus } from '../data'
import { Badge, Panel, PreviewNote } from './UI'
export default function Reminders({ admin = false }: { admin?: boolean }) {
  const [status,setStatus]=useState<TaskStatus>('Upcoming')
  return <><div className="tabs" aria-label="Task status">{(['Upcoming','Completed','Overdue'] as const).map(item=><button key={item} aria-pressed={status===item} onClick={()=>setStatus(item)}>{item}<span>{tasks.filter(t=>t.status===item).length}</span></button>)}</div>
    <Panel title={`${status} care tasks`} action={<Badge>Sample data</Badge>}>{tasks.filter(t=>t.status===status).map(task=><article className="task-row" key={task.title}><span className="small-icon"><Bell size={19} /></span><div className="task-copy"><h3>{task.title}</h3><p>{task.plant} · {plants.find(plant=>plant.name===task.plant)?.origin==='Nursery'?'Pepps & Toms nursery':'Personal plant'}{admin?' · Sample grower A':''}</p><p className="helper">{task.detail}</p></div><div className="task-meta"><Badge tone={status==='Overdue'?'red':''}>{status}</Badge><small>{shortDate(task.date)} 2026</small></div></article>)}</Panel>
    <PreviewNote>Task statuses above are fixed examples. Tasks cannot be completed or rescheduled yet, and no background reminders are running.</PreviewNote>
    <Panel title="Email reminders"><div className="list-row"><div className="flex-line"><Mail size={20} /><div><h3>Email delivery</h3><p>Planned for a later milestone. No messages are sent.</p></div></div><Badge>Planned</Badge></div></Panel>
  </>
}
