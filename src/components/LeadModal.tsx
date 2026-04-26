'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, User, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Product, orderService } from '@/lib/supabase';
import { generateOrderRef } from '@/lib/generateOrderRef';
import { useLanguage } from '@/context/LanguageContext';

interface LeadModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_FEE_DOUALA = 2000;
const DELIVERY_FEE_OTHER = 3000;
const FREE_DELIVERY_THRESHOLD = 50000;

const CITIES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
];

function calcDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return city === 'Douala' ? DELIVERY_FEE_DOUALA : DELIVERY_FEE_OTHER;
}

export default function LeadModal({ product, isOpen, onClose }: LeadModalProps) {
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — Contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Step 2 — Delivery
  const [city, setCity] = useState('Douala');
  const [agency, setAgency] = useState('');
  const [quartier, setQuartier] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  const subtotal = product.price_xaf * 1;
  const deliveryFee = calcDeliveryFee(city, subtotal);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const isDouala = city === 'Douala';

  const step1Valid = name.trim().length >= 2 && phone.trim().length >= 8;
  const step2Valid = isDouala
    ? city && quartier.trim().length >= 2
    : city && agency.trim().length >= 2;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const orderRef = generateOrderRef();
    try {
      await orderService.create({
        order_ref: orderRef,
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price_xaf,
        total_price: total,
        customer_name: name,
        customer_phone: `+237${phone.replace(/^(\+237|237)/, '')}`,
        city,
        bus_agency: agency,
        quartier,
        address_details: addressDetails,
        delivery_fee: deliveryFee,
        status: 'pending',
        status_history: [{ status: 'pending', at: new Date().toISOString() }],
      });

      const msg = encodeURIComponent(
        `Bonjour Loving Tech! 👋\n\n` +
        `🛍️ Nouvelle commande — ${orderRef}\n` +
        `Produit: ${product.name}\n` +
        `Quantité: 1\n\n` +
        `👤 Client: ${name}\n` +
        `📱 WhatsApp: +237${phone.replace(/^(\+237|237)/, '')}\n\n` +
        `📦 Livraison:\n` +
        `Ville: ${city}\n` +
        (agency ? `Agence: ${agency}\n` : '') +
        `Quartier: ${quartier}\n` +
        (addressDetails ? `Détails: ${addressDetails}\n` : '') +
        `\n💰 Sous-total: ${subtotal.toLocaleString('fr-FR')} FCFA\n` +
        `🚚 Livraison: ${deliveryFee === 0 ? 'GRATUITE' : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}\n` +
        `✅ Total: ${total.toLocaleString('fr-FR')} FCFA\n\n` +
        `Merci!`
      );

      window.open(`https://wa.me/237655163248?text=${msg}`, '_blank');
      onClose();
    } catch (err) {
      console.error('Order creation failed:', err);
      alert(t({ en: 'Something went wrong. Please try again.', fr: "Une erreur s'est produite. Veuillez réessayer." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-brand-grey/10 border border-brand-grey/30 rounded-xl py-3 pl-11 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition';
  const inputNoPrefixCls = 'w-full bg-brand-grey/10 border border-brand-grey/30 rounded-xl py-3 px-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition';

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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step > s ? 'bg-brand-blue text-white' : step === s ? 'bg-brand-blue text-white' : 'bg-brand-grey/30 text-brand-dark/40'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs hidden sm:block ${step === s ? 'text-brand-dark font-medium' : 'text-brand-dark/40'}`}>
                    {s === 1 ? t({ en: 'Contact', fr: 'Contact' }) : s === 2 ? t({ en: 'Delivery', fr: 'Livraison' }) : t({ en: 'Summary', fr: 'Résumé' })}
                  </span>
                  {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-brand-blue' : 'bg-brand-grey/30'}`} />}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="px-6 py-5 space-y-4">

              {/* Step 1 — Contact */}
              {step === 1 && (
                <>
                  <div>
                    <label htmlFor="order-name" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                      {t({ en: 'Full Name', fr: 'Nom complet' })} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey" aria-hidden="true" />
                      <input id="order-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Jean Dupont" autoComplete="name" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="order-phone" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                      {t({ en: 'WhatsApp Number', fr: 'Numéro WhatsApp' })} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey" aria-hidden="true" />
                      <input id="order-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="6 77 00 00 00" autoComplete="tel" />
                    </div>
                    <p className="text-xs text-brand-dark/40 mt-1">+237 {t({ en: 'prefix added automatically', fr: 'préfixe ajouté automatiquement' })}</p>
                  </div>
                </>
              )}

              {/* Step 2 — Delivery */}
              {step === 2 && (
                <>
                  <div>
                    <label htmlFor="order-city" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                      {t({ en: 'City', fr: 'Ville' })} *
                    </label>
                    <select id="order-city" value={city} onChange={e => { setCity(e.target.value); setAgency(''); setQuartier(''); }} className={`${inputNoPrefixCls} cursor-pointer`}>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="text-xs mt-1.5">
                      {subtotal >= FREE_DELIVERY_THRESHOLD
                        ? <span className="text-green-700 font-medium">✅ {t({ en: 'Free delivery!', fr: 'Livraison gratuite!' })}</span>
                        : <span className="text-brand-dark/50">{t({ en: 'Delivery fee', fr: 'Frais de livraison' })}: <strong>{deliveryFee.toLocaleString('fr-FR')} FCFA</strong></span>
                      }
                    </p>
                  </div>
                  {isDouala ? (
                    <div>
                      <label htmlFor="order-quartier" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                        {t({ en: 'Neighbourhood', fr: 'Quartier' })} *
                      </label>
                      <input id="order-quartier" type="text" value={quartier} onChange={e => setQuartier(e.target.value)} className={inputNoPrefixCls} placeholder={t({ en: 'e.g. Bonamoussadi', fr: 'ex. Bonamoussadi' })} />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="order-agency" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                        {t({ en: 'Bus Agency', fr: 'Agence de bus' })} *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey" aria-hidden="true" />
                        <input id="order-agency" type="text" value={agency} onChange={e => setAgency(e.target.value)} className={inputCls} placeholder={t({ en: 'e.g. Vatican Express, Buca Voyages', fr: 'ex. Vatican Express, Buca Voyages' })} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="order-details" className="block text-sm font-medium text-brand-dark/60 mb-1.5">
                      {t({ en: 'Delivery Instructions', fr: 'Instructions de livraison' })} ({t({ en: 'optional', fr: 'optionnel' })})
                    </label>
                    <textarea id="order-details" value={addressDetails} onChange={e => setAddressDetails(e.target.value)} rows={2} className={`${inputNoPrefixCls} resize-none`} placeholder={t({ en: 'Landmark, gate colour…', fr: 'Repère, couleur du portail…' })} />
                  </div>
                </>
              )}

              {/* Step 3 — Summary */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-brand-grey/20 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'Product', fr: 'Produit' })}</span>
                      <span className="font-medium text-brand-dark text-right max-w-[60%] truncate">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'Customer', fr: 'Client' })}</span>
                      <span className="font-medium text-brand-dark">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">WhatsApp</span>
                      <span className="font-medium text-brand-dark">+237 {phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'City', fr: 'Ville' })}</span>
                      <span className="font-medium text-brand-dark">{city}{isDouala && quartier ? `, ${quartier}` : ''}</span>
                    </div>
                    {!isDouala && agency && (
                      <div className="flex justify-between">
                        <span className="text-brand-dark/60">{t({ en: 'Agency', fr: 'Agence' })}</span>
                        <span className="font-medium text-brand-dark">{agency}</span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-brand-grey/10 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'Subtotal', fr: 'Sous-total' })}</span>
                      <span className="text-brand-dark">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/60">{t({ en: 'Delivery', fr: 'Livraison' })}</span>
                      <span className={deliveryFee === 0 ? 'text-green-700 font-medium' : 'text-brand-dark'}>
                        {deliveryFee === 0 ? t({ en: 'FREE', fr: 'GRATUITE' }) : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-brand-grey/20 pt-2 font-bold">
                      <span className="text-brand-dark">Total</span>
                      <span className="text-brand-blue text-base">{total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-dark/40 text-center">
                    {t({ en: 'By ordering you accept our terms and return policy.', fr: 'En commandant, vous acceptez nos conditions et notre politique de retour.' })}
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
  );
}
