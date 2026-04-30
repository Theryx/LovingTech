'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, MapPin, User, ArrowRight, ArrowLeft, CheckCircle2, Tag } from 'lucide-react'
import { Product } from '@/lib/supabase'
import { generateOrderRef } from '@/lib/generateOrderRef'
import { validatePromo } from '@/lib/validatePromo'
import { useNotifications } from '@/components/NotificationProvider'
import { useLanguage } from '@/context/LanguageContext'

interface LeadModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

const FREE_DELIVERY_THRESHOLD_DEFAULT = 50000

type ZoneOption = {
  id: string
  city_name_fr: string
  city_name_en: string
  delivery_fee: number
  estimated_days: string
  agencies: string[]
}

const normalizeCity = (value: string) => value.trim().toLowerCase()

export default function LeadModal({ product, isOpen, onClose }: LeadModalProps) {
  const { t, language } = useLanguage()
  const { error: notifyError } = useNotifications()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1 — Contact
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  // Step 2 — Delivery
  const [zones, setZones] = useState<ZoneOption[]>([])
  const [freeThreshold, setFreeThreshold] = useState(FREE_DELIVERY_THRESHOLD_DEFAULT)
  const [city, setCity] = useState('Douala')
  const [agency, setAgency] = useState('')
  const [customAgency, setCustomAgency] = useState('')
  const [quartier, setQuartier] = useState('')
  const [addressDetails, setAddressDetails] = useState('')

  // Promo code state
  const [promoInput, setPromoInput] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const normalizedCity = normalizeCity(city)
  const subtotal = product.price_xaf * quantity
  const selectedZone =
    zones.find(
      z =>
        normalizeCity(z.city_name_fr) === normalizedCity ||
        normalizeCity(z.city_name_en) === normalizedCity
    ) || null
  const zoneFee = selectedZone?.delivery_fee ?? (normalizedCity === 'douala' ? 2000 : 3000)
  const deliveryFee = subtotal >= freeThreshold ? 0 : zoneFee
  const effectiveAgency = agency === '__custom__' ? customAgency : agency
  const total = subtotal + deliveryFee - promoDiscount

  useEffect(() => {
    fetch('/api/delivery-zones')
      .then(r => r.json())
      .then((data: ZoneOption[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setZones(data)
          setCity(data[0].city_name_fr)
        }
      })
      .catch(() => {
        // fallback to hardcoded Douala
        setCity('Douala')
      })
    fetch('/api/delivery-settings')
      .then(r => r.json())
      .then(d => {
        if (d?.free_delivery_threshold) setFreeThreshold(d.free_delivery_threshold)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setQuantity(1)
      setPromoInput('')
      setPromoDiscount(0)
      setPromoCode('')
      setPromoMessage('')
      setPromoError('')
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoMessage('')
    setPromoError('')
    const result = await validatePromo(promoInput.trim(), subtotal, deliveryFee)
    if (result.valid) {
      setPromoDiscount(result.discount)
      setPromoCode(promoInput.trim().toUpperCase())
      setPromoMessage(result.message)
    } else {
      setPromoDiscount(0)
      setPromoCode('')
      setPromoError(result.error)
    }
    setPromoLoading(false)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const isDouala = normalizedCity === 'douala'
  const zoneAgencies = selectedZone?.agencies || []
  const agencyValue = agency === '__custom__' ? customAgency : agency

  const step1Valid = name.trim().length >= 2 && phone.trim().length >= 8
  const step2Valid = isDouala
    ? city.length > 0 && quartier.trim().length >= 2
    : city.length > 0 && agencyValue.trim().length >= 2

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const orderRef = generateOrderRef()
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ref: orderRef,
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price_xaf,
          total_price: total,
          customer_name: name,
          customer_phone: `+237${phone.replace(/^(\+237|237)/, '')}`,
          city,
          bus_agency: effectiveAgency || undefined,
          quartier,
          address_details: addressDetails || undefined,
          delivery_fee: deliveryFee,
          promo_code: promoCode || undefined,
          promo_discount: promoDiscount || undefined,
          status: 'pending',
          status_history: [{ status: 'pending', at: new Date().toISOString() }],
        }),
      })
      if (!res.ok) throw new Error(await res.text())

      const msg = encodeURIComponent(
        `Bonjour Loving Tech! 👋\n\n` +
          `🛍️ Nouvelle commande — ${orderRef}\n` +
          `Produit: ${product.name}\n` +
          `Quantité: 1\n\n` +
          `👤 Client: ${name}\n` +
          `📱 WhatsApp: +237${phone.replace(/^(\+237|237)/, '')}\n\n` +
          `📦 Livraison:\n` +
          `Ville: ${city}\n` +
          (effectiveAgency ? `Agence: ${effectiveAgency}\n` : '') +
          `Quartier: ${quartier}\n` +
          (addressDetails ? `Détails: ${addressDetails}\n` : '') +
          `\n💰 Sous-total: ${subtotal.toLocaleString('fr-FR')} FCFA\n` +
          `🚚 Livraison: ${deliveryFee === 0 ? 'GRATUITE' : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}\n` +
          (promoDiscount > 0
            ? `🎟️ Promo (${promoCode}): -${promoDiscount.toLocaleString('fr-FR')} FCFA\n`
            : '') +
          `✅ Total: ${total.toLocaleString('fr-FR')} FCFA\n\n` +
          `Merci!`
      )

      const whatsappMessage = encodeURIComponent(
        `Bonjour Loving Tech!\n\n` +
          `Nouvelle commande - ${orderRef}\n` +
          `Produit: ${product.name}\n` +
          `Quantite: ${quantity}\n\n` +
          `Client: ${name}\n` +
          `WhatsApp: +237${phone.replace(/^(\+237|237)/, '')}\n\n` +
          `Livraison:\n` +
          `Ville: ${city}\n` +
          (!isDouala && effectiveAgency ? `Agence: ${effectiveAgency}\n` : '') +
          (isDouala ? `Quartier: ${quartier}\n` : '') +
          (addressDetails ? `Details: ${addressDetails}\n` : '') +
          `\nSous-total: ${subtotal.toLocaleString('fr-FR')} FCFA\n` +
          `Livraison: ${deliveryFee === 0 ? 'GRATUITE' : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}\n` +
          (promoDiscount > 0
            ? `Promo (${promoCode}): -${promoDiscount.toLocaleString('fr-FR')} FCFA\n`
            : '') +
          `Total: ${total.toLocaleString('fr-FR')} FCFA\n\n` +
          `Merci!`
      )

      window.open(`https://wa.me/237655163248?text=${whatsappMessage}`, '_blank')
      onClose()
    } catch (err) {
      console.error('Order creation failed:', err)
      notifyError(
        t({
          en: 'Something went wrong. Please try again.',
          fr: "Une erreur s'est produite. Veuillez réessayer.",
        })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls =
    'w-full bg-brand-grey/10 border border-brand-grey/30 rounded-xl py-3 pl-11 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition'
  const inputNoPrefixCls =
    'w-full bg-brand-grey/10 border border-brand-grey/30 rounded-xl py-3 px-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition'

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-brand-grey/20 flex items-center justify-between">
              <div>
                <h2 id="order-modal-title" className="text-lg font-bold text-brand-dark">
                  {t({ en: 'Complete Your Order', fr: 'Finaliser votre commande' })}
                </h2>
                <p className="text-xs text-brand-dark/40 mt-0.5">{product.name}</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={t({ en: 'Close', fr: 'Fermer' })}
                className="p-2 rounded-full text-brand-dark/40 hover:bg-brand-grey/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-4 flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      step > s
                        ? 'bg-brand-blue text-white'
                        : step === s
                          ? 'bg-brand-blue text-white'
                          : 'bg-brand-grey/30 text-brand-dark/40'
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${step === s ? 'text-brand-dark font-medium' : 'text-brand-dark/40'}`}
                  >
                    {s === 1
                      ? t({ en: 'Contact', fr: 'Contact' })
                      : s === 2
                        ? t({ en: 'Delivery', fr: 'Livraison' })
                        : t({ en: 'Summary', fr: 'Résumé' })}
                  </span>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-px ${step > s ? 'bg-brand-blue' : 'bg-brand-grey/30'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="px-6 py-5 space-y-4">
              {/* Step 1 — Contact */}
              {step === 1 && (
                <>
                  <div>
                    <label
                      htmlFor="order-name"
                      className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                    >
                      {t({ en: 'Full Name', fr: 'Nom complet' })} *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey"
                        aria-hidden="true"
                      />
                      <input
                        id="order-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={inputCls}
                        placeholder="Jean Dupont"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="order-phone"
                      className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                    >
                      {t({ en: 'WhatsApp Number', fr: 'Numéro WhatsApp' })} *
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey"
                        aria-hidden="true"
                      />
                      <input
                        id="order-phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={inputCls}
                        placeholder="6 77 00 00 00"
                        autoComplete="tel"
                      />
                    </div>
                    <p className="text-xs text-brand-dark/40 mt-1">
                      +237{' '}
                      {t({
                        en: 'prefix added automatically',
                        fr: 'préfixe ajouté automatiquement',
                      })}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="order-quantity"
                      className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                    >
                      {t({ en: 'Quantity', fr: 'Quantité' })} *
                    </label>
                    <input
                      id="order-quantity"
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={e =>
                        setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                      }
                      className={inputNoPrefixCls}
                    />
                  </div>
                </>
              )}

              {/* Step 2 — Delivery */}
              {step === 2 && (
                <>
                  <div>
                    <label
                      htmlFor="order-city"
                      className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                    >
                      {t({ en: 'City', fr: 'Ville' })} *
                    </label>
                    <select
                      id="order-city"
                      value={city}
                      onChange={e => {
                        setCity(e.target.value)
                        setAgency('')
                        setCustomAgency('')
                        setQuartier('')
                      }}
                      className={`${inputNoPrefixCls} cursor-pointer`}
                    >
                      {zones.length > 0
                        ? zones.map(z => (
                            <option key={z.id} value={z.city_name_fr}>
                              {z.city_name_fr}
                            </option>
                          ))
                        : [
                            'Douala',
                            'Yaoundé',
                            'Bafoussam',
                            'Bamenda',
                            'Garoua',
                            'Maroua',
                            'Ngaoundéré',
                            'Bertoua',
                            'Ebolowa',
                            'Kribi',
                          ].map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                    </select>
                    {selectedZone && (
                      <p className="text-xs mt-1 text-brand-dark/40">
                        {selectedZone.estimated_days}
                      </p>
                    )}
                    <p className="text-xs mt-1">
                      {deliveryFee === 0 ? (
                        <span className="text-green-700 font-medium">
                          ✅ {t({ en: 'Free delivery!', fr: 'Livraison gratuite!' })}
                        </span>
                      ) : (
                        <span className="text-brand-dark/50">
                          {t({ en: 'Delivery fee', fr: 'Frais de livraison' })}:{' '}
                          <strong>{deliveryFee.toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      )}
                    </p>
                  </div>
                  {isDouala ? (
                    <div>
                      <label
                        htmlFor="order-quartier"
                        className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                      >
                        {t({ en: 'Neighbourhood', fr: 'Quartier' })} *
                      </label>
                      <input
                        id="order-quartier"
                        type="text"
                        value={quartier}
                        onChange={e => setQuartier(e.target.value)}
                        className={inputNoPrefixCls}
                        placeholder={t({ en: 'e.g. Bonamoussadi', fr: 'ex. Bonamoussadi' })}
                      />
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="order-agency"
                        className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                      >
                        {t({ en: 'Bus Agency', fr: 'Agence de bus' })} *
                      </label>
                      {zoneAgencies.length > 0 ? (
                        <>
                          <select
                            id="order-agency"
                            value={agency}
                            onChange={e => {
                              setAgency(e.target.value)
                              setCustomAgency('')
                            }}
                            className={`${inputNoPrefixCls} cursor-pointer`}
                          >
                            <option value="">
                              {t({ en: '— Select an agency —', fr: '— Choisir une agence —' })}
                            </option>
                            {zoneAgencies.map(ag => (
                              <option key={ag} value={ag}>
                                {ag}
                              </option>
                            ))}
                            <option value="__custom__">
                              {t({ en: 'Other agency…', fr: 'Autre agence…' })}
                            </option>
                          </select>
                          {agency === '__custom__' && (
                            <input
                              type="text"
                              value={customAgency}
                              onChange={e => setCustomAgency(e.target.value)}
                              className={`${inputNoPrefixCls} mt-2`}
                              placeholder={t({ en: 'Agency name', fr: "Nom de l'agence" })}
                            />
                          )}
                        </>
                      ) : (
                        <div className="relative">
                          <MapPin
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey"
                            aria-hidden="true"
                          />
                          <input
                            id="order-agency"
                            type="text"
                            value={agency}
                            onChange={e => setAgency(e.target.value)}
                            className={inputCls}
                            placeholder={t({
                              en: 'e.g. Vatican Express, Buca Voyages',
                              fr: 'ex. Vatican Express, Buca Voyages',
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="order-details"
                      className="block text-sm font-medium text-brand-dark/60 mb-1.5"
                    >
                      {t({ en: 'Delivery Instructions', fr: 'Instructions de livraison' })} (
                      {t({ en: 'optional', fr: 'optionnel' })})
                    </label>
                    <textarea
                      id="order-details"
                      value={addressDetails}
                      onChange={e => setAddressDetails(e.target.value)}
                      rows={2}
                      className={`${inputNoPrefixCls} resize-none`}
                      placeholder={t({
                        en: 'Landmark, gate colour…',
                        fr: 'Repère, couleur du portail…',
                      })}
                    />
                  </div>
                </>
              )}

              {/* Step 3 — Summary */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-brand-grey/20 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">
                        {t({ en: 'Product', fr: 'Produit' })}
                      </span>
                      <span className="font-medium text-brand-dark text-right max-w-[60%] truncate">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">
                        {t({ en: 'Quantity', fr: 'Quantité' })}
                      </span>
                      <span className="font-medium text-brand-dark">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">
                        {t({ en: 'Customer', fr: 'Client' })}
                      </span>
                      <span className="font-medium text-brand-dark">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">WhatsApp</span>
                      <span className="font-medium text-brand-dark">+237 {phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'City', fr: 'Ville' })}</span>
                      <span className="font-medium text-brand-dark">
                        {city}
                        {isDouala && quartier ? `, ${quartier}` : ''}
                      </span>
                    </div>
                    {!isDouala && effectiveAgency && (
                      <div className="flex justify-between">
                        <span className="text-brand-dark/60">
                          {t({ en: 'Agency', fr: 'Agence' })}
                        </span>
                        <span className="font-medium text-brand-dark">{effectiveAgency}</span>
                      </div>
                    )}
                  </div>
                  {/* Promo code */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                        placeholder={t({ en: 'Promo code', fr: 'Code promo' })}
                        className="w-full rounded-xl border border-brand-grey/30 py-2.5 pl-10 pr-3 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="rounded-xl border border-brand-blue px-4 py-2.5 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/5 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    >
                      {promoLoading ? '…' : t({ en: 'Apply', fr: 'Appliquer' })}
                    </button>
                  </div>
                  {promoMessage && <p className="text-xs text-green-700">{promoMessage}</p>}
                  {promoError && <p className="text-xs text-red-600">{promoError}</p>}

                  <div className="rounded-xl bg-brand-grey/10 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">
                        {t({ en: 'Subtotal', fr: 'Sous-total' })}
                      </span>
                      <span className="text-brand-dark">
                        {subtotal.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">
                        {t({ en: 'Delivery', fr: 'Livraison' })}
                      </span>
                      <span
                        className={
                          deliveryFee === 0 ? 'text-green-700 font-medium' : 'text-brand-dark'
                        }
                      >
                        {deliveryFee === 0
                          ? t({ en: 'FREE', fr: 'GRATUITE' })
                          : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}
                      </span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-dark/60">Promo ({promoCode})</span>
                        <span className="text-green-700 font-medium">
                          -{promoDiscount.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-brand-grey/20 pt-2 font-bold">
                      <span className="text-brand-dark">Total</span>
                      <span className="text-brand-blue text-base">
                        {total.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-dark/40 text-center">
                    {language === 'fr' ? (
                      <>
                        En commandant, vous acceptez nos{' '}
                        <a
                          href="/conditions"
                          target="_blank"
                          className="underline hover:text-brand-blue"
                        >
                          Conditions
                        </a>{' '}
                        et notre{' '}
                        <a
                          href="/politique-de-retour"
                          target="_blank"
                          className="underline hover:text-brand-blue"
                        >
                          Politique de retour
                        </a>
                        .
                      </>
                    ) : (
                      <>
                        By ordering you accept our{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          className="underline hover:text-brand-blue"
                        >
                          Terms
                        </a>{' '}
                        and{' '}
                        <a
                          href="/return-policy"
                          target="_blank"
                          className="underline hover:text-brand-blue"
                        >
                          Return Policy
                        </a>
                        .
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-6 flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-grey/30 px-4 py-3 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  {t({ en: 'Back', fr: 'Retour' })}
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:brightness-95 transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                >
                  {t({ en: 'Next', fr: 'Suivant' })}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3 text-sm font-bold text-white hover:bg-brand-dark/90 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      {t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
