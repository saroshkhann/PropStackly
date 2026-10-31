"use client";

import { RouteError } from "@/components/shared/route-error";

export default function PipelineError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="We couldn't load the pipeline" reset={reset} />;
}
