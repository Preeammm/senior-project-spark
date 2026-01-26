import type { ProjectMaterial } from "../../portfolio/types";

type Props = { materials: ProjectMaterial[] };

export default function MaterialsLinks({ materials }: Props) {
  if (!materials?.length) return <span style={{ color: "#6b7280" }}>-</span>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {materials.map((m) => (
        <a
          key={m.url}
          href={m.url}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "underline", color: "#111827" }}
        >
          {m.name}
        </a>
      ))}
    </div>
  );
}
