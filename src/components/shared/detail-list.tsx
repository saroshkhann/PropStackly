import { cn } from "@/lib/utils";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
}

export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col divide-y", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-[13px] text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-right text-[13px] font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
