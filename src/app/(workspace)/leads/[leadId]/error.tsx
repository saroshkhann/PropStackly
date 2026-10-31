"use client";

import { RouteError } from "@/components/shared/route-error";

export default function LeadDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load this lead" reset={reset} />;
}
