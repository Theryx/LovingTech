'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingCart, MessageCircle, Calendar, Tag, Package, ArrowRight, ShieldCheck, HelpCircle, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useNotifications } from '@/components/NotificationProvider'
import Navbar from '@/components/Navbar'
import { validatePromo } from '@/lib/validatePromo'

const WHATSAPP_NUMBER = '237655163248'

function generateOrderRef(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `LT-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

interface DeliveryZone {
  city_name_fr: string
  city_name_en: string
  delivery_fee: number
  estimated_days: string
  agencies?: string[]
}

export default function CartPageClient() {
  const { t, language } = useLanguage()
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart()
  const { error: notifyError } = useNotifications()

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [quartier, setQuartier] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(50000)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const selectedZone = zones.find(z => z.city_name_fr === selectedCity || z.city_name_en === selectedCity)
  const deliveryFee = selectedZone && subtotal < freeDeliveryThreshold ? selectedZone.delivery_fee : 0
  const total = subtotal + deliveryFee - promoDiscount

  const validatePhone = () => {
    if (customerPhone.length !== 9) {
      setPhoneError(language === 'fr' ? 'Le numéro doit contenir 9 chiffres' : 'Phone number must be 9 digits')
      return false
    }
    setPhoneError('')
    return true
  }

  const isFormValid = customerName.trim() && customerPhone.trim() && selectedCity && (quartier.trim() || !selectedZone) && customerPhone.length === 9

  useEffect(() => {
    fetch('/api/delivery-zones')
      .then(r => r.json())
      .then(setZones)
      .catch(() => {})
    fetch('/api/delivery-settings')
      .then(r => r.json())
      .then(s => s?.free_delivery_threshold && setFreeDeliveryThreshold(s.free_delivery_threshold))
      .catch(() => {})
  }, [])

  const handlePromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo.')
      return
    }
    const result = await validatePromo(promoCode.trim(), subtotal, deliveryFee)
    if (result.valid) {
      setPromoDiscount(result.discount)
      setPromoMessage(result.message)
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoError(result.error)
      setPromoDiscount(0)
      setPromoApplied(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setPromoDiscount(0)
    setPromoMessage('')
    setPromoError('')
    setPromoApplied(false)
  }

  const generateWhatsAppMessage = (mode: 'delivery' | 'appointment', orderRef: string) => {
    const fn = (v: number) => v.toLocaleString('fr-FR')
    const itemsList = items.map((item, i) =>
      `${i + 1}. *${item.product.name}* — ${fn(item.product.price_xaf || 0)} FCFA${item.quantity > 1 ? ` (x${item.quantity})` : ''}`
    ).join('\n')

    if (mode === 'delivery') {
      return encodeURIComponent(
        `🛒 *Nouvelle commande — ${orderRef}*\n\n` +
        `*Articles:*\n${itemsList}\n\n` +
        `*Récapitulatif:*\n` +
        `Sous-total: ${fn(subtotal)} FCFA\n` +
        (deliveryFee > 0 ? `Livraison: ${fn(deliveryFee)} FCFA\n` : `Livraison: *Offerte* 🎉\n`) +
        (promoDiscount > 0 ? `Code promo ${promoCode.toUpperCase()}: -${fn(promoDiscount)} FCFA\n` : '') +
        `*TOTAL: ${fn(total)} FCFA*\n\n` +
        `👤 *Client:* ${customerName.trim()}\n` +
        `📱 *WhatsApp:* +237 ${customerPhone.trim()}\n` +
        `📍 *Ville:* ${selectedCity}\n` +
        (quartier.trim() ? `🏠 *Quartier/Agence:* ${quartier.trim()}\n` : '') +
        (selectedZone ? `⏱️ *Délai estimé:* ${selectedZone.estimated_days}\n` : '')
      )
    }

    return encodeURIComponent(
      `📅 *Demande de rendez-vous — ${orderRef}*\n\n` +
      `*Articles à consulter:*\n${itemsList}\n\n` +
      `💰 *Valeur totale:* ${fn(subtotal)} FCFA\n\n` +
      `👤 *Client:* ${customerName.trim()}\n` +
      `📱 *WhatsApp:* +237 ${customerPhone.trim()}\n` +
      `📍 *Ville:* ${selectedCity}\n` +
      (quartier.trim() ? `📍 *Quartier:* ${quartier.trim()}\n` : '') +
      `\n🕐 *Je souhaite prendre rendez-vous pour voir ces articles avant de décider.*`
    )
  }

  const handleCheckout = async (mode: 'delivery' | 'appointment') => {
    if (!validatePhone()) return
    if (!customerName.trim() || !selectedCity || (!quartier.trim() && selectedZone)) return
    setLoading(true)
    try {
      const orderRef = generateOrderRef()

      for (const item of items) {
        const orderBody = {
          order_ref: orderRef,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price_xaf || 0,
          total_price: (item.product.price_xaf || 0) * item.quantity,
          customer_name: customerName.trim(),
          customer_phone: `+237${customerPhone.trim()}`,
          city: selectedCity,
          quartier: quartier.trim() || '',
          bus_agency: selectedZone?.agencies?.length ? selectedZone.agencies[0] : '',
          delivery_fee: mode === 'delivery' ? deliveryFee : 0,
          promo_code: promoApplied ? promoCode.toUpperCase() : null,
          promo_discount: promoApplied ? promoDiscount : 0,
        }

        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderBody),
        })
      }

      const message = generateWhatsAppMessage(mode, orderRef)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
      clearCart()
      setOrderSuccess(true)
    } catch {
      notifyError(
        language === 'fr'
          ? 'Erreur lors de la commande. Veuillez réessayer.'
          : 'Order error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-white text-brand-dark">
        <Navbar />
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-3">
            {t({ en: 'Order sent successfully!', fr: 'Commande envoyée avec succès !' })}
          </h1>
          <p className="text-brand-dark/60 mb-3 max-w-md mx-auto">
            {t({
              en: 'Your order has been saved and sent to WhatsApp.',
              fr: 'Votre commande a été enregistrée et envoyée sur WhatsApp.',
            })}
          </p>
          <p className="text-brand-dark/40 text-sm mb-10 max-w-md mx-auto">
            {t({
              en: 'Our team will contact you shortly to confirm the details.',
              fr: 'Notre équipe vous contactera dans les plus brefs délais pour confirmer les détails.',
            })}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-8 py-3.5 text-base font-semibold text-white transition hover:brightness-95"
          >
            {t({ en: 'Browse products', fr: 'Voir les produits' })}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white text-brand-dark">
        <Navbar />
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
          <Package className="mx-auto mb-6 h-16 w-16 text-brand-grey/40" />
          <h1 className="text-3xl font-bold text-brand-dark mb-3">
            {t({ en: 'Your cart is empty', fr: 'Votre panier est vide' })}
          </h1>
          <p className="text-brand-dark/60 mb-8">
            {t({
              en: 'Browse our products and add what you like.',
              fr: 'Parcourez nos produits et ajoutez ce qui vous plaît.',
            })}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {t({ en: 'Browse products', fr: 'Voir les produits' })}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-brand-dark">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">
          {t({ en: 'Cart', fr: 'Panier' })} ({items.length > 1 ? `${items.length} articles` : `${items.length} article`})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* LEFT: Cart Items */}
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-xl border border-brand-grey/20 bg-white p-4"
              >
                <Link href={`/product/${item.product.id}`} className="shrink-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-brand-grey/10">
                    <Image
                      src={item.product.images?.[0] || '/images/placeholder.svg'}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/product/${item.product.id}`} className="hover:text-brand-blue transition-colors">
                      <h3 className="font-semibold text-brand-dark line-clamp-1">{item.product.name}</h3>
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-brand-dark/40 uppercase tracking-wider mt-0.5">
                        {item.product.brand}
                      </p>
                    )}
                    {item.product.stock_status === 'in_stock' ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-green-600">
                        <Check className="h-3 w-3" />
                        {t({ en: 'In Stock', fr: 'En stock' })}
                      </span>
                    ) : (
                      <span className="inline-flex mt-1 text-xs font-medium text-red-500">
                        {t({ en: 'Out of Stock', fr: 'Rupture de stock' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center rounded-lg border border-brand-grey/30">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(item.product.id)
                          else updateQuantity(item.product.id, item.quantity - 1)
                        }}
                        className="p-1.5 text-brand-dark/60 hover:text-brand-dark transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold text-brand-dark min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 text-brand-dark/60 hover:text-brand-dark transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-brand-dark">
                        {((item.product.price_xaf || 0) * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-brand-dark/30 hover:text-red-500 transition-colors rounded"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Summary & Checkout */}
          <div className="space-y-4">
            {/* Free delivery banner */}
            {subtotal < freeDeliveryThreshold && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                <span className="font-semibold">
                  {language === 'fr'
                    ? `Plus que ${(freeDeliveryThreshold - subtotal).toLocaleString('fr-FR')} FCFA pour la livraison offerte`
                    : `Only ${(freeDeliveryThreshold - subtotal).toLocaleString('fr-FR')} FCFA more for free delivery`}
                </span>
              </div>
            )}

            {subtotal >= freeDeliveryThreshold && deliveryFee === 0 && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                <span className="font-semibold">
                  {language === 'fr' ? 'Livraison offerte 🎉' : 'Free delivery 🎉'}
                </span>
              </div>
            )}

            {/* Summary Card */}
            <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-4">
                {t({ en: 'Summary', fr: 'Résumé' })}
              </h2>

              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      placeholder={t({ en: 'Promo code', fr: 'Code promo' })}
                      className="w-full rounded-lg border border-brand-grey/30 py-2.5 pl-9 pr-3 text-sm placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:bg-brand-grey/5"
                    />
                  </div>
                  {promoApplied ? (
                    <button
                      onClick={handleRemovePromo}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      {t({ en: 'Remove', fr: 'Retirer' })}
                    </button>
                  ) : (
                    <button
                      onClick={handlePromo}
                      className="rounded-lg bg-brand-dark px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark/80 transition-colors"
                    >
                      {t({ en: 'Apply', fr: 'Appliquer' })}
                    </button>
                  )}
                </div>
                {promoMessage && (
                  <p className="mt-1.5 text-xs text-green-600">{promoMessage}</p>
                )}
                {promoError && (
                  <p className="mt-1.5 text-xs text-red-500">{promoError}</p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm border-b border-brand-grey/20 pb-4 mb-4">
                <div className="flex justify-between text-brand-dark/60">
                  <span>{t({ en: 'Subtotal', fr: 'Sous-total' })} ({itemCount} articles)</span>
                  <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-brand-dark/60">
                  <span>{t({ en: 'Delivery', fr: 'Livraison' })}</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0
                      ? t({ en: 'Free', fr: 'Offerte' })
                      : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t({ en: 'Promo discount', fr: 'Réduction promo' })}</span>
                    <span>-{promoDiscount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-lg text-brand-dark mb-6">
                <span>{t({ en: 'Total', fr: 'Total' })}</span>
                <span>{total.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {/* Customer Details */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-brand-dark">
                  {t({ en: 'Your details', fr: 'Vos informations' })}
                </p>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={t({ en: 'Full name', fr: 'Nom complet' })}
                  className="w-full rounded-lg border border-brand-grey/30 py-2.5 px-3 text-sm placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
                <div className="flex rounded-lg border border-brand-grey/30 overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue">
                  <span className="flex items-center bg-brand-grey/10 px-3 text-sm text-brand-dark/60 font-medium">
                    +237
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => {
                      setCustomerPhone(e.target.value.replace(/\D/g, ''))
                      setPhoneError('')
                    }}
                    placeholder="6XX XXX XXX"
                    maxLength={9}
                    className="flex-1 py-2.5 px-3 text-sm placeholder:text-brand-dark/30 focus:outline-none"
                    required
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500 -mt-2">{phoneError}</p>
                )}
                <select
                  value={selectedCity}
                  onChange={e => {
                    setSelectedCity(e.target.value)
                    setQuartier('')
                  }}
                  className="w-full rounded-lg border border-brand-grey/30 py-2.5 px-3 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  <option value="">
                    {t({ en: 'Select your city', fr: 'Sélectionnez votre ville' })}
                  </option>
                  {zones.map(z => (
                    <option key={z.city_name_fr} value={z.city_name_fr}>
                      {language === 'fr' ? z.city_name_fr : z.city_name_en} — {z.delivery_fee.toLocaleString('fr-FR')} FCFA
                    </option>
                  ))}
                </select>
                {selectedZone && (
                  <input
                    type="text"
                    value={quartier}
                    onChange={e => setQuartier(e.target.value)}
                    placeholder={
                      selectedZone.agencies?.length
                        ? t({ en: 'Bus agency', fr: 'Agence de bus' })
                        : t({ en: 'Neighbourhood', fr: 'Quartier' })
                    }
                    className="w-full rounded-lg border border-brand-grey/30 py-2.5 px-3 text-sm placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    required
                  />
                )}
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleCheckout('delivery')}
                  disabled={!isFormValid || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
                </button>

                <button
                  onClick={() => handleCheckout('appointment')}
                  disabled={!isFormValid || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-grey/30 bg-white px-6 py-3.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-grey/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-5 w-5" />
                  {t({ en: 'Book appointment to view', fr: 'Prendre rendez-vous pour voir' })}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-xl border border-brand-grey/20 bg-white p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <ShieldCheck className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-dark">
                    {t({ en: 'Satisfied or refunded', fr: 'Satisfait ou remboursé' })}
                  </p>
                  <p className="text-xs text-brand-dark/50">
                    {t({ en: 'Inspect before paying', fr: 'Inspectez avant de payer' })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <ShoppingCart className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-dark">
                    {t({ en: 'Secure payment', fr: 'Paiement sécurisé' })}
                  </p>
                  <p className="text-xs text-brand-dark/50">
                    {t({ en: 'Pay on delivery', fr: 'Paiement à la livraison' })}
                  </p>
                </div>
              </div>
              <Link href="/faq" className="flex items-start gap-3 hover:bg-brand-grey/5 rounded-lg -mx-1 p-1 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <HelpCircle className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-dark">
                    {t({ en: 'Need help?', fr: 'Besoin d\'aide ?' })}
                  </p>
                  <p className="text-xs text-brand-dark/50 flex items-center gap-1">
                    {t({ en: 'View FAQ', fr: 'Consultez la FAQ' })}
                    <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
