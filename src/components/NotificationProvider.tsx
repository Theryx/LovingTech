'use client'

import {
  createContext,
  useCallback,
  useContext,
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
}

type NotificationContextValue = {
  notify: (toast: Omit<Toast, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null)
  const toastIdRef = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastIdRef.current
    setToasts(current => [...current, { ...toast, id }])
    window.setTimeout(() => {
      setToasts(current => current.filter(item => item.id !== id))
    }, 4200)
  }, [])

  const success = useCallback(
    (message: string, title?: string) => {
      notify({ type: 'success', message, title })
    },
    [notify]
  )

  const error = useCallback(
    (message: string, title?: string) => {
      notify({ type: 'error', message, title })
    },
    [notify]
  )

  const info = useCallback(
    (message: string, title?: string) => {
      notify({ type: 'info', message, title })
    },
    [notify]
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({ ...options, open: true })
    return new Promise<boolean>(resolve => {
      confirmResolverRef.current = resolve
    })
  }, [])

  const resolveConfirm = useCallback((value: boolean) => {
    confirmResolverRef.current?.(value)
    confirmResolverRef.current = null
    setConfirmState(null)
  }, [])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success,
      error,
      info,
      confirm,
    }),
    [confirm, error, info, notify, success]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
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
                className={`pointer-events-auto rounded-2xl border p-4 shadow-lg ${style.card}`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
                    <p className="text-sm leading-5 text-current/80">{toast.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-full p-1 text-current/50 transition hover:bg-black/5 hover:text-current"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmState?.open ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              role="alertdialog"
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
                  className="rounded-full border border-brand-grey/30 px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10"
                >
                  {confirmState.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => resolveConfirm(true)}
                  className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${
                    confirmState.tone === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-brand-blue hover:bg-brand-blue/90'
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
