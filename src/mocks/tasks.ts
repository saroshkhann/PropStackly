import type { Task, TaskPriority, TaskStatus, TaskType } from "@/domain/task";
import { DEMO_AGENCY_ID } from "./agency";
import { demoLeads } from "./leads";
import { atLocalTime, createRandom } from "./utils";

type Seed = [
  id: string,
  title: string,
  type: TaskType,
  priority: TaskPriority,
  status: TaskStatus,
  day: number,
  hour: number,
  minute: number,
  leadName: string | null,
  assignedToId: string,
  notes?: string,
];

const seeds: Seed[] = [
  ["tsk_001", "Share revised payment plan", "whatsapp", "high", "todo", 0, 11, 15, "Mehwish Akram", "usr_hassan", "Client asked for a 3-instalment option."],
  ["tsk_002", "Confirm budget and financing", "call", "medium", "todo", 0, 14, 0, "Faisal Iqbal", "usr_ayesha"],
  ["tsk_003", "Send shortlisted listings", "whatsapp", "medium", "todo", 0, 17, 30, "Rabia Anwar", "usr_usman"],
  ["tsk_004", "Token agreement meeting", "meeting", "high", "todo", 1, 13, 0, "Hira Shahid", "usr_ayesha", "Bring draft agreement and owner's CNIC copy."],
  ["tsk_005", "Introductory call", "call", "high", "todo", 1, 10, 0, "Kashif Mehmood", "usr_bilal"],
  ["tsk_006", "Check bank financing status", "call", "medium", "done", -1, 16, 0, "Mehwish Akram", "usr_hassan"],
  ["tsk_007", "Send token agreement draft", "email", "high", "in_progress", -1, 18, 0, "Maryam Zafar", "usr_bilal", "Legal is reviewing clause 4 on possession date."],
  ["tsk_008", "Follow up on Model Town sale", "whatsapp", "medium", "todo", 2, 12, 0, "Maryam Zafar", "usr_bilal"],
  ["tsk_009", "Revive conversation", "whatsapp", "low", "todo", -2, 15, 0, "Waqas Chaudhry", "usr_hassan"],
  ["tsk_010", "Share commercial plot options", "email", "medium", "todo", 3, 11, 0, "Faisal Iqbal", "usr_ayesha"],
  ["tsk_011", "Discuss counter-offer", "meeting", "high", "in_progress", 0, 9, 30, "Zubair Khan", "usr_ayesha", "Owner may accept 2% below asking."],
  ["tsk_012", "Collect CNIC and title documents", "document", "high", "todo", -1, 12, 0, "Asad Mirza", "usr_usman", "Needed before transfer at the society office."],
  ["tsk_013", "Renew featured listings on Zameen.com", "admin", "medium", "todo", 0, 16, 0, null, "usr_fatima"],
  ["tsk_014", "Upload new photos for Gulberg apartments", "admin", "low", "todo", 2, 15, 0, null, "usr_zainab"],
  ["tsk_015", "Weekly pipeline review", "meeting", "medium", "todo", 4, 10, 0, null, "usr_hamza", "Bring stalled negotiation deals."],
  ["tsk_019", "Approve October commission payouts", "admin", "high", "todo", 0, 15, 0, null, "usr_hamza"],
  ["tsk_020", "Review new exclusive mandate terms", "document", "medium", "in_progress", -1, 17, 0, null, "usr_hamza", "Chaudhry Nasir wants 1.5% commission."],
  ["tsk_021", "Call Maryam Zafar about DHA offer", "call", "high", "todo", 1, 12, 30, "Maryam Zafar", "usr_hamza"],
  ["tsk_016", "Prepare transfer file for society", "document", "medium", "todo", 5, 12, 0, "Arslan Qadir", "usr_ayesha"],
  ["tsk_017", "Call about rental renewal", "call", "low", "done", -2, 11, 0, "Anum Tariq", "usr_zainab"],
  ["tsk_018", "Send floor plans", "email", "low", "done", -3, 14, 0, "Talha Rashid", "usr_bilal"],
];

const templates: { title: string; type: TaskType }[] = [
  { title: "Follow-up call", type: "call" },
  { title: "Send matching listings", type: "whatsapp" },
  { title: "Check if still looking", type: "call" },
  { title: "Share price comparison", type: "email" },
  { title: "Schedule a viewing", type: "call" },
];

const random = createRandom(8080);
const leadByName = new Map(demoLeads.map((lead) => [lead.name, lead]));

const generated: Seed[] = demoLeads
  .filter((lead) => lead.assignedToId && ["new", "contacted", "qualified"].includes(lead.status))
  .filter((lead) => !seeds.some((seed) => seed[8] === lead.name))
  .map((lead, index) => {
    const template = random.pick(templates);
    const day = random.int(-3, 6);
    return [
      `tsk_${(100 + index).toString()}`,
      template.title,
      template.type,
      lead.priority === "hot" ? "high" : lead.priority === "warm" ? "medium" : "low",
      day < 0 && random.next() < 0.45 ? "done" : "todo",
      day,
      random.int(10, 18),
      random.pick([0, 15, 30, 45]),
      lead.name,
      lead.assignedToId!,
    ];
  });

export const demoTasks: Task[] = [...seeds, ...generated]
  .map(([id, title, type, priority, status, day, hour, minute, leadName, assignedToId, notes]): Task => {
    const dueAt = atLocalTime(day, hour, minute);
    return {
      id,
      agencyId: DEMO_AGENCY_ID,
      title,
      notes: notes ?? null,
      type,
      priority,
      status,
      dueAt,
      leadId: leadName ? (leadByName.get(leadName)?.id ?? null) : null,
      dealId: null,
      assignedToId,
      createdAt: atLocalTime(Math.min(day, 0) - 2, 9),
      completedAt: status === "done" ? dueAt : null,
    };
  })
  .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
