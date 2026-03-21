type Props = {
  value: number;
};

function getRelevanceMeta(value: number) {
  const safeValue = Math.max(0, Math.min(100, value));

  if (safeValue >= 70) {
    return {
      toneClass: "relToneHigh",
      label: "High relevance",
      range: "70% - 100%",
      description: "Highly important for this career path.",
    };
  }

  if (safeValue >= 40) {
    return {
      toneClass: "relToneMediumHigh",
      label: "Medium-high relevance",
      range: "40% - 69%",
      description: "Quite important for this career path.",
    };
  }

  if (safeValue >= 20) {
    return {
      toneClass: "relToneMedium",
      label: "Moderate relevance",
      range: "20% - 39%",
      description: "Moderately related to this career path.",
    };
  }

  if (safeValue >= 1) {
    return {
      toneClass: "relToneLow",
      label: "Low relevance",
      range: "1% - 19%",
      description: "Only a small match for this career path.",
    };
  }

  return {
    toneClass: "relToneNone",
    label: "No relevance",
    range: "0%",
    description: "Not relevant to this career path.",
  };
}

export default function RelevanceIndicator({ value }: Props) {
  const meta = getRelevanceMeta(value);

  return (
    <div className="relevanceIndicatorWrap">
      <button
        type="button"
        className={`relevanceIndicator ${meta.toneClass}`}
        aria-label={`${meta.label}. ${meta.description}`}
      />
      <div className="relevanceTooltip" role="tooltip">
        <div className="relevanceTooltipTitle">{meta.label}</div>
        <div className="relevanceTooltipRange">{meta.range}</div>
        <div className="relevanceTooltipText">{meta.description}</div>
      </div>
    </div>
  );
}
