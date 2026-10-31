"use client";

import { RouteError } from "@/components/shared/route-error";

export default function PropertiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load your properties" reset={reset} />;
}
