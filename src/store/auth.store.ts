import { create } from 'zustand'

type AuthState = {
  isLoading: boolean
  token: string | null
  user: unknown | null
  init: () => void
  setAuth: (token: string, user?: unknown | null) => void
  logout: () => void
}

const STORAGE_KEY = 'token'

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  token: null,
  user: null,
  init: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEY)
      if (token) set({ token })
    } catch {
      // ignore storage failures
    } finally {
      set({ isLoading: false })
    }
  },
  setAuth: (token, user = null) => {
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // ignore storage failures
    }
    set({ token, user })
  },
  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage failures
    }
    set({ token: null, user: null })
  },
}))

