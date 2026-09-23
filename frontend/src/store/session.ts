import { create } from "zustand";
import type { AppUser } from "../types";

interface SessionState {
  user: AppUser | null;
  status: "loading" | "authenticated" | "guest";
  setUser: (user: AppUser | null) => void;
  setStatus: (status: SessionState["status"]) => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),
  setStatus: (status) => set({ status }),
}));
