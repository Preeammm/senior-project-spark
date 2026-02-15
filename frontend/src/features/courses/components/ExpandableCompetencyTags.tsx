import { useMemo, useState } from "react";
import TagPill from "./TagPill";
import { normalizeCompetencyTags } from "../utils/competencyTags";

type Props = {
  tags: string[];
  maxVisible?: number;
  contextText?: string;
};

function toneByIndex(i: number) {
  return (["pink", "green", "blue", "sand"] as const)[i % 4];
}

export default function ExpandableCompetencyTags({ tags, maxVisible = 2, contextText }: Props) {
  const [expanded, setExpanded] = useState(false);
  const normalizedTags = useMemo(
    () => normalizeCompetencyTags(tags, contextText),
    [tags, contextText]
  );

  const visibleTags = expanded ? normalizedTags : normalizedTags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, normalizedTags.length - maxVisible);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      {visibleTags.map((tag, i) => (
        <TagPill key={`${tag}-${i}`} label={tag} tone={toneByIndex(i)} />
      ))}

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: 13,
            color: "#64748b",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {expanded ? "Show less" : `+${hiddenCount} more`}
        </button>
      ) : null}
    </div>
  );
}
