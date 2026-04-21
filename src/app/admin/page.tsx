'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';
import { Product, productService } from '@/lib/supabase';

const labels = {
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  totalProducts: { en: 'Total Products', fr: 'Produits total' },
  featuredProducts: { en: 'Featured Products', fr: 'Produits en vedette' },
  totalLeads: { en: 'Total Leads', fr: 'Prospects total' },
  pendingLeads: { en: 'Pending Leads', fr: 'Prospects en attente' },
  quickActions: { en: 'Quick Actions', fr: 'Actions rapides' },
  addNewProduct: { en: 'Add New Product', fr: 'Ajouter un produit' },
  viewAllLeads: { en: 'View All Leads', fr: 'Voir tous les prospects' },
  recentActivity: { en: 'Recent Activity', fr: 'Activité récente' },
  noRecentActivity: { en: 'No recent activity', fr: 'Aucune activité récente' },
};

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const dbProducts = await productService.getAll();
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);

  const featuredCount = products.filter((p) => (p as ProductWithFeatured).featured).length;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{t(labels.dashboard)}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/products"
          className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.totalProducts)}</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-4xl font-bold text-zinc-900 dark:text-white">{products.length}</span>
        </Link>
        <Link
          href="/admin/products?featured=true"
          className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.featuredProducts)}</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-4xl font-bold text-zinc-900 dark:text-white">{featuredCount}</span>
        </Link>
        <Link
          href="/admin/leads"
          className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.totalLeads)}</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-4xl font-bold text-zinc-900 dark:text-white">0</span>
        </Link>
        <Link
          href="/admin/leads?status=pending"
          className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.pendingLeads)}</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-4xl font-bold text-zinc-900 dark:text-white">0</span>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t(labels.quickActions)}</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{t(labels.addNewProduct)}</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{t(labels.viewAllLeads)}</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t(labels.recentActivity)}</h2>
          <p className="text-zinc-500 dark:text-zinc-400">{t(labels.noRecentActivity)}</p>
        </div>
      </div>
    </div>
  );
}