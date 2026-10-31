import { toast } from "sonner";

/** Every UI-only action routes here so the prototype never implies that something was saved. */
export function notifyDemoAction(action: string, detail = "This is a prototype — nothing was saved. It will be wired up in a later batch.") {
  toast(`${action} · demo only`, { description: detail });
}
