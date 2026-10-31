"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <EmptyState
        icon={TriangleAlert}
        title="We couldn't load your dashboard"
        description="Something went wrong while preparing your agency's data. Try again in a moment."
        action={
          <Button variant="outline" onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
        }
        className="py-16"
      />
    </div>
  );
}
