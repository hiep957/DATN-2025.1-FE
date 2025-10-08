import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
  roles?: string[] // Thêm roles nếu cần thiết
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void

}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        setAccessToken: (token) => set({ accessToken: token }),
        setUser: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
      }),
      { name: 'Auth Store' } // tên hiển thị trong Redux DevTools
    )
  )
)
