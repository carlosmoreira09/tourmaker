"use client";

import { useState } from "react";
import { TourProvider, type TourTheme } from "tourmaker-react";
import { demoTour } from "./tours";

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TourTheme>("dark");

  return (
    <TourProvider
      tours={[demoTour]}
      theme={theme}
      onEvent={(e) => console.log("[tourmaker]", e)}
    >
      {children}
      <button
        className="pg-theme-toggle"
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        aria-label="Alternar tema do tour"
      >
        Tema do tour: {theme === "dark" ? "🌙 escuro" : "☀️ claro"}
      </button>
    </TourProvider>
  );
}
