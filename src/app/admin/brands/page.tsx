'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Link as LinkIcon, X } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'

interface Brand {
  id: string
  name: string
  logo_url: string | null
  sort_order: number
  is_active: boolean
}

function BrandSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full animate-pulse bg-brand-grey/10" />
          <div className="mx-auto h-5 w-24 rounded animate-pulse bg-brand-grey/10" />
        </div>
      ))}
    </div>
  )
}

export default function AdminBrands() {
  const { error: notifyError, success, confirm } = useNotifications()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [urlInput, setUrlInput] = useState<Record<string, string>>({})

  const loadBrands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/brands')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setBrands(data)
      const urls: Record<string, string> = {}
      data.forEach((b: Brand) => { urls[b.id] = b.logo_url || '' })
      setUrlInput(urls)
    } catch {
      notifyError('Failed to load brands.')
    }
    setLoading(false)
  }, [notifyError])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  const handleUpload = async (brandId: string, file: File) => {
    setUploading(brandId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('brandId', brandId)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      const url = result.url || result.image_url

      await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: url }),
      })

      setBrands(prev => prev.map(b => (b.id === brandId ? { ...b, logo_url: url } : b)))
      setUrlInput(prev => ({ ...prev, [brandId]: url }))
      success('Logo updated.')
    } catch {
      notifyError('Upload failed.')
    }
    setUploading(null)
  }

  const handleSetUrl = async (brandId: string) => {
    const url = urlInput[brandId]?.trim() || ''
    if (!url) return
    try {
      await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: url }),
      })
      setBrands(prev => prev.map(b => (b.id === brandId ? { ...b, logo_url: url } : b)))
      success('Logo URL updated.')
    } catch {
      notifyError('Failed to update logo URL.')
    }
  }

  const handleToggleActive = async (brand: Brand) => {
    await fetch(`/api/brands/${brand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !brand.is_active }),
    })
    setBrands(prev => prev.map(b => (b.id === brand.id ? { ...b, is_active: !b.is_active } : b)))
  }

  const handleDelete = async (brandId: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Brand',
      message: `Are you sure you want to delete "${name}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      tone: 'danger',
    })
    if (!confirmed) return

    await fetch(`/api/brands/${brandId}`, { method: 'DELETE' })
    setBrands(prev => prev.filter(b => b.id !== brandId))
    success('Brand deleted.')
  }

  const handleCreate = async () => {
    if (!newBrandName.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: newBrandName.trim() }
      if (newBrandLogoUrl.trim()) payload.logo_url = newBrandLogoUrl.trim()

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setBrands(prev => [...prev, data])
      setUrlInput(prev => ({ ...prev, [data.id]: data.logo_url || '' }))
      setNewBrandName('')
      setNewBrandLogoUrl('')
      setShowNewForm(false)
      success('Brand added.')
    } catch {
      notifyError('Failed to create brand.')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-1">Brands</h1>
          <p className="text-brand-grey">Manage brand logos displayed on the homepage</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {showNewForm && (
        <div className="mb-8 rounded-xl border border-brand-grey/20 bg-white p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4">New Brand</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newBrandName}
              onChange={e => setNewBrandName(e.target.value)}
              placeholder="Brand name"
              className="w-full rounded-lg border border-brand-grey/30 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <input
              type="url"
              value={newBrandLogoUrl}
              onChange={e => setNewBrandLogoUrl(e.target.value)}
              placeholder="Image URL (optional) — https://..."
              className="w-full rounded-lg border border-brand-grey/30 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newBrandName.trim() || saving}
                className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewBrandLogoUrl('') }}
                className="rounded-lg border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark/60 hover:bg-brand-grey/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <BrandSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map(brand => (
            <div
              key={brand.id}
              className={`rounded-xl border bg-white p-6 transition ${
                brand.is_active ? 'border-brand-grey/20' : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-20 w-20 rounded-full object-cover border border-brand-grey/20"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-grey/10">
                      <ImageIcon className="h-8 w-8 text-brand-grey/40" />
                    </div>
                  )}
                  {uploading === brand.id && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-brand-dark mb-1">{brand.name}</h3>
                <p className="text-xs text-brand-dark/40 mb-1">
                  {brand.logo_url ? 'Logo set' : 'No logo'}
                </p>

                {/* URL Input */}
                <div className="w-full mb-4 flex gap-1.5">
                  <input
                    type="url"
                    value={urlInput[brand.id] || ''}
                    onChange={e => setUrlInput(prev => ({ ...prev, [brand.id]: e.target.value }))}
                    placeholder="Paste image URL..."
                    className="flex-1 rounded-lg border border-brand-grey/30 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    onKeyDown={e => e.key === 'Enter' && handleSetUrl(brand.id)}
                  />
                  <button
                    onClick={() => handleSetUrl(brand.id)}
                    disabled={!urlInput[brand.id]?.trim()}
                    className="rounded-lg bg-brand-blue px-2.5 py-1.5 text-xs font-medium text-white transition hover:brightness-95 disabled:opacity-50 shrink-0"
                  >
                    Set
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg bg-brand-grey/10 px-3 py-2 text-xs font-medium text-brand-dark/70 hover:bg-brand-grey/20 transition flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(brand.id, file)
                      }}
                    />
                  </label>

                  <button
                    onClick={() => handleToggleActive(brand)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      brand.is_active
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <button
                    onClick={() => handleDelete(brand.id, brand.name)}
                    className="rounded-lg p-2 text-brand-dark/30 hover:text-red-500 hover:bg-red-50 transition"
                    aria-label="Delete brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
