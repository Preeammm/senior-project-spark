type Props = { label: string };

export default function TagPill({ label }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid #d1d5db",
        fontSize: 12,
        marginRight: 6,
        marginBottom: 6,
        background: "#fff",
      }}
    >
      {label}
    </span>
  );
}
