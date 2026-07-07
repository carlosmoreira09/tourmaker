"use client";

import { useTour } from "@tourmaker/react";

export default function Home() {
  const { start } = useTour();

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
          Clique abaixo para iniciar o tour de demonstração. Passo 1 é uma tela
          centralizada; os seguintes destacam elementos reais da navegação. Use
          as setas ← → e Esc.
        </p>
        <button className="pg-cta" onClick={() => start("demo")}>
          Iniciar tour ▶
        </button>
      </main>
    </>
  );
}
