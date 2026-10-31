"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

export function RouteError({ title, reset }: { title: string; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <EmptyState
        icon={TriangleAlert}
        title={title}
        description="Something went wrong while loading this page. Try again in a moment."
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
