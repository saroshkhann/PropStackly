import { PropertySessionProvider } from "@/features/properties/components/property-session";

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <PropertySessionProvider>{children}</PropertySessionProvider>;
}
