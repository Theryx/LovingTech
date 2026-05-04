'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Product, ProductCondition, ProductCategory, Variant } from '@/lib/supabase'
import ProductForm, { WARRANTY_DEFAULTS } from '@/components/ProductForm'
import { LOCAL_PRODUCTS } from '@/lib/localProducts'

const emptyProduct = {
  name: '',
  description: '',
  price_xaf: 0 as number,
  compare_at_price: null as number | null,
  brand: '',
  specs: {} as Record<string, string>,
  images: [] as string[],
  stock_status: 'in_stock' as 'in_stock' | 'out_of_stock' | 'pre_order',
  stock_qty: 1,
  warranty_info: WARRANTY_DEFAULTS.new,
  featured: false,
  condition: 'new' as ProductCondition,
  category: 'keyboard' as ProductCategory,
  variants: [] as Variant[],
  tags: [] as string[],
  key_specs: [] as string[],
  box_contents: [] as string[],
  box_contents_fr: [] as string[],
}

interface ProductFormErrors {
  name?: string
  price_xaf?: string
  brand?: string
}

export default function AdminProductEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { error: notifyError, success } = useNotifications()
  const productId = params.id as string

  const [product, setProduct] = useState(emptyProduct)
  const [specKeys, setSpecKeys] = useState<string[]>([])
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [isLocalProduct, setIsLocalProduct] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (res.ok) {
          const db = await res.json()
          if (db) {
            setProduct({
              name: db.name || '',
              description: db.description || '',
              price_xaf: db.price_xaf || 0,
              compare_at_price: db.compare_at_price ?? null,
              brand: db.brand || '',
              specs: db.specs || {},
              images: db.images || [],
              stock_status: db.stock_status || 'in_stock',
              stock_qty: db.stock_qty ?? 1,
              warranty_info: db.warranty_info || WARRANTY_DEFAULTS[(db.condition || 'new') as keyof typeof WARRANTY_DEFAULTS],
              featured: !!db.featured,
              condition: db.condition || 'new',
              category: db.category || 'keyboard',
              variants: db.variants || [],
              tags: db.tags || [],
              key_specs: db.key_specs || [],
              box_contents: db.box_contents || [],
              box_contents_fr: db.box_contents_fr || [],
            })
            setSpecKeys(Object.keys(db.specs || {}))
            setLoading(false)
            return
          }
        }
      } catch (err) {
        // fall through
      }

      const local = LOCAL_PRODUCTS.find(p => p.id === productId)
      if (local) {
        setProduct({
          name: local.name,
          description: local.description || '',
          price_xaf: local.price_xaf,
          compare_at_price: null,
          brand: local.brand || '',
          specs: local.specs || {},
          images: local.images || [],
          stock_status: local.stock_status || 'in_stock',
          stock_qty: 1,
          warranty_info: WARRANTY_DEFAULTS.new,
          featured: (local as any).featured || false,
          condition: (local as any).condition || 'new',
          category: (local as any).category || 'keyboard',
          variants: [],
          tags: [],
          key_specs: (local as any).key_specs || [],
          box_contents: (local as any).box_contents || [],
          box_contents_fr: (local as any).box_contents_fr || [],
        })
        setSpecKeys(Object.keys(local.specs || {}))
        setIsLocalProduct(true)
      }
      setLoading(false)
    }
    load()
  }, [productId])

  const handleConditionChange = (condition: ProductCondition) => {
    setProduct(p => ({ ...p, condition, warranty_info: WARRANTY_DEFAULTS[condition] }))
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
      setProduct(p => ({ ...p, specs: newSpecs }))
    }
  }

  const handleSpecValueChange = (key: string, val: string) => {
    setProduct(p => ({ ...p, specs: { ...p.specs, [key]: val } }))
  }

  const addSpec = () => setSpecKeys(p => [...p, ''])
  const removeSpec = (index: number) => {
    const key = specKeys[index]
    setSpecKeys(specKeys.filter((_, i) => i !== index))
    const newSpecs = { ...product.specs }
    delete newSpecs[key]
    setProduct(p => ({ ...p, specs: newSpecs }))
  }

  const addVariantGroup = () => {
    setProduct(p => ({
      ...p,
      variants: [
        ...p.variants,
        { label: '', options: [{ name: '', stock_qty: 0, price_delta: 0 }] },
      ],
    }))
  }

  const updateVariantLabel = (vi: number, label: string) => {
    setProduct(p => {
      const variants = [...p.variants]
      variants[vi] = { ...variants[vi], label }
      return { ...p, variants }
    })
  }

  const addVariantOption = (vi: number) => {
    setProduct(p => {
      const variants = [...p.variants]
      variants[vi] = {
        ...variants[vi],
        options: [...variants[vi].options, { name: '', stock_qty: 0, price_delta: 0 }],
      }
      return { ...p, variants }
    })
  }

  const updateVariantOption = (vi: number, oi: number, patch: Partial<Variant['options'][0]>) => {
    setProduct(p => {
      const variants = [...p.variants]
      const options = [...variants[vi].options]
      options[oi] = { ...options[oi], ...patch }
      variants[vi] = { ...variants[vi], options }
      return { ...p, variants }
    })
  }

  const removeVariantOption = (vi: number, oi: number) => {
    setProduct(p => {
      const variants = [...p.variants]
      variants[vi] = {
        ...variants[vi],
        options: variants[vi].options.filter((_, i) => i !== oi),
      }
      return { ...p, variants }
    })
  }

  const removeVariantGroup = (vi: number) => {
    setProduct(p => ({ ...p, variants: p.variants.filter((_, i) => i !== vi) }))
  }

  const validate = (): boolean => {
    const errs: ProductFormErrors = {}
    if (!product.name.trim()) {
      errs.name = 'Product name is required'
    }
    if (product.price_xaf <= 0) {
      errs.price_xaf = 'Price must be greater than 0'
    }
    if (product.condition === 'second_hand' && product.images.length < 2) {
      notifyError('Second-hand products require at least 2 photos.')
      return false
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = { ...product }
      if (isLocalProduct) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: crypto.randomUUID() }),
        })
      } else {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to update')
        }
      }
      success('Product saved successfully.')
      setTimeout(() => router.push('/admin/products'), 1200)
    } catch (error: any) {
      notifyError(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-brand-grey/20 rounded" />
          <div className="h-96 bg-brand-grey/10 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 text-brand-grey transition hover:bg-brand-grey/10 hover:text-brand-blue"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">Edit Product</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <ProductForm
        name={product.name}
        description={product.description}
        price_xaf={product.price_xaf}
        compare_at_price={product.compare_at_price}
        brand={product.brand}
        specs={product.specs}
        images={product.images}
        stock_status={product.stock_status}
        stock_qty={product.stock_qty}
        warranty_info={product.warranty_info}
        featured={product.featured}
        condition={product.condition}
        category={product.category}
        variants={product.variants}
        tags={product.tags}
        key_specs={product.key_specs}
        box_contents={product.box_contents}
        box_contents_fr={product.box_contents_fr}
        errors={errors}
        onChange={patch => setProduct(p => ({ ...p, ...patch }))}
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
        onImagesChange={images => setProduct(p => ({ ...p, images }))}
      />
    </div>
  )
}
