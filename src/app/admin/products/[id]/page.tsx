'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/components/NotificationProvider';
import { Product, ProductCondition, ProductCategory, Variant, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ImageUploader from '@/components/ImageUploader';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';

const WARRANTY_DEFAULTS: Record<ProductCondition, string> = {
  new: 'Garantie fabricant / Manufacturer warranty',
  refurbished: '30 jours / 30 days',
  second_hand: 'Aucune garantie / No warranty',
};

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
  stock_qty: 0,
  low_stock_threshold: 3,
};

const inputCls = 'w-full rounded-lg border border-brand-grey/30 bg-white px-4 py-2 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue';
const labelCls = 'mb-2 block text-sm font-medium text-brand-dark';

export default function AdminProductEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const { error: notifyError, success } = useNotifications();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product>(emptyProduct);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLocalProduct, setIsLocalProduct] = useState(false);

  const set = (patch: Partial<Product>) => setProduct(p => ({ ...p, ...patch }));

  useEffect(() => {
    async function loadProduct() {
      let found: Product | ProductWithFeatured | null = null;
      let fromLocal = false;

      try {
        const db = await productService.getById(productId);
        if (db) found = db;
      } catch (err) {
        console.error('DB fetch failed:', err);
      }

      if (!found) {
        const local = LOCAL_PRODUCTS.find(p => p.id === productId);
        if (local) { found = local; fromLocal = true; }
      }

      if (found) {
        setProduct({
          ...emptyProduct,
          ...found,
          condition: (found as Product).condition || 'new',
          category: (found as Product).category || 'keyboard',
          variants: (found as Product).variants || [],
          warranty_info: (found as Product).warranty_info || WARRANTY_DEFAULTS[(found as Product).condition || 'new'],
        });
        setSpecKeys(Object.keys(found.specs || {}));
        setIsLocalProduct(fromLocal);
      }
    }
    loadProduct();
  }, [productId]);

  const handleConditionChange = (condition: ProductCondition) => {
    set({ condition, warranty_info: WARRANTY_DEFAULTS[condition] });
  };

  // Specs helpers
  const handleSpecKeyChange = (index: number, value: string) => {
    const newKeys = [...specKeys];
    const oldKey = newKeys[index];
    newKeys[index] = value;
    setSpecKeys(newKeys);
    if (oldKey && product.specs[oldKey] !== undefined) {
      const newSpecs = { ...product.specs };
      const val = newSpecs[oldKey];
      delete newSpecs[oldKey];
      if (value) newSpecs[value] = val;
      set({ specs: newSpecs });
    }
  };

  const handleSpecValueChange = (key: string, val: string) => {
    set({ specs: { ...product.specs, [key]: val } });
  };

  const addSpec = () => setSpecKeys([...specKeys, '']);
  const removeSpec = (index: number) => {
    const key = specKeys[index];
    const newKeys = specKeys.filter((_, i) => i !== index);
    const newSpecs = { ...product.specs };
    delete newSpecs[key];
    setSpecKeys(newKeys);
    set({ specs: newSpecs });
  };

  // Variant helpers
  const addVariantGroup = () => {
    set({ variants: [...(product.variants || []), { label: '', options: [{ name: '', stock_qty: 0, price_delta: 0 }] }] });
  };

  const updateVariantLabel = (vi: number, label: string) => {
    const variants = [...(product.variants || [])];
    variants[vi] = { ...variants[vi], label };
    set({ variants });
  };

  const addVariantOption = (vi: number) => {
    const variants = [...(product.variants || [])];
    variants[vi] = { ...variants[vi], options: [...variants[vi].options, { name: '', stock_qty: 0, price_delta: 0 }] };
    set({ variants });
  };

  const updateVariantOption = (vi: number, oi: number, patch: Partial<Variant['options'][0]>) => {
    const variants = [...(product.variants || [])];
    const options = [...variants[vi].options];
    options[oi] = { ...options[oi], ...patch };
    variants[vi] = { ...variants[vi], options };
    set({ variants });
  };

  const removeVariantOption = (vi: number, oi: number) => {
    const variants = [...(product.variants || [])];
    variants[vi] = { ...variants[vi], options: variants[vi].options.filter((_, i) => i !== oi) };
    set({ variants });
  };

  const removeVariantGroup = (vi: number) => {
    set({ variants: (product.variants || []).filter((_, i) => i !== vi) });
  };

  const handleSave = async () => {
    if (product.condition === 'second_hand' && (product.images || []).length < 2) {
      notifyError('Second-hand products require at least 2 photos of the actual item.');
      return;
    }
    setSaving(true);
    try {
      const data = { ...product, specs: product.specs || {}, images: product.images || [] };
      if (isLocalProduct) {
        await productService.create(data as any);
      } else {
        await productService.update(product.id, data as any);
      }
      setSaved(true);
      success(t({ en: 'Product saved successfully.', fr: 'Produit enregistré avec succès.' }));
      setTimeout(() => router.push('/admin/products'), 1000);
    } catch (error: any) {
      console.error('Failed to save:', error);
      notifyError(`Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const hasVariants = (product.variants || []).length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 text-brand-grey transition hover:text-brand-blue">
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
          {saving ? t({ en: 'Saving...', fr: 'Enregistrement...' }) : saved ? t({ en: 'Saved!', fr: 'Enregistré!' }) : t({ en: 'Save', fr: 'Enregistrer' })}
        </button>
      </div>

      <div className="space-y-6">
        {/* Condition & Category */}
        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">{t({ en: 'Classification', fr: 'Classification' })}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t({ en: 'Condition', fr: 'État' })} *</label>
              <select value={product.condition || 'new'} onChange={(e) => handleConditionChange(e.target.value as ProductCondition)} className={inputCls}>
                <option value="new">{t({ en: 'New', fr: 'Neuf' })}</option>
                <option value="refurbished">{t({ en: 'Refurbished', fr: 'Reconditionné' })}</option>
                <option value="second_hand">{t({ en: 'Second-hand', fr: 'Occasion' })}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t({ en: 'Category', fr: 'Catégorie' })} *</label>
              <select value={product.category || 'keyboard'} onChange={(e) => set({ category: e.target.value as ProductCategory })} className={inputCls}>
                <option value="keyboard">{t({ en: 'Keyboard', fr: 'Clavier' })}</option>
                <option value="mouse">{t({ en: 'Mouse', fr: 'Souris' })}</option>
                <option value="cable">{t({ en: 'Cable', fr: 'Câble' })}</option>
                <option value="speaker">{t({ en: 'Speaker', fr: 'Enceinte' })}</option>
                <option value="solar_lamp">{t({ en: 'Solar Lamp', fr: 'Lampe solaire' })}</option>
              </select>
            </div>
          </div>
          {product.condition === 'second_hand' && (
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
                <input type="text" value={product.name_fr || ''} onChange={(e) => set({ name_fr: e.target.value })} className={inputCls} placeholder="Nom en français" />
              </div>
              <div>
                <label className={labelCls}>Name (EN)</label>
                <input type="text" value={product.name_en || ''} onChange={(e) => set({ name_en: e.target.value })} className={inputCls} placeholder="Name in English" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t({ en: 'Display Name (fallback)', fr: 'Nom affiché (fallback)' })}</label>
              <input type="text" value={product.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} placeholder="Used if FR/EN names are empty" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Description (FR)</label>
                <textarea value={product.description_fr || ''} onChange={(e) => set({ description_fr: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Description en français" />
              </div>
              <div>
                <label className={labelCls}>Description (EN)</label>
                <textarea value={product.description_en || ''} onChange={(e) => set({ description_en: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Description in English" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t({ en: 'Brand', fr: 'Marque' })}</label>
              <input type="text" value={product.brand} onChange={(e) => set({ brand: e.target.value })} className={inputCls} placeholder="Logitech, Apple..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t({ en: 'Price (XAF)', fr: 'Prix (XAF)' })} *</label>
                <input type="number" value={product.price_xaf} onChange={(e) => set({ price_xaf: Number(e.target.value) })} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>{t({ en: 'Compare-at Price (XAF)', fr: 'Prix barré (XAF)' })}</label>
                <input type="number" value={product.compare_at_price || ''} onChange={(e) => set({ compare_at_price: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} placeholder={t({ en: 'Optional', fr: 'Optionnel' })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t({ en: 'Stock Status', fr: 'Statut du stock' })}</label>
                <select value={product.stock_status} onChange={(e) => set({ stock_status: e.target.value as any })} className={inputCls}>
                  <option value="in_stock">{t({ en: 'In Stock', fr: 'En stock' })}</option>
                  <option value="out_of_stock">{t({ en: 'Out of Stock', fr: 'Rupture de stock' })}</option>
                  <option value="pre_order">{t({ en: 'Pre-order', fr: 'Pré-commande' })}</option>
                </select>
              </div>
              {!hasVariants && (
                <div>
                  <label className={labelCls}>{t({ en: 'Stock Qty', fr: 'Quantité en stock' })}</label>
                  <input type="number" value={product.stock_qty ?? 0} onChange={(e) => set({ stock_qty: Number(e.target.value) })} className={inputCls} placeholder="0" />
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>{t({ en: 'Warranty', fr: 'Garantie' })}</label>
              <input type="text" value={product.warranty_info || ''} onChange={(e) => set({ warranty_info: e.target.value })} className={inputCls} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={!!product.featured} onChange={(e) => set({ featured: e.target.checked })} className="h-4 w-4 rounded border-brand-grey text-brand-blue focus:ring-brand-blue" />
              <label htmlFor="featured" className="text-sm font-medium text-brand-dark">{t({ en: 'Featured product', fr: 'Produit en vedette' })}</label>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-dark">{t({ en: 'Variants', fr: 'Variantes' })}</h2>
            <button onClick={addVariantGroup} className="flex items-center gap-1 text-sm text-brand-grey transition hover:text-brand-blue">
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
                    <input type="text" value={variant.label} onChange={(e) => updateVariantLabel(vi, e.target.value)} className={`${inputCls} flex-1`} placeholder={t({ en: 'Group label (e.g. Color, Size)', fr: 'Nom du groupe (ex. Couleur, Taille)' })} />
                    <button onClick={() => removeVariantGroup(vi)} className="p-2 text-brand-grey hover:text-brand-orange transition"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2">
                    {variant.options.map((opt, oi) => (
                      <div key={oi} className="grid grid-cols-[1fr_100px_100px_auto] gap-2 items-center">
                        <input type="text" value={opt.name} onChange={(e) => updateVariantOption(vi, oi, { name: e.target.value })} className={inputCls} placeholder={t({ en: 'Option name', fr: 'Nom option' })} />
                        <input type="number" value={opt.stock_qty} onChange={(e) => updateVariantOption(vi, oi, { stock_qty: Number(e.target.value) })} className={inputCls} placeholder="Qty" />
                        <input type="number" value={opt.price_delta} onChange={(e) => updateVariantOption(vi, oi, { price_delta: Number(e.target.value) })} className={inputCls} placeholder="±XAF" />
                        <button onClick={() => removeVariantOption(vi, oi)} className="p-2 text-brand-grey hover:text-brand-orange transition"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addVariantOption(vi)} className="flex items-center gap-1 text-xs text-brand-grey hover:text-brand-blue transition mt-1">
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
            <button onClick={addSpec} className="flex items-center gap-1 text-sm text-brand-grey transition hover:text-brand-blue">
              <Plus className="w-4 h-4" />
              {t({ en: 'Add Spec', fr: 'Ajouter' })}
            </button>
          </div>
          <div className="space-y-3">
            {specKeys.map((key, index) => (
              <div key={index} className="flex items-center gap-3">
                <input type="text" value={key} onChange={(e) => handleSpecKeyChange(index, e.target.value)} className="flex-1 rounded-lg border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue" placeholder={t({ en: 'Spec name', fr: 'Nom spec' })} />
                <span className="text-brand-grey">:</span>
                <input type="text" value={product.specs[key] || ''} onChange={(e) => handleSpecValueChange(key, e.target.value)} className="flex-1 rounded-lg border border-brand-grey/30 bg-white px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue" placeholder={t({ en: 'Value', fr: 'Valeur' })} />
                <button onClick={() => removeSpec(index)} className="p-2 text-brand-grey transition hover:text-brand-orange"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {specKeys.length === 0 && <p className="text-sm text-brand-dark/40">{t({ en: 'No specifications added', fr: 'Aucune spécification ajoutée' })}</p>}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-1 text-lg font-semibold text-brand-dark">{t({ en: 'Images', fr: 'Images' })}</h2>
          {product.condition === 'second_hand' && (
            <p className="mb-3 text-xs text-amber-700">{t({ en: 'Min. 2 photos required for second-hand', fr: "Min. 2 photos requises pour l'occasion" })}</p>
          )}
          <ImageUploader images={product.images} onChange={(images) => set({ images })} />
        </div>
      </div>
    </div>
  );
}
