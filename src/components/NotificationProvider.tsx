'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  type: ToastType
  title?: string
  message: string
}

type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
}

type ConfirmState = ConfirmOptions & {
  open: boolean
  triggerRef?: HTMLElement | null
}

type NotificationContextValue = {
  notify: (toast: Omit<Toast, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  confirm: (options: ConfirmOptions, triggerRef?: HTMLElement | null) => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const TOAST_STYLES: Record<
  ToastType,
  { icon: typeof CheckCircle2; card: string; iconWrap: string }
> = {
  success: {
    icon: CheckCircle2,
    card: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconWrap: 'bg-emerald-500 text-white',
  },
  error: {
    icon: AlertCircle,
    card: 'border-red-200 bg-red-50 text-red-900',
    iconWrap: 'bg-red-500 text-white',
  },
  info: {
    icon: Info,
    card: 'border-brand-blue/20 bg-white text-brand-dark',
    iconWrap: 'bg-brand-blue text-white',
  },
}

const TOAST_DISMISS_MS = 6000

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    first?.focus()
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [active, ref])
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set())
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null)
  const toastIdRef = useRef(0)
  const confirmRef = useRef<HTMLDivElement>(null)

  useFocusTrap(confirmRef as React.RefObject<HTMLDivElement>, !!confirmState?.open)

  const dismissToast = useCallback((id: number) => {
    setExitingIds(prev => new Set(prev).add(id))
    setToasts(current => current.filter(t => t.id !== id))
  }, [])

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastIdRef.current
    setToasts(current => [...current, { ...toast, id }])
  }, [])

  const success = useCallback(
    (message: string, title?: string) => notify({ type: 'success', message, title }),
    [notify]
  )

  const error = useCallback(
    (message: string, title?: string) => notify({ type: 'error', message, title }),
    [notify]
  )

  const info = useCallback(
    (message: string, title?: string) => notify({ type: 'info', message, title }),
    [notify]
  )

  const confirm = useCallback(
    (options: ConfirmOptions, triggerRef?: HTMLElement | null) => {
      setConfirmState({ ...options, open: true, triggerRef })
      return new Promise<boolean>(resolve => {
        confirmResolverRef.current = resolve
      })
    },
    []
  )

  const resolveConfirm = useCallback(
    (value: boolean) => {
      confirmResolverRef.current?.(value)
      confirmResolverRef.current = null
      const trigger = confirmState?.triggerRef
      setConfirmState(null)
      if (trigger) {
        setTimeout(() => trigger.focus(), 50)
      }
    },
    [confirmState]
  )

  useEffect(() => {
    if (!confirmState?.open) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') resolveConfirm(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [confirmState?.open, resolveConfirm])

  useEffect(() => {
    if (toasts.length === 0) return
    const newest = toasts[toasts.length - 1]
    const timer = setTimeout(() => dismissToast(newest.id), TOAST_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toasts, dismissToast])

  const value = useMemo<NotificationContextValue>(
    () => ({ notify, success, error, info, confirm }),
    [confirm, error, info, notify, success]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map(toast => {
            const style = TOAST_STYLES[toast.type]
            const Icon = style.icon

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                onAnimationComplete={() => {
                  if (exitingIds.has(toast.id)) {
                    setToasts(current => current.filter(t => t.id !== toast.id))
                    setExitingIds(prev => {
                      const next = new Set(prev)
                      next.delete(toast.id)
                      return next
                    })
                  }
                }}
                className={`pointer-events-auto rounded-2xl border p-4 shadow-lg ${style.card}`}
                role="status"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {toast.title ? (
                      <p className="text-sm font-semibold">{toast.title}</p>
                    ) : null}
                    <p className="text-sm leading-5 text-current/80">{toast.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-full p-1 text-current/50 transition hover:bg-black/5 hover:text-current"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmState?.open ? (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
            onClick={e => {
              if (e.target === e.currentTarget) resolveConfirm(false)
            }}
          >
            <motion.div
              ref={confirmRef}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby={confirmState.message ? 'confirm-message' : undefined}
            >
              <h2 id="confirm-title" className="text-lg font-bold text-brand-dark">
                {confirmState.title}
              </h2>
              {confirmState.message ? (
                <p id="confirm-message" className="mt-2 text-sm leading-6 text-brand-dark/65">
                  {confirmState.message}
                </p>
              ) : null}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => resolveConfirm(false)}
                  className="rounded-full border border-brand-grey/30 px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  {confirmState.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => resolveConfirm(true)}
                  className={`rounded-full px-5 py-2 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    confirmState.tone === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600'
                      : 'bg-brand-blue hover:bg-brand-blue/90 focus-visible:ring-brand-blue'
                  }`}
                >
                  {confirmState.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}