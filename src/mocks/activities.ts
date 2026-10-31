import type { Activity, ActivityKind } from "@/domain/activity";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import { DEMO_AGENCY_ID, demoMembers } from "./agency";
import { demoContacts } from "./contacts";
import { leadSources } from "./lead-sources";
import { demoLeads } from "./leads";
import { createRandom } from "./utils";

const random = createRandom(9021);

const progression: LeadStatus[] = ["new", "contacted", "qualified", "site_visit", "negotiation", "won"];

const callNotes = [
  "Discussed budget and preferred blocks. Client wants possession within 3 months.",
  "Confirmed requirements. Prefers a park-facing unit and asked about transfer charges.",
  "Client asked for recent sale prices in the area to benchmark the offer.",
  "Spoke briefly; client travelling, asked to call back after Jummah.",
  "Walked through payment plan options and FBR valuation implications.",
];
const whatsappNotes = [
  "Shared 3 listings with photos and location pins.",
  "Sent floor plans and the society map.",
  "Shared the updated price sheet and possession schedule.",
  "Sent a short video walkthrough of the property.",
];
const notes = [
  "Client is comparing with a Bahria Town option — highlight DHA resale value.",
  "Spouse to join for the next visit. Prefers weekend afternoons.",
  "Needs bank financing letter before committing to token.",
  "Very price sensitive; seller has some flexibility on the final number.",
  "Overseas relatives funding part of the purchase; documents via email.",
];
const visitNotes = [
  "Client liked the layout and natural light; concerned about the street width.",
  "Visited with family. Positive on location, wants a second look at the kitchen.",
  "Property matched expectations. Asked for owner's best price.",
];

const nameById = new Map(demoMembers.map((m) => [m.id, m.name]));
const ownerId = demoMembers.find((m) => m.role === "owner")!.id;

function between(startIso: string, endIso: string, fraction: number) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return new Date(start + (end - start) * fraction).toISOString();
}

let sequence = 0;
function entry(kind: ActivityKind, fields: Omit<Activity, "id" | "agencyId" | "kind">): Activity {
  sequence += 1;
  return { id: `act_${sequence.toString().padStart(4, "0")}`, agencyId: DEMO_AGENCY_ID, kind, ...fields };
}

const leadActivities = demoLeads.flatMap((lead) => {
  const source = leadSources.find((s) => s.id === lead.sourceId)?.label ?? "Other";
  const base = { leadId: lead.id, contactId: lead.contactId };
  const items: Activity[] = [
    entry("created", { ...base, actorId: null, title: `Lead captured from ${source}`, body: `${lead.interest} · ${lead.location}`, createdAt: lead.createdAt }),
  ];
  if (lead.assignedToId) {
    items.push(entry("assignment", {
      ...base,
      actorId: ownerId,
      title: `Assigned to ${nameById.get(lead.assignedToId)}`,
      body: null,
      createdAt: between(lead.createdAt, lead.lastActivityAt, 0.05),
    }));
  }

  const reached = lead.status === "lost" ? random.int(1, 3) : Math.max(0, progression.indexOf(lead.status));
  const actorId = lead.assignedToId;
  for (let step = 1; step <= reached; step += 1) {
    const at = (offset: number) => between(lead.createdAt, lead.lastActivityAt, Math.min(1, (step - 1 + offset) / reached));
    const status = progression[step]!;
    if (status === "contacted") {
      items.push(entry("call", { ...base, actorId, title: `Outbound call · ${random.int(2, 12)} min`, body: random.pick(callNotes), createdAt: at(0.35) }));
      items.push(entry("whatsapp", { ...base, actorId, title: "WhatsApp message sent", body: random.pick(whatsappNotes), createdAt: at(0.6) }));
    }
    if (status === "qualified") {
      items.push(entry("note", { ...base, actorId, title: "Note added", body: random.pick(notes), createdAt: at(0.5) }));
    }
    if (status === "site_visit") {
      items.push(entry("site_visit", { ...base, actorId, title: "Site visit completed", body: random.pick(visitNotes), createdAt: at(0.7) }));
    }
    if (status === "negotiation") {
      items.push(entry("call", { ...base, actorId, title: `Price discussion · ${random.int(5, 20)} min`, body: "Client made an initial offer; relayed to the owner.", createdAt: at(0.5) }));
    }
    items.push(entry("status_change", { ...base, actorId, title: `Status changed to ${LEAD_STATUS_LABELS[status]}`, body: null, createdAt: at(1) }));
  }
  if (lead.status === "lost") {
    items.push(entry("status_change", { ...base, actorId, title: "Marked as lost", body: "Client bought through another agency.", createdAt: lead.lastActivityAt }));
  }
  return items;
});

const leadContactIds = new Set(demoLeads.map((lead) => lead.contactId));

const ownerActivities = demoContacts
  .filter((contact) => !leadContactIds.has(contact.id) && contact.lastContactedAt)
  .flatMap((contact) => [
    entry("created", { leadId: null, contactId: contact.id, actorId: contact.ownerId, title: "Contact added", body: contact.occupation, createdAt: contact.createdAt }),
    entry("note", {
      leadId: null,
      contactId: contact.id,
      actorId: contact.ownerId,
      title: "Listing mandate signed",
      body: "Owner agreed to list with Crescent Realty at the discussed asking price.",
      createdAt: between(contact.createdAt, contact.lastContactedAt!, 0.3),
    }),
    entry("call", {
      leadId: null,
      contactId: contact.id,
      actorId: contact.ownerId,
      title: `Owner update call · ${random.int(3, 9)} min`,
      body: "Shared buyer feedback from recent viewings and discussed pricing.",
      createdAt: contact.lastContactedAt!,
    }),
  ]);

export const demoActivities: Activity[] = [...leadActivities, ...ownerActivities].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);
