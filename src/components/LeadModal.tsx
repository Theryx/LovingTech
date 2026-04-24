'use client';

import { useState } from 'react';
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

      const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '237600000000';
      
      const message = isOutOfStock
        ? encodeURIComponent(
            `Hello Loving Tech! I want to be notified when *${product.name}* is back in stock.\n\n` +
            `*My Details:*\n` +
            `- WhatsApp: ${whatsapp}\n` +
            `- Preferred Delivery Area: ${address}\n\n` +
            `Please let me know as soon as it arrives!`
          )
        : encodeURIComponent(
            `Hello Loving Tech! I'm interested in the *${product.name}* (${product.price_xaf.toLocaleString('fr-FR')} XAF).\n\n` +
            `*Delivery Details:*\n` +
            `- WhatsApp: ${whatsapp}\n` +
            `- Address: ${address}\n\n` +
            `Is it still available?`
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {isOutOfStock 
                  ? t({ en: 'Notify Me When Available', fr: 'Me prévenir du retour en stock' })
                  : t({ en: 'Complete Your Order', fr: 'Finaliser votre commande' })}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">{t({ en: 'WhatsApp Number', fr: 'Numéro WhatsApp' })}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    required
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 677000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400/30 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">
                  {isOutOfStock 
                    ? t({ en: 'Preferred Delivery Area', fr: 'Zone de livraison préférée' })
                    : t({ en: 'Delivery Address / Neighborhood', fr: 'Adresse de livraison / Quartier' })}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    required
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="e.g. Bonamoussadi, Douala"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400/30 transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                    isOutOfStock 
                      ? 'bg-amber-500 text-white hover:bg-amber-600' 
                      : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 dark:border-black/20 border-t-blue-500 animate-spin" />
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
                <p className="text-center text-xs text-zinc-400 mt-4">
                  {isOutOfStock
                    ? t({ en: 'We will message you as soon as it is back in stock.', fr: 'Nous vous contacterons dès qu\'il sera de retour en stock.' })
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
