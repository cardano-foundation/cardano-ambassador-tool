"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;

    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-background hover:bg-muted/80 transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="text-lg">{theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
