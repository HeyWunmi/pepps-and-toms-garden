import type { ReactNode } from 'react'
import { ArrowUpRight, Info, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow || 'GARDEN COMPANION'}</p><h1>{title}</h1><p className="description">{description}</p></div>{action}</div>
}
export function Panel({ title, children, action, className = '' }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{action}</div>{children}</section>
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span> }
export function PreviewNote({ children = 'Form preview only. You can explore the fields, but saving is unavailable until accounts and storage are connected.' }: { children?: ReactNode }) {
  return <div className="preview-note"><Info size={17} aria-hidden="true" /><p>{children}</p></div>
}
export function PageLink({ to, children }: { to: string; children: ReactNode }) { return <Link className="text-link" to={to}>{children}<ArrowUpRight size={15} aria-hidden="true" /></Link> }
export function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) { return <article className="stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article> }
export function PlantMark({ red = false }: { red?: boolean }) { return <span className={`plant-mark ${red ? 'red' : ''}`}><Sprout size={25} aria-hidden="true" /></span> }
export function PreviewForm({ children, label = 'Save unavailable' }: { children: ReactNode; label?: string }) {
  return <form onSubmit={event => event.preventDefault()}><PreviewNote /><div className="form-grid">{children}</div><div className="form-footer"><button className="button" disabled type="submit">{label}</button><span>Nothing entered here is saved or sent.</span></div></form>
}
export function PlantSelect() { return <label>Plant<select defaultValue="tomato"><option value="tomato">Cherry tomato · Nursery</option><option value="pepper">Sweet pepper · Nursery</option><option value="basil">Sweet basil · Personal</option></select></label> }
