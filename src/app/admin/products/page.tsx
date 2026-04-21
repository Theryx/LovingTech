'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Star, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';

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

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [products] = useState(LOCAL_PRODUCTS as unknown as Product[]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || p.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = Array.from(new Set(products.map((p) => p.brand)));

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
                  {(product as ProductWithFeatured).featured ? (
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