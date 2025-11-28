import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: number
  username: string
  email: string
  address?: string
  phoneNumber?: string
  birthday?: string
  gender?: string
  occupation?: string
  avatar?: string
  roles?: string[] // Thêm roles nếu cần thiết
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  updateUser: (updatedUser: Partial<User>) => void
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
        updateUser: (updatedUser: Partial<User>) =>
          set((state) => ({
            user: { ...state.user, ...updatedUser } as User,
          })),
      }),
      { name: 'Auth Store' } // tên hiển thị trong Redux DevTools
    )
  )
)
