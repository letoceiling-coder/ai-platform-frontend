import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../store/toast.store'

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] w-full max-w-sm space-y-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={[
              'pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl',
              t.type === 'success' ? 'ring-1 ring-emerald-500/20' : 'ring-1 ring-rose-500/20',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-slate-300">
                  {t.type === 'success' ? 'SUCCESS' : 'ERROR'}
                </div>
                <div className="mt-1 text-sm text-white/90">{t.title}</div>
              </div>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                onClick={() => remove(t.id)}
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

