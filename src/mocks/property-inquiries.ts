import type { LeadSourceId, LeadStatus } from "@/domain/lead";
import type { InquiryStatus, PropertyInquiry } from "@/domain/property";
import { DEMO_AGENCY_ID } from "./agency";
import { demoLeads } from "./leads";
import { demoProperties, interestedPropertyIds } from "./properties";
import { createRandom } from "./utils";

const random = createRandom(6060);

const statusFromLead: Record<LeadStatus, InquiryStatus> = {
  new: "new",
  contacted: "responded",
  qualified: "responded",
  site_visit: "visit_scheduled",
  negotiation: "visit_scheduled",
  won: "closed",
  lost: "closed",
};

const portalNames = [
  "Usman Ghani", "Saba Tariq", "Hamid Raza", "Areeba Khan", "Zeeshan Haider", "Mariam Iqbal", "Ali Hassan Shah",
  "Javeria Aslam", "Shoaib Anwar", "Rida Fatima", "Kamran Yousaf", "Sana Mirza", "Waleed Ahmed", "Hafsa Noor",
];
const portalMessages = [
  "Is this still available? Please share the final demand.",
  "Can I visit this weekend? Interested if the price is negotiable.",
  "Please send more pictures and the exact location pin.",
  "Is bank financing possible on this property?",
  "What are the transfer charges and is possession immediate?",
  "Looking for a family home; is the area quiet and secure?",
];
const portalSources: LeadSourceId[] = ["zameen", "zameen", "graana", "meta_ads", "whatsapp", "website"];

let sequence = 0;
const nextId = () => `inq_${(++sequence).toString().padStart(4, "0")}`;

const fromLeads: PropertyInquiry[] = demoLeads.flatMap((lead) =>
  interestedPropertyIds(lead.id, lead.status === "new" ? 1 : 3).map((propertyId, index) => ({
    id: nextId(),
    agencyId: DEMO_AGENCY_ID,
    propertyId,
    leadId: lead.id,
    name: lead.name,
    phoneMasked: lead.phoneMasked,
    sourceId: lead.sourceId,
    message: index === 0 ? `Interested in ${lead.interest.toLowerCase()} options around ${lead.location.split(",")[0]}.` : "Shared by the agent as a matching option.",
    status: index === 0 ? statusFromLead[lead.status] : "responded",
    createdAt: new Date(new Date(lead.createdAt).getTime() + index * 6 * 3_600_000).toISOString(),
  })),
);

const fromPortals: PropertyInquiry[] = demoProperties
  .filter((property) => property.status !== "off_market")
  .flatMap((property) => {
    const count = property.status === "available" ? random.int(0, 4) : random.int(0, 2);
    const listed = new Date(property.listedAt).getTime();
    const updated = new Date(property.updatedAt).getTime();
    return Array.from({ length: count }, (): PropertyInquiry => ({
      id: nextId(),
      agencyId: DEMO_AGENCY_ID,
      propertyId: property.id,
      leadId: null,
      name: random.pick(portalNames),
      phoneMasked: `03${random.int(0, 4)}${random.int(0, 9)} ••• ${random.int(1000, 9999)}`,
      sourceId: random.pick(portalSources),
      message: random.pick(portalMessages),
      status: random.pick<InquiryStatus>(["new", "responded", "responded", "closed"]),
      createdAt: new Date(listed + random.next() * Math.max(1, updated - listed)).toISOString(),
    }));
  });

export const demoPropertyInquiries: PropertyInquiry[] = [...fromLeads, ...fromPortals].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);
