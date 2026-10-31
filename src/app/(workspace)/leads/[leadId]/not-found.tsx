import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function LeadNotFound() {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <EmptyState
        icon={SearchX}
        title="Lead not found"
        description="It may have been removed, or it belongs to a different agency workspace."
        action={<Button asChild variant="outline"><Link href="/leads">Back to leads</Link></Button>}
        className="py-16"
      />
    </div>
  );
}
