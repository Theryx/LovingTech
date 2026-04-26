'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, ArrowRight } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface LeadModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ product, isOpen, onClose }: LeadModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isOutOfStock = product.stock_status === 'out_of_stock';
      const { error } = await supabase.from('leads').insert([
        {
          product_id: product.id,
          whatsapp_number: whatsapp,
          address: address,
          status: isOutOfStock ? 'notification_requested' : 'pending',
        },
      ]);

      if (error) throw error;

      const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '237655163248';

      const message = isOutOfStock
        ? encodeURIComponent(
            `Bonjour Loving Tech! Je veux être notifié quand *${product.name}* est de retour en stock.\n\n` +
            `*Mes informations:*\n` +
            `- WhatsApp: ${whatsapp}\n` +
            `- Zone de livraison: ${address}\n\n` +
            `Merci!`
          )
        : encodeURIComponent(
            `Bonjour Loving Tech! 👋\n\n` +
            `Je suis intéressé par *${product.name}* (${product.price_xaf.toLocaleString('fr-FR')} XAF).\n\n` +
            `*Livraison:*\n` +
            `- WhatsApp: ${whatsapp}\n` +
            `- Adresse: ${address}\n\n` +
            `Est-ce encore disponible?`
          );

      window.open(`https://wa.me/${businessNumber}?text=${message}`, '_blank');
      onClose();
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-brand-grey/20 flex justify-between items-center">
              <h2 id="lead-modal-title" className="text-xl font-bold text-brand-dark">
                {isOutOfStock
                  ? t({ en: 'Notify Me When Available', fr: 'Me prévenir du retour en stock' })
                  : t({ en: 'Complete Your Order', fr: 'Finaliser votre commande' })}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={t({ en: 'Close', fr: 'Fermer' })}
                className="p-2 rounded-full text-brand-dark/50 hover:bg-brand-grey/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="modal-whatsapp" className="text-sm font-medium text-brand-dark/60">
                  {t({ en: 'WhatsApp Number', fr: 'Numéro WhatsApp' })}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey" aria-hidden="true" />
                  <input
                    required
                    id="modal-whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="ex. 677000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-brand-grey/10 border border-brand-grey/30 rounded-2xl py-3 pl-12 pr-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-address" className="text-sm font-medium text-brand-dark/60">
                  {isOutOfStock
                    ? t({ en: 'Preferred Delivery Area', fr: 'Zone de livraison préférée' })
                    : t({ en: 'Delivery Address / Neighborhood', fr: 'Adresse de livraison / Quartier' })}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey" aria-hidden="true" />
                  <input
                    required
                    id="modal-address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="ex. Bonamoussadi, Douala"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-brand-grey/10 border border-brand-grey/30 rounded-2xl py-3 pl-12 pr-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isOutOfStock
                      ? 'bg-brand-orange text-white hover:brightness-95 focus-visible:ring-brand-orange'
                      : 'bg-brand-dark text-white hover:bg-brand-dark/90 focus-visible:ring-brand-dark'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {t({ en: 'Processing...', fr: 'Traitement...' })}
                    </>
                  ) : (
                    <>
                      {isOutOfStock
                        ? t({ en: 'Notify Me on WhatsApp', fr: 'Prévenez-moi sur WhatsApp' })
                        : t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-brand-dark/40 mt-4">
                  {isOutOfStock
                    ? t({ en: 'We will message you as soon as it is back in stock.', fr: "Nous vous contacterons dès qu'il sera de retour en stock." })
                    : t({ en: 'Data is used only for delivery coordination.', fr: 'Les données sont utilisées uniquement pour la coordination de livraison.' })}
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
