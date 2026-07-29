export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-crate-line rounded-2xl py-16 px-6 text-center">
      <p className="font-display italic text-2xl text-crate-ink mb-2">
        {title}
      </p>
      <p className="text-crate-ink-muted max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-crate-ink-muted">
      <span className="w-5 h-5 rounded-full border-2 border-crate-line border-t-crate-accent animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
