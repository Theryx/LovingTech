'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Product, ProductCondition, Variant } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import ProductForm, { WARRANTY_DEFAULTS } from '@/components/ProductForm'

const emptyProduct: Omit<Product, 'created_at'> = {
  id: '',
  name: '',
  description: '',
  price_xaf: 0,
  compare_at_price: undefined,
  brand: '',
  specs: {},
  images: [],
  stock_status: 'in_stock',
  stock_qty: 1,
  low_stock_threshold: 3,
  condition: 'new',
  category: 'keyboard',
  name_fr: '',
  name_en: '',
  description_fr: '',
  description_en: '',
  warranty_info: WARRANTY_DEFAULTS.new,
  variants: [],
  tags: [],
}

export default function NewProductPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { error: notifyError, success } = useNotifications()
  const [product, setProduct] = useState<Omit<Product, 'created_at'>>(emptyProduct)
  const [specKeys, setSpecKeys] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<typeof product>) => setProduct(p => ({ ...p, ...patch }))

  const handleConditionChange = (condition: ProductCondition) => {
    set({ condition, warranty_info: WARRANTY_DEFAULTS[condition] })
  }

  const handleSpecKeyChange = (index: number, value: string) => {
    const newKeys = [...specKeys]
    const oldKey = newKeys[index]
    newKeys[index] = value
    setSpecKeys(newKeys)
    if (oldKey && product.specs[oldKey] !== undefined) {
      const newSpecs = { ...product.specs }
      const val = newSpecs[oldKey]
      delete newSpecs[oldKey]
      if (value) newSpecs[value] = val
      set({ specs: newSpecs })
    }
  }

  const handleSpecValueChange = (key: string, val: string) => {
    set({ specs: { ...product.specs, [key]: val } })
  }

  const addSpec = () => setSpecKeys([...specKeys, ''])
  const removeSpec = (index: number) => {
    const key = specKeys[index]
    const newKeys = specKeys.filter((_, i) => i !== index)
    const newSpecs = { ...product.specs }
    delete newSpecs[key]
    setSpecKeys(newKeys)
    set({ specs: newSpecs })
  }

  const addVariantGroup = () => {
    set({
      variants: [
        ...(product.variants || []),
        { label: '', options: [{ name: '', stock_qty: 0, price_delta: 0 }] },
      ],
    })
  }

  const updateVariantLabel = (vi: number, label: string) => {
    const variants = [...(product.variants || [])]
    variants[vi] = { ...variants[vi], label }
    set({ variants })
  }

  const addVariantOption = (vi: number) => {
    const variants = [...(product.variants || [])]
    variants[vi] = {
      ...variants[vi],
      options: [...variants[vi].options, { name: '', stock_qty: 0, price_delta: 0 }],
    }
    set({ variants })
  }

  const updateVariantOption = (vi: number, oi: number, patch: Partial<Variant['options'][0]>) => {
    const variants = [...(product.variants || [])]
    const options = [...variants[vi].options]
    options[oi] = { ...options[oi], ...patch }
    variants[vi] = { ...variants[vi], options }
    set({ variants })
  }

  const removeVariantOption = (vi: number, oi: number) => {
    const variants = [...(product.variants || [])]
    variants[vi] = { ...variants[vi], options: variants[vi].options.filter((_, i) => i !== oi) }
    set({ variants })
  }

  const removeVariantGroup = (vi: number) => {
    set({ variants: (product.variants || []).filter((_, i) => i !== vi) })
  }

  const handleSave = async () => {
    if (product.price_xaf <= 0) {
      notifyError(t({ en: 'Price is required.', fr: 'Le prix est obligatoire.' }))
      return
    }
    if (!product.name_fr && !product.name_en && !product.name) {
      notifyError(
        t({
          en: 'At least one product name is required.',
          fr: 'Au moins un nom de produit est requis.',
        })
      )
      return
    }
    if (product.condition === 'second_hand' && (product.images || []).length < 2) {
      notifyError('Second-hand products require at least 2 photos of the actual item.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          id: crypto.randomUUID(),
          specs: product.specs || {},
          images: product.images || [],
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save')
      }
      setSaved(true)
      success(t({ en: 'Product saved successfully.', fr: 'Produit enregistré avec succès.' }))
      setTimeout(() => router.push('/admin/products'), 1000)
    } catch (error: any) {
      console.error('Failed to save:', error)
      notifyError(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-brand-grey transition hover:text-brand-blue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">
            {t({ en: 'Add Product', fr: 'Ajouter un produit' })}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving
            ? t({ en: 'Saving...', fr: 'Enregistrement...' })
            : saved
              ? t({ en: 'Saved!', fr: 'Enregistré!' })
              : t({ en: 'Save', fr: 'Enregistrer' })}
        </button>
      </div>

      <ProductForm
        product={product}
        specKeys={specKeys}
        onChange={set}
        onConditionChange={handleConditionChange}
        onSpecKeyChange={handleSpecKeyChange}
        onSpecValueChange={handleSpecValueChange}
        onAddSpec={addSpec}
        onRemoveSpec={removeSpec}
        onAddVariantGroup={addVariantGroup}
        onUpdateVariantLabel={updateVariantLabel}
        onAddVariantOption={addVariantOption}
        onUpdateVariantOption={updateVariantOption}
        onRemoveVariantOption={removeVariantOption}
        onRemoveVariantGroup={removeVariantGroup}
        onImagesChange={images => set({ images })}
      />
    </div>
  )
}
