// src/components/PageHeader.tsx
import React from "react";

export type PageHeaderProps<T extends string> = {
  title: string;

  careerFocus?: T;
  careerFocusOptions?: readonly T[];
  onCareerFocusChange?: (v: T) => void;

  // element ใต้ dropdown (เช่น View all career details)
  careerExtra?: React.ReactNode;

  // เผื่ออยากเปลี่ยนขนาด title ในบางหน้า
  titleSize?: number; // default 44-ish
};

export default function PageHeader<T extends string>({
  title,
  careerFocus,
  careerFocusOptions,
  onCareerFocusChange,
  careerExtra,
  titleSize = 25,
}: PageHeaderProps<T>) {
  const showCareer =
    careerFocus !== undefined &&
    onCareerFocusChange !== undefined &&
    careerFocusOptions !== undefined &&
    careerFocusOptions.length > 0;

  return (
    <div style={styles.wrap}>
      <h1 style={{ ...styles.title, fontSize: titleSize }}>{title}</h1>

      {showCareer && (
        <div style={styles.careerWrap}>
          {/* row: label + select (กลางตรงกัน) */}
          <div style={styles.careerRow}>
            <span style={styles.careerLabel}>Career Focus:</span>

            <select
              value={careerFocus}
              onChange={(e) => onCareerFocusChange(e.target.value as T)}
              style={styles.select}
            >
              {careerFocusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* ใต้ dropdown ชิดซ้าย */}
          {careerExtra && <div style={styles.extra}>{careerExtra}</div>}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center", // ✅ ทำให้ title + career block อยู่กลางแนวเดียวกัน
    justifyContent: "space-between",
    gap: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },

  title: {
    margin: 0,
    fontWeight: 750,
    letterSpacing: -0.2,
    color: "#111827",
    lineHeight: 1.05, // ✅ กัน baseline แปลก
  },

  careerWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  careerRow: {
    display: "flex",
    alignItems: "center", // ✅ label กับ select “กลางตรงกัน”
    gap: 12,
  },

  careerLabel: {
    color: "#374151",
    fontWeight: 700,
    fontSize: 15,
    lineHeight: "40px", // ✅ ให้เท่ากับความสูง select เพื่อ center เป๊ะ
    whiteSpace: "nowrap",
  },

  select: {
    height: 44,
    minWidth: 260,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: "0 16px",
    background: "#fff",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    lineHeight: "44px",
    boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
  },

  extra: {
    marginTop: 8,
    width: "100%",
    display: "flex",
    justifyContent: "flex-start", // ✅ ชิดซ้ายใต้ dropdown
  },
};
