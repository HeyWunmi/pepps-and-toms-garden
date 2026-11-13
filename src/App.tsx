import { useEffect, useState } from 'react'
import { ArrowUpRight, Bell, BookOpen, Check, ChevronRight, Flower2, LayoutDashboard, Leaf, Menu, ShieldCheck, Smartphone, Sprout, Users, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type View = 'customer' | 'admin'
const currentView = (): View => window.location.hash === '#/admin' ? 'admin' : 'customer'

function Feature({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return <article className="feature-card"><div className="flex items-center justify-between"><span className="icon-tile"><Icon size={22} aria-hidden="true" /></span><span className="planned">Planned</span></div><h3>{title}</h3><p>{children}</p></article>
}

export default function App() {
  const [view, setView] = useState<View>(currentView)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onHash = () => { setView(currentView()); setMenuOpen(false) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const admin = view === 'admin'
  return <div className="app-shell">
    <a href="#main" className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <a className="brand" href="#/customer" aria-label="Pepps and Toms Garden Companion home"><img className="brand-artwork" src="/brand-logo.png" alt="Pepps & Toms" /><small>GARDEN COMPANION</small></a>
      <div className="nav-label">YOUR SPACE</div>
      <nav className="space-y-2"><a className={`nav-item ${!admin ? 'active' : ''}`} aria-current={!admin ? 'page' : undefined} href="#/customer"><LayoutDashboard size={19} /> My garden <ChevronRight size={16} className="ml-auto" /></a><a className={`nav-item ${admin ? 'active' : ''}`} aria-current={admin ? 'page' : undefined} href="#/admin"><ShieldCheck size={19} /> Admin preview <ChevronRight size={16} className="ml-auto" /></a></nav>
      <div className="sidebar-note"><Leaf size={23} /><h2>A little care.<br />A lot of possibility.</h2><p>A space for every grower, from your first seedling onwards.</p><div className="flex gap-1 mt-5"><span /><span /><span /></div></div>
      <div className="sidebar-footer"><span className="status-dot" /> Foundation preview <small>Made for growing, together.</small></div>
    </aside>
    <div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button><span className="breadcrumb">Garden Companion <span>/</span> <strong>{admin ? 'Admin preview' : 'My garden'}</strong></span><span className="preview-badge"><span className="status-dot" /> Early beginnings</span></header>
      <main id="main" tabIndex={-1}>
        <div className="page-heading"><div><p className="eyebrow">{admin ? 'BEHIND THE GARDEN' : 'ROOTED IN EVERYDAY CARE'}</p><h1>{admin ? 'Room to grow, together.' : 'Your garden starts here.'}</h1><p className="page-description">{admin ? 'The future home for looking after your growing community.' : 'A little space to nurture your plants and your love of growing.'}</p></div><span className="outline-tag"><Sprout size={15} /> {admin ? 'Admin dashboard' : 'Garden dashboard'}</span></div>
        <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><span className="hero-label"><span /> {admin ? 'A COMMUNITY IN THE MAKING' : 'EVERY GROWER IS WELCOME'}</span><h2 id="hero-title">{admin ? <>Good things grow<br />with good care.</> : <>From small beginnings,<br />beautiful things grow.</>}</h2><p>{admin ? 'A dedicated space to manage customer accounts and support their plant journeys. This is a layout preview; admin tools are not connected.' : 'Whether you’re a Pepps & Toms customer or tending plants of your own, your growing journey belongs here.'}</p><a href="#up-next" className="hero-link">See what’s taking root <ArrowUpRight size={17} /></a></div><div className="garden-art" aria-hidden="true"><div className="sun" /><div className="art-orbit" /><div className="plant plant-one"><i /><i /><i /><i /><b /></div><div className="plant plant-two"><i /><i /><i /><i /><b /></div><div className="plant plant-three"><i /><i /><b /></div><span className="art-caption">GROW AT YOUR OWN PACE</span></div></section>
        <section id="up-next" aria-labelledby="next-title"><div className="section-heading"><div><p className="eyebrow">A PEEK AT WHAT’S NEXT</p><h2 id="next-title">{admin ? 'Tools for your community' : 'Good things are taking root'}</h2></div><span className="muted text-xs">Future features · not yet available</span></div><div className="feature-grid">{admin ? <><Feature icon={Users} title="Customer accounts">A future overview of your customers and their growing journeys.</Feature><Feature icon={Sprout} title="Plant records">A place to support the plants in your customer community.</Feature><Feature icon={Bell} title="Care reminders">Tools to help organise helpful, timely plant care reminders.</Feature></> : <><Feature icon={Sprout} title="Your plant collection">Keep Pepps & Toms plants and your own favourites in one place.</Feature><Feature icon={BookOpen} title="Growth journals">Make room for milestones, little observations and progress photos.</Feature><Feature icon={Bell} title="Gentle reminders">A helping hand with watering, feeding and everyday plant care.</Feature></>}</div></section>
        <div className="bottom-grid"><section className="welcome-card"><span className="icon-tile tomato"><Flower2 size={23} /></span><div><h2>{admin ? 'A preview, with clear boundaries' : 'One companion. Every kind of grower.'}</h2><p>{admin ? 'This page is publicly accessible for layout review. Secure admin access will be added with authentication.' : 'Bought from Pepps & Toms? Growing your own? You’ll be welcome here. Customer accounts will come in a later phase.'}</p></div></section><section className="install-card"><Smartphone size={27} aria-hidden="true" /><div><h2>Make yourself at home</h2><p>On iPhone, use Safari’s Share menu → Add to Home Screen. On Android, look for Install app in your browser menu.</p><span><Check size={13} /> App shell available offline after first visit</span></div></section></div>
        <footer className="page-footer"><span>Pepps & Toms <span className="footer-dot">·</span> Garden Companion</span><span>Growing thoughtfully, one step at a time.</span></footer>
      </main>
    </div>
  </div>
}
