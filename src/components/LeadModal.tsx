'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, ArrowRight } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';

interface LeadModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ product, isOpen, onClose }: LeadModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save Lead to Supabase
      const { error } = await supabase.from('leads').insert([
        {
          product_id: product.id,
          whatsapp_number: whatsapp,
          address: address,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      // 2. Redirect to WhatsApp
      const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '237600000000'; // Fallback
      const message = encodeURIComponent(
        `Hello Loving Tech! I'm interested in the *${product.name}* (${product.price_xaf.toLocaleString()} XAF).\n\n` +
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complete Your Order</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 677000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/10 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Delivery Address / Neighborhood</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bonamoussadi, Douala"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/10 transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-black/20 border-t-blue-500 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Order via WhatsApp
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-4">
                  Data is used only for delivery coordination.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
