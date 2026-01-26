type Props = { value: number };

export default function ProgressBadge({ value }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontWeight: 600,
        minWidth: 64,
        textAlign: "center",
        background: "#fff",
      }}
    >
      {v}%
    </span>
  );
}
