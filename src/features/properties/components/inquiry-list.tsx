"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Inbox, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { INQUIRY_STATUS_LABELS, type InquiryStatus } from "@/domain/property";
import { notifyDemoAction } from "@/lib/demo";
import { formatDate, formatRelative } from "@/lib/format";
import type { InquiryEntry } from "../data/types";
import { SegmentedControl } from "./segmented-control";

const tones: Record<InquiryStatus, StatusTone> = {
  new: "info",
  responded: "neutral",
  visit_scheduled: "brand",
  closed: "neutral",
};

export function InquiryList({ inquiries, now }: { inquiries: InquiryEntry[]; now: string }) {
  const [filter, setFilter] = useState<"all" | "new">("all");
  const visible = filter === "new" ? inquiries.filter((i) => i.status === "new") : inquiries;
  const newCount = inquiries.filter((i) => i.status === "new").length;

  if (inquiries.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No inquiries yet"
        description="Inquiries from Zameen.com, Graana, ads, and walk-ins will be logged here once portals are connected."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label="Inquiry filter"
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All ${inquiries.length}` },
            { value: "new", label: `Awaiting reply ${newCount}` },
          ]}
        />
        <p className="text-xs text-muted-foreground">Portal inquiries are sample data; no portal is connected.</p>
      </div>
      {visible.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">Every inquiry has been answered.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {visible.map((inquiry) => (
            <li key={inquiry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 gap-3">
                <UserAvatar name={inquiry.name} size="sm" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                    <span className="font-medium text-foreground">{inquiry.name}</span>
                    <span className="text-xs text-muted-foreground tabular">{inquiry.phoneMasked}</span>
                    <span className="text-xs text-muted-foreground">via {inquiry.sourceLabel}</span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">“{inquiry.message}”</p>
                  <p className="mt-1 text-xs text-subtle-foreground" title={formatDate(inquiry.createdAt, "dateTime")}>
                    {formatRelative(inquiry.createdAt, now)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-10 sm:pl-0">
                <StatusBadge tone={tones[inquiry.status]}>{INQUIRY_STATUS_LABELS[inquiry.status]}</StatusBadge>
                {inquiry.leadId ? (
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link href={`/leads/${inquiry.leadId}`}>
                      Lead
                      <ArrowUpRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => notifyDemoAction("Convert inquiry to lead")}>
                    <UserPlus />
                    Create lead
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
