'use client'

import { useState } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

const WHATSAPP_NUMBER = '237655163248'

const PRESET_QUESTIONS = [
  { en: 'How do I place an order?', fr: 'Comment passer une commande ?' },
  { en: 'What are the delivery times?', fr: 'Quels sont les délais de livraison ?' },
  { en: 'What are the towns you deliver to?', fr: 'Quelles sont les villes dans lesquelles vous livrez ?' },
  { en: 'How can I track my order?', fr: 'Comment suivre ma commande ?' },
  { en: 'Are your products authentic?', fr: 'Vos produits sont-ils authentiques ?' },
]

function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank')
}

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const { t, language } = useLanguage()
  const [customQuestion, setCustomQuestion] = useState('')

  function handlePresetClick(question: string) {
    openWhatsApp(question)
  }

  function handleCustomSend() {
    const trimmed = customQuestion.trim()
    if (!trimmed) return
    openWhatsApp(trimmed)
    setCustomQuestion('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCustomSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-dialog-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-brand-grey/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange/10">
                  <MessageCircle className="h-5 w-5 text-brand-orange" />
                </div>
                <h2 id="help-dialog-title" className="text-lg font-bold text-brand-dark">
                  {t({ en: 'How can we help you?', fr: 'Comment pouvons-nous vous aider ?' })}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label={t({ en: 'Close', fr: 'Fermer' })}
                className="p-2 rounded-full text-brand-dark/40 hover:bg-brand-grey/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {/* Preset questions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40 mb-3">
                  {t({ en: 'Quick questions', fr: 'Questions rapides' })}
                </p>
                <div className="space-y-2">
                  {PRESET_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(q[language as 'en' | 'fr'])}
                      className="w-full text-left px-4 py-3 rounded-xl border border-brand-grey/20 bg-white text-sm text-brand-dark hover:border-brand-orange/40 hover:bg-brand-orange/5 transition"
                    >
                      {q[language as 'en' | 'fr']}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-brand-grey/20" />
                <span className="text-xs text-brand-dark/30 font-medium">
                  {t({ en: 'or', fr: 'ou' })}
                </span>
                <div className="flex-1 h-px bg-brand-grey/20" />
              </div>

              {/* Custom question */}
              <div>
                <textarea
                  value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t({ en: 'Type your own question...', fr: 'Écrivez votre propre question...' })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-brand-grey/30 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange/40 transition"
                />
                <button
                  onClick={handleCustomSend}
                  disabled={!customQuestion.trim()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {t({ en: 'Send on WhatsApp', fr: 'Envoyer sur WhatsApp' })}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-brand-grey/10 bg-brand-grey/5 shrink-0">
              <p className="text-xs text-brand-dark/40 text-center">
                {t({
                  en: 'We usually reply within a few minutes during business hours.',
                  fr: 'Nous répondons généralement en quelques minutes pendant les heures ouvrables.',
                })}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
