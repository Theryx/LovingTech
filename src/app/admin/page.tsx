'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold text-brand-dark">{t(labels.dashboard)}</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-grey">{t(labels.totalProducts)}</span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">{products.length}</span>
        </Link>
        <Link
          href="/admin/products?featured=true"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-grey">{t(labels.featuredProducts)}</span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">{featuredCount}</span>
        </Link>
        <Link
          href="/admin/leads"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-grey">{t(labels.totalLeads)}</span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">0</span>
        </Link>
        <Link
          href="/admin/leads?status=pending"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-grey">{t(labels.pendingLeads)}</span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">0</span>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">{t(labels.quickActions)}</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">{t(labels.addNewProduct)}</span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">{t(labels.viewAllLeads)}</span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">{t(labels.recentActivity)}</h2>
          <p className="text-brand-grey">{t(labels.noRecentActivity)}</p>
        </div>
      </div>
    </div>
  );
}
