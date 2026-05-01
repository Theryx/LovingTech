'use client'

import { Plus, X, AlertTriangle } from 'lucide-react'
import { ProductCondition, ProductCategory, Variant } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import ImageUploader from '@/components/ImageUploader'

export const WARRANTY_DEFAULTS: Record<ProductCondition, string> = {
  new: 'Garantie fabricant / Manufacturer warranty',
  refurbished: '30 jours / 30 days',
  second_hand: 'Aucune garantie / No warranty',
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
  errors?: ProductFormErrors
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
  errors = {},
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
  const { t, language } = useLanguage()
  const hasVariants = variants.length > 0
  const specKeys = Object.keys(specs)

  return (
    <div className="space-y-6">
      {/* Condition & Category */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>
          {t({ en: 'Classification', fr: 'Classification' })}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t({ en: 'Condition', fr: 'État' })} required error={errors.condition}>
            <select
              value={condition}
              onChange={e => onConditionChange(e.target.value as ProductCondition)}
              required
              aria-required="true"
              className={inputCls}
            >
              <option value="new">{t({ en: 'New', fr: 'Neuf' })}</option>
              <option value="refurbished">
                {t({ en: 'Refurbished', fr: 'Reconditionné' })}
              </option>
              <option value="second_hand">{t({ en: 'Second-hand', fr: 'Occasion' })}</option>
            </select>
          </Field>
          <Field label={t({ en: 'Category', fr: 'Catégorie' })} required error={errors.category}>
            <select
              value={category}
              onChange={e => onChange({ category: e.target.value as ProductCategory })}
              required
              aria-required="true"
              className={inputCls}
            >
              <option value="keyboard">{t({ en: 'Keyboard', fr: 'Clavier' })}</option>
              <option value="mouse">{t({ en: 'Mouse', fr: 'Souris' })}</option>
              <option value="cable">{t({ en: 'Cable', fr: 'Câble' })}</option>
              <option value="speaker">{t({ en: 'Speaker', fr: 'Enceinte' })}</option>
              <option value="solar_lamp">{t({ en: 'Solar Lamp', fr: 'Lampe solaire' })}</option>
            </select>
          </Field>
        </div>
        {condition === 'second_hand' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
            {t({
              en: 'Second-hand products require at least 2 actual photos. No returns accepted.',
              fr: "Les produits d'occasion nécessitent au moins 2 photos réelles. Aucun retour accepté.",
            })}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>
          {t({ en: 'Basic Information', fr: 'Informations de base' })}
        </h2>
        <div className="space-y-4">
          <Field
            label={language === 'fr' ? 'Nom du produit' : 'Product Name'}
            required
            error={errors.name}
          >
            <input
              type="text"
              value={name}
              onChange={e => onChange({ name: e.target.value })}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              className={inputCls}
              placeholder={
                language === 'fr' ? 'Ex: Clavier mécanique RGB' : 'Ex: RGB Mechanical Keyboard'
              }
            />
          </Field>

          <Field label={language === 'fr' ? 'Description' : 'Description'} error={errors.description}>
            <textarea
              value={description}
              onChange={e => onChange({ description: e.target.value })}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder={
                language === 'fr'
                  ? 'Décrivez le produit en détail...'
                  : 'Describe the product in detail...'
              }
            />
          </Field>

          <Field label={t({ en: 'Brand', fr: 'Marque' })} error={errors.brand}>
            <input
              type="text"
              value={brand}
              onChange={e => onChange({ brand: e.target.value })}
              className={inputCls}
              placeholder="Logitech, Apple, Anker..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t({ en: 'Price (XAF)', fr: 'Prix (XAF)' })} required error={errors.price_xaf}>
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
            <Field label={t({ en: 'Compare-at Price (XAF)', fr: 'Prix barré (XAF)' })}>
              <input
                type="number"
                value={compare_at_price ?? ''}
                onChange={e =>
                  onChange({ compare_at_price: e.target.value ? Number(e.target.value) : null })
                }
                min="0"
                className={inputCls}
                placeholder={t({ en: 'Optional', fr: 'Optionnel' })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t({ en: 'Stock Status', fr: 'Statut du stock' })}>
              <select
                value={stock_status}
                onChange={e => onChange({ stock_status: e.target.value as any })}
                className={inputCls}
              >
                <option value="in_stock">{t({ en: 'In Stock', fr: 'En stock' })}</option>
                <option value="out_of_stock">{t({ en: 'Out of Stock', fr: 'Rupture' })}</option>
                <option value="pre_order">{t({ en: 'Pre-order', fr: 'Pré-commande' })}</option>
              </select>
            </Field>
            {!hasVariants && (
              <Field label={t({ en: 'Stock Qty', fr: 'Quantité' })}>
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

          <Field label={t({ en: 'Warranty', fr: 'Garantie' })}>
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
              {t({ en: 'Featured product', fr: 'Produit en vedette' })}
            </label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={sectionTitleCls}>{t({ en: 'Variants', fr: 'Variantes' })}</h2>
          <button
            type="button"
            onClick={onAddVariantGroup}
            className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-3 py-1.5 text-sm font-medium text-brand-grey transition hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t({ en: 'Add Group', fr: 'Ajouter groupe' })}
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-brand-dark/40">
            {t({
              en: 'No variants — uses stock qty above',
              fr: 'Aucune variante — utilise la quantité ci-dessus',
            })}
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
                    placeholder={t({
                      en: 'Group label (e.g. Color, Size)',
                      fr: 'Nom du groupe (ex. Couleur, Taille)',
                    })}
                    aria-label={t({ en: 'Variant group name', fr: 'Nom du groupe de variante' })}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveVariantGroup(vi)}
                    className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                    aria-label={t({ en: 'Remove variant group', fr: 'Supprimer le groupe' })}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-center">
                    <span className="text-xs font-medium text-brand-dark/40 px-1">
                      {t({ en: 'Option', fr: 'Option' })}
                    </span>
                    <span className="text-xs font-medium text-brand-dark/40 px-1">
                      {t({ en: 'Stock', fr: 'Stock' })}
                    </span>
                    <span
                      className="text-xs font-medium text-brand-dark/40 px-1"
                      title={t({
                        en: 'Price delta: positive adds to base price, negative subtracts',
                        fr: 'Delta prix : positif ajoute au prix de base, négatif soustrait',
                      })}
                    >
                      {t({ en: '± Price (XAF)', fr: '± Prix (XAF)' })}
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
                        placeholder={t({ en: 'Option name', fr: 'Nom option' })}
                        aria-label={t({ en: 'Option name', fr: 'Nom de l\'option' })}
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
                        aria-label={t({ en: 'Stock quantity', fr: 'Quantité en stock' })}
                      />
                      <input
                        type="number"
                        value={opt.price_delta}
                        onChange={e =>
                          onUpdateVariantOption(vi, oi, { price_delta: Number(e.target.value) })
                        }
                        className={inputCls}
                        placeholder="±0"
                        title={t({
                          en: 'Positive adds to base price, negative subtracts',
                          fr: 'Positif ajoute au prix de base, négatif soustrait',
                        })}
                        aria-label={t({ en: 'Price delta in XAF', fr: 'Delta prix en XAF' })}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveVariantOption(vi, oi)}
                        className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                        aria-label={t({ en: 'Remove option', fr: 'Supprimer l\'option' })}
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
                    {t({ en: 'Add option', fr: 'Ajouter option' })}
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
          <h2 className={sectionTitleCls}>{t({ en: 'Specifications', fr: 'Spécifications' })}</h2>
          <button
            type="button"
            onClick={onAddSpec}
            className="flex items-center gap-1.5 rounded-lg border border-brand-grey/30 px-3 py-1.5 text-sm font-medium text-brand-grey transition hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t({ en: 'Add Spec', fr: 'Ajouter' })}
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
                placeholder={t({ en: 'Spec name', fr: 'Nom spec' })}
                aria-label={t({ en: 'Specification name', fr: 'Nom de la spécification' })}
              />
              <span className="text-brand-grey" aria-hidden="true">
                :
              </span>
              <input
                type="text"
                value={specs[key] || ''}
                onChange={e => onSpecValueChange(key, e.target.value)}
                className="flex-1 rounded-xl border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder={t({ en: 'Value', fr: 'Valeur' })}
                aria-label={t({ en: 'Specification value', fr: 'Valeur de la spécification' })}
              />
              <button
                type="button"
                onClick={() => onRemoveSpec(index)}
                className="rounded-lg p-2 text-brand-grey transition hover:bg-red-50 hover:text-red-500"
                aria-label={t({ en: 'Remove spec', fr: 'Supprimer la spec' })}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {specKeys.length === 0 && (
            <p className="text-sm text-brand-dark/40">
              {t({ en: 'No specifications added', fr: 'Aucune spécification ajoutée' })}
            </p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className={sectionTitleCls}>{t({ en: 'Images', fr: 'Images' })}</h2>
        {condition === 'second_hand' && (
          <p className="mb-3 text-xs text-amber-700">
            {t({
              en: 'Min. 2 photos required for second-hand items',
              fr: 'Min. 2 photos requises pour les articles d\'occasion',
            })}
          </p>
        )}
        <ImageUploader images={images} onChange={onImagesChange} />
      </div>
    </div>
  )
}