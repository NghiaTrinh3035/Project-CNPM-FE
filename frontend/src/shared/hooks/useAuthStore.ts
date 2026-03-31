import { setAuthToken } from "@/api/axiosClient";
import type { AuthSession, User } from "@/shared/types/domain";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  user: User | null;
  setSession: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      user: null,
      setSession: (session) => {
        setAuthToken(session.token);
        set({
          session,
          isAuthenticated: true,
          user: session.user,
        });
      },
      logout: () => {
        setAuthToken(null);
        set({
          session: null,
          isAuthenticated: false,
          user: null,
        });
      },
      updateUser: (user) =>
        set((state) => ({
          ...state,
          user,
          session: state.session ? { ...state.session, user } : null,
        })),
    }),
    {
      name: "chrono-auth-store",
    },
  ),
);
