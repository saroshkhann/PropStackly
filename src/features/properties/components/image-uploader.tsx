"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyImage } from "@/domain/property";
import { cn } from "@/lib/utils";
import { PropertyImageView } from "./property-image";
import { usePropertySession } from "./property-session";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES = 20;

interface ImageUploaderProps {
  value: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

/**
 * Simulated upload: files become local object-URL previews with a fake progress bar. Nothing is sent to a
 * server or cloud storage, and previews are released when the user leaves the properties module.
 */
export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputId = useId();
  const session = usePropertySession();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const timers = useRef(new Set<ReturnType<typeof setInterval>>());

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearInterval);
  }, []);

  const simulateProgress = (id: string) => {
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(100, pct + 12 + Math.round(Math.random() * 18));
      setProgress((current) => ({ ...current, [id]: pct }));
      if (pct >= 100) {
        clearInterval(timer);
        timers.current.delete(timer);
      }
    }, 140);
    timers.current.add(timer);
  };

  const addFiles = (files: FileList | File[]) => {
    const problems: string[] = [];
    const added: PropertyImage[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        problems.push(`${file.name}: use JPG, PNG, or WebP`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name}: larger than 8 MB`);
        continue;
      }
      if (value.length + added.length >= MAX_IMAGES) {
        problems.push(`Only ${MAX_IMAGES} photos per listing`);
        break;
      }
      const url = URL.createObjectURL(file);
      session.trackObjectUrl(url);
      const id = `local_${crypto.randomUUID()}`;
      added.push({ id, label: file.name.replace(/\.[^.]+$/, ""), source: { kind: "local", url, fileName: file.name } });
      simulateProgress(id);
    }
    setErrors(problems);
    if (added.length) onChange([...value, ...added]);
  };

  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    onChange(next);
  };

  // Object URLs are released by the session provider; a saved listing may still reference a removed preview.
  const remove = (image: PropertyImage) => onChange(value.filter((i) => i.id !== image.id));

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
          dragging && "border-brand bg-brand-soft",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-card">
          <UploadCloud className="size-5" aria-hidden />
        </span>
        <span className="text-[13px] font-medium">
          Drag photos here or <span className="text-brand underline underline-offset-4">browse</span>
        </span>
        <span className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 8 MB · {value.length}/{MAX_IMAGES} photos</span>
        <span className="text-xs text-warning">Prototype: photos stay in this browser as previews and are not uploaded.</span>
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 rounded-lg border border-danger/25 bg-danger-soft/50 px-3 py-2 text-xs text-danger">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {value.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImagePlus className="size-4" aria-hidden />
          Listings with at least 5 photos get noticeably more inquiries.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Listing photos">
          {value.map((image, index) => {
            const pct = image.source.kind === "local" ? (progress[image.id] ?? 100) : 100;
            return (
              <li key={image.id} className="group relative overflow-hidden rounded-lg border bg-card shadow-card">
                <PropertyImageView image={image} className="aspect-[4/3] w-full" showMarker={false} sizes="200px" />
                {index === 0 && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold shadow-card">
                    <Star className="size-3 fill-warning text-warning" aria-hidden />
                    Cover
                  </span>
                )}
                {pct < 100 && (
                  <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/40 p-0.5" role="progressbar" aria-label={`Preparing ${image.label}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-1 rounded-full bg-white transition-[width]" style={{ width: `${pct}%` }} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-1 border-t px-2 py-1.5">
                  <p className="min-w-0 truncate text-[11.5px] text-muted-foreground" title={image.label}>
                    {image.source.kind === "local" ? (pct < 100 ? "Preparing…" : "Local preview") : `${image.label} · sample`}
                  </p>
                  <div className="flex shrink-0 items-center">
                    {index > 0 && (
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(index, -1)} aria-label={`Move ${image.label} earlier`}>
                        <ArrowLeft />
                      </Button>
                    )}
                    {index < value.length - 1 && (
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(index, 1)} aria-label={`Move ${image.label} later`}>
                        <ArrowRight />
                      </Button>
                    )}
                    {index > 0 && (
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(index, -index)} aria-label={`Make ${image.label} the cover photo`}>
                        <Star />
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon-xs" className="hover:text-danger" onClick={() => remove(image)} aria-label={`Remove ${image.label}`}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
