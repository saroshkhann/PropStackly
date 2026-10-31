import Image from "next/image";
import { Armchair, BedDouble, Building, CookingPot, Home, Map as MapIcon, Sofa, TreePine, Trees, type LucideIcon } from "lucide-react";
import type { PropertyImage } from "@/domain/property";
import { cn } from "@/lib/utils";

/** Muted, photographic-feeling palettes for sample artwork; never brand colours. */
const tones = [
  ["oklch(0.86 0.03 75)", "oklch(0.72 0.05 60)"],
  ["oklch(0.85 0.03 150)", "oklch(0.68 0.05 160)"],
  ["oklch(0.84 0.03 245)", "oklch(0.66 0.05 250)"],
  ["oklch(0.85 0.04 40)", "oklch(0.7 0.07 35)"],
  ["oklch(0.86 0.01 260)", "oklch(0.7 0.02 260)"],
  ["oklch(0.83 0.03 300)", "oklch(0.66 0.05 290)"],
] as const;

const labelIcons: Record<string, LucideIcon> = {
  "Front elevation": Home,
  "Drawing room": Sofa,
  Kitchen: CookingPot,
  "Master bedroom": BedDouble,
  Lawn: Trees,
  "Plot map": MapIcon,
  "Street view": TreePine,
  Interior: Armchair,
  "Building exterior": Building,
};

interface PropertyImageViewProps {
  image: PropertyImage | undefined;
  className?: string;
  /** Show the "Sample photo" marker; hidden on very small thumbnails. */
  showMarker?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function PropertyImageView({ image, className, showMarker = true, sizes = "400px", priority }: PropertyImageViewProps) {
  if (image?.source.kind === "local") {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={image.source.url} alt={image.label} fill sizes={sizes} className="object-cover" unoptimized priority={priority} />
        {showMarker && (
          <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-medium text-white backdrop-blur">
            Local preview · not uploaded
          </span>
        )}
      </div>
    );
  }

  const [from, to] = tones[image?.source.kind === "sample" ? image.source.tone % tones.length : 4];
  const Icon = (image && labelIcons[image.label]) ?? Home;

  return (
    <div
      role="img"
      aria-label={image ? `${image.label} (sample image)` : "No photos yet"}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(155deg, ${from}, ${to})` }}
    >
      <span
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ backgroundImage: "linear-gradient(to top, oklch(0.2 0.02 260 / 0.18), transparent)" }}
        aria-hidden
      />
      <Icon className="relative size-[34%] max-h-24 max-w-24 text-white/75" strokeWidth={1.1} aria-hidden />
      {showMarker && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-[10.5px] font-medium text-secondary-foreground backdrop-blur">
          {image ? `${image.label} · sample` : "No photos yet"}
        </span>
      )}
    </div>
  );
}
