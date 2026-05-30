type BadgeTone = "orange" | "green" | "red" | "gray" | "yellow";

const toneClass: Record<BadgeTone, string> = {
  orange: "bg-orange-100 text-orange-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-stone-100 text-stone-700",
  yellow: "bg-yellow-100 text-yellow-800",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
