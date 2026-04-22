'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Star, Pencil, Trash2, AlertCircle, Loader2, Database } from 'lucide-react';
import { Product, productService } from '@/lib/supabase';
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
  loadingError: { en: 'Failed to connect to database. Showing local products instead.', fr: 'Impossible de se connecter à la base de données. Affichage des produits locaux.' },
  usingLocal: { en: 'Using Local Data', fr: 'Données locales' },
  usingDb: { en: 'Live Database', fr: 'Base de données' },
};

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const dbProducts = await productService.getAll();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts as Product[]);
          setIsLocal(false);
        } else {
          console.warn('Database is empty, using local products');
          setProducts(LOCAL_PRODUCTS as unknown as Product[]);
          setIsLocal(true);
        }
      } catch (err) {
        console.error('Failed to load from DB:', err);
        setError(t(labels.loadingError));
        setProducts(LOCAL_PRODUCTS as unknown as Product[]);
        setIsLocal(true);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [t]);

  const handleDelete = async (id: string) => {
    if (isLocal) {
      alert('Cannot delete local mock products. Please connect a database.');
      return;
    }
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const descMatch = p.description?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesSearch = nameMatch || descMatch;
    const matchesBrand = !filterBrand || p.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t(labels.products)}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isLocal 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {isLocal ? <AlertCircle className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              {isLocal ? t(labels.usingLocal) : t(labels.usingDb)}
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your product catalog and inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition"
        >
          <Plus className="w-4 h-4" />
          {t(labels.addProduct)}
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t(labels.searchProducts)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full appearance-none pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
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

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full min-w-[800px]">
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
                        src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.svg';
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
                    {!isLocal && (
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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