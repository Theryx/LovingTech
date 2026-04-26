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
        <h1 className="text-3xl font-bold text-brand-dark">{t(labels.leads)}</h1>
        <div className="flex items-center gap-2 text-sm text-brand-grey">
          <span>{leads.length} {t(labels.total)}</span>
          <span>•</span>
          <span>{leads.filter((l) => l.status === 'pending').length} {t(labels.pendingCount)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
          <input
            type="text"
            placeholder={t(labels.searchLeads)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-brand-grey/30 bg-white py-2 pl-10 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg border border-brand-grey/30 bg-white py-2 pl-10 pr-8 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
          >
            <option value="">{t(labels.allStatus)}</option>
            <option value="pending">{t(labels.pending)}</option>
            <option value="contacted">{t(labels.contacted)}</option>
            <option value="completed">{t(labels.completed)}</option>
          </select>
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-grey/20 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-grey/20">
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.product)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.whatsapp)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.address)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.status)}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey">{t(labels.date)}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-brand-grey">{t(labels.actions)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-brand-grey/10 transition hover:bg-brand-grey/5"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-brand-dark">
                    {mockProducts[lead.product_id] || t(labels.unknownProduct)}
                  </span>
                </td>
                <td className="px-6 py-4 text-brand-grey">{lead.whatsapp_number}</td>
                <td className="px-6 py-4 text-brand-grey">{lead.address}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'pending'
                        ? 'bg-brand-orange/15 text-brand-orange'
                        : lead.status === 'contacted'
                        ? 'bg-brand-blue/15 text-brand-blue'
                        : 'bg-brand-dark text-white'
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
                <td className="px-6 py-4 text-sm text-brand-grey">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {lead.status === 'pending' && (
                      <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-grey transition hover:bg-brand-grey/10 hover:text-brand-blue">
                        {t(labels.markContacted)}
                      </button>
                    )}
                    {lead.status === 'contacted' && (
                      <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:bg-brand-blue/10 hover:text-brand-dark">
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
          <div className="p-12 text-center text-brand-grey">{t(labels.noLeads)}</div>
        )}
      </div>
    </div>
  );
}
