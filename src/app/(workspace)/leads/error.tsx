"use client";

import { RouteError } from "@/components/shared/route-error";

export default function LeadsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load your leads" reset={reset} />;
}
