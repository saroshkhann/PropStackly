"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { PropertyImage } from "@/domain/property";
import { cn } from "@/lib/utils";
import { PropertyImageView } from "./property-image";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const current = images[Math.min(index, Math.max(0, count - 1))];
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative overflow-hidden rounded-xl border bg-muted shadow-card">
        <PropertyImageView image={current} className="aspect-[16/9] w-full" sizes="(min-width: 1280px) 800px, 100vw" priority />
        {count > 0 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 bg-white/90 shadow-card backdrop-blur hover:bg-white"
              onClick={() => setOpen(true)}
            >
              <Expand />
              View all {count}
            </Button>
            {count > 1 && (
              <>
                <Button variant="secondary" size="icon" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 shadow-card hover:bg-white" onClick={() => go(-1)} aria-label="Previous photo">
                  <ChevronLeft />
                </Button>
                <Button variant="secondary" size="icon" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 shadow-card hover:bg-white" onClick={() => go(1)} aria-label="Next photo">
                  <ChevronRight />
                </Button>
              </>
            )}
            <span className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white tabular backdrop-blur" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="scrollbar-thin flex gap-2 overflow-x-auto pb-1" aria-label="Photos">
          {images.map((image, i) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${image.label}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "block overflow-hidden rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-canvas transition focus-visible:ring-ring focus-visible:outline-none",
                  i === index ? "ring-brand" : "opacity-75 hover:opacity-100",
                )}
              >
                <PropertyImageView image={image} className="h-14 w-20" showMarker={false} sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[min(64rem,calc(100vw-2rem))] gap-3 p-3 sm:max-w-[min(64rem,calc(100vw-2rem))]"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            if (event.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{title} photos</DialogTitle>
          <DialogDescription className="sr-only">Use the left and right arrow keys to browse photos.</DialogDescription>
          <div className="relative overflow-hidden rounded-lg">
            <PropertyImageView image={current} className="aspect-[16/10] w-full" sizes="1024px" />
            {count > 1 && (
              <>
                <Button variant="secondary" size="icon" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white" onClick={() => go(-1)} aria-label="Previous photo">
                  <ChevronLeft />
                </Button>
                <Button variant="secondary" size="icon" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white" onClick={() => go(1)} aria-label="Next photo">
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
          <p className="px-1 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{current?.label}</span> · {index + 1} of {count}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
