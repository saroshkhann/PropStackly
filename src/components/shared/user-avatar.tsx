import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const tints = [
  "bg-[oklch(0.94_0.03_250)] text-[oklch(0.4_0.1_250)]",
  "bg-[oklch(0.94_0.035_160)] text-[oklch(0.4_0.09_160)]",
  "bg-[oklch(0.95_0.04_70)] text-[oklch(0.45_0.1_60)]",
  "bg-[oklch(0.94_0.03_300)] text-[oklch(0.42_0.12_300)]",
  "bg-[oklch(0.95_0.03_20)] text-[oklch(0.45_0.13_25)]",
  "bg-[oklch(0.94_0.025_200)] text-[oklch(0.4_0.08_210)]",
];

function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length];
}

const sizes = { xs: "size-6 text-[10px]", sm: "size-7 text-[11px]", md: "size-8 text-xs", lg: "size-9 text-sm" };

export function UserAvatar({ name, size = "md", className }: { name: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <Avatar className={cn(sizes[size], className)}>
      <AvatarFallback className={cn("font-semibold", tintFor(name))}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
