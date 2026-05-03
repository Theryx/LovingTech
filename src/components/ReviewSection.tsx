'use client'

import { useState, useEffect } from 'react'
import { Star, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { Review, reviewService } from '@/lib/supabase'

interface ReviewSectionProps {
  productId: string
  onApprovedCountChange?: (count: number) => void
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1" role="group" aria-label={t({ en: 'Rating', fr: 'Note' })}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          aria-label={t({
            en: `${star} star${star > 1 ? 's' : ''}`,
            fr: `${star} étoile${star > 1 ? 's' : ''}`,
          })}
          className={`transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`h-5 w-5 ${(hovered || value) >= star ? 'fill-brand-orange text-brand-orange' : 'text-brand-grey'}`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}

const REVIEWS_PER_PAGE = 5

export default function ReviewSection({ productId, onApprovedCountChange }: ReviewSectionProps) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    reviewService
      .getByProduct(productId)
      .then(data => {
        setReviews(data)
        // Count only approved reviews
        const approvedCount = data.filter(r => r.status === 'approved').length
        onApprovedCountChange?.(approvedCount)
      })
      .catch(() => {})
  }, [productId, onApprovedCountChange])

  // Filter to show only approved reviews
  const approvedReviews = reviews.filter(r => r.status === 'approved')
  
  const avg =
    approvedReviews.length > 0
      ? Math.round((approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length) * 10) / 10
      : 0

  // Pagination logic
  const totalPages = Math.ceil(approvedReviews.length / REVIEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
  const paginatedReviews = approvedReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (rating === 0) {
      setFormError(t({ en: 'Please select a rating.', fr: 'Veuillez sélectionner une note.' }))
      return
    }
    if (name.trim().length < 2) {
      setFormError(t({ en: 'Name required.', fr: 'Nom requis.' }))
      return
    }
    if (!orderRef.trim()) {
      setFormError(t({ en: 'Order reference required.', fr: 'Référence de commande requise.' }))
      return
    }
    setSubmitting(true)
    try {
      await reviewService.create({
        product_id: productId,
        order_ref: orderRef.trim().toUpperCase(),
        rating,
        reviewer_name: name.trim(),
        comment: comment.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err: any) {
      const msg = err?.message || err?.details || JSON.stringify(err)
      setFormError(`${t({ en: 'Error', fr: 'Erreur' })}: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition'

  return (
    <section aria-label={t({ en: 'Reviews', fr: 'Avis' })}>
      {/* Header with average rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">
            {t({ en: 'Reviews', fr: 'Avis' })}
            <span className="ml-2 text-sm font-normal text-brand-dark/40">
              ({approvedReviews.length} {t({ en: 'reviews', fr: 'avis' })})
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
            {t({ en: 'Leave a review', fr: 'Laisser un avis' })}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && !submitted && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-brand-grey/20 bg-white p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              {t({ en: 'Order reference', fr: 'Référence de commande' })} *
            </label>
            <input
              type="text"
              value={orderRef}
              onChange={e => setOrderRef(e.target.value)}
              placeholder="LT-20260101-1234"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              {t({ en: 'Your name', fr: 'Votre nom' })} *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jean Dupont"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              {t({ en: 'Rating', fr: 'Note' })} *
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark/60 mb-1.5">
              {t({ en: 'Comment (optional)', fr: 'Commentaire (optionnel)' })}
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder={t({
                en: 'Your opinion on this product...',
                fr: 'Votre avis sur ce produit...',
              })}
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              {submitting
                ? t({ en: 'Sending...', fr: 'Envoi...' })
                : t({ en: 'Submit', fr: 'Envoyer' })}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-brand-grey/30 px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10"
            >
              {t({ en: 'Cancel', fr: 'Annuler' })}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
          ✅{' '}
          {t({
            en: 'Your review is awaiting approval.',
            fr: 'Votre avis est en attente de validation.',
          })}
        </div>
      )}

      {/* Reviews list */}
      {approvedReviews.length === 0 ? (
        <p className="text-sm text-brand-dark/40">
          {t({ en: 'Be the first to leave a review!', fr: 'Soyez le premier à laisser un avis!' })}
        </p>
      ) : (
        <>
          <div className="space-y-5">
            {paginatedReviews.map(r => (
              <div key={r.id} className="rounded-2xl border border-brand-grey/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-brand-dark text-sm">{r.reviewer_name}</p>
                      {/* Verified Purchase Badge */}
                      {r.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <Check className="h-3 w-3" />
                          {t({ en: 'Verified Purchase', fr: 'Achat vérifié' })}
                        </span>
                      )}
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  <span className="text-xs text-brand-dark/40 shrink-0">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString(t({ en: 'en-US', fr: 'fr-FR' }))
                      : ''}
                  </span>
                </div>
                {r.comment && <p className="mt-3 text-sm text-brand-dark/70">{r.comment}</p>}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-brand-grey/20 pt-6">
              <p className="text-sm text-brand-dark/60">
                {t({ en: 'Showing', fr: 'Affichage' })}{' '}
                {startIndex + 1}-{Math.min(startIndex + REVIEWS_PER_PAGE, approvedReviews.length)}{' '}
                {t({ en: 'of', fr: 'sur' })} {approvedReviews.length}{' '}
                {t({ en: 'reviews', fr: 'avis' })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-brand-grey/30 px-3 py-2 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t({ en: 'Previous', fr: 'Précédent' })}
                </button>
                <span className="text-sm text-brand-dark/60 px-2">
                  {t({ en: 'Page', fr: 'Page' })} {currentPage} {t({ en: 'of', fr: 'sur' })} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-brand-grey/30 px-3 py-2 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t({ en: 'Next', fr: 'Suivant' })}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
