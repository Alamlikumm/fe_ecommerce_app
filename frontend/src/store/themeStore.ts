import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next);
        }
      },
      setDark: (isDark) => {
        set({ isDark });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", isDark);
        }
      },
    }),
    { name: "tokokita-theme" }
  )
);