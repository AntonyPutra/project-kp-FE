import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (userData, token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    set({ user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },
  setLoading: (status) => set({ isLoading: status }),
}));
