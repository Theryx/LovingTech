'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Image, Loader2, RefreshCw } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import type { Category } from '@/lib/supabase'

const labelMap: Record<string, string> = {
  keyboards: 'Keyboards',
  mice: 'Mice',
  audio: 'Audio',
  'charging-power': 'Charging & Power',
  gaming: 'Gaming',
  accessories: 'Accessories',
}

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

      const res = await fetch(`/api/categories/${slug}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errData.error || 'Upload failed')
      }

      const result = await res.json()

      setCategories(prev =>
        prev.map(c => (c.slug === slug ? { ...c, image_url: result.image_url } : c))
      )

      success(`Image updated for ${labelMap[slug] || slug}.`)
    } catch (e: any) {
      console.error(e)
      notifyError(e.message || 'Upload failed.')
    }

    setUploading(null)
  }

  function triggerFileInput(slug: string) {
    fileInputRefs.current[slug]?.click()
  }

  async function handleSeed() {
    if (!confirm('This will replace all existing categories with the new 6 categories (Keyboards, Mice, Audio, Charging & Power, Gaming, Accessories). Images will need to be re-uploaded. Continue?')) {
      return
    }

    setSeeding(true)
    try {
      const res = await fetch('/api/categories/seed', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to seed categories')
      }

      success(`Successfully reset categories. ${data.categories?.length || 6} new categories created.`)
      await loadCategories()
    } catch (e: any) {
      console.error(e)
      notifyError(e.message || 'Failed to reset categories.')
    }
    setSeeding(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Categories</h1>
          <p className="mt-1 text-sm text-brand-dark/50">
            Upload images for each category. They appear on the homepage &ldquo;Shop by Category&rdquo; section.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark/70 transition hover:bg-brand-grey/10 hover:text-brand-dark disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reset Categories
        </button>
      </div>

      {loading ? (
        <CategorySkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const isBusy = uploading === cat.slug
            return (
              <div
                key={cat.slug}
                className="rounded-xl border border-brand-grey/20 bg-white overflow-hidden transition hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-brand-grey/10 relative">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.label_en}
                      className="w-full h-full object-cover"
                    />
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
                  <h3 className="font-semibold text-brand-dark mb-1">{cat.label_en}</h3>
                  <p className="text-xs text-brand-dark/40 mb-2">{cat.slug}</p>
                  {cat.description_en && (
                    <p className="text-xs text-brand-dark/60 mb-4 line-clamp-2">{cat.description_en}</p>
                  )}

                  <input
                    ref={el => {
                      fileInputRefs.current[cat.slug] = el
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(cat.slug, file)
                      e.target.value = ''
                    }}
                    className="hidden"
                  />

                  <button
                    onClick={() => triggerFileInput(cat.slug)}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-grey/30 px-4 py-2.5 text-sm font-medium text-brand-dark/60 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {cat.image_url ? 'Change image' : 'Upload image'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
