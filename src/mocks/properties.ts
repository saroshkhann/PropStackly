import type { Property, PropertyStatus, PropertyType } from "@/domain/property";
import { DEMO_AGENCY_ID } from "./agency";
import { createRandom, hoursFromNow } from "./utils";

const areas = [
  "DHA Phase 5", "DHA Phase 6", "DHA Phase 8", "Gulberg III", "Bahria Town", "Johar Town",
  "Lake City", "Model Town", "Cantt", "Bahria Orchard", "Valencia Town", "Askari 11",
] as const;

const typeProfiles: Record<PropertyType, { sizes: string[]; min: number; max: number }> = {
  house: { sizes: ["5 Marla", "8 Marla", "10 Marla", "1 Kanal", "2 Kanal"], min: 18_000_000, max: 160_000_000 },
  plot: { sizes: ["5 Marla", "10 Marla", "1 Kanal", "2 Kanal"], min: 9_000_000, max: 95_000_000 },
  apartment: { sizes: ["1 Bed", "2 Bed", "3 Bed", "Penthouse"], min: 9_500_000, max: 65_000_000 },
  commercial: { sizes: ["Shop", "Office floor", "4 Marla commercial", "8 Marla commercial"], min: 25_000_000, max: 300_000_000 },
  farmhouse: { sizes: ["2 Kanal", "4 Kanal", "8 Kanal"], min: 50_000_000, max: 250_000_000 },
};

const typeWeights: PropertyType[] = ["house", "house", "house", "house", "plot", "plot", "plot", "apartment", "apartment", "commercial", "farmhouse"];
const statusWeights: PropertyStatus[] = [
  "available", "available", "available", "available", "available", "available",
  "under_offer", "under_offer", "sold", "sold", "rented", "off_market",
];

const random = createRandom(2026_10);

export const demoProperties: Property[] = Array.from({ length: 148 }, (_, index) => {
  const type = random.pick(typeWeights);
  const profile = typeProfiles[type];
  const size = random.pick(profile.sizes);
  const area = random.pick(areas);
  const status = random.pick(statusWeights);
  const raw = profile.min + random.next() * (profile.max - profile.min);
  return {
    id: `prp_${(2100 + index).toString()}`,
    agencyId: DEMO_AGENCY_ID,
    title: `${size} ${type === "plot" ? "plot" : type}`,
    type,
    purpose: status === "rented" ? "rent" : "sale",
    status,
    area,
    city: "Lahore",
    size,
    pricePKR: Math.round(raw / 500_000) * 500_000,
    listedAt: hoursFromNow(-random.int(2, 24 * 120)),
  };
});
