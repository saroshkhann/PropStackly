"use client";

import { RouteError } from "@/components/shared/route-error";

export default function TasksError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load your tasks" reset={reset} />;
}
