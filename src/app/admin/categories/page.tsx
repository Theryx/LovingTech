'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Image, Loader2, RefreshCw, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import type { Category } from '@/lib/supabase'

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="aspect-[4/3] rounded-lg mb-4 animate-pulse bg-brand-grey/10" />
          <div className="h-5 w-32 rounded animate-pulse bg-brand-grey/10 mb-3" />
          <div className="h-10 w-full rounded-xl animate-pulse bg-brand-grey/10" />
        </div>
      ))}
    </div>
  )
}

export default function AdminCategories() {
  const { error: notifyError, success } = useNotifications()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [editSlug, setEditSlug] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({ slug: '', label_en: '', label_fr: '' })
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setCategories(data)
    } catch (e) {
      console.error(e)
      notifyError('Failed to load categories.')
    }
    setLoading(false)
  }, [notifyError])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function handleUpload(slug: string, file: File) {
    setUploading(slug)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/categories/${slug}/upload`, { method: 'POST', body: formData })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errData.error || 'Upload failed')
      }
      const result = await res.json()
      setCategories(prev => prev.map(c => (c.slug === slug ? { ...c, image_url: result.image_url } : c)))
      success('Image updated.')
    } catch (e: any) {
      notifyError(e.message || 'Upload failed.')
    }
    setUploading(null)
  }

  async function handleSave(slug: string) {
    setSaving(slug)
    try {
      const cat = categories.find(c => c.slug === slug)
      if (!cat) return
      const res = await fetch(`/api/categories/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label_en: cat.label_en,
          label_fr: cat.label_fr,
          description_en: (cat as any).description_en,
          description_fr: (cat as any).description_fr,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }))
        throw new Error(err.error || 'Failed to save')
      }
      setEditSlug(null)
      success('Category updated.')
      await loadCategories()
    } catch (e: any) {
      notifyError(e.message || 'Failed to save category.')
    }
    setSaving(null)
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete category "${slug}"? This cannot be undone.`)) return
    setDeleting(slug)
    try {
      const res = await fetch(`/api/categories/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }))
        throw new Error(err.error || 'Delete failed')
      }
      setCategories(prev => prev.filter(c => c.slug !== slug))
      if (editSlug === slug) setEditSlug(null)
      success(`Category "${slug}" deleted.`)
    } catch (e: any) {
      notifyError(e.message || 'Failed to delete category.')
    }
    setDeleting(null)
  }

  async function handleCreate() {
    const slug = createForm.slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (!slug || !createForm.label_en.trim() || !createForm.label_fr.trim()) {
      notifyError('All fields are required.')
      return
    }
    setSaving('__new__')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, label_en: createForm.label_en, label_fr: createForm.label_fr }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setCreateOpen(false)
      setCreateForm({ slug: '', label_en: '', label_fr: '' })
      success(`Category "${slug}" created.`)
      await loadCategories()
    } catch (e: any) {
      notifyError(e.message || 'Failed to create category.')
    }
    setSaving(null)
  }

  async function handleSeed() {
    if (!confirm('This will replace all existing categories. Continue?')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/categories/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to seed')
      success(`Reset complete. ${data.categories?.length || 6} categories created.`)
      await loadCategories()
    } catch (e: any) {
      notifyError(e.message || 'Failed to reset.')
    }
    setSeeding(false)
  }

  function updateCat(slug: string, field: string, value: string) {
    setCategories(prev => prev.map(c => (c.slug === slug ? { ...c, [field]: value } : c)))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Categories</h1>
          <p className="mt-1 text-sm text-brand-dark/50">
            Manage product categories. Changes appear on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark/70 transition hover:bg-brand-grey/10 hover:text-brand-dark disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reset
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New Category
          </button>
        </div>
      </div>

      {loading ? (
        <CategorySkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const isBusy = uploading === cat.slug
            const isEditing = editSlug === cat.slug
            const isSaving = saving === cat.slug
            const isDeleting = deleting === cat.slug

            return (
              <div
                key={cat.slug}
                className="rounded-xl border border-brand-grey/20 bg-white overflow-hidden transition hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-brand-grey/10 relative">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.label_en} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-dark/20">
                      <Image className="h-12 w-12" />
                    </div>
                  )}
                  {isBusy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/40">English Label</label>
                        <input
                          value={cat.label_en}
                          onChange={e => updateCat(cat.slug, 'label_en', e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-brand-grey/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/40">French Label</label>
                        <input
                          value={cat.label_fr}
                          onChange={e => updateCat(cat.slug, 'label_fr', e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-brand-grey/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/40">English Description</label>
                        <textarea
                          value={(cat as any).description_en || ''}
                          onChange={e => updateCat(cat.slug, 'description_en', e.target.value)}
                          rows={2}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-brand-grey/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/40">French Description</label>
                        <textarea
                          value={(cat as any).description_fr || ''}
                          onChange={e => updateCat(cat.slug, 'description_fr', e.target.value)}
                          rows={2}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-brand-grey/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSave(cat.slug)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Save
                        </button>
                        <button
                          onClick={() => setEditSlug(null)}
                          className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-4 py-2 text-xs font-medium text-brand-dark/60 transition hover:bg-brand-grey/10"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-brand-dark mb-1">{cat.label_en}</h3>
                      <p className="text-xs text-brand-dark/40 mb-2">{cat.slug}</p>
                      {(cat as any).description_en && (
                        <p className="text-xs text-brand-dark/60 mb-4 line-clamp-2">{(cat as any).description_en}</p>
                      )}

                      <input
                        ref={el => { fileInputRefs.current[cat.slug] = el }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleUpload(cat.slug, file)
                          e.target.value = ''
                        }}
                        className="hidden"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fileInputRefs.current[cat.slug]?.click()}
                          disabled={isBusy}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-grey/30 px-3 py-2 text-sm font-medium text-brand-dark/60 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                        >
                          <Upload className="h-4 w-4" />
                          {cat.image_url ? 'Change' : 'Upload'}
                        </button>
                        <button
                          onClick={() => setEditSlug(cat.slug)}
                          className="rounded-xl p-2 text-brand-dark/40 transition hover:bg-brand-grey/10 hover:text-brand-blue"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.slug)}
                          disabled={isDeleting}
                          className="rounded-xl p-2 text-brand-dark/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCreateOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-dark">New Category</h2>
              <button onClick={() => setCreateOpen(false)} className="p-2 text-brand-dark/40 hover:text-brand-dark rounded-lg transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-dark">Slug</label>
                <input
                  value={createForm.slug}
                  onChange={e => setCreateForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. keyboards"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brand-grey/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-dark">Label (English)</label>
                <input
                  value={createForm.label_en}
                  onChange={e => setCreateForm(f => ({ ...f, label_en: e.target.value }))}
                  placeholder="Keyboards"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brand-grey/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-dark">Label (French)</label>
                <input
                  value={createForm.label_fr}
                  onChange={e => setCreateForm(f => ({ ...f, label_fr: e.target.value }))}
                  placeholder="Claviers"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brand-grey/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={saving === '__new__'}
                className="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving === '__new__' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
