'use client';

import { Plus, X, AlertTriangle } from 'lucide-react';
import { Product, ProductCondition, ProductCategory, Variant } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ImageUploader from '@/components/ImageUploader';

export const WARRANTY_DEFAULTS: Record<ProductCondition, string> = {
  new: 'Garantie fabricant / Manufacturer warranty',
  refurbished: '30 jours / 30 days',
  second_hand: 'Aucune garantie / No warranty',
};

const inputCls = 'w-full rounded-lg border border-brand-grey/30 bg-white px-4 py-2 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue';
const labelCls = 'mb-2 block text-sm font-medium text-brand-dark';

type ProductFormData = Omit<Product, 'id' | 'created_at'> & { id?: string; created_at?: string };

interface ProductFormProps {
  product: ProductFormData;
  specKeys: string[];
  onChange: (patch: Partial<ProductFormData>) => void;
  onConditionChange: (condition: ProductCondition) => void;
  onSpecKeyChange: (index: number, value: string) => void;
  onSpecValueChange: (key: string, val: string) => void;
  onAddSpec: () => void;
  onRemoveSpec: (index: number) => void;
  onAddVariantGroup: () => void;
  onUpdateVariantLabel: (vi: number, label: string) => void;
  onAddVariantOption: (vi: number) => void;
  onUpdateVariantOption: (vi: number, oi: number, patch: Partial<Variant['options'][0]>) => void;
  onRemoveVariantOption: (vi: number, oi: number) => void;
  onRemoveVariantGroup: (vi: number) => void;
  onImagesChange: (images: string[]) => void;
}

export default function ProductForm({
  product,
  specKeys,
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
  const { t } = useLanguage();
  const hasVariants = (product.variants || []).length > 0;
  const condition = product.condition || 'new';

  return (
    <div className="space-y-6">
      {/* Condition & Category */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">{t({ en: 'Classification', fr: 'Classification' })}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t({ en: 'Condition', fr: 'État' })} *</label>
            <select value={condition} onChange={(e) => onConditionChange(e.target.value as ProductCondition)} className={inputCls}>
              <option value="new">{t({ en: 'New', fr: 'Neuf' })}</option>
              <option value="refurbished">{t({ en: 'Refurbished', fr: 'Reconditionné' })}</option>
              <option value="second_hand">{t({ en: 'Second-hand', fr: 'Occasion' })}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t({ en: 'Category', fr: 'Catégorie' })} *</label>
            <select value={product.category || 'keyboard'} onChange={(e) => onChange({ category: e.target.value as ProductCategory })} className={inputCls}>
              <option value="keyboard">{t({ en: 'Keyboard', fr: 'Clavier' })}</option>
              <option value="mouse">{t({ en: 'Mouse', fr: 'Souris' })}</option>
              <option value="cable">{t({ en: 'Cable', fr: 'Câble' })}</option>
              <option value="speaker">{t({ en: 'Speaker', fr: 'Enceinte' })}</option>
              <option value="solar_lamp">{t({ en: 'Solar Lamp', fr: 'Lampe solaire' })}</option>
            </select>
          </div>
        </div>
        {condition === 'second_hand' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {t({ en: 'Second-hand products require at least 2 actual photos of the item. No returns accepted.', fr: "Les produits d'occasion nécessitent au moins 2 photos réelles de l'article. Aucun retour accepté." })}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">{t({ en: 'Basic Information', fr: 'Informations de base' })}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom (FR)</label>
              <input type="text" value={product.name_fr || ''} onChange={(e) => onChange({ name_fr: e.target.value })} className={inputCls} placeholder="Nom en français" />
            </div>
            <div>
              <label className={labelCls}>Name (EN)</label>
              <input type="text" value={product.name_en || ''} onChange={(e) => onChange({ name_en: e.target.value })} className={inputCls} placeholder="Name in English" />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t({ en: 'Display Name (fallback)', fr: 'Nom affiché (fallback)' })}</label>
            <input type="text" value={product.name} onChange={(e) => onChange({ name: e.target.value })} className={inputCls} placeholder="Used if FR/EN names are empty" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Description (FR)</label>
              <textarea value={product.description_fr || ''} onChange={(e) => onChange({ description_fr: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Description en français" />
            </div>
            <div>
              <label className={labelCls}>Description (EN)</label>
              <textarea value={product.description_en || ''} onChange={(e) => onChange({ description_en: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Description in English" />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t({ en: 'Brand', fr: 'Marque' })}</label>
            <input type="text" value={product.brand} onChange={(e) => onChange({ brand: e.target.value })} className={inputCls} placeholder="Logitech, Apple..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t({ en: 'Price (XAF)', fr: 'Prix (XAF)' })} *</label>
              <input type="number" value={product.price_xaf} onChange={(e) => onChange({ price_xaf: Number(e.target.value) })} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>{t({ en: 'Compare-at Price (XAF)', fr: 'Prix barré (XAF)' })}</label>
              <input type="number" value={product.compare_at_price || ''} onChange={(e) => onChange({ compare_at_price: e.target.value ? Number(e.target.value) : null })} className={inputCls} placeholder={t({ en: 'Optional', fr: 'Optionnel' })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t({ en: 'Stock Status', fr: 'Statut du stock' })}</label>
              <select value={product.stock_status} onChange={(e) => onChange({ stock_status: e.target.value as any })} className={inputCls}>
                <option value="in_stock">{t({ en: 'In Stock', fr: 'En stock' })}</option>
                <option value="out_of_stock">{t({ en: 'Out of Stock', fr: 'Rupture de stock' })}</option>
                <option value="pre_order">{t({ en: 'Pre-order', fr: 'Pré-commande' })}</option>
              </select>
            </div>
            {!hasVariants && (
              <div>
                <label className={labelCls}>{t({ en: 'Stock Qty', fr: 'Quantité en stock' })}</label>
                <input type="number" value={product.stock_qty ?? 0} onChange={(e) => onChange({ stock_qty: Number(e.target.value) })} className={inputCls} placeholder="0" />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>{t({ en: 'Warranty', fr: 'Garantie' })}</label>
            <input type="text" value={product.warranty_info || ''} onChange={(e) => onChange({ warranty_info: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={!!product.featured} onChange={(e) => onChange({ featured: e.target.checked })} className="h-4 w-4 rounded border-brand-grey text-brand-blue focus:ring-brand-blue" />
            <label htmlFor="featured" className="text-sm font-medium text-brand-dark">{t({ en: 'Featured product', fr: 'Produit en vedette' })}</label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">{t({ en: 'Variants', fr: 'Variantes' })}</h2>
          <button onClick={onAddVariantGroup} className="flex items-center gap-1 text-sm text-brand-grey transition hover:text-brand-blue">
            <Plus className="w-4 h-4" />
            {t({ en: 'Add Group', fr: 'Ajouter groupe' })}
          </button>
        </div>
        {(product.variants || []).length === 0 ? (
          <p className="text-sm text-brand-dark/40">{t({ en: 'No variants — uses stock qty above', fr: 'Aucune variante — utilise la quantité ci-dessus' })}</p>
        ) : (
          <div className="space-y-6">
            {(product.variants || []).map((variant, vi) => (
              <div key={vi} className="rounded-lg border border-brand-grey/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input type="text" value={variant.label} onChange={(e) => onUpdateVariantLabel(vi, e.target.value)} className={`${inputCls} flex-1`} placeholder={t({ en: 'Group label (e.g. Color, Size)', fr: 'Nom du groupe (ex. Couleur, Taille)' })} />
                  <button onClick={() => onRemoveVariantGroup(vi)} className="p-2 text-brand-grey hover:text-brand-orange transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {variant.options.map((opt, oi) => (
                    <div key={oi} className="grid grid-cols-[1fr_100px_100px_auto] gap-2 items-center">
                      <input type="text" value={opt.name} onChange={(e) => onUpdateVariantOption(vi, oi, { name: e.target.value })} className={inputCls} placeholder={t({ en: 'Option name', fr: 'Nom option' })} />
                      <input type="number" value={opt.stock_qty} onChange={(e) => onUpdateVariantOption(vi, oi, { stock_qty: Number(e.target.value) })} className={inputCls} placeholder="Qty" />
                      <input type="number" value={opt.price_delta} onChange={(e) => onUpdateVariantOption(vi, oi, { price_delta: Number(e.target.value) })} className={inputCls} placeholder="±XAF" />
                      <button onClick={() => onRemoveVariantOption(vi, oi)} className="p-2 text-brand-grey hover:text-brand-orange transition"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => onAddVariantOption(vi)} className="flex items-center gap-1 text-xs text-brand-grey hover:text-brand-blue transition mt-1">
                    <Plus className="w-3 h-3" />
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">{t({ en: 'Specifications', fr: 'Spécifications' })}</h2>
          <button onClick={onAddSpec} className="flex items-center gap-1 text-sm text-brand-grey transition hover:text-brand-blue">
            <Plus className="w-4 h-4" />
            {t({ en: 'Add Spec', fr: 'Ajouter' })}
          </button>
        </div>
        <div className="space-y-3">
          {specKeys.map((key, index) => (
            <div key={index} className="flex items-center gap-3">
              <input type="text" value={key} onChange={(e) => onSpecKeyChange(index, e.target.value)} className="flex-1 rounded-lg border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue" placeholder={t({ en: 'Spec name', fr: 'Nom spec' })} />
              <span className="text-brand-grey">:</span>
              <input type="text" value={product.specs[key] || ''} onChange={(e) => onSpecValueChange(key, e.target.value)} className="flex-1 rounded-lg border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue" placeholder={t({ en: 'Value', fr: 'Valeur' })} />
              <button onClick={() => onRemoveSpec(index)} className="p-2 text-brand-grey transition hover:text-brand-orange"><X className="w-4 h-4" /></button>
            </div>
          ))}
          {specKeys.length === 0 && <p className="text-sm text-brand-dark/40">{t({ en: 'No specifications added', fr: 'Aucune spécification ajoutée' })}</p>}
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-brand-dark">{t({ en: 'Images', fr: 'Images' })}</h2>
        {condition === 'second_hand' && (
          <p className="mb-3 text-xs text-amber-700">{t({ en: 'Min. 2 photos required for second-hand', fr: "Min. 2 photos requises pour l'occasion" })}</p>
        )}
        <ImageUploader images={product.images} onChange={onImagesChange} />
      </div>
    </div>
  );
}
