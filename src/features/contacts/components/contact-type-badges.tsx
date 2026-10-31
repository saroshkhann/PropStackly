import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { CONTACT_TYPE_LABELS, type ContactType } from "@/domain/contact";

const typeTones: Record<ContactType, StatusTone> = {
  buyer: "info",
  seller: "warning",
  landlord: "violet",
  tenant: "neutral",
  investor: "success",
};

export function ContactTypeBadges({ types }: { types: ContactType[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {types.map((type) => (
        <StatusBadge key={type} tone={typeTones[type]} className="h-5 px-2 text-[11px]">
          {CONTACT_TYPE_LABELS[type]}
        </StatusBadge>
      ))}
    </span>
  );
}
