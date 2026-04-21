'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ImageUploader from '@/components/ImageUploader';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';

const labels = {
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit' },
  editProduct: { en: 'Edit Product', fr: 'Modifier le produit' },
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
  save: { en: 'Save', fr: 'Enregistrer' },
  saving: { en: 'Saving...', fr: 'Enregistrement...' },
  saved: { en: 'Saved!', fr: 'Enregistré!' },
};
  '1': {
    id: '1',
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with 8K DPI sensor, quiet clicks, and 70-day battery life.',
    price_xaf: 35000,
    brand: 'Logitech',
    specs: { sensor: '8,000 DPI', battery: '70 days', connectivity: 'Bluetooth, USB Receiver' },
    images: ['/images/logitech-mx-master-3s.png'],
    stock_status: 'in_stock',
  },
  '2': {
    id: '2',
    name: 'Logitech MX Keys S',
    description: 'Smart illuminated wireless keyboard with perfect stroke keys and smart shortcuts.',
    price_xaf: 28000,
    brand: 'Logitech',
    specs: { keys: 'Perfect Stroke', battery: '10 days', connectivity: 'Bluetooth, USB Receiver' },
    images: ['/images/logitech-mx-keys-s.png'],
    stock_status: 'in_stock',
  },
  '3': {
    id: '3',
    name: 'Keychron K2 Pro',
    description: 'Wireless mechanical keyboard with QMK/VIA support and hot-swappable switches.',
    price_xaf: 32000,
    brand: 'Keychron',
    specs: { switches: 'Hot-swappable Brown', battery: '80 hours', connectivity: 'Bluetooth, USB-C' },
    images: ['/images/keychron-k2-pro.png'],
    stock_status: 'in_stock',
  },
  '4': {
    id: '4',
    name: 'Logitech G502 Hero',
    description: 'High-performance gaming mouse with 25,600 DPI sensor and 11 programmable buttons.',
    price_xaf: 45000,
    brand: 'Logitech',
    specs: { sensor: '25,600 DPI', buttons: '11 programmable', weight: '121g (adjustable)' },
    images: ['/images/logitech-g502-hero.png'],
    stock_status: 'in_stock',
  },
  '5': {
    id: '5',
    name: 'Logitech Pebble Mouse 2',
    description: 'Slim, quiet, and portable wireless mouse with customizable middle button.',
    price_xaf: 25000,
    brand: 'Logitech',
    specs: { sensor: '4000 DPI', battery: '24 months', connectivity: 'Bluetooth, USB Receiver' },
    images: ['/images/logitech-mx-keys-s.png'],
    stock_status: 'in_stock',
  },
  '6': {
    id: '6',
    name: 'Anker PowerCore 20000',
    description: '20000mAh portable charger with PowerIQ and fast charging support.',
    price_xaf: 18000,
    brand: 'Anker',
    specs: { capacity: '20000mAh', output: '20W USB-C', weight: '345g' },
    images: ['/images/placeholder.svg'],
    stock_status: 'in_stock',
  },
  '7': {
    id: '7',
    name: 'Anker 737 Power Bank',
    description: '24000mAh high-capacity power bank with 140W total output.',
    price_xaf: 42000,
    brand: 'Anker',
    specs: { capacity: '24000mAh', output: '140W total', display: 'Smart IPS' },
    images: ['/images/anker-737.png'],
    stock_status: 'in_stock',
  },
  '8': {
    id: '8',
    name: 'Keychron Q1 Pro',
    description: 'Premium mechanical keyboard with 2.4G wireless, QMK/VIA, and all-metal body.',
    price_xaf: 48000,
    brand: 'Keychron',
    specs: { switches: 'Hot-swappable Red', battery: '100 hours (wireless)', connectivity: '2.4G, Bluetooth, USB-C' },
    images: ['/images/keychron-q1-pro.png'],
    stock_status: 'in_stock',
  },
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

export default function AdminProductEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const isNew = params.id === 'new';
  const productId = isNew ? '' : (params.id as string);

  const [product, setProduct] = useState<Product>(emptyProduct);
  const [featured, setFeatured] = useState(false);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const product = LOCAL_PRODUCTS.find((p) => p.id === productId);
      if (product) {
        setProduct(product);
        setSpecKeys(Object.keys(product.specs));
        setFeatured(!!(product as ProductWithFeatured).featured);
      }
    } else if (isNew) {
      setSpecKeys(['spec1', 'spec2']);
    }
  }, [productId, isNew]);

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

  const handleSpecValueChange = (key: string, value: string) => {
    setProduct({ ...product, specs: { ...product.specs, [key]: value } });
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push('/admin/products');
    }, 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price);
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
            {isNew ? 'Add Product' : 'Edit Product'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Product Name</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                placeholder="Enter product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Price (XAF)</label>
                <input
                  type="number"
                  value={product.price_xaf}
                  onChange={(e) => setProduct({ ...product, price_xaf: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Brand</label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="Enter brand"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Stock Status</label>
              <select
                value={product.stock_status}
                onChange={(e) => setProduct({ ...product, stock_status: e.target.value as any })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="pre_order">Pre-order</option>
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
                Featured product
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Specifications</h2>
            <button
              onClick={addSpec}
              className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <Plus className="w-4 h-4" />
              Add Spec
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
                  placeholder="Spec name"
                />
                <span className="text-zinc-400">:</span>
                <input
                  type="text"
                  value={product.specs[key] || ''}
                  onChange={(e) => handleSpecValueChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="Value"
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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No specifications added</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t({ en: 'Images', fr: 'Images' })}</h2>
          <ImageUploader
            images={product.images}
            onChange={(images) => setProduct({ ...product, images })}
          />
        </div>
      </div>
    </div>
  );
}