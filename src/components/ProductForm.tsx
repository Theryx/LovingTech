'use client'

import { Plus, X, AlertTriangle } from 'lucide-react'
import { ProductCondition, ProductCategory, Variant } from '@/lib/supabase'
import ImageUploader from '@/components/ImageUploader'

export const WARRANTY_DEFAULTS: Record<ProductCondition, string> = {
  new: 'Manufacturer warranty',
  refurbished: '30 days',
  second_hand: 'No warranty',
}

export interface ProductFormErrors {
  price_xaf?: string
  name?: string
  brand?: string
  condition?: string
  category?: string
  description?: string
  images?: string
}

interface ProductFormProps {
  name: string
  description: string
  price_xaf: number
  compare_at_price: number | null
  brand: string
  specs: Record<string, string>
  images: string[]
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order'
  stock_qty: number
  warranty_info: string
  featured: boolean
  condition: ProductCondition
  category: ProductCategory
  variants: Variant[]
  tags: string[]
  key_specs?: string[]
  box_contents?: string[]
  box_contents_fr?: string[]
  errors?: ProductFormErrors
  brands?: string[]
  onChange: (patch: Partial<ProductFormProps>) => void
  onConditionChange: (condition: ProductCondition) => void
  onSpecKeyChange: (index: number, value: string) => void
  onSpecValueChange: (key: string, val: string) => void
  onAddSpec: () => void
  onRemoveSpec: (index: number) => void
  onAddVariantGroup: () => void
  onUpdateVariantLabel: (vi: number, label: string) => void
  onAddVariantOption: (vi: number) => void
  onUpdateVariantOption: (vi: number, oi: number, patch: Partial<Variant['options'][0]>) => void
  onRemoveVariantOption: (vi: number, oi: number) => void
  onRemoveVariantGroup: (vi: number) => void
  onImagesChange: (images: string[]) => void
}

const inputCls =
  'w-full rounded-xl border border-brand-grey/30 bg-white px-4 py-2.5 text-brand-dark outline-none transition focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:bg-brand-grey/5 disabled:cursor-not-allowed'
const labelCls = 'mb-1.5 block text-sm font-semibold text-brand-dark'
const sectionTitleCls = 'mb-4 text-lg font-semibold text-brand-dark'
const errorCls = 'mt-1.5 text-xs font-medium text-red-600'

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className={errorCls} role="alert" id={`${label}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function ProductForm({
  name,
  description,
  price_xaf,
  compare_at_price,
  brand,
  specs,
  images,
  stock_status,
  stock_qty,
  warranty_info,
  featured,
  condition,
  category,
  variants,
  key_specs = [],
  box_contents = [],
  box_contents_fr = [],
  errors = {},
  brands = [],
  onChange,
  onConditionChange,
  onSpecKeyChange,
  onSpecValueChange,
  onAddSpec,
  onRemoveSpec,
  onAddVariantGroup,
  onUpdateVariantLabel,
  onAddVariantOption,
  onUpdateVariantOption,
  onRemoveVariantOption,
  onRemoveVariantGroup,
  onImagesChange,
}: ProductFormProps) {
  const hasVariants = variants.length > 0
  const specKeys = Object.keys(specs)

  return (
    <div className="space-y-6">
      {/* Condition & Category */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>Classification</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Condition" required error={errors.condition}>
            <select
              value={condition}
              onChange={e => onConditionChange(e.target.value as ProductCondition)}
              required
              aria-required="true"
              className={inputCls}
            >
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
              <option value="second_hand">Second-hand</option>
            </select>
          </Field>
          <Field label="Category" required error={errors.category}>
            <select
              value={category}
              onChange={e => onChange({ category: e.target.value as ProductCategory })}
              required
              aria-required="true"
              className={inputCls}
            >
              <option value="keyboard">Keyboard</option>
              <option value="mouse">Mouse</option>
              <option value="cable">Cable</option>
              <option value="speaker">Speaker</option>
              <option value="solar_lamp">Solar Lamp</option>
              <option value="others">Others</option>
            </select>
          </Field>
        </div>
        {condition === 'second_hand' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
            Second-hand products require at least 2 actual photos. No returns accepted.
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>Basic Information</h2>
        <div className="space-y-4">
          <Field label="Product Name" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={e => onChange({ name: e.target.value })}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              className={inputCls}
              placeholder="Ex: RGB Mechanical Keyboard"
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={description}
              onChange={e => onChange({ description: e.target.value })}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Describe the product in detail..."
            />
          </Field>

          <Field label="Brand" error={errors.brand}>
            <input
              type="text"
              value={brand}
              onChange={e => onChange({ brand: e.target.value })}
              className={inputCls}
              placeholder="Logitech, Apple, Anker..."
              list="brand-list"
              autoComplete="off"
            />
            {brands.length > 0 && (
              <datalist id="brand-list">
                {brands.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price (XAF)" required error={errors.price_xaf}>
              <input
                type="number"
                value={price_xaf || ''}
                onChange={e => onChange({ price_xaf: Number(e.target.value) })}
                required
                aria-required="true"
                aria-invalid={!!errors.price_xaf}
                min="0"
                className={inputCls}
                placeholder="0"
              />
            </Field>
            <Field label="Compare-at Price (XAF)">
              <input
                type="number"
                value={compare_at_price ?? ''}
                onChange={e =>
                  onChange({ compare_at_price: e.target.value ? Number(e.target.value) : null })
                }
                min="0"
                className={inputCls}
                placeholder="Optional"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stock Status">
              <select
                value={stock_status}
                onChange={e => onChange({ stock_status: e.target.value as any })}
                className={inputCls}
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="pre_order">Pre-order</option>
              </select>
            </Field>
            {!hasVariants && (
              <Field label="Stock Qty">
                <input
                  type="number"
                  value={stock_qty ?? 0}
                  onChange={e => onChange({ stock_qty: Number(e.target.value) })}
                  min="0"
                  className={inputCls}
                  placeholder="0"
                />
              </Field>
            )}
          </div>

          <Field label="Warranty">
            <input
              type="text"
              value={warranty_info}
              onChange={e => onChange({ warranty_info: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={!!featured}
              onChange={e => onChange({ featured: e.target.checked })}
              className="h-4 w-4 shrink-0 rounded border-brand-grey text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="featured" className="text-sm font-medium text-brand-dark cursor-pointer">
              Featured product
            </label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={sectionTitleCls}>Variants</h2>
          <button
            type="button"
            onClick={onAddVariantGroup}
            className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-3 py-1.5 text-sm font-medium text-brand-grey transition hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Group
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-brand-dark/40">
            No variants — uses stock qty above
          </p>
        ) : (
          <div className="space-y-6">
            {variants.map((variant, vi) => (
              <div key={vi} className="rounded-lg border border-brand-grey/20 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <input
                    type="text"
                    value={variant.label}
                    onChange={e => onUpdateVariantLabel(vi, e.target.value)}
                    className={`${inputCls} flex-1`}
                    placeholder="Group label (e.g. Color, Size)"
                    aria-label="Variant group name"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveVariantGroup(vi)}
                    className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove variant group"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-center">
                    <span className="text-xs font-medium text-brand-dark/40 px-1">
                      Option
                    </span>
                    <span className="text-xs font-medium text-brand-dark/40 px-1">
                      Stock
                    </span>
                    <span
                      className="text-xs font-medium text-brand-dark/40 px-1"
                      title="Price delta: positive adds to base price, negative subtracts"
                    >
                      ± Price (XAF)
                      <span className="ml-1 text-brand-grey">?</span>
                    </span>
                    <span />
                  </div>
                  {variant.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={opt.name}
                        onChange={e =>
                          onUpdateVariantOption(vi, oi, { name: e.target.value })
                        }
                        className={inputCls}
                        placeholder="Option name"
                        aria-label="Option name"
                      />
                      <input
                        type="number"
                        value={opt.stock_qty}
                        onChange={e =>
                          onUpdateVariantOption(vi, oi, { stock_qty: Number(e.target.value) })
                        }
                        min="0"
                        className={inputCls}
                        placeholder="0"
                        aria-label="Stock quantity"
                      />
                      <input
                        type="number"
                        value={opt.price_delta}
                        onChange={e =>
                          onUpdateVariantOption(vi, oi, { price_delta: Number(e.target.value) })
                        }
                        className={inputCls}
                        placeholder="±0"
                        title="Positive adds to base price, negative subtracts"
                        aria-label="Price delta in XAF"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveVariantOption(vi, oi)}
                        className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove option"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => onAddVariantOption(vi)}
                    className="mt-1 flex items-center gap-1 text-xs text-brand-grey transition hover:text-brand-blue"
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    Add option
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specs */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={sectionTitleCls}>Specifications</h2>
          <button
            type="button"
            onClick={onAddSpec}
            className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-3 py-1.5 text-sm font-medium text-brand-grey transition hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Spec
          </button>
        </div>
        <div className="space-y-3">
          {specKeys.map((key, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={key}
                onChange={e => onSpecKeyChange(index, e.target.value)}
                className="flex-1 rounded-xl border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder="Spec name"
                aria-label="Specification name"
              />
              <span className="text-brand-grey" aria-hidden="true">
                :
              </span>
              <input
                type="text"
                value={specs[key] || ''}
                onChange={e => onSpecValueChange(key, e.target.value)}
                className="flex-1 rounded-xl border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder="Value"
                aria-label="Specification value"
              />
              <button
                type="button"
                onClick={() => onRemoveSpec(index)}
                className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                aria-label="Remove spec"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {specKeys.length === 0 && (
            <p className="text-sm text-brand-dark/40">
              No specifications added
            </p>
          )}
        </div>
      </div>

      {/* Key Specifications */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>Key Specifications</h2>
        {specKeys.length === 0 ? (
          <p className="text-sm text-brand-dark/40">
            Add specifications above to select key specs
          </p>
        ) : (
          <div>
            <p className="mb-3 text-xs text-brand-dark/60">
              Select up to 4 specs to highlight on the product page
            </p>
            <div className="flex flex-wrap gap-2">
              {specKeys.map(key => (
                <label
                  key={key}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    key_specs.includes(key)
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-brand-grey/30 text-brand-dark/70 hover:border-brand-blue/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={key_specs.includes(key)}
                    onChange={e => {
                      const newKeySpecs = e.target.checked
                        ? [...key_specs, key].slice(0, 4)
                        : key_specs.filter(k => k !== key)
                      onChange({ key_specs: newKeySpecs })
                    }}
                    className="h-4 w-4 rounded border-brand-grey text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
            {key_specs.length > 0 && (
              <p className="mt-2 text-xs text-brand-dark/40">
                {key_specs.length} / 4 selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* What's in the Box */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>What&apos;s in the Box</h2>
        <div className="space-y-2">
          {box_contents.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={e => {
                  const newBox = [...box_contents]
                  newBox[index] = e.target.value
                  onChange({ box_contents: newBox })
                }}
                className="flex-1 rounded-xl border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder="e.g. 1x Wireless Mouse"
              />
              <button
                type="button"
                onClick={() => {
                  const newBox = box_contents.filter((_, i) => i !== index)
                  onChange({ box_contents: newBox })
                }}
                className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ box_contents: [...box_contents, ''] })}
            className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-3 py-1.5 text-sm font-medium text-brand-grey transition hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add item
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>Images</h2>
        {condition === 'second_hand' && (
          <p className="mb-3 text-xs text-amber-700">
            Min. 2 photos required for second-hand items
          </p>
        )}
        <ImageUploader images={images} onChange={onImagesChange} />
      </div>
    </div>
  )
}
