import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle2,
  User, Mail, Phone, Globe, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/auth'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'officer', label: 'Procurement Officer', desc: 'Create & manage RFQs' },
  { value: 'vendor',  label: 'Vendor',              desc: 'Submit quotations & invoices' },
  { value: 'manager', label: 'Manager',             desc: 'Approve & oversee procurement' },
  { value: 'admin',   label: 'Administrator',       desc: 'Full system access' },
]

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates',
  'Canada', 'Australia', 'Germany', 'Singapore', 'Other',
]

interface FormState {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: UserRole
  country: string
  additional_info: string
  password: string
  confirm_password: string
}

const INITIAL: FormState = {
  first_name: '', last_name: '', email: '', phone: '',
  role: 'officer', country: '', additional_info: '',
  password: '', confirm_password: '',
}

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(INITIAL)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const selectedRole = ROLES.find((r) => r.value === form.role)!

  const validate = (): string => {
    const nameRegex = /^[A-Za-z\s-]+$/
    if (!form.first_name.trim()) return 'First name is required'
    if (!nameRegex.test(form.first_name)) return 'First name can only contain letters'
    if (!form.last_name.trim()) return 'Last name is required'
    if (!nameRegex.test(form.last_name)) return 'Last name can only contain letters'
    if (!form.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email'
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) return 'Enter a valid phone number'
    if (!form.password) return 'Password is required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password) return 'Passwords do not match'
    return ''
  }

  const getPhonePlaceholder = (country: string) => {
    switch (country) {
      case 'India': return '+91 98765 43210'
      case 'United States': return '+1 (555) 123-4567'
      case 'United Kingdom': return '+44 7911 123456'
      case 'United Arab Emirates': return '+971 50 123 4567'
      case 'Canada': return '+1 (555) 123-4567'
      case 'Australia': return '+61 412 345 678'
      case 'Germany': return '+49 1512 3456789'
      case 'Singapore': return '+65 8123 4567'
      default: return '+1 234 567 8900'
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const validationErr = validate()
    if (validationErr) { setError(validationErr); return }

    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone || undefined,
        country: form.country || undefined,
        role: form.role,
        additional_info: form.additional_info || undefined,
      })
      setSuccess(true)
      toast.success('Account created! Please sign in.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Registration failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-slide-up">
        <div className="glass-card p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">VendorBridge</h1>
              <p className="text-xs text-gray-500 font-medium">Procurement Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-sm text-gray-500">Join VendorBridge and streamline procurement</p>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-6 animate-fade-in">
              <CheckCircle2 size={16} className="text-brand-400 shrink-0" />
              <p className="text-sm text-brand-300">Account created! Redirecting to login…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstname" className="form-label">
                  <User size={10} className="inline mr-1" />First Name
                </label>
                <input
                  id="reg-firstname"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={form.first_name}
                  onChange={set('first_name')}
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="reg-lastname" className="form-label">Last Name</label>
                <input
                  id="reg-lastname"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={set('last_name')}
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">
                <Mail size={10} className="inline mr-1" />Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={set('email')}
                className="input-field"
                disabled={isLoading}
              />
            </div>

            {/* Phone + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-phone" className="form-label">
                  <Phone size={10} className="inline mr-1" />Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={getPhonePlaceholder(form.country)}
                  value={form.phone}
                  onChange={set('phone')}
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="reg-country" className="form-label">
                  <Globe size={10} className="inline mr-1" />Country
                </label>
                <select
                  id="reg-country"
                  value={form.country}
                  onChange={set('country')}
                  className="input-field appearance-none"
                  disabled={isLoading}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="form-label">Role</label>
              <div className="relative">
                <button
                  id="reg-role-trigger"
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="input-field flex items-center justify-between text-left bg-white focus:bg-white"
                  disabled={isLoading}
                >
                  <div>
                    <span className="text-gray-900 font-medium">{selectedRole.label}</span>
                    <span className="text-gray-500 text-xs ml-2">— {selectedRole.desc}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${roleOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {roleOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden animate-fade-in">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        id={`reg-role-${r.value}`}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, role: r.value })); setRoleOpen(false) }}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-brand-50
                          ${form.role === r.value ? 'bg-brand-50 text-brand-600' : 'text-gray-700'}`}
                      >
                        <span className="font-medium text-sm">{r.label}</span>
                        <span className="text-xs text-gray-500 ml-2">— {r.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label htmlFor="reg-info" className="form-label">Additional Information</label>
              <textarea
                id="reg-info"
                rows={3}
                placeholder="Company name, department, or any relevant details…"
                value={form.additional_info}
                onChange={set('additional_info')}
                className="input-field resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="form-label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    className="input-field pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    className="input-field pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading || success}
              className="btn-primary flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="divider my-6">already have an account?</div>

          <Link to="/login" id="go-to-login">
            <button className="btn-secondary text-sm">Sign in instead</button>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} VendorBridge. All rights reserved.
        </p>
      </div>
    </div>
  )
}
