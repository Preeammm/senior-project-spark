import type { ReactNode } from "react";
import "./PageHeader.css";

type Props<TCareer extends string = string> = {
  title: string;

  // Optional career dropdown
  careerFocus?: TCareer;
  careerFocusOptions?: readonly TCareer[];
  onCareerFocusChange?: (v: TCareer) => void;

  // Optional extra row (View all career details)
  careerExtra?: ReactNode;
};

export default function PageHeader<TCareer extends string = string>({
  title,
  careerFocus,
  careerFocusOptions,
  onCareerFocusChange,
  careerExtra,
}: Props<TCareer>) {
  const showCareer =
    careerFocus !== undefined &&
    Array.isArray(careerFocusOptions) &&
    careerFocusOptions.length > 0 &&
    typeof onCareerFocusChange === "function";

  return (
    <div className="pageHeaderWrap">
      <h1 className="pageHeaderTitle">{title}</h1>

      {showCareer ? (
        <div className="pageHeaderCareerRow">
          <div className="pageHeaderCareerLabel">Career Focus:</div>
          <select
            className="pageHeaderCareerSelect"
            value={careerFocus}
            onChange={(e) => onCareerFocusChange(e.target.value as TCareer)}
          >
            <option value="">Select career focus</option>
            {careerFocusOptions!.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* ✅ MUST render independently */}
      {careerExtra ? <div className="pageHeaderExtraRow">{careerExtra}</div> : null}
    </div>
  );
}
