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
  X
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../components/Logo'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Define sidebar links and their required roles
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Vendors', path: '/vendors', icon: Store, roles: ['officer', 'manager', 'admin'] },
    { name: 'RFQs', path: '/rfqs', icon: FileText, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['officer', 'vendor', 'manager', 'admin'] },
    { name: 'Approvals', path: '/approvals', icon: Activity, roles: ['manager', 'admin'] },
    { name: 'Activity & Logs', path: '/logs', icon: Activity, roles: ['manager', 'admin'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
  ]

  // Filter links based on current user role
  const allowedLinks = navLinks.filter(link => user && link.roles.includes(user.role))

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-card border-l-0 border-t-0 border-b-0 rounded-r-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
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
          <nav className="flex-1 space-y-1">
            {allowedLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-brand-50 text-brand-600 border border-brand-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-brand-500' : 'text-gray-400'} />
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Summary */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 font-bold">
                {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-brand-600 font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Topbar (Mobile mainly) */}
        <header className="lg:hidden flex items-center justify-between p-4 glass-card border-t-0 border-x-0 rounded-none z-10">
          <button 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Logo className="w-8 h-8" />
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 z-10">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Welcome back, here's what's happening today.</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-xl border border-gray-200 hover:bg-red-50 bg-white shadow-sm"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Active RFQs', value: '12', color: 'text-brand-600' },
                { label: 'Pending Approvals', value: '5', color: 'text-amber-500' },
                { label: 'Total Spend (MTD)', value: '$2.3M', color: 'text-gray-900' },
                { label: 'Active Vendors', value: '34', color: 'text-blue-500' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5">
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Placeholder Content Area */}
            <div className="glass-card p-12 text-center border-dashed border-2 border-gray-200">
               <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
                 <LayoutDashboard size={28} className="text-brand-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">Workspace Content Area</h3>
               <p className="text-gray-500 max-w-md mx-auto text-sm">
                 This is the main container where tables, forms, and specific workflow views (RFQs, Quotations, Approvals) will render in Phase 2.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
