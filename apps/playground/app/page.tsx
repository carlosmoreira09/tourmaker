"use client";

import { useTour, useAutoStartTour, useHasSeen } from "tourmaker-react";

export default function Home() {
  const { start, reset } = useTour();

  // Phase 3: auto-start the tour once, on first visit (persisted in localStorage).
  useAutoStartTour("demo");
  const seen = useHasSeen("demo");

  return (
    <>
      <nav className="pg-nav">
        <strong>Acme</strong>
        <input id="feature-search" className="pg-search" placeholder="Buscar…" />
        <button id="feature-profile" className="pg-icon-btn" aria-label="Perfil">
          🧑
        </button>
        <button id="feature-settings" className="pg-icon-btn" aria-label="Configurações">
          ⚙️
        </button>
      </nav>

      <main className="pg-main">
        <h1>TourMaker Playground</h1>
        <p>
          O tour inicia <strong>sozinho na primeira visita</strong> (lembrado no
          localStorage). Recarregue: ele não volta. Clique em “Resetar” para
          poder ver de novo. Use as setas ← → e Esc.
        </p>
        <p className="pg-status">
          Status:{" "}
          {seen === undefined ? "…" : seen ? "já visto ✅" : "ainda não visto"}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="pg-cta" onClick={() => start("demo")}>
            Iniciar tour ▶
          </button>
          <button
            className="pg-cta"
            style={{ background: "#64748b" }}
            onClick={() => void reset("demo").then(() => location.reload())}
          >
            Resetar “já viu”
          </button>
        </div>
      </main>
    </>
  );
}
