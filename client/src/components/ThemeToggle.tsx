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

const MoonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#777E90"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C11.4477 2 11 2.44772 11 3C11 3.55228 11.4477 4 12 4C12.5523 4 13 3.55228 13 3C13 2.44772 12.5523 2 12 2Z"
      fill="#777E91"
    />
    <path
      d="M12 20C11.4477 20 11 20.4477 11 21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21C13 20.4477 12.5523 20 12 20Z"
      fill="#777E91"
    />
    <path
      d="M21 11C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13C20.4477 13 20 12.5523 20 12C20 11.4477 20.4477 11 21 11Z"
      fill="#777E91"
    />
    <path
      d="M4 12C4 11.4477 3.55228 11 3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13C3.55228 13 4 12.5523 4 12Z"
      fill="#777E91"
    />
    <path
      d="M17.6569 4.92903C18.0474 4.53851 18.6806 4.53851 19.0711 4.92903C19.4616 5.31955 19.4616 5.95272 19.0711 6.34324C18.6806 6.73377 18.0474 6.73377 17.6569 6.34324C17.2664 5.95272 17.2664 5.31955 17.6569 4.92903Z"
      fill="#777E91"
    />
    <path
      d="M6.34309 17.6568C5.95257 17.2663 5.3194 17.2663 4.92888 17.6568C4.53836 18.0473 4.53836 18.6805 4.92888 19.071C5.3194 19.4616 5.95257 19.4616 6.34309 19.071C6.73362 18.6805 6.73362 18.0473 6.34309 17.6568Z"
      fill="#777E91"
    />
    <path
      d="M19.0711 17.6569C19.4616 18.0474 19.4616 18.6806 19.0711 19.0711C18.6806 19.4616 18.0474 19.4616 17.6569 19.0711C17.2664 18.6806 17.2664 18.0474 17.6569 17.6569C18.0474 17.2664 18.6806 17.2664 19.0711 17.6569Z"
      fill="#777E91"
    />
    <path
      d="M6.34319 6.34309C6.73371 5.95257 6.73371 5.3194 6.34319 4.92888C5.95266 4.53836 5.3195 4.53836 4.92897 4.92888C4.53845 5.3194 4.53845 5.95257 4.92897 6.34309C5.3195 6.73362 5.95266 6.73362 6.34319 6.34309Z"
      fill="#777E91"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
      fill="#777E91"
    />
  </svg>
);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-background  transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

export default ThemeToggle;
