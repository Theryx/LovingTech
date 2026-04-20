'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { Lead } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const labels = {
  leads: { en: 'Leads', fr: 'Prospects' },
  total: { en: 'total', fr: 'total' },
  pendingCount: { en: 'pending', fr: 'en attente' },
  searchLeads: { en: 'Search leads...', fr: 'Rechercher des prospects...' },
  allStatus: { en: 'All Status', fr: 'Tous les statuts' },
  product: { en: 'Product', fr: 'Produit' },
  whatsapp: { en: 'WhatsApp', fr: 'WhatsApp' },
  address: { en: 'Address', fr: 'Adresse' },
  status: { en: 'Status', fr: 'Statut' },
  date: { en: 'Date', fr: 'Date' },
  actions: { en: 'Actions', fr: 'Actions' },
  markContacted: { en: 'Mark Contacted', fr: 'Marquer contacté' },
  markCompleted: { en: 'Mark Completed', fr: 'Marquer terminé' },
  pending: { en: 'Pending', fr: 'En attente' },
  contacted: { en: 'Contacted', fr: 'Contacté' },
  completed: { en: 'Completed', fr: 'Terminé' },
  noLeads: { en: 'No leads found', fr: 'Aucun prospect trouvé' },
  unknownProduct: { en: 'Unknown Product', fr: 'Produit inconnu' },
};

const mockLeads: Lead[] = [
  {
    id: '1',
    product_id: '1',
    whatsapp_number: '+237 612 345 678',
    address: 'Buea, Cameroon',
    status: 'pending',
    created_at: '2026-04-15T10:30:00Z',
  },
  {
    id: '2',
    product_id: '2',
    whatsapp_number: '+237 677 890 123',
    address: 'Douala, Cameroon',
    status: 'contacted',
    created_at: '2026-04-14T14:20:00Z',
  },
  {
    id: '3',
    product_id: '3',
    whatsapp_number: '+237 699 456 789',
    address: 'Yaoundé, Cameroon',
    status: 'completed',
    created_at: '2026-04-10T09:15:00Z',
  },
];

const mockProducts: Record<string, string> = {
  '1': 'Logitech MX Master 3S',
  '2': 'Logitech MX Keys S',
  '3': 'Keychron K2 Pro',
  '4': 'Logitech G502 Hero',
  '5': 'Logitech Pebble Mouse 2',
  '6': 'Anker PowerCore 20000',
  '7': 'Anker 737 Power Bank',
  '8': 'Keychron Q1 Pro',
};

export default function AdminLeadsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [leads] = useState<Lead[]>(mockLeads);

  const filteredLeads = leads.filter((lead) => {
    const productName = mockProducts[lead.product_id] || '';
    const matchesSearch =
      lead.whatsapp_number.toLowerCase().includes(search.toLowerCase()) ||
      lead.address.toLowerCase().includes(search.toLowerCase()) ||
      productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t(labels.leads)}</h1>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{leads.length} {t(labels.total)}</span>
          <span>•</span>
          <span>{leads.filter((l) => l.status === 'pending').length} {t(labels.pendingCount)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t(labels.searchLeads)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
          >
            <option value="">{t(labels.allStatus)}</option>
            <option value="pending">{t(labels.pending)}</option>
            <option value="contacted">{t(labels.contacted)}</option>
            <option value="completed">{t(labels.completed)}</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.product)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.whatsapp)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.address)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.status)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.date)}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(labels.actions)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {mockProducts[lead.product_id] || t(labels.unknownProduct)}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{lead.whatsapp_number}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{lead.address}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : lead.status === 'contacted'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {lead.status === 'pending' ? (
                      <Clock className="w-3 h-3" />
                    ) : lead.status === 'contacted' ? (
                      <MessageSquare className="w-3 h-3" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {lead.status === 'pending' ? t(labels.pending) : lead.status === 'contacted' ? t(labels.contacted) : t(labels.completed)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {lead.status === 'pending' && (
                      <button className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
                        {t(labels.markContacted)}
                      </button>
                    )}
                    {lead.status === 'contacted' && (
                      <button className="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition">
                        {t(labels.markCompleted)}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">{t(labels.noLeads)}</div>
        )}
      </div>
    </div>
  );
}