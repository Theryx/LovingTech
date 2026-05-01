'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { PromoCode } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

const EMPTY_FORM: Omit<PromoCode, 'id' | 'uses_count' | 'created_at'> = {
  code: '',
  type: 'percent',
  value: 0,
  min_order_amount: 0,
  max_uses: null,
  expires_at: null,
  is_active: true,
}

export default function AdminPromosPage() {
  const { t } = useLanguage()
  const { confirm, error: notifyError, success } = useNotifications()
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/promo-codes')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setPromos(data)
    } catch (err) {
      console.error('Failed to load promos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.code.trim()) {
      setFormError('Code requis / Code required')
      return
    }
    if (form.value <= 0) {
      setFormError('Valeur invalide / Invalid value')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create')
      }
      const created = await res.json()
      setPromos(prev => [created, ...prev])
      setShowForm(false)
      setForm({ ...EMPTY_FORM })
      success(t({ en: 'Promo code created.', fr: 'Code promo créé.' }))
    } catch {
      setFormError(t({ en: 'Failed to create promo code.', fr: 'Échec de création du code promo.' }))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (promo: PromoCode) => {
    try {
      await fetch(`/api/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !promo.is_active }),
      })
      setPromos(prev => prev.map(p => (p.id === promo.id ? { ...p, is_active: !p.is_active } : p)))
      success(
        t({
          en: promo.is_active ? 'Promo code disabled.' : 'Promo code activated.',
          fr: promo.is_active ? 'Code promo désactivé.' : 'Code promo activé.',
        })
      )
    } catch (err: any) {
      notifyError(
        err?.message ||
          t({ en: 'Failed to update promo code.', fr: 'Échec de mise à jour du code promo.' })
      )
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: t({ en: 'Delete this promo code?', fr: 'Supprimer ce code promo ?' }),
      message: t({ en: 'This action cannot be undone.', fr: 'Cette action est définitive.' }),
      confirmLabel: t({ en: 'Delete', fr: 'Supprimer' }),
      cancelLabel: t({ en: 'Cancel', fr: 'Annuler' }),
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' })
      setPromos(prev => prev.filter(p => p.id !== id))
      success(t({ en: 'Promo code deleted.', fr: 'Code promo supprimé.' }))
    } catch (err: any) {
      notifyError(
        err?.message ||
          t({ en: 'Failed to delete promo code.', fr: 'Échec de suppression du code promo.' })
      )
    }
  }

  const inputCls =
    'w-full rounded-xl border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          {t({ en: 'Promo Codes', fr: 'Codes Promo' })}
        </h1>
        <button
          onClick={() => {
            setShowForm(true)
            setFormError('')
            setForm({ ...EMPTY_FORM })
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t({ en: 'Create code', fr: 'Créer un code' })}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-2xl border border-brand-grey/20 bg-white p-6 space-y-4"
        >
          <h2 className="font-semibold text-brand-dark">
            {t({ en: 'New Promo Code', fr: 'Nouveau code promo' })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">
                {t({ en: 'Type', fr: 'Type' })} *
              </label>
              <select
                value={form.type}
                onChange={e =>
                  setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))
                }
                className={inputCls}
              >
                <option value="percent">
                  {t({ en: 'Percentage (%)', fr: 'Pourcentage (%)' })}
                </option>
                <option value="fixed">
                  {t({ en: 'Fixed amount (FCFA)', fr: 'Montant fixe (FCFA)' })}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">
                {t({ en: 'Value', fr: 'Valeur' })} *
              </label>
              <input
                type="number"
                min={1}
                value={form.value || ''}
                onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                placeholder={form.type === 'percent' ? '20' : '5000'}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">
                {t({ en: 'Min. order (FCFA)', fr: 'Commande min. (FCFA)' })}
              </label>
              <input
                type="number"
                min={0}
                value={form.min_order_amount || ''}
                onChange={e => setForm(f => ({ ...f, min_order_amount: Number(e.target.value) }))}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">
                {t({
                  en: 'Max uses (blank = unlimited)',
                  fr: 'Max utilisations (vide = illimité)',
                })}
              </label>
              <input
                type="number"
                min={1}
                value={form.max_uses ?? ''}
                onChange={e =>
                  setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : null }))
                }
                placeholder={t({ en: 'Unlimited', fr: 'Illimité' })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark/60 mb-1">
                {t({ en: 'Expiry date (optional)', fr: "Date d'expiration (optionnel)" })}
              </label>
              <input
                type="datetime-local"
                value={form.expires_at ?? ''}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value || null }))}
                className={inputCls}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            >
              {saving ? t({ en: 'Creating…', fr: 'Création…' }) : t({ en: 'Create', fr: 'Créer' })}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-brand-grey/30 px-5 py-2.5 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition"
            >
              {t({ en: 'Cancel', fr: 'Annuler' })}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-20 text-center text-brand-dark/40">
          {t({ en: 'Loading…', fr: 'Chargement…' })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-brand-grey/20">
                {[
                  'Code',
                  t({ en: 'Type', fr: 'Type' }),
                  t({ en: 'Value', fr: 'Valeur' }),
                  t({ en: 'Uses', fr: 'Utilisations' }),
                  t({ en: 'Expires', fr: 'Expire' }),
                  t({ en: 'Status', fr: 'Statut' }),
                  '',
                ].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr
                  key={p.id}
                  className="border-b border-brand-grey/10 hover:bg-brand-grey/5 transition"
                >
                  <td className="px-5 py-4 font-mono text-sm font-bold text-brand-dark">
                    {p.code}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-dark/60">
                    {p.type === 'percent' ? '%' : 'FCFA fixe'}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-dark">
                    {p.type === 'percent'
                      ? `${p.value}%`
                      : `${p.value.toLocaleString('fr-FR')} FCFA`}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-dark/60">
                    {p.uses_count}
                    {p.max_uses !== null ? `/${p.max_uses}` : ''}
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-dark/40">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-brand-grey/20 text-brand-dark/40'}`}
                    >
                      {p.is_active
                        ? t({ en: 'Active', fr: 'Actif' })
                        : t({ en: 'Inactive', fr: 'Inactif' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(p)}
                        aria-label={p.is_active ? 'Désactiver' : 'Activer'}
                        className="text-brand-dark/40 hover:text-brand-blue transition"
                      >
                        {p.is_active ? (
                          <ToggleRight className="w-5 h-5 text-brand-blue" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id!)}
                        aria-label="Supprimer"
                        className="text-brand-dark/40 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {promos.length === 0 && (
            <p className="py-12 text-center text-brand-dark/40">
              {t({ en: 'No promo codes yet', fr: 'Aucun code promo' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
