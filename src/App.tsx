import { AuthProvider } from './auth/AuthProvider'
import AuthScreen from './auth/AuthScreens'
import { RequireAuth, RequireAdmin } from './auth/RequireAuth'
import { HashRouter, Navigate, Route, Routes, Link } from 'react-router-dom'
import Layout from './components/Layout'
import { Dashboard, Plants, CustomerCalendar, CustomerReminders, Journal, Harvest, Support, Settings } from './pages/Customer'
import { Overview, Inventory, Customers, AdminCalendar, AdminReminders, Assignments, Reports } from './pages/Admin'

function NotFound() { return <div className="not-found"><h1>Screen not found</h1><p>This address does not match a preview screen.</p><Link className="button" to="/customer/dashboard">Back to dashboard</Link></div> }
export default function App() {
  return <HashRouter><AuthProvider><Routes>
    {(['login', 'signup', 'reset', 'update-password', 'logout'] as const).map(mode => <Route key={mode} path={`/auth/${mode}`} element={<AuthScreen key={mode} mode={mode} />} />)}
    <Route path="/" element={<Navigate replace to="/customer/dashboard" />} />
    <Route element={<RequireAuth />}><Route path="/customer" element={<Layout />}><Route index element={<Navigate replace to="dashboard" />} /><Route path="dashboard" element={<Dashboard />} /><Route path="plants" element={<Plants />} /><Route path="calendar" element={<CustomerCalendar />} /><Route path="reminders" element={<CustomerReminders />} /><Route path="journal" element={<Journal />} /><Route path="harvest" element={<Harvest />} /><Route path="support" element={<Support />} /><Route path="settings" element={<Settings />} /><Route path="*" element={<NotFound />} /></Route>
    <Route element={<RequireAdmin />}><Route path="/admin" element={<Layout admin />}><Route index element={<Navigate replace to="overview" />} /><Route path="overview" element={<Overview />} /><Route path="inventory" element={<Inventory />} /><Route path="customers" element={<Customers />} /><Route path="calendar" element={<AdminCalendar />} /><Route path="reminders" element={<AdminReminders />} /><Route path="assignments" element={<Assignments />} /><Route path="support" element={<Support admin />} /><Route path="reports" element={<Reports />} /><Route path="*" element={<NotFound />} /></Route>
    </Route></Route>
    <Route path="*" element={<NotFound />} />
  </Routes></AuthProvider></HashRouter>
}
