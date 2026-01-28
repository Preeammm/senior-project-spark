import React from "react";

export type PageHeaderProps<T extends string> = {
  title: string;
  careerFocus?: T;
  careerFocusOptions?: readonly T[];
  onCareerFocusChange?: (v: T) => void;
  careerExtra?: React.ReactNode; // link ใต้ dropdown
};

export default function PageHeader<T extends string>({
  title,
  careerFocus,
  careerFocusOptions,
  onCareerFocusChange,
  careerExtra,
}: PageHeaderProps<T>) {
  const showCareer =
    careerFocus !== undefined &&
    onCareerFocusChange !== undefined &&
    careerFocusOptions !== undefined &&
    careerFocusOptions.length > 0;

  return (
    <div style={{ marginBottom: 10 }}>
      <h1 style={{ margin: 0, fontSize: 25, fontWeight: 650 }}>{title}</h1>

      {showCareer && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#374151", fontWeight: 600, fontSize: 15 }}>
              Career Focus:
            </span>

            <select
              value={careerFocus}
              onChange={(e) => onCareerFocusChange(e.target.value as T)}
              style={{
                height: 38,
                minWidth: 240,
                borderRadius: 8,
                border: "1px solid #9ca3af",
                padding: "0 14px",
                background: "#fff",
                fontSize: 14,
                lineHeight: "38px",
              }}
            >
              {careerFocusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* อยู่ใต้ dropdown และชิดซ้าย */}
          {careerExtra && <div style={{ marginTop: 8 }}>{careerExtra}</div>}
        </div>
      )}
    </div>
  );
}
