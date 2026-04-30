'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Product, ProductCondition, Variant } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import ProductForm, { WARRANTY_DEFAULTS } from '@/components/ProductForm'
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts'

const emptyProduct: Product = {
  id: '',
  name: '',
  description: '',
  price_xaf: 0,
  brand: '',
  specs: {},
  images: [],
  stock_status: 'in_stock',
  condition: 'new',
  category: 'keyboard',
  name_fr: '',
  name_en: '',
  description_fr: '',
  description_en: '',
  warranty_info: WARRANTY_DEFAULTS.new,
  variants: [],
  stock_qty: 1,
  low_stock_threshold: 3,
  compare_at_price: undefined,
}

export default function AdminProductEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const { error: notifyError, success } = useNotifications()
  const productId = params.id as string

  const [product, setProduct] = useState<Product>(emptyProduct)
  const [specKeys, setSpecKeys] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isLocalProduct, setIsLocalProduct] = useState(false)

  const set = (patch: Partial<Product>) => setProduct(p => ({ ...p, ...patch }))

  useEffect(() => {
    async function loadProduct() {
      let found: Product | ProductWithFeatured | null = null
      let fromLocal = false

      try {
        const res = await fetch(`/api/products/${productId}`)
        if (res.ok) {
          const db = await res.json()
          if (db) found = db
        }
      } catch (err) {
        console.error('DB fetch failed:', err)
      }

      if (!found) {
        const local = LOCAL_PRODUCTS.find(p => p.id === productId)
        if (local) {
          found = local
          fromLocal = true
        }
      }

      if (found) {
        setProduct({
          ...emptyProduct,
          ...found,
          condition: (found as Product).condition || 'new',
          category: (found as Product).category || 'keyboard',
          variants: (found as Product).variants || [],
          warranty_info:
            (found as Product).warranty_info ||
            WARRANTY_DEFAULTS[(found as Product).condition || 'new'],
        })
        setSpecKeys(Object.keys(found.specs || {}))
        setIsLocalProduct(fromLocal)
      }
    }
    loadProduct()
  }, [productId])

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
      const data = { ...product, specs: product.specs || {}, images: product.images || [] }
      if (isLocalProduct) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: crypto.randomUUID() }),
        })
      } else {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to update')
        }
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
            {t({ en: 'Edit Product', fr: 'Modifier le produit' })}
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
