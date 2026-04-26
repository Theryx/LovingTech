'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Star, Pencil, Trash2, AlertCircle, Loader2, Database } from 'lucide-react';
import { Product, productService } from '@/lib/supabase';

const CONDITION_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  new:         { bg: '#D1FAE5', text: '#065F46', label: 'New / Neuf' },
  refurbished: { bg: '#DBEAFE', text: '#1E3A8A', label: 'Refurbished' },
  second_hand: { bg: '#FEF3C7', text: '#92400E', label: 'Occasion' },
};
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="font-medium text-brand-grey">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-brand-dark">{t(labels.products)}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isLocal 
                ? 'bg-brand-orange/15 text-brand-orange'
                : 'bg-brand-blue/15 text-brand-blue'
            }`}>
              {isLocal ? <AlertCircle className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              {isLocal ? t(labels.usingLocal) : t(labels.usingDb)}
            </span>
          </div>
          <p className="text-brand-grey">Manage your product catalog and inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-medium text-white transition hover:brightness-95"
        >
          <Plus className="w-4 h-4" />
          {t(labels.addProduct)}
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/10 p-4 text-brand-orange">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
          <input
            type="text"
            placeholder={t(labels.searchProducts)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-brand-grey/30 bg-white py-2 pl-10 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full appearance-none rounded-lg border border-brand-grey/30 bg-white py-2 pl-10 pr-8 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
          >
            <option value="">{t(labels.allBrands)}</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-grey/20">
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.product)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.brand)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.price)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">Condition</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.stock)}</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-brand-grey">{t(labels.featured)}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-brand-grey">{t(labels.actions)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-brand-grey/10 transition hover:bg-brand-grey/5"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-brand-grey/15">
                      <img
                        src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                        }}
                      />
                    </div>
                    <span className="font-medium text-brand-dark">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-brand-grey">{product.brand}</td>
                <td className="px-6 py-4 text-brand-dark">{formatPrice(product.price_xaf)}</td>
                <td className="px-6 py-4">
                  {product.condition && CONDITION_STYLE[product.condition] ? (
                    <span
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      style={{ backgroundColor: CONDITION_STYLE[product.condition].bg, color: CONDITION_STYLE[product.condition].text }}
                    >
                      {CONDITION_STYLE[product.condition].label}
                    </span>
                  ) : (
                    <span className="text-xs text-brand-dark/30">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock_status === 'in_stock'
                        ? 'bg-brand-blue/15 text-brand-blue'
                        : product.stock_status === 'out_of_stock'
                        ? 'bg-brand-dark text-white'
                        : 'bg-brand-orange/15 text-brand-orange'
                    }`}
                  >
                    {product.stock_status === 'in_stock' ? t(labels.inStock) : product.stock_status === 'out_of_stock' ? t(labels.outOfStock) : t(labels.preOrder)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {(product as ProductWithFeatured).featured ? (
                    <Star className="mx-auto h-5 w-5 fill-brand-orange text-brand-orange" />
                  ) : (
                    <Star className="mx-auto h-5 w-5 text-brand-grey" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-brand-grey transition hover:text-brand-blue"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {!isLocal && (
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-brand-grey transition hover:text-brand-orange"
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
          <div className="p-12 text-center text-brand-grey">{t(labels.noProducts)}</div>
        )}
      </div>
    </div>
  );
}
