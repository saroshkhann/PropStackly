"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropertyListItem } from "../data/types";

interface PropertySessionValue {
  drafts: PropertyListItem[];
  /** Saves a draft or an edited listing for the rest of this browser session. */
  save: (item: PropertyListItem) => void;
  /** Applies session edits to server data and prepends session drafts. */
  merge: (items: PropertyListItem[]) => PropertyListItem[];
  resolve: (item: PropertyListItem) => PropertyListItem;
  findDraft: (id: string) => PropertyListItem | undefined;
  /** Tracks object URLs from local image previews so they are released when leaving the module. */
  trackObjectUrl: (url: string) => void;
}

const PropertySessionContext = createContext<PropertySessionValue | null>(null);

/**
 * Prototype-only store shared by the property pages. Nothing is persisted: state lives in memory for the
 * current tab and disappears on reload, and local images never leave the browser.
 */
export function PropertySessionProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<PropertyListItem[]>([]);
  const [edits, setEdits] = useState<Record<string, PropertyListItem>>({});
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const save = useCallback((item: PropertyListItem) => {
    if (item.isDraft) {
      setDrafts((current) => [item, ...current.filter((d) => d.id !== item.id)]);
    } else {
      setEdits((current) => ({ ...current, [item.id]: item }));
    }
  }, []);

  const value = useMemo<PropertySessionValue>(
    () => ({
      drafts,
      save,
      merge: (items) => [...drafts, ...items.map((item) => edits[item.id] ?? item)],
      resolve: (item) => edits[item.id] ?? item,
      findDraft: (id) => drafts.find((d) => d.id === id),
      trackObjectUrl: (url) => objectUrls.current.add(url),
    }),
    [drafts, edits, save],
  );

  return <PropertySessionContext.Provider value={value}>{children}</PropertySessionContext.Provider>;
}

export function usePropertySession() {
  const context = useContext(PropertySessionContext);
  if (!context) throw new Error("usePropertySession must be used inside PropertySessionProvider");
  return context;
}
