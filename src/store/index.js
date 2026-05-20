import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/axios'

// ─── AUTH STORE ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      // Connexion client
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('accessToken', data.accessToken)
          set({ user: data.user, accessToken: data.accessToken })
          return data.user
        } finally {
          set({ isLoading: false })
        }
      },

      // Connexion admin — route dédiée qui vérifie role=admin côté serveur
      adminLogin: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/admin/login', { email, password })
          localStorage.setItem('accessToken', data.accessToken)
          set({ user: data.user, accessToken: data.accessToken })
          return data.user
        } finally {
          set({ isLoading: false })
        }
      },

      // Inscription client
      register: async (name, email, password, phone) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { name, email, password, phone })
          localStorage.setItem('accessToken', data.accessToken)
          set({ user: data.user, accessToken: data.accessToken })
          return data.user
        } finally {
          set({ isLoading: false })
        }
      },

      // Déconnexion (silencieuse si erreur réseau)
      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null })
      },

      // Rafraîchir le profil depuis l'API
      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
          return data.user
        } catch {
          get().logout()
          return null
        }
      },

      // Mettre à jour le profil
      updateProfile: async (body) => {
        const { data } = await api.put('/auth/profile', body)
        set({ user: data.user })
        return data.user
      },
    }),
    {
      name: 'W�nam-auth',
      // Ne persiste que user et accessToken (pas les fonctions)
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
)

// ─── CART STORE ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existing = items.find((i) => i._id === item._id)
        if (existing) {
          set({ items: items.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i._id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set({ items: get().items.map((i) => i._id === id ? { ...i, quantity: qty } : i) })
      },

      clear: () => set({ items: [] }),

      // Calculés à la volée
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'W�nam-cart' }
  )
)


