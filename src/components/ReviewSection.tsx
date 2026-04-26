'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Review, reviewService } from '@/lib/supabase';

interface ReviewSectionProps {
  productId: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Note / Rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          className={`transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`h-5 w-5 ${(hovered || value) >= star ? 'fill-brand-orange text-brand-orange' : 'text-brand-grey'}`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    reviewService.getByProduct(productId).then(setReviews).catch(() => {});
  }, [productId]);

  const avg = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (rating === 0) { setFormError('Veuillez sélectionner une note / Please select a rating.'); return; }
    if (name.trim().length < 2) { setFormError('Nom requis / Name required.'); return; }
    if (!orderRef.trim()) { setFormError('Référence de commande requise / Order reference required.'); return; }
    setSubmitting(true);
    try {
      await reviewService.create({ product_id: productId, order_ref: orderRef.trim().toUpperCase(), rating, reviewer_name: name.trim(), comment: comment.trim() || undefined });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || err?.details || JSON.stringify(err);
      setFormError(`Erreur: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition';

  return (
    <section aria-label="Avis / Reviews">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">
            Avis / Reviews
            <span className="ml-2 text-sm font-normal text-brand-dark/40">
              ({reviews.length} {reviews.length === 1 ? 'avis' : 'avis'})
            </span>
          </h2>
          {avg > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avg)} />
              <span className="text-sm font-semibold text-brand-dark">{avg}/5</span>
            </div>
          )}
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl border border-brand-blue px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            Laisser un avis / Leave a review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-brand-grey/20 bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              Référence de commande / Order reference *
            </label>
            <input type="text" value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="LT-20260101-1234" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              Votre nom / Your name *
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              Note / Rating *
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              Commentaire / Comment (optionnel)
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Votre avis sur ce produit…" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
              {submitting ? 'Envoi…' : 'Envoyer / Submit'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-brand-grey/30 px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10">
              Annuler / Cancel
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
          ✅ Votre avis est en attente de validation. / Your review is awaiting approval.
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-brand-dark/40">
          Soyez le premier à laisser un avis! / Be the first to leave a review!
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map(r => (
            <div key={r.id} className="rounded-2xl border border-brand-grey/20 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{r.reviewer_name}</p>
                  <StarRating value={r.rating} />
                </div>
                <span className="text-xs text-brand-dark/40 shrink-0">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : ''}
                </span>
              </div>
              {r.comment && <p className="mt-3 text-sm text-brand-dark/70">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
