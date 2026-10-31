"use client";

import { RouteError } from "@/components/shared/route-error";

export default function PropertyDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load this property" reset={reset} />;
}
