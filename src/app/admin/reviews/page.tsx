'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { Review, ReviewStatus, reviewService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_STYLE: Record<ReviewStatus, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'En attente' },
  approved: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Approuvé' },
  rejected: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejeté' },
};

type FilterValue = ReviewStatus | '';

export default function AdminReviewsPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await reviewService.getAll();
      setReviews(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: ReviewStatus) => {
    setUpdating(id);
    await reviewService.updateStatus(id, status);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  };

  const filtered = filter ? reviews.filter(r => r.status === filter) : reviews;

  const FILTERS: { value: FilterValue; label: string }[] = [
    { value: '', label: t({ en: 'All', fr: 'Tous' }) },
    { value: 'pending', label: t({ en: 'Pending', fr: 'En attente' }) },
    { value: 'approved', label: t({ en: 'Approved', fr: 'Approuvés' }) },
    { value: 'rejected', label: t({ en: 'Rejected', fr: 'Rejetés' }) },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">{t({ en: 'Reviews', fr: 'Avis' })}</h1>
        <span className="text-sm text-brand-dark/40">
          {reviews.filter(r => r.status === 'pending').length} {t({ en: 'pending', fr: 'en attente' })}
        </span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
              filter === f.value ? 'bg-brand-blue text-white' : 'bg-brand-grey/20 text-brand-dark hover:bg-brand-grey/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-brand-dark/40">{t({ en: 'Loading…', fr: 'Chargement…' })}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => {
            const style = STATUS_STYLE[r.status || 'pending'];
            return (
              <div key={r.id} className="rounded-xl border border-brand-grey/20 bg-white p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-semibold text-brand-dark">{r.reviewer_name}</span>
                      <span className="font-mono text-xs text-brand-dark/40">{r.order_ref}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>{style.label}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-brand-orange text-brand-orange' : 'text-brand-grey'}`} aria-hidden="true" />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-brand-dark/70">{r.comment}</p>}
                    <p className="text-xs text-brand-dark/30 mt-2">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : ''}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleStatus(r.id!, 'approved')}
                        disabled={updating === r.id}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        {t({ en: 'Approve', fr: 'Approuver' })}
                      </button>
                      <button
                        onClick={() => handleStatus(r.id!, 'rejected')}
                        disabled={updating === r.id}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        {t({ en: 'Reject', fr: 'Rejeter' })}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-brand-dark/40">{t({ en: 'No reviews found', fr: 'Aucun avis trouvé' })}</p>
          )}
        </div>
      )}
    </div>
  );
}
