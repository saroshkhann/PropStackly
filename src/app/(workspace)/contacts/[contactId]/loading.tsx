import { Skeleton } from "@/components/ui/skeleton";

export default function ContactProfileLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading contact">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-[420px] rounded-xl xl:col-span-2" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
