'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Product, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ImageUploader from '@/components/ImageUploader';

const labels = {
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit' },
  basicInfo: { en: 'Basic Information', fr: 'Informations de base' },
  productName: { en: 'Product Name', fr: 'Nom du produit' },
  enterProductName: { en: 'Enter product name', fr: 'Nom du produit' },
  description: { en: 'Description', fr: 'Description' },
  enterDescription: { en: 'Enter product description', fr: 'Description du produit' },
  priceXaf: { en: 'Price (XAF)', fr: 'Prix (XAF)' },
  brand: { en: 'Brand', fr: 'Marque' },
  enterBrand: { en: 'Enter brand', fr: 'Marque' },
  stockStatus: { en: 'Stock Status', fr: 'Statut du stock' },
  inStock: { en: 'In Stock', fr: 'En stock' },
  outOfStock: { en: 'Out of Stock', fr: 'Rupture de stock' },
  preOrder: { en: 'Pre-order', fr: 'Pré-commande' },
  featured: { en: 'Featured product', fr: 'Produit en vedette' },
  specifications: { en: 'Specifications', fr: 'Spécifications' },
  addSpec: { en: 'Add Spec', fr: 'Ajouter' },
  specName: { en: 'Spec name', fr: 'Nom spec' },
  value: { en: 'Value', fr: 'Valeur' },
  noSpecs: { en: 'No specifications added', fr: 'Aucune spécification ajoutée' },
  images: { en: 'Images', fr: 'Images' },
  imageUrl: { en: 'Image URL', fr: 'URL de l\'image' },
  addImage: { en: 'Add Image', fr: 'Ajouter une image' },
  imageHint: { en: 'Max: 5MB • 800-1200px • JPEG, PNG, WebP', fr: 'Max: 5Mo • 800-1200px • JPEG, PNG, WebP' },
  save: { en: 'Save', fr: 'Enregistrer' },
  saving: { en: 'Saving...', fr: 'Enregistrement...' },
  saved: { en: 'Saved!', fr: 'Enregistré!' },
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
};

export default function NewProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [featured, setFeatured] = useState(false);
  const [specKeys, setSpecKeys] = useState<string[]>(['spec1', 'spec2']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSpecKeyChange = (index: number, value: string) => {
    const newKeys = [...specKeys];
    const oldKey = newKeys[index];
    newKeys[index] = value;
    setSpecKeys(newKeys);

    if (oldKey && product.specs[oldKey]) {
      const newSpecs = { ...product.specs };
      delete newSpecs[oldKey];
      if (value) {
        newSpecs[value] = product.specs[oldKey];
      }
      setProduct({ ...product, specs: newSpecs });
    }
  };

  const handleSpecValueChange = (key: string, val: string) => {
    setProduct({ ...product, specs: { ...product.specs, [key]: val } });
  };

  const addSpec = () => {
    setSpecKeys([...specKeys, `spec${specKeys.length + 1}`]);
  };

  const removeSpec = (index: number) => {
    const key = specKeys[index];
    const newKeys = specKeys.filter((_, i) => i !== index);
    const newSpecs = { ...product.specs };
    delete newSpecs[key];
    setSpecKeys(newKeys);
    setProduct({ ...product, specs: newSpecs });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newProduct = {
        ...product,
        id: crypto.randomUUID(),
        specs: product.specs || {},
        images: product.images || [],
        stock_status: product.stock_status || 'in_stock',
        featured,
      };
      await productService.create(newProduct as any);
      setSaved(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {t(labels.addProduct)}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? t(labels.saving) : saved ? t(labels.saved) : t(labels.save)}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t(labels.basicInfo)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t(labels.productName)}</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                placeholder={t(labels.enterProductName)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t(labels.description)}</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                placeholder={t(labels.enterDescription)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t(labels.priceXaf)}</label>
                <input
                  type="number"
                  value={product.price_xaf}
                  onChange={(e) => setProduct({ ...product, price_xaf: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t(labels.brand)}</label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder={t(labels.enterBrand)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t(labels.stockStatus)}</label>
              <select
                value={product.stock_status}
                onChange={(e) => setProduct({ ...product, stock_status: e.target.value as any })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              >
                <option value="in_stock">{t(labels.inStock)}</option>
                <option value="out_of_stock">{t(labels.outOfStock)}</option>
                <option value="pre_order">{t(labels.preOrder)}</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-white"
              />
              <label htmlFor="featured" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t(labels.featured)}
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t(labels.specifications)}</h2>
            <button
              onClick={addSpec}
              className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <Plus className="w-4 h-4" />
              {t(labels.addSpec)}
            </button>
          </div>
          <div className="space-y-3">
            {specKeys.map((key, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleSpecKeyChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder={t(labels.specName)}
                />
                <span className="text-zinc-400">:</span>
                <input
                  type="text"
                  value={product.specs[key] || ''}
                  onChange={(e) => handleSpecValueChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder={t(labels.value)}
                />
                <button
                  onClick={() => removeSpec(index)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {specKeys.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(labels.noSpecs)}</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t(labels.images)}</h2>
          <ImageUploader
            images={product.images}
            onChange={(images) => setProduct({ ...product, images })}
          />
        </div>
      </div>
    </div>
  );
}