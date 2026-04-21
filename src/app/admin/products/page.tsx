'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Star, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const labels = {
  products: { en: 'Products', fr: 'Produits' },
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit' },
  searchProducts: { en: 'Search products...', fr: 'Rechercher des produits...' },
  allBrands: { en: 'All Brands', fr: 'Toutes les marques' },
  product: { en: 'Product', fr: 'Produit' },
  brand: { en: 'Brand', fr: 'Marque' },
  price: { en: 'Price', fr: 'Prix' },
  stock: { en: 'Stock', fr: 'Stock' },
  featured: { en: 'Featured', fr: 'En vedette' },
  actions: { en: 'Actions', fr: 'Actions' },
  inStock: { en: 'In Stock', fr: 'En stock' },
  outOfStock: { en: 'Out of Stock', fr: 'Rupture de stock' },
  preOrder: { en: 'Pre-order', fr: 'Pré-commande' },
  noProducts: { en: 'No products found', fr: 'Aucun produit trouvé' },
};

const mockProducts = [
  {
    id: '1',
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with 8K DPI sensor, quiet clicks, and 70-day battery life.',
    price_xaf: 35000,
    brand: 'Logitech',
    specs: { sensor: '8,000 DPI', battery: '70 days', connectivity: 'Bluetooth, USB Receiver' },
    images: ['/images/logitech-mx-master-3s.png'],
    stock_status: 'in_stock',
  },
  {
    id: '2',
    name: 'Logitech MX Keys S',
    description: 'Smart illuminated wireless keyboard with perfect stroke keys and smart shortcuts.',
    price_xaf: 28000,
    brand: 'Logitech',
    specs: { keys: 'Perfect Stroke', battery: '10 days' },
    images: ['/images/logitech-mx-keys-s.png'],
    stock_status: 'in_stock',
  },
  {
    id: '3',
    name: 'Keychron K2 Pro',
    description: 'Wireless mechanical keyboard with QMK/VIA support and hot-swappable switches.',
    price_xaf: 32000,
    brand: 'Keychron',
    specs: { switches: 'Hot-swappable Brown', battery: '80 hours' },
    images: ['/images/keychron-k2-pro.png'],
    stock_status: 'in_stock',
  },
  {
    id: '4',
    name: 'Logitech G502 Hero',
    description: 'High-performance gaming mouse with 25,600 DPI sensor and 11 programmable buttons.',
    price_xaf: 45000,
    brand: 'Logitech',
    specs: { sensor: '25,600 DPI', buttons: '11 programmable' },
    images: ['/images/logitech-g502-hero.png'],
    stock_status: 'in_stock',
  },
  {
    id: '5',
    name: 'Logitech Pebble Mouse 2',
    description: 'Slim, quiet, and portable wireless mouse with customizable middle button.',
    price_xaf: 25000,
    brand: 'Logitech',
    specs: { sensor: '4000 DPI', battery: '24 months' },
    images: ['/images/logitech-pebble-mouse-2.png'],
    stock_status: 'in_stock',
  },
  {
    id: '6',
    name: 'Anker PowerCore 20000',
    description: '20000mAh portable charger with PowerIQ and fast charging support.',
    price_xaf: 18000,
    brand: 'Anker',
    specs: { capacity: '20000mAh', output: '20W USB-C' },
    images: ['/images/placeholder.svg'],
    stock_status: 'in_stock',
  },
  {
    id: '7',
    name: 'Anker 737 Power Bank',
    description: '24000mAh high-capacity power bank with 140W total output.',
    price_xaf: 42000,
    brand: 'Anker',
    specs: { capacity: '24000mAh', output: '140W total' },
    images: ['/images/anker-737.png'],
    stock_status: 'in_stock',
  },
  {
    id: '8',
    name: 'Keychron Q1 Pro',
    description: 'Premium mechanical keyboard with 2.4G wireless, QMK/VIA, and all-metal body.',
    price_xaf: 48000,
    brand: 'Keychron',
    specs: { switches: 'Hot-swappable Red', battery: '100 hours' },
    images: ['/images/keychron-q1-pro.png'],
    stock_status: 'in_stock',
  },
].map((p) => ({ ...p, featured: ['1', '2', '3'].includes(p.id) }));

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [products] = useState(mockProducts as unknown as Product[]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || p.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = [...new Set(products.map((p) => p.brand))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t(labels.products)}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition"
        >
          <Plus className="w-4 h-4" />
          {t(labels.addProduct)}
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t(labels.searchProducts)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
          >
            <option value="">{t(labels.allBrands)}</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.product)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.brand)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.price)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.stock)}</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.featured)}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.actions)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-white">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{product.brand}</td>
                <td className="px-6 py-4 text-zinc-900 dark:text-white">{formatPrice(product.price_xaf)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock_status === 'in_stock'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : product.stock_status === 'out_of_stock'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {product.stock_status === 'in_stock' ? t(labels.inStock) : product.stock_status === 'out_of_stock' ? t(labels.outOfStock) : t(labels.preOrder)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {(product as any).featured ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto" />
                  ) : (
                    <Star className="w-5 h-5 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-zinc-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">{t(labels.noProducts)}</div>
        )}
      </div>
    </div>
  );
}