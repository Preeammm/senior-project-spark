type Props<T extends string> = {
  title: string;
  careerFocus?: T;
  onCareerFocusChange?: (v: T) => void;
};

export default function PageHeader<T extends string>({
  title,
  careerFocus,
  onCareerFocusChange,
}: Props<T>) {
  return (
    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 18 }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 650 }}>{title}</h1>

      {careerFocus && onCareerFocusChange && (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#374151", fontWeight: 600 }}>Career Focus:</span>

          <select
            value={careerFocus}
            onChange={(e) => onCareerFocusChange(e.target.value as T)}
            style={{ height: 36, borderRadius: 10, border: "1px solid #d1d5db", padding: "0 10px" }}
          >
            <option value="Data Analyst">Data Analyst</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="Software Engineer">Software Engineer</option>
          </select>
        </label>
      )}
    </div>
  );
}
