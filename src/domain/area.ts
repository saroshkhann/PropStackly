import { MARLA_SQFT } from "@/config/app";
import type { AreaUnit, PropertyArea } from "./property";

export const AREA_UNIT_LABELS: Record<AreaUnit, { short: string; long: string }> = {
  marla: { short: "Marla", long: "Marla" },
  kanal: { short: "Kanal", long: "Kanal" },
  sqft: { short: "sq ft", long: "Square feet" },
  sqyd: { short: "sq yd", long: "Square yards" },
};

export const AREA_UNITS = Object.keys(AREA_UNIT_LABELS) as AreaUnit[];

const SQFT_PER: Record<AreaUnit, number> = {
  marla: MARLA_SQFT,
  kanal: MARLA_SQFT * 20,
  sqft: 1,
  sqyd: 9,
};

export function toSqft(area: PropertyArea) {
  return area.value * SQFT_PER[area.unit];
}

export function convertArea(area: PropertyArea, unit: AreaUnit): PropertyArea {
  return { value: toSqft(area) / SQFT_PER[unit], unit };
}

function trim(value: number) {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return Number(value.toFixed(digits)).toLocaleString("en-PK");
}

/** Formats an area, optionally converting it; Marla/Kanal pluralise the way agents write them. */
export function formatArea(area: PropertyArea, unit: AreaUnit = area.unit) {
  const converted = unit === area.unit ? area : convertArea(area, unit);
  return `${trim(converted.value)} ${AREA_UNIT_LABELS[unit].short}`;
}

/** Price per Marla, the benchmark Pakistani buyers compare listings on. */
export function pricePerMarla(pricePKR: number, area: PropertyArea) {
  const marla = convertArea(area, "marla").value;
  return marla > 0 ? pricePKR / marla : 0;
}
