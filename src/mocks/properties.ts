import { convertArea } from "@/domain/area";
import {
  PROPERTY_TYPE_META,
  type AreaUnit,
  type ListingPurpose,
  type Property,
  type PropertyImage,
  type PropertyStatus,
  type PropertyType,
} from "@/domain/property";
import { DEMO_AGENCY_ID, demoMembers } from "./agency";
import { demoContacts } from "./contacts";
import { createRandom, hoursFromNow } from "./utils";

interface LocationProfile {
  name: string;
  sectors: string[];
  /** Typical residential plot price per Marla, in PKR. */
  plotPerMarla: number;
  types: PropertyType[];
}

const locations: LocationProfile[] = [
  { name: "DHA Phase 5", sectors: ["Block A", "Block C", "Block E", "Block G", "Block L"], plotPerMarla: 3_400_000, types: ["house", "house", "plot", "portion", "commercial_plot", "shop"] },
  { name: "DHA Phase 6", sectors: ["Block B", "Block C", "Block D", "Block J", "Block N"], plotPerMarla: 2_700_000, types: ["house", "house", "plot", "plot", "portion", "shop"] },
  { name: "DHA Phase 8", sectors: ["Ex Air Avenue", "Park View", "Block U", "Block W"], plotPerMarla: 1_900_000, types: ["plot", "plot", "house"] },
  { name: "Gulberg III", sectors: ["Block E", "Block H", "Main Boulevard", "MM Alam Road"], plotPerMarla: 5_500_000, types: ["apartment", "apartment", "office", "shop", "building", "house"] },
  { name: "Bahria Town", sectors: ["Sector C, Jasmine Block", "Sector E, Talha Block", "Sector B, Overseas A", "Sector D, Nargis Block"], plotPerMarla: 1_500_000, types: ["house", "house", "plot", "apartment", "shop", "portion"] },
  { name: "Johar Town", sectors: ["Block J", "Block R", "Phase 2, Block Q", "Block G"], plotPerMarla: 1_800_000, types: ["house", "portion", "plot", "office", "shop"] },
  { name: "Lake City", sectors: ["Sector M-2", "Sector M-3A", "Sector M-7"], plotPerMarla: 1_600_000, types: ["house", "plot", "plot"] },
  { name: "Model Town", sectors: ["Block K", "Block M", "Block F"], plotPerMarla: 3_000_000, types: ["house", "portion"] },
  { name: "Askari 11", sectors: ["Sector B", "Sector C"], plotPerMarla: 1_700_000, types: ["house", "apartment"] },
  { name: "Bahria Orchard", sectors: ["Phase 1, Eastern Block", "Phase 2, OLC A"], plotPerMarla: 800_000, types: ["apartment", "plot", "house"] },
  { name: "Bedian Road", sectors: ["Green Acres", "Palm Farms"], plotPerMarla: 450_000, types: ["farmhouse", "farmhouse"] },
  { name: "Sundar Industrial Estate", sectors: ["Phase 1", "Phase 2"], plotPerMarla: 900_000, types: ["warehouse", "warehouse"] },
];

const sizes: Record<PropertyType, { value: number; unit: AreaUnit }[]> = {
  house: [{ value: 5, unit: "marla" }, { value: 8, unit: "marla" }, { value: 10, unit: "marla" }, { value: 1, unit: "kanal" }, { value: 2, unit: "kanal" }],
  apartment: [{ value: 850, unit: "sqft" }, { value: 1250, unit: "sqft" }, { value: 1800, unit: "sqft" }, { value: 2600, unit: "sqft" }],
  portion: [{ value: 10, unit: "marla" }, { value: 1, unit: "kanal" }],
  plot: [{ value: 5, unit: "marla" }, { value: 10, unit: "marla" }, { value: 1, unit: "kanal" }, { value: 2, unit: "kanal" }],
  farmhouse: [{ value: 2, unit: "kanal" }, { value: 4, unit: "kanal" }, { value: 8, unit: "kanal" }],
  shop: [{ value: 250, unit: "sqft" }, { value: 420, unit: "sqft" }, { value: 650, unit: "sqft" }],
  office: [{ value: 1200, unit: "sqft" }, { value: 2400, unit: "sqft" }, { value: 4500, unit: "sqft" }],
  commercial_plot: [{ value: 4, unit: "marla" }, { value: 8, unit: "marla" }],
  warehouse: [{ value: 6000, unit: "sqft" }, { value: 12000, unit: "sqft" }],
  building: [{ value: 8, unit: "marla" }, { value: 1, unit: "kanal" }],
};

/** Built value relative to the land at plot rates. */
const priceMultiplier: Record<PropertyType, number> = {
  house: 2.1,
  apartment: 1.6,
  portion: 1.2,
  plot: 1,
  farmhouse: 1.8,
  shop: 4.5,
  office: 2.4,
  commercial_plot: 3.2,
  warehouse: 1.4,
  building: 4,
};

const rentable: PropertyType[] = ["house", "apartment", "portion", "shop", "office", "warehouse"];

const adjectives: Record<PropertyType, string[]> = {
  house: ["Brand New Modern", "Spanish Style", "Well-Maintained", "Designer", "Luxury"],
  apartment: ["Fully Serviced", "Luxury", "Modern", "Corner"],
  portion: ["Separate Entrance", "Ground Floor", "Upper"],
  plot: ["Possession", "Corner", "Park Facing", "Prime Location"],
  farmhouse: ["Landscaped", "Gated", "Luxury"],
  shop: ["Ground Floor", "Main Road", "Mezzanine"],
  office: ["Furnished", "Corporate", "Open Plan"],
  commercial_plot: ["Main Boulevard", "Corner", "Prime"],
  warehouse: ["Covered", "Industrial"],
  building: ["Commercial", "Rented Out"],
};

const typeNouns: Record<PropertyType, string> = {
  house: "House",
  apartment: "Apartment",
  portion: "Portion",
  plot: "Plot",
  farmhouse: "Farmhouse",
  shop: "Shop",
  office: "Office Space",
  commercial_plot: "Commercial Plot",
  warehouse: "Warehouse",
  building: "Building",
};

const residentialFeatures = ["Corner", "Park facing", "Double unit", "Basement", "Servant quarter", "Drawing & dining", "Store room", "Solar system", "Lawn", "Possession ready", "Bank financing eligible", "Furnished"];
const commercialFeatures = ["Corner", "Main boulevard", "Basement", "Lift", "Possession ready", "Solar system", "Store room"];
const plotFeatures = ["Corner", "Park facing", "Main boulevard", "Possession ready"];
const amenityPool = ["Sui gas", "Electricity backup", "Water bore", "24/7 security", "Gated community", "Mosque nearby", "School nearby", "Hospital nearby", "Commercial area nearby", "Parking", "Gym", "Swimming pool"];

const imageLabels: Record<PropertyType, string[]> = {
  house: ["Front elevation", "Drawing room", "Kitchen", "Master bedroom", "Lawn", "Street view"],
  apartment: ["Building exterior", "Interior", "Kitchen", "Master bedroom", "Street view"],
  portion: ["Front elevation", "Interior", "Kitchen", "Master bedroom"],
  plot: ["Plot map", "Street view", "Front elevation"],
  farmhouse: ["Front elevation", "Lawn", "Interior", "Street view"],
  shop: ["Building exterior", "Interior", "Street view"],
  office: ["Building exterior", "Interior", "Street view"],
  commercial_plot: ["Plot map", "Street view"],
  warehouse: ["Building exterior", "Interior", "Street view"],
  building: ["Building exterior", "Interior", "Street view"],
};

const random = createRandom(2026_10);

function sample<T>(items: readonly T[], min: number, max: number) {
  const pool = [...items];
  const count = Math.min(pool.length, random.int(min, max));
  const picked: T[] = [];
  while (picked.length < count) picked.push(pool.splice(random.int(0, pool.length - 1), 1)[0]!);
  return picked;
}

function sizeLabel(area: { value: number; unit: AreaUnit }) {
  if (area.unit === "marla") return `${area.value} Marla`;
  if (area.unit === "kanal") return `${area.value} Kanal`;
  return `${area.value.toLocaleString("en-PK")} Sq Ft`;
}

function rooms(type: PropertyType, marla: number) {
  if (!PROPERTY_TYPE_META[type].hasRooms) return { bedrooms: null, bathrooms: null };
  const bedrooms =
    type === "apartment" ? Math.max(1, Math.min(4, Math.round(marla / 2.2))) :
    type === "portion" ? random.int(2, 3) :
    type === "farmhouse" ? random.int(4, 6) :
    marla <= 5 ? 3 : marla <= 8 ? 4 : marla <= 10 ? random.int(4, 5) : marla <= 20 ? random.int(5, 6) : random.int(6, 7);
  return { bedrooms, bathrooms: bedrooms + (random.next() > 0.5 ? 1 : 0) };
}

function address(type: PropertyType, sector: string) {
  const number = random.int(2, 480);
  if (type === "apartment") return `Flat ${random.int(1, 12)}${random.pick(["A", "B", "C"])}, Tower ${random.int(1, 4)}, ${sector}`;
  if (type === "shop" || type === "office") return `Unit ${number}, ${random.pick(["Plaza 12", "Trade Centre", "Business Hub", "City Arcade"])}, ${sector}`;
  if (type === "plot" || type === "commercial_plot") return `Plot ${number}, ${sector}`;
  if (type === "warehouse") return `Warehouse ${number}, ${sector}`;
  return `House ${number}, Street ${random.int(1, 30)}, ${sector}`;
}

function describe(type: PropertyType, purpose: ListingPurpose, location: string, size: string, features: string[], bedrooms: number | null) {
  const featureText = features.slice(0, 3).map((f) => f.toLowerCase()).join(", ");
  const intro: Record<PropertyType, string> = {
    house: `${size} house${bedrooms ? ` with ${bedrooms} bedrooms` : ""} in ${location}, built with quality materials and a practical family layout.`,
    apartment: `${size} apartment in ${location} with wide windows, a modern kitchen, and access to building amenities.`,
    portion: `Self-contained ${size} portion in ${location} with a separate entrance, ideal for a small family.`,
    plot: `${size} residential plot in ${location}, all dues clear and ready for transfer.`,
    farmhouse: `${size} farmhouse on ${location} with landscaped grounds, perfect for weekends and family events.`,
    shop: `${size} shop in ${location} with strong footfall and frontage on a busy commercial street.`,
    office: `${size} office floor in ${location} suited to corporate or IT teams, with dedicated parking.`,
    commercial_plot: `${size} commercial plot in ${location}, approved for a multi-storey building.`,
    warehouse: `${size} covered warehouse in ${location} with container access and three-phase electricity.`,
    building: `${size} commercial building in ${location} with ground-floor shops and offices above.`,
  };
  const outro = purpose === "rent" ? "Available for rent with two months' advance and one month's security." : "Transfer can be arranged quickly; documents verified by our team.";
  return `${intro[type]}${featureText ? ` Highlights include ${featureText}.` : ""} ${outro}`;
}

const agents = demoMembers.filter((member) => member.role !== "owner").map((member) => member.id);
const sellerPool = demoContacts.filter((c) => c.types.includes("seller")).map((c) => c.id);
const landlordPool = demoContacts.filter((c) => c.types.includes("landlord")).map((c) => c.id);
let sellerCursor = 0;
let landlordCursor = 0;

export const demoProperties: Property[] = Array.from({ length: 72 }, (_, index) => {
  const location = locations[index % locations.length]!;
  const type = random.pick(location.types);
  const meta = PROPERTY_TYPE_META[type];
  const area = random.pick(sizes[type]);
  const marla = convertArea(area, "marla").value;
  const purpose: ListingPurpose = rentable.includes(type) && random.next() < 0.3 ? "rent" : "sale";
  const salePrice = marla * location.plotPerMarla * priceMultiplier[type] * (0.85 + random.next() * 0.3);
  const pricePKR =
    purpose === "rent" ? Math.round((salePrice * 0.0028) / 5_000) * 5_000 : Math.round(salePrice / 500_000) * 500_000;
  const statusRoll = random.next();
  const status: PropertyStatus =
    statusRoll < 0.62 ? "available" : statusRoll < 0.76 ? "under_offer" : statusRoll < 0.9 ? (purpose === "sale" ? "sold" : "rented") : "off_market";
  const sector = random.pick(location.sectors);
  const features = sample(meta.category === "commercial" ? commercialFeatures : type === "plot" ? plotFeatures : residentialFeatures, 2, 5);
  const amenities = sample(amenityPool, 3, 7);
  const { bedrooms, bathrooms } = rooms(type, marla);
  const size = sizeLabel(area);
  const labels = imageLabels[type];
  const images: PropertyImage[] = sample(labels, 2, labels.length)
    .sort((a, b) => labels.indexOf(a) - labels.indexOf(b))
    .map((label, i) => ({
    id: `img_${index}_${i}`,
    label,
    source: { kind: "sample", tone: (index + i) % 6 },
  }));
  const pool = purpose === "rent" && landlordPool.length ? landlordPool : sellerPool;
  const ownerContactId = pool === landlordPool ? landlordPool[landlordCursor++ % landlordPool.length]! : sellerPool[sellerCursor++ % sellerPool.length]!;
  const listedHoursAgo = random.int(6, 24 * 150);

  return {
    id: `prp_${(2100 + index).toString()}`,
    agencyId: DEMO_AGENCY_ID,
    title: `${size} ${random.pick(adjectives[type])} ${typeNouns[type]}`,
    description: describe(type, purpose, location.name, size, features, bedrooms),
    type,
    category: meta.category,
    purpose,
    status,
    city: "Lahore",
    location: location.name,
    sector,
    address: address(type, sector),
    pricePKR,
    area,
    bedrooms,
    bathrooms,
    features,
    amenities,
    images,
    ownerContactId,
    assignedAgentId: index % 17 === 5 ? null : random.pick(agents),
    listedAt: hoursFromNow(-listedHoursAgo),
    updatedAt: hoursFromNow(-random.int(1, Math.min(listedHoursAgo, 24 * 20))),
  };
});

const available = demoProperties.filter((p) => p.status === "available" || p.status === "under_offer");

/** Listings shared with or shortlisted by a lead. */
export function interestedPropertyIds(leadId: string, count: number) {
  const seed = [...leadId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return [...new Set(Array.from({ length: count }, (_, i) => available[(seed * 7 + i * 13) % available.length]!.id))];
}
