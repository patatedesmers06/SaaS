import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create<ThemeState>((set, get) => {
  // Get initial theme from localStorage or default to system
  const savedTheme = (typeof localStorage !== 'undefined' 
    ? localStorage.getItem('leaveflow-theme') as Theme 
    : null) || 'system'
  
  const resolvedTheme = savedTheme === 'system' ? getSystemTheme() : savedTheme
  
  // Apply theme on store creation
  applyTheme(resolvedTheme)
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const { theme } = get()
      if (theme === 'system') {
        const newResolvedTheme = e.matches ? 'dark' : 'light'
        applyTheme(newResolvedTheme)
        set({ resolvedTheme: newResolvedTheme })
      }
    })
  }
  
  return {
    theme: savedTheme as Theme,
    resolvedTheme,
    
    setTheme: (theme: Theme) => {
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      localStorage.setItem('leaveflow-theme', theme)
      applyTheme(resolvedTheme)
      set({ theme, resolvedTheme })
    },
    
    toggleTheme: () => {
      const { resolvedTheme } = get()
      const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('leaveflow-theme', newTheme)
      applyTheme(newTheme)
      set({ theme: newTheme, resolvedTheme: newTheme })
    },
  }
})
