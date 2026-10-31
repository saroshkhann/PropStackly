import { APP_NAME } from "@/config/app";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-brand text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_1px_2px_oklch(0.2_0.05_262/0.3)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none">
        <path d="M5 10.2 12 5l7 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6" y="12.5" width="12" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="6" y="16.6" width="12" height="2.6" rx="1.3" fill="currentColor" opacity="0.55" />
      </svg>
    </span>
  );
}

export function BrandLogo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
