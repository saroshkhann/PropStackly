"use client";

import { RouteError } from "@/components/shared/route-error";

export default function ContactsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load your contacts" reset={reset} />;
}
