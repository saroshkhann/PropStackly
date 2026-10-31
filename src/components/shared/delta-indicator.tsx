import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DeltaIndicator({ value, upIsGood = true, className }: { value: number; upIsGood?: boolean; className?: string }) {
  const positive = value >= 0;
  const good = positive === upIsGood;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular",
        good ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{positive ? "Up" : "Down"}</span>
      {formatPercent(Math.abs(value))}
    </span>
  );
}
