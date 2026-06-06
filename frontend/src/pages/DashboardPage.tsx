import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  LogOut,
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Activity,
  Users,
  Store,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../components/Logo'
import VendorsPage from './VendorsPage'
import RFQsPage from './RFQsPage'
import QuotationsPage from './QuotationsPage'

interface DashboardPageProps {
  page?: string
}

export default function DashboardPage({ page }: DashboardPageProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Vendors', path: '/vendors', icon: Store, roles: ['officer', 'manager', 'admin'] },
    { name: 'RFQs', path: '/rfqs', icon: FileText, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    { name: 'Activity & Logs', path: '/logs', icon: Activity, roles: ['manager', 'admin'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
  ]

  const allowedLinks = navLinks.filter(link => user && link.roles.includes(user.role))

  // Render correct page content based on `page` prop
  const renderContent = () => {
    switch (page) {
      case 'vendors':    return <VendorsPage />
      case 'rfqs':       return <RFQsPage />
      case 'quotations': return <QuotationsPage />
      default:           return <DashboardHome user={user} handleLogout={handleLogout} />
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">VendorBridge</span>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5">
            {allowedLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-gray-400'} />
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-brand-600 font-medium capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10 shadow-sm">
          <button
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Logo className="w-8 h-8" />
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
            <LogOut size={18} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Dashboard Home (default content) ─────────────────────────────────────────
function DashboardHome({ user }: { user: any; handleLogout?: () => void }) {
  const stats = [
    { label: 'Active RFQs', value: '—', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100' },
    { label: 'Pending Approvals', value: '—', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Total Spend (MTD)', value: '—', color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200' },
    { label: 'Active Vendors', value: '—', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  ]

  const quickLinks = [
    { label: 'Manage Vendors', path: '/vendors', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100' },
    { label: 'Create RFQ', path: '/rfqs', color: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-100' },
    { label: 'View Quotations', path: '/quotations', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Good day, {user?.first_name}! 👋</h1>
        <p className="text-brand-100 text-sm">Welcome to VendorBridge — your procurement command centre.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${stat.bg} ${stat.border}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(l => (
            <Link key={l.path} to={l.path}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${l.color}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Use the sidebar to navigate all modules. Stats will populate once connected to the database.</p>
      </div>
    </div>
  )
}
