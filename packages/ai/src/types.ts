/** A meaningful, visible element distilled from the live page. */
export interface Candidate {
  index: number;
  tag: string;
  role: string | null;
  /** Visible text (or placeholder/aria-label for inputs), truncated. */
  text: string;
  /** A resilient CSS selector that uniquely resolves to this element. */
  selector: string;
  ariaLabel: string | null;
  id: string | null;
}

/** One step the AI proposes, referencing a candidate by index. */
export interface StepPlan {
  /** Candidate index, or -1 for a centered step with no anchor (e.g. welcome). */
  elementIndex: number;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "auto";
}

export interface GenerateOptions {
  url: string;
  route: string;
  prompt: string;
  id: string;
  out: string;
  headed: boolean;
  model: string;
}
