'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, X, Check, MapPin } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { DeliveryZone, DeliverySettings } from '@/lib/supabase'

const DOUALA_SORT_ORDER = 0

const emptyZone = (): Omit<DeliveryZone, 'id' | 'created_at'> => ({
  city_name_fr: '',
  city_name_en: '',
  delivery_fee: 3000,
  estimated_days: '2–3 jours ouvrables / 2–3 business days',
  is_available: true,
  agencies: [],
  sort_order: 99,
})

function DeliverySkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <div className="mb-4 h-5 w-48 rounded animate-pulse bg-brand-grey/10" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-xl animate-pulse bg-brand-grey/10" />
          <div className="h-10 w-20 rounded-full animate-pulse bg-brand-grey/10" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-brand-grey/20 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-grey/20 bg-brand-grey/5">
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-16 rounded animate-pulse bg-brand-grey/10" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-brand-grey/10">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-20 rounded animate-pulse bg-brand-grey/10" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminDelivery() {
  const { error: notifyError, success } = useNotifications()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [threshold, setThreshold] = useState('50000')
  const [thresholdSaved, setThresholdSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyZone())
  const [agencyInput, setAgencyInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [zoneRes, settingsRes] = await Promise.all([
        fetch('/api/delivery-zones'),
        fetch('/api/delivery-settings'),
      ])
      if (!zoneRes.ok || !settingsRes.ok) throw new Error('Failed to load')
      const zoneData = await zoneRes.json()
      const settingsData = await settingsRes.json()
      setZones(zoneData)
      setSettings(settingsData)
      if (settingsData) setThreshold(String(settingsData.free_delivery_threshold))
    } catch (e) {
      console.error(e)
      notifyError('Failed to load delivery settings.')
    }
    setLoading(false)
  }

  function openAdd() {
    setForm(emptyZone())
    setAgencyInput('')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(zone: DeliveryZone) {
    setForm({
      city_name_fr: zone.city_name_fr,
      city_name_en: zone.city_name_en,
      delivery_fee: zone.delivery_fee,
      estimated_days: zone.estimated_days,
      is_available: zone.is_available ?? true,
      agencies: [...(zone.agencies || [])],
      sort_order: zone.sort_order ?? 99,
    })
    setAgencyInput('')
    setEditingId(zone.id || null)
    setShowForm(true)
  }

  function addAgency() {
    const name = agencyInput.trim()
    if (!name) return
    setForm(f => ({ ...f, agencies: [...(f.agencies || []), name] }))
    setAgencyInput('')
  }

  function removeAgency(i: number) {
    setForm(f => ({ ...f, agencies: (f.agencies || []).filter((_, idx) => idx !== i) }))
  }

  async function saveZone() {
    if (!form.city_name_fr.trim() || !form.city_name_en.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await fetch(`/api/delivery-zones/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/delivery-zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setShowForm(false)
      await load()
      success(editingId ? 'Delivery zone updated.' : 'Delivery zone created.')
    } catch (e: any) {
      notifyError(e.message || 'Error saving zone.')
    }
    setSaving(false)
  }

  async function deleteZone(id: string) {
    try {
      await fetch(`/api/delivery-zones/${id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      await load()
      success('Delivery zone deleted.')
    } catch (e: any) {
      notifyError(e.message || 'Error deleting zone.')
    }
  }

  async function toggleAvailable(zone: DeliveryZone) {
    if (!zone.id) return
    try {
      await fetch(`/api/delivery-zones/${zone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !zone.is_available }),
      })
      await load()
      success(zone.is_available ? 'City disabled for delivery.' : 'City enabled for delivery.')
    } catch (e: any) {
      notifyError(e.message || 'Failed to update availability.')
    }
  }

  async function saveThreshold() {
    const val = parseInt(threshold, 10)
    if (isNaN(val) || val < 0) return
    try {
      await fetch('/api/delivery-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ free_delivery_threshold: val }),
      })
      setThresholdSaved(true)
      success('Free delivery threshold saved.')
      setTimeout(() => setThresholdSaved(false), 2000)
    } catch (e: any) {
      notifyError(e.message || 'Failed to save threshold.')
    }
  }

  const inputCls =
    'w-full rounded-xl border border-brand-grey/30 px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-dark">Delivery Zones</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue/90"
        >
          <Plus className="h-4 w-4" />
          Add city
        </button>
      </div>

      {/* Free delivery threshold */}
      <div className="mb-8 rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-brand-dark">Free delivery from:</h2>
        <p className="mb-4 text-sm text-brand-dark/50">
          Currently: free delivery from {parseInt(threshold).toLocaleString('en-US')} FCFA
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            className="w-40 rounded-xl border border-brand-grey/30 px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <span className="text-sm text-brand-dark/60">FCFA</span>
          <button
            onClick={saveThreshold}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${thresholdSaved ? 'bg-green-100 text-green-700' : 'bg-brand-blue text-white hover:bg-brand-blue/90'}`}
          >
            {thresholdSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Zones table */}
      {loading ? (
        <DeliverySkeleton />
      ) : zones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-grey/30 p-12 text-center text-brand-dark/40">
          <MapPin className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>No delivery zones yet. Add Douala first.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-grey/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-grey/20 bg-brand-grey/5 text-left">
                <th className="px-4 py-3 font-medium text-brand-dark/60">City</th>
                <th className="px-4 py-3 font-medium text-brand-dark/60">Fee</th>
                <th className="px-4 py-3 font-medium text-brand-dark/60">Agencies</th>
                <th className="px-4 py-3 font-medium text-brand-dark/60">Delay</th>
                <th className="px-4 py-3 font-medium text-brand-dark/60">Available</th>
                <th className="px-4 py-3 font-medium text-brand-dark/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => {
                const isDouala = zone.sort_order === DOUALA_SORT_ORDER
                return (
                  <tr
                    key={zone.id}
                    className="border-b border-brand-grey/10 last:border-0 hover:bg-brand-grey/5"
                  >
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {zone.city_name_fr}
                      {zone.city_name_en !== zone.city_name_fr && (
                        <span className="ml-1 text-brand-dark/40">/ {zone.city_name_en}</span>
                      )}
                      {isDouala && (
                        <span className="ml-2 rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs text-brand-blue">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-dark/70">
                      {zone.delivery_fee.toLocaleString('en-US')} FCFA
                    </td>
                    <td className="px-4 py-3 text-brand-dark/70">
                      {(zone.agencies || []).length === 0 ? (
                        <span className="text-brand-dark/30 italic">None configured</span>
                      ) : (
                        (zone.agencies || []).join(', ')
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-dark/70 max-w-[180px] truncate">
                      {zone.estimated_days}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAvailable(zone)}
                        role="switch"
                        aria-checked={zone.is_available}
                        aria-label={zone.is_available ? 'Disable delivery' : 'Enable delivery'}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${zone.is_available ? 'bg-brand-blue' : 'bg-brand-grey/40'}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${zone.is_available ? 'translate-x-4' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(zone)}
                          className="rounded p-1 text-brand-dark/40 hover:text-brand-blue transition"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {!isDouala &&
                          (deleteConfirm === zone.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteZone(zone.id!)}
                                className="rounded p-1 text-red-600 hover:bg-red-50 transition"
                                aria-label="Confirm delete"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded p-1 text-brand-dark/40 hover:text-brand-dark transition"
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(zone.id!)}
                              className="rounded p-1 text-brand-dark/40 hover:text-red-600 transition"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit form panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-dark">
                {editingId ? 'Edit city' : 'Add city'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1 text-brand-dark/40 hover:text-brand-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-dark/60">
                    Name (FR) *
                  </label>
                  <input
                    value={form.city_name_fr}
                    onChange={e => setForm(f => ({ ...f, city_name_fr: e.target.value }))}
                    className={inputCls}
                    placeholder="Douala"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-dark/60">
                    Name (EN) *
                  </label>
                  <input
                    value={form.city_name_en}
                    onChange={e => setForm(f => ({ ...f, city_name_en: e.target.value }))}
                    className={inputCls}
                    placeholder="Douala"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-dark/60">
                    Delivery fee (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={form.delivery_fee}
                    onChange={e =>
                      setForm(f => ({ ...f, delivery_fee: parseInt(e.target.value) || 0 }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-dark/60">
                    Available
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                      role="switch"
                      aria-checked={form.is_available}
                      aria-label={form.is_available ? 'Mark unavailable' : 'Mark available'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.is_available ? 'bg-brand-blue' : 'bg-brand-grey/40'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.is_available ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                    <span className="text-sm text-brand-dark/60">
                      {form.is_available ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-brand-dark/60">
                  Estimated delay *
                </label>
                <input
                  value={form.estimated_days}
                  onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))}
                  className={inputCls}
                  placeholder="2–3 jours ouvrables / 2–3 business days"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-brand-dark/60">
                  Bus agencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.agencies || []).map((ag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full bg-brand-grey/20 px-3 py-1 text-xs text-brand-dark"
                    >
                      {ag}
                      <button
                        onClick={() => removeAgency(i)}
                        className="ml-1 text-brand-dark/40 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={agencyInput}
                    onChange={e => setAgencyInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAgency()
                      }
                    }}
                    className={inputCls}
                    placeholder="Agency name (press Enter)"
                  />
                  <button
                    onClick={addAgency}
                    className="rounded-xl bg-brand-grey/20 px-4 py-2 text-sm text-brand-dark hover:bg-brand-grey/40 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full border border-brand-grey/30 px-5 py-2 text-sm text-brand-dark hover:bg-brand-grey/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveZone}
                disabled={saving || !form.city_name_fr.trim() || !form.city_name_en.trim()}
                className="rounded-full bg-brand-blue px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
