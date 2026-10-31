import { cn } from "@/lib/utils";

export interface ChartTooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
  shape?: "line" | "square";
}

/** Value-led tooltip body: the number is the strong element, the series name follows. */
export function ChartTooltipCard({ title, rows, footer }: { title: string; rows: ChartTooltipRow[]; footer?: string }) {
  return (
    <div className="min-w-44 rounded-lg border bg-popover px-3 py-2.5 text-popover-foreground shadow-raised">
      <p className="mb-1.5 text-[11.5px] font-medium text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2 text-[13px]">
            <span
              className={cn("shrink-0", row.shape === "square" ? "size-2.5 rounded-[3px]" : "h-0.5 w-3 rounded-full")}
              style={{ backgroundColor: row.color }}
              aria-hidden
            />
            <span className="font-semibold text-foreground tabular">{row.value}</span>
            <span className="text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-1.5 border-t pt-1.5 text-[11.5px] text-muted-foreground">{footer}</p>}
    </div>
  );
}

export function ChartLegend({ items }: { items: { key: string; label: string; color: string; value?: string; shape?: "line" | "square" }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2 text-[13px]">
          <span
            className={cn("shrink-0", item.shape === "square" ? "size-2.5 rounded-[3px]" : "h-0.5 w-3.5 rounded-full")}
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value && <span className="font-semibold text-foreground tabular">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
