"use client";

import { RouteError } from "@/components/shared/route-error";

export default function SiteVisitsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load site visits" reset={reset} />;
}
