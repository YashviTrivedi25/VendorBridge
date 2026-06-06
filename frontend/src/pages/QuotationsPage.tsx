import { useState, useEffect } from 'react'
import { FileSpreadsheet, Plus, Loader2, CheckCircle2, XCircle, DollarSign, Clock } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

interface Quotation {
  id: number; rfq_id: number; vendor_id: number; total_price: number
  delivery_days: number; notes: string | null; status: string
  items: { id: number; product_name: string; qty: number; unit_price: number; total: number }[]
}
interface RFQ { id: number; title: string; status: string }
interface Vendor { id: number; name: string }

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
}

export default function QuotationsPage() {
  const { user } = useAuth()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [compareRfqId, setCompareRfqId] = useState<number | null>(null)
  const [compareData, setCompareData] = useState<Quotation[]>([])
  const [compareLoading, setCompareLoading] = useState(false)
  const [form, setForm] = useState({
    rfq_id: '', vendor_id: '', total_price: '', delivery_days: '', notes: '',
    items: [{ product_name: '', qty: 1, unit_price: '', total: '' }]
  })

  const isVendor = user?.role === 'vendor'
  const isOfficerOrAbove = ['officer', 'manager', 'admin'].includes(user?.role || '')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [qRes, rfqRes, vRes] = await Promise.all([
        api.get('/api/quotations'),
        api.get('/api/rfqs'),
        api.get('/api/vendors'),
      ])
      setQuotations(qRes.data)
      setRfqs(rfqRes.data)
      setVendors(vRes.data)
    } catch { toast.error('Failed to load quotations') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async () => {
    if (!form.rfq_id || !form.vendor_id || !form.total_price || !form.delivery_days) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      await api.post('/api/quotations', {
        rfq_id: parseInt(form.rfq_id),
        vendor_id: parseInt(form.vendor_id),
        total_price: parseFloat(form.total_price),
        delivery_days: parseInt(form.delivery_days),
        notes: form.notes,
        items: form.items.map(i => ({ ...i, qty: parseInt(String(i.qty)), unit_price: parseFloat(String(i.unit_price)), total: parseFloat(String(i.total)) })),
      })
      toast.success('Quotation submitted!')
      setShowForm(false)
      fetchData()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Submit failed') }
    finally { setSaving(false) }
  }

  const handleApprove = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await api.post(`/api/quotations/${id}/approve`, { status })
      toast.success(`Quotation ${status}`)
      fetchData()
      if (compareRfqId) loadCompare(compareRfqId)
    } catch { toast.error('Action failed') }
  }

  const loadCompare = async (rfqId: number) => {
    setCompareRfqId(rfqId)
    setCompareLoading(true)
    try {
      const res = await api.get(`/api/quotations/${rfqId}/compare`)
      setCompareData(res.data)
    } catch { toast.error('Failed to load comparison') }
    finally { setCompareLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isVendor ? 'Submit pricing for open RFQs' : 'Review and compare vendor quotations'}
          </p>
        </div>
        {isVendor && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary w-auto px-5 py-2.5">
            <Plus size={16} /> Submit Quotation
          </button>
        )}
      </div>

      {/* Compare Section (Officer+) */}
      {isOfficerOrAbove && (
        <div className="glass-card p-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Compare Quotations by RFQ</h3>
          <div className="flex gap-3 flex-wrap">
            {rfqs.map(r => (
              <button key={r.id} onClick={() => loadCompare(r.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${compareRfqId === r.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:bg-brand-50'}`}>
                {r.title}
              </button>
            ))}
          </div>

          {compareRfqId && (
            <div className="mt-4">
              {compareLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-500" size={24} /></div>
              ) : compareData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No quotations submitted yet for this RFQ.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        {['Vendor', 'Total Price', 'Delivery (days)', 'Notes', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {compareData.map(q => {
                        const vendor = vendors.find(v => v.id === q.vendor_id)
                        return (
                          <tr key={q.id} className="hover:bg-surface-50">
                            <td className="px-3 py-2 font-medium text-gray-800">{vendor?.name || `Vendor #${q.vendor_id}`}</td>
                            <td className="px-3 py-2 text-gray-800 font-semibold">₹{Number(q.total_price).toLocaleString()}</td>
                            <td className="px-3 py-2 text-gray-600">{q.delivery_days} days</td>
                            <td className="px-3 py-2 text-gray-500">{q.notes || '—'}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {q.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {q.status === 'Submitted' && ['manager', 'admin'].includes(user?.role || '') && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleApprove(q.id, 'Approved')} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                    <CheckCircle2 size={15} />
                                  </button>
                                  <button onClick={() => handleApprove(q.id, 'Rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                    <XCircle size={15} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Quotations */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-brand-500" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="glass-card text-center py-16">
            <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No quotations yet</p>
          </div>
        ) : quotations.map(q => {
          const vendor = vendors.find(v => v.id === q.vendor_id)
          const rfq = rfqs.find(r => r.id === q.rfq_id)
          return (
            <div key={q.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{rfq?.title || `RFQ #${q.rfq_id}`}</p>
                  <p className="text-sm text-gray-500 mt-0.5">by {vendor?.name || `Vendor #${q.vendor_id}`}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {q.status}
                </span>
              </div>
              <div className="flex items-center gap-5 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-brand-500" />₹{Number(q.total_price).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-500" />{q.delivery_days} days</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit Quotation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Submit Quotation</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">RFQ *</label>
                  <select className="input-field" value={form.rfq_id} onChange={e => setForm(p => ({ ...p, rfq_id: e.target.value }))}>
                    <option value="">Select RFQ…</option>
                    {rfqs.filter(r => r.status === 'Open').map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Vendor *</label>
                  <select className="input-field" value={form.vendor_id} onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>
                    <option value="">Select Vendor…</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Total Price (₹) *</label>
                  <input type="number" className="input-field" placeholder="0.00" value={form.total_price} onChange={e => setForm(p => ({ ...p, total_price: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Delivery Days *</label>
                  <input type="number" className="input-field" placeholder="e.g. 14" value={form.delivery_days} onChange={e => setForm(p => ({ ...p, delivery_days: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Terms, warranties…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Submit Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
