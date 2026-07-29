"use client";

export default function RatingStars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${value ?? 0} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-lg leading-none transition-transform ${
            readOnly ? "cursor-default" : "hover:scale-110 cursor-pointer"
          } ${
            value && star <= value ? "text-crate-accent" : "text-crate-line"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
