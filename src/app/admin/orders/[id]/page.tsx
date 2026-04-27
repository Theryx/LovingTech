'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/components/NotificationProvider';
import { Order, OrderStatus, orderService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_FLOW: { status: OrderStatus; labelFr: string; labelEn: string; color: string }[] = [
  { status: 'confirmed',  labelFr: 'Confirmer',       labelEn: 'Confirm',     color: 'bg-brand-blue' },
  { status: 'dispatched', labelFr: 'Marquer expédié', labelEn: 'Mark Shipped', color: 'bg-brand-orange' },
  { status: 'delivered',  labelFr: 'Marquer livré',   labelEn: 'Mark Delivered', color: 'bg-green-600' },
  { status: 'cancelled',  labelFr: 'Annuler',         labelEn: 'Cancel',      color: 'bg-red-500' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  dispatched:'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-brand-blue/10 text-brand-blue',
  dispatched:'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { t } = useLanguage();
  const { confirm, error: notifyError, success } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const data = await orderService.getById(params.id as string);
    if (data) { setOrder(data); setNotes(data.admin_notes || ''); }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;
    const action = STATUS_FLOW.find(s => s.status === status);
    const label = t({ en: action?.labelEn || status, fr: action?.labelFr || status });
    const confirmed = await confirm({
      title: t({ en: `${label} this order?`, fr: `${label} cette commande ?` }),
      confirmLabel: label,
      cancelLabel: t({ en: 'Cancel', fr: 'Annuler' }),
      tone: status === 'cancelled' ? 'danger' : 'default',
    });
    if (!confirmed) return;
    setUpdating(true);
    try {
      await orderService.updateStatus(order.id!, status);
      await load();
      success(t({ en: 'Order status updated.', fr: 'Statut de la commande mis à jour.' }));
    } catch (err: any) {
      notifyError(err?.message || t({ en: 'Failed to update order status.', fr: 'Échec de mise à jour du statut.' }));
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    setSavingNotes(true);
    try {
      await orderService.updateNotes(order.id!, notes);
      success(t({ en: 'Notes saved.', fr: 'Notes enregistrées.' }));
    } catch (err: any) {
      notifyError(err?.message || t({ en: 'Failed to save notes.', fr: "Échec de l'enregistrement des notes." }));
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-brand-dark/40">Chargement…</div>;
  if (!order) return <div className="py-20 text-center text-brand-dark/40">Commande introuvable.</div>;

  const whatsappLink = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customer_name}, concernant votre commande ${order.order_ref}…`)}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="p-2 text-brand-grey hover:text-brand-blue transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark font-mono">{order.order_ref}</h1>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${STATUS_COLOR[order.status || 'pending']}`}>
            {STATUS_LABEL[order.status || 'pending']}
          </span>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-2 rounded-lg bg-brand-dark text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark/90 transition"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          {t({ en: 'Contact customer', fr: 'Contacter le client' })}
        </a>
      </div>

      <div className="space-y-6">
        {/* Customer */}
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">{t({ en: 'Customer', fr: 'Client' })}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-brand-dark/40 mb-0.5">{t({ en: 'Name', fr: 'Nom' })}</p><p className="font-medium text-brand-dark">{order.customer_name}</p></div>
            <div><p className="text-brand-dark/40 mb-0.5">WhatsApp</p><p className="font-medium text-brand-dark">{order.customer_phone}</p></div>
          </div>
        </section>

        {/* Order */}
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">{t({ en: 'Order', fr: 'Commande' })}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-brand-dark/60">{t({ en: 'Product', fr: 'Produit' })}</span><span className="font-medium text-brand-dark">{order.product_name}</span></div>
            {order.variant_chosen && <div className="flex justify-between"><span className="text-brand-dark/60">Variante</span><span className="font-medium text-brand-dark">{order.variant_chosen}</span></div>}
            <div className="flex justify-between"><span className="text-brand-dark/60">{t({ en: 'Qty', fr: 'Qté' })}</span><span className="font-medium text-brand-dark">{order.quantity}</span></div>
            <div className="flex justify-between"><span className="text-brand-dark/60">{t({ en: 'Unit price', fr: 'Prix unitaire' })}</span><span className="font-medium text-brand-dark">{order.unit_price.toLocaleString('fr-FR')} FCFA</span></div>
            <div className="flex justify-between border-t border-brand-grey/20 pt-2"><span className="text-brand-dark/60">{t({ en: 'Delivery', fr: 'Livraison' })}</span><span className="font-medium text-brand-dark">{order.delivery_fee === 0 ? t({ en: 'Free', fr: 'Gratuite' }) : `${order.delivery_fee.toLocaleString('fr-FR')} FCFA`}</span></div>
            {order.promo_discount ? <div className="flex justify-between"><span className="text-brand-dark/60">Promo ({order.promo_code})</span><span className="font-medium text-green-700">-{order.promo_discount.toLocaleString('fr-FR')} FCFA</span></div> : null}
            <div className="flex justify-between border-t border-brand-grey/20 pt-2 font-bold"><span className="text-brand-dark">Total</span><span className="text-brand-blue">{order.total_price.toLocaleString('fr-FR')} FCFA</span></div>
          </div>
        </section>

        {/* Delivery */}
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">{t({ en: 'Delivery', fr: 'Livraison' })}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-brand-dark/40 mb-0.5">{t({ en: 'City', fr: 'Ville' })}</p><p className="font-medium text-brand-dark">{order.city}</p></div>
            <div><p className="text-brand-dark/40 mb-0.5">{t({ en: 'Neighbourhood', fr: 'Quartier' })}</p><p className="font-medium text-brand-dark">{order.quartier}</p></div>
            {order.bus_agency && <div><p className="text-brand-dark/40 mb-0.5">{t({ en: 'Agency', fr: 'Agence' })}</p><p className="font-medium text-brand-dark">{order.bus_agency}</p></div>}
            {order.address_details && <div className="col-span-2"><p className="text-brand-dark/40 mb-0.5">Détails</p><p className="font-medium text-brand-dark">{order.address_details}</p></div>}
          </div>
        </section>

        {/* Status update */}
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">{t({ en: 'Update Status', fr: 'Mettre à jour le statut' })}</h2>
          <div className="flex flex-wrap gap-3">
            {STATUS_FLOW.filter(s => s.status !== order.status).map(s => (
              <button
                key={s.status}
                onClick={() => handleStatusUpdate(s.status)}
                disabled={updating}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${s.color}`}
              >
                {t({ en: s.labelEn, fr: s.labelFr })}
              </button>
            ))}
          </div>
        </section>

        {/* Status timeline */}
        {order.status_history && order.status_history.length > 0 && (
          <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">Timeline</h2>
            <div className="space-y-3">
              {[...order.status_history].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium text-brand-dark capitalize">{STATUS_LABEL[h.status] || h.status}</span>
                    <span className="text-brand-dark/40 ml-2">{new Date(h.at).toLocaleString('fr-FR')}</span>
                    {h.note && <p className="text-brand-dark/60 mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Admin notes */}
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">{t({ en: 'Admin Notes', fr: 'Notes admin' })}</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            rows={3}
            placeholder={t({ en: 'Internal notes…', fr: 'Notes internes…' })}
            className="w-full resize-none rounded-lg border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <button onClick={handleSaveNotes} disabled={savingNotes} className="mt-2 text-xs text-brand-blue hover:underline disabled:opacity-40">
            {savingNotes ? t({ en: 'Saving…', fr: 'Enregistrement…' }) : t({ en: 'Save notes', fr: 'Enregistrer les notes' })}
          </button>
        </section>
      </div>
    </div>
  );
}
