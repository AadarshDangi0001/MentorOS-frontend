

export default function SkeletonRow() {
  return (
    <div className="p-5 border border-border-strong bg-surface-container-lowest rounded-xl space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-surface-container-high" />
        <div className="h-5 w-32 rounded-full bg-surface-container-high" />
      </div>
      <div className="h-5 w-48 rounded-lg bg-surface-container-high" />
      <div className="flex gap-4">
        <div className="h-4 w-28 rounded-lg bg-surface-container-high" />
        <div className="h-4 w-24 rounded-lg bg-surface-container-high" />
      </div>
    </div>
  );
}
