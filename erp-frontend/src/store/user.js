import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode'; // Import karein

export const useUserStore = create(
  persist(
    (set, get) => ({ // 'get' ko yahan add karein
      token: null,
      user: null,
      isAuth: false,
      setToken: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ 
            token, 
            user: { email: decoded.email, role: decoded.role }, 
            isAuth: true 
          });
        } catch (error) {
          console.error("Invalid token:", error);
          get().logout();
        }
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ token: null, user: null, isAuth: false });
      },
      // Yeh naya function add karein
      checkAuth: () => {
        const { token } = get();
        if (token) {
          try {
            const decoded = jwtDecode(token);
            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
              get().logout(); // Logout if expired
            } else {
              set({ isAuth: true, user: { email: decoded.email, role: decoded.role } });
            }
          } catch (error) {
            get().logout(); // Logout if token is invalid
          }
        } else {
          get().logout();
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);