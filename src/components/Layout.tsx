import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeftRight, BookOpen, CalendarDays, ChartNoAxesCombined, CircleHelp, ClipboardList, House, LayoutDashboard, Leaf, Menu, Package, Settings, ShieldCheck, Sprout, Users, Wheat, X, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import BackButton from './BackButton'

export type NavItem = { path: string; label: string; icon: LucideIcon }
export const customerNav: NavItem[] = [
  { path: 'dashboard', label: 'Dashboard', icon: House }, { path: 'plants', label: 'My Plants', icon: Sprout },
  { path: 'calendar', label: 'Calendar', icon: CalendarDays }, { path: 'reminders', label: 'Reminders', icon: Bell },
  { path: 'journal', label: 'Growth Journal', icon: BookOpen }, { path: 'harvest', label: 'Harvest Log', icon: Wheat },
  { path: 'support', label: 'Support', icon: CircleHelp }, { path: 'settings', label: 'Settings', icon: Settings },
]
export const adminNav: NavItem[] = [
  { path: 'overview', label: 'Overview', icon: LayoutDashboard }, { path: 'inventory', label: 'Nursery Inventory', icon: Package },
  { path: 'customers', label: 'Customers', icon: Users }, { path: 'calendar', label: 'Care Calendar', icon: CalendarDays },
  { path: 'reminders', label: 'Reminders', icon: Bell }, { path: 'assignments', label: 'Plant Assignments', icon: ClipboardList },
  { path: 'support', label: 'Support', icon: CircleHelp }, { path: 'reports', label: 'Reports', icon: ChartNoAxesCombined },
]
export default function Layout({ admin = false }: { admin?: boolean }) {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const main = useRef<HTMLElement>(null)
  const menu = useRef<HTMLButtonElement>(null)
  const items = admin ? adminNav : customerNav
  const base = admin ? '/admin' : '/customer'
  const current = items.find(item => pathname.endsWith('/' + item.path))?.label || 'Garden Companion'
  useEffect(() => { setOpen(false); main.current?.focus(); document.title = `${current} · Pepps & Toms Garden Companion` }, [pathname, current])
  useEffect(() => {
    if (hash === '#add-plant') document.getElementById('add-plant')?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); menu.current?.focus() } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  return <div className="app-shell">
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
    <header className="mobile-header"><Link to={`${base}/${admin ? 'overview' : 'dashboard'}`} aria-label="Pepps & Toms home"><img src="/brand-logo.png" alt="Pepps & Toms" /></Link><span>{admin ? 'Admin preview' : 'Garden Companion'}</span><button ref={menu} className="icon-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
    {open && <button className="nav-backdrop" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />}
    <aside id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`}>
      <Link className="brand" to={`${base}/${admin ? 'overview' : 'dashboard'}`} aria-label="Pepps & Toms home"><img src="/brand-logo.png" alt="Pepps & Toms" /><span>GARDEN COMPANION</span></Link>
      <p className="nav-label">{admin ? 'NURSERY WORKSPACE' : 'YOUR GARDEN'}</p>
      <nav aria-label={admin ? 'Admin navigation' : 'Customer navigation'}>{items.map(({ path, label, icon: Icon }) => <NavLink key={path} to={`${base}/${path}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19} aria-hidden="true" />{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><Link className="workspace-switch" to={admin ? '/customer/dashboard' : '/admin/overview'}><ArrowLeftRight size={17} aria-hidden="true" />{admin ? 'Customer workspace' : 'Admin workspace'}<span>Preview</span></Link><Link className="workspace-switch" to="/auth/logout">Sign out</Link><p><ShieldCheck size={14} /> Signed-in sample workspace</p></div>
    </aside>
    <div className="main-shell"><header className="topbar"><span>{admin ? 'Nursery workspace' : 'My workspace'}<span className="slash">/</span><strong>{current}</strong></span><span className="preview-pill"><span />UI preview</span></header>
      <main ref={main} id="main" tabIndex={-1}><div className="sample-banner"><Leaf size={16} aria-hidden="true" /><span><strong>Sample workspace.</strong> All records are fictional. Forms do not save; reminders are not sent.</span></div>{pathname !== `${base}/${admin ? 'overview' : 'dashboard'}` && <BackButton fallback={`${base}/${admin ? 'overview' : 'dashboard'}`} />}<Outlet /></main>
      <footer className="app-footer"><span>Pepps & Toms Garden Companion</span><span>Sample records · account connected</span></footer>
    </div>
    <nav className="bottom-nav" aria-label="Quick navigation">{items.slice(0,4).map(({ path, label, icon: Icon }) => <NavLink key={path} to={`${base}/${path}`}><Icon size={20} aria-hidden="true" /><span>{label === 'Nursery Inventory' ? 'Inventory' : label === 'Care Calendar' ? 'Calendar' : label}</span></NavLink>)}<button onClick={() => { setOpen(true); menu.current?.focus() }} aria-label="Open all screens"><Menu size={20} /><span>More</span></button></nav>
  </div>
}
