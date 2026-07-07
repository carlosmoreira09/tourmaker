import { createContext, useContext } from "react";
import type { TourEngine } from "tourmaker-core";

export const TourContext = createContext<TourEngine | null>(null);

export function useTourEngine(): TourEngine {
  const engine = useContext(TourContext);
  if (!engine) {
    throw new Error("useTour() must be used inside a <TourProvider>.");
  }
  return engine;
}
