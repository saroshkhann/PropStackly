import { z } from "zod";
import { AREA_UNITS } from "@/domain/area";
import { PROPERTY_STATUSES, PROPERTY_TYPES, PROPERTY_TYPE_META, statusesFor, type Property } from "@/domain/property";

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => /^\d+(\.\d+)?$/.test(value.replace(/,/g, "")), "Numbers only")
    .transform((value) => Number(value.replace(/,/g, "")));

const roomCount = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 20), "0–20")
  .transform((value) => (value === "" ? null : Number(value)));

export const propertyFormSchema = z
  .object({
    title: z.string().trim().min(8, "Use a descriptive title, e.g. 10 Marla Brand New House").max(90),
    description: z.string().trim().min(30, "Add at least a couple of sentences").max(1500, "Keep it under 1,500 characters"),
    purpose: z.enum(["sale", "rent"]),
    category: z.enum(["residential", "commercial"]),
    type: z.enum(PROPERTY_TYPES),
    status: z.enum(PROPERTY_STATUSES),
    city: z.string().min(1, "Choose a city"),
    location: z.string().trim().min(2, "Add the society or area").max(60),
    sector: z.string().trim().min(1, "Add the phase, block, or sector").max(60),
    address: z.string().trim().min(3, "Add the plot, house, or unit address").max(120),
    price: wholeNumber("Price").refine((value) => value >= 1_000, "Enter the full amount in rupees"),
    areaValue: wholeNumber("Area").refine((value) => value > 0, "Must be more than zero"),
    areaUnit: z.enum(AREA_UNITS),
    bedrooms: roomCount,
    bathrooms: roomCount,
    features: z.array(z.string()),
    amenities: z.array(z.string()),
    ownerContactId: z.string().min(1, "Link the owner from your contacts"),
    assignedAgentId: z.string(),
  })
  .superRefine((values, ctx) => {
    const meta = PROPERTY_TYPE_META[values.type];
    if (meta.category !== values.category) {
      ctx.addIssue({ code: "custom", path: ["type"], message: `${meta.label} is a ${meta.category} type` });
    }
    if (!statusesFor(values.purpose).includes(values.status)) {
      ctx.addIssue({ code: "custom", path: ["status"], message: values.purpose === "rent" ? "Rentals can't be marked sold" : "Sale listings can't be marked rented" });
    }
    if (meta.hasRooms && values.bedrooms === null) {
      ctx.addIssue({ code: "custom", path: ["bedrooms"], message: "Required for this type" });
    }
  });

export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormValues = z.output<typeof propertyFormSchema>;

export const propertyFormDefaults: PropertyFormInput = {
  title: "",
  description: "",
  purpose: "sale",
  category: "residential",
  type: "house",
  status: "available",
  city: "Lahore",
  location: "",
  sector: "",
  address: "",
  price: "",
  areaValue: "",
  areaUnit: "marla",
  bedrooms: "",
  bathrooms: "",
  features: [],
  amenities: [],
  ownerContactId: "",
  assignedAgentId: "",
};

export function propertyToFormInput(property: Property): PropertyFormInput {
  return {
    title: property.title,
    description: property.description,
    purpose: property.purpose,
    category: property.category,
    type: property.type,
    status: property.status,
    city: property.city,
    location: property.location,
    sector: property.sector,
    address: property.address,
    price: String(property.pricePKR),
    areaValue: String(property.area.value),
    areaUnit: property.area.unit,
    bedrooms: property.bedrooms === null ? "" : String(property.bedrooms),
    bathrooms: property.bathrooms === null ? "" : String(property.bathrooms),
    features: property.features,
    amenities: property.amenities,
    ownerContactId: property.ownerContactId ?? "",
    assignedAgentId: property.assignedAgentId ?? "",
  };
}

export const PAKISTAN_CITIES = ["Lahore", "Islamabad", "Rawalpindi", "Karachi", "Faisalabad", "Multan", "Peshawar"];
