import { UserRoundX } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

interface AgentChipProps {
  name: string | null;
  /** Show only the first name to save space in dense tables. */
  short?: boolean;
  className?: string;
}

export function AgentChip({ name, short = false, className }: AgentChipProps) {
  if (!name) {
    return (
      <span className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
        <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-border-strong">
          <UserRoundX className="size-3" aria-hidden />
        </span>
        Unassigned
      </span>
    );
  }
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <UserAvatar name={name} size="xs" />
      <span className="truncate text-secondary-foreground" title={name}>
        {short ? name.split(" ")[0] : name}
      </span>
    </span>
  );
}
