'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image, GripVertical, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  bucket?: string
  folder?: string
}

const labels = {
  dragDrop: {
    en: 'Drag images here or click to upload',
    fr: 'Glissez les images ici ou cliquez pour télécharger',
  },
  uploading: { en: 'Uploading...', fr: 'Téléchargement...' },
  uploadFailed: {
    en: 'Upload failed. Enter image URL below instead.',
    fr: "Échec. Entrez l'URL de l'image ci-dessous.",
  },
  bucketMissing: {
    en: 'Storage not configured. Use URL below instead.',
    fr: "Stockage non configuré. Utilisez l'URL ci-dessous.",
  },
  mainImage: { en: 'Main', fr: 'Principal' },
  remove: { en: 'Remove', fr: 'Supprimer' },
  supportedFormats: {
    en: 'Max: 5MB • 800-1200px • JPEG, PNG, WebP',
    fr: 'Max: 5Mo • 800-1200px • JPEG, PNG, WebP',
  },
  previewFailed: { en: 'Preview not available', fr: 'Aperçu non disponible' },
  orUrl: { en: 'Or enter image URL:', fr: "Ou entrez l'URL de l'image:" },
}

export default function ImageUploader({
  images,
  onChange,
  bucket = 'products',
  folder = 'images',
}: ImageUploaderProps) {
  const { t } = useLanguage()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewErrors, setPreviewErrors] = useState<Record<number, boolean>>({})
  const [uploadError, setUploadError] = useState<string>('')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
          setUploadError(t(labels.bucketMissing))
          return null
        }
        console.error('Upload error:', error)
        setUploadError(t(labels.uploadFailed))
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return publicUrl
    } catch (err: any) {
      if (err?.message?.includes('Bucket not found')) {
        setUploadError(t(labels.bucketMissing))
      } else {
        setUploadError(t(labels.uploadFailed))
      }
      return null
    }
  }

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      const newImages = [...images, urlInput.trim()]
      onChange(newImages)
      setUrlInput('')
      setUploadError('')
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setUploading(true)
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > 5 * 1024 * 1024) {
          console.error('File too large:', file.name)
          continue
        }

        const url = await uploadToSupabase(file)
        if (url) {
          newImages.push(url)
        }
      }

      setUploading(false)
      if (newImages.length > 0) {
        onChange([...images, ...newImages])
      }
    },
    [images, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleMakeMain = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const [main] = newImages.splice(index, 1)
    newImages.unshift(main)
    onChange(newImages)
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const newImages = [...images]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    onChange(newImages)
  }

  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return
    const newImages = [...images]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={e => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-brand-blue bg-brand-blue/5'
            : uploadError
              ? 'border-brand-orange'
              : 'border-brand-grey/40 hover:border-brand-blue/60'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-brand-grey">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-grey/40 border-t-brand-blue" />
            {t(labels.uploading)}
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-2 h-8 w-8 text-brand-blue" />
            <p className="text-sm text-brand-grey">{t(labels.dragDrop)}</p>
            <p className="mt-1 text-xs text-brand-grey">{t(labels.supportedFormats)}</p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="rounded-lg border border-brand-orange/30 bg-brand-orange/10 p-3">
          <p className="text-sm text-brand-orange">{uploadError}</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark"
              onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
            />
            <button
              onClick={handleAddUrl}
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:brightness-95"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-brand-grey">{t(labels.orUrl)}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden border-2 transition ${
                index === 0 ? 'border-brand-blue' : 'border-brand-grey/30'
              }`}
            >
              <div className="relative aspect-square bg-brand-grey/10">
                {previewErrors[index] ? (
                  <div className="flex h-full w-full items-center justify-center text-brand-grey">
                    <Image className="h-8 w-8" />
                    <span className="text-xs ml-2">{t(labels.previewFailed)}</span>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => setPreviewErrors(prev => ({ ...prev, [index]: true }))}
                  />
                )}

                <div className="absolute top-2 left-2">
                  {index === 0 ? (
                    <span className="flex items-center gap-1 rounded bg-brand-blue px-2 py-1 text-[10px] font-bold uppercase text-white">
                      <Star className="h-3 w-3" />
                      {t(labels.mainImage)}
                    </span>
                  ) : null}
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleMakeMain(index)}
                    className="rounded bg-white p-1.5 text-brand-dark shadow transition hover:bg-brand-grey/10"
                    title="Make main"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="rounded bg-white/90 p-1.5 text-brand-dark transition hover:bg-white disabled:opacity-30"
                      >
                        <GripVertical className="w-3 h-3 rotate-[-90deg]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                        className="rounded bg-white/90 p-1.5 text-brand-dark transition hover:bg-white disabled:opacity-30"
                      >
                        <GripVertical className="w-3 h-3 rotate-90deg" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="rounded bg-brand-orange p-1.5 text-white transition hover:brightness-95"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
