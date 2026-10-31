import type { PipelineStageId } from "@/domain/deal";

/** Column accents: open stages step along one hue toward closing; won and lost use status colours. */
export const stageAccent: Record<PipelineStageId, string> = {
  inquiry: "#9ec5f4",
  qualified: "#6da7ec",
  site_visit: "#3987e5",
  negotiation: "#256abf",
  token: "#184f95",
  closed_won: "var(--success)",
  closed_lost: "var(--danger)",
};
