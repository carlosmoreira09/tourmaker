import type { Tour } from "@tourmaker/react";

/** Demo tour used by the playground. This is exactly the shape the Phase 2 AI
 *  layer will generate. */
export const demoTour: Tour = {
  id: "demo",
  steps: [
    {
      title: "Bem-vindo ao TourMaker 👋",
      content:
        "Este é um passo centralizado, sem elemento âncora — perfeito para uma tela de boas-vindas. Use as setas do teclado ou os botões.",
    },
    {
      target: "#feature-search",
      title: "Busca",
      content: "Encontre qualquer coisa rapidamente por aqui.",
      placement: "bottom",
    },
    {
      target: "#feature-profile",
      title: "Seu perfil",
      content: "Gerencie sua conta e preferências neste menu.",
      placement: "right",
    },
    {
      target: "#feature-settings",
      title: "Configurações",
      content: "Ajuste o app do seu jeito. É isso — tour concluído!",
      placement: "left",
    },
  ],
};
