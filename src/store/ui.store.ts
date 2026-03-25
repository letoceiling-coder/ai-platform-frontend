import { create } from 'zustand'

type Theme = 'dark' | 'light'

type UiState = {
  sidebarOpen: boolean
  theme: Theme
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}))

