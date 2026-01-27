type Props = { label: string; tone?: "pink" | "green" | "blue" | "sand" };

const TONE: Record<string, { bg: string; fg: string }> = {
  pink: { bg: "#f3e4e6", fg: "#374151" },
  green: { bg: "#dfead4", fg: "#374151" },
  blue: { bg: "#e2eef0", fg: "#374151" },
  sand: { bg: "#e8e2d2", fg: "#374151" },
};

export default function TagPill({ label, tone = "blue" }: Props) {
  const t = TONE[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 13,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
        border: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      {label}
    </span>
  );
}
