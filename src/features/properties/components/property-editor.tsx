"use client";

import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import type { PropertyFormOptions, PropertyListItem } from "../data/types";
import { PropertyForm } from "./property-form";
import { usePropertySession } from "./property-session";

interface PropertyEditorProps {
  property?: PropertyListItem;
  options: PropertyFormOptions;
  now: string;
  agencyId: string;
}

/** Page frame for creating or editing a listing; edits made earlier in the session are pre-filled. */
export function PropertyEditor({ property, options, now, agencyId }: PropertyEditorProps) {
  const session = usePropertySession();
  const current = property ? session.resolve(property) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/properties">Properties</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {current && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/properties/${current.id}`} className="max-w-[14rem] truncate">
                      {current.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{current ? "Edit" : "New listing"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeader
          title={current ? "Edit listing" : "Add property"}
          description={current ? "Update details, pricing, photos, and ownership." : "Create a listing your team can match with buyers and tenants."}
        />
      </div>
      <PropertyForm key={current?.updatedAt ?? "new"} property={current} options={options} now={now} agencyId={agencyId} />
    </div>
  );
}
