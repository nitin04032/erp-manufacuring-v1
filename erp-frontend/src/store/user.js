import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Yeh aapka global store hai
export const useUserStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuth: false,
      setToken: (token) => {
        set({ token, isAuth: !!token });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ token: null, user: null, isAuth: false });
      },
    }),
    {
      name: 'user-storage', // local storage mein is naam se save hoga
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);