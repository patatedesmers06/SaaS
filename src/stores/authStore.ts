import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@services/supabase'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile from our users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) throw profileError
            
            set({ user: userProfile, isLoading: false, isInitialized: true })
          } else {
            set({ user: null, isLoading: false, isInitialized: true })
          }
          
          // Subscribe to auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({ user: userProfile })
            } else if (event === 'SIGNED_OUT') {
              set({ user: null })
            }
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ 
            user: null, 
            isLoading: false, 
            isInitialized: true,
            error: 'Erreur lors de l\'initialisation' 
          })
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          
          if (data.user) {
            // Fetch user profile
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (profileError) throw profileError
            
            set({ user: userProfile, isLoading: false })
          }
        } catch (error: any) {
          console.error('Login error:', error)
          set({ 
            isLoading: false, 
            error: error.message === 'Invalid login credentials' 
              ? 'Email ou mot de passe incorrect'
              : 'Erreur de connexion' 
          })
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // Create auth user
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
          
          if (error) throw error
          
          if (data.user) {
            // Note: The user profile will be created by a Supabase trigger
            // For now, we wait a bit for the trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Fetch the created profile
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (!profileError) {
              set({ user: userProfile, isLoading: false })
            } else {
              // Profile might not exist yet if no trigger, create it manually
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: email,
                  full_name: fullName,
                  role: 'employee' as UserRole,
                  hire_date: new Date().toISOString().split('T')[0],
                  is_active: true,
                })
                .select()
                .single()
              
              if (createError) throw createError
              set({ user: newProfile, isLoading: false })
            }
          }
        } catch (error: any) {
          console.error('Register error:', error)
          set({ 
            isLoading: false, 
            error: error.message.includes('already registered')
              ? 'Cet email est déjà utilisé'
              : 'Erreur lors de l\'inscription' 
          })
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })
          await supabase.auth.signOut()
          set({ user: null, isLoading: false })
        } catch (error) {
          console.error('Logout error:', error)
          set({ isLoading: false, error: 'Erreur lors de la déconnexion' })
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          
          if (error) throw error
          
          set({ isLoading: false })
        } catch (error: any) {
          console.error('Reset password error:', error)
          set({ 
            isLoading: false, 
            error: 'Erreur lors de l\'envoi du lien de réinitialisation' 
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'leaveflow-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
