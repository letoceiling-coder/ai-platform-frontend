import { create } from 'zustand'

type ToastType = 'success' | 'error'

export type Toast = {
  id: string
  type: ToastType
  title: string
}

type ToastState = {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>, ttlMs?: number) => void
  remove: (id: string) => void
}

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast, ttlMs = 2600) => {
    const toastId = id()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: toastId }] }))
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) })), ttlMs)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

