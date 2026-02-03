import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

import { http } from "../services/http";
import { createDocument } from "../features/portfolio/services/portfolio.api";

import "../styles/page.css";
import "./NewDocumentPage.css";

type Project = {
  id: string;
  projectName: string;
  courseName?: string;
  yearSemester?: string;
  type?: string;
};

async function fetchProjects(): Promise<Project[]> {
  const { data } = await http.get("/api/projects");
  return data;
}

export default function NewDocumentPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const careerFocus = "Data Analyst";

  const [usePersonalInfo, setUsePersonalInfo] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [shortDesc, setShortDesc] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);

  const [touched, setTouched] = useState<{ title: boolean; shortDesc: boolean }>(
    { title: false, shortDesc: false }
  );

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const selectedCount = selectedProjectIds.length;

  const selectedProjects = useMemo(() => {
    const list = projects ?? [];
    const set = new Set(selectedProjectIds);
    return list.filter((p) => set.has(p.id));
  }, [projects, selectedProjectIds]);

  const titleError =
    touched.title && title.trim().length === 0 ? "Title is required" : "";
  const descError =
    touched.shortDesc && shortDesc.trim().length === 0
      ? "Short description is required"
      : "";

  const canGenerate =
    title.trim().length > 0 && shortDesc.trim().length > 0 && !isLoading;

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearProjects() {
    setSelectedProjectIds([]);
  }

  async function onGenerate() {
    setTouched({ title: true, shortDesc: true });
    if (!canGenerate) return;

    // ✅ mock content: เอา title/desc/projects ไปเขียนเป็น content ก่อน
    const contentLines: string[] = [];
    contentLines.push(`# ${title.trim()}`);
    contentLines.push("");
    contentLines.push(`Career Focus: ${careerFocus}`);
    contentLines.push(`Use SPARK Personal Info: ${usePersonalInfo ? "Yes" : "No"}`);
    contentLines.push("");

    contentLines.push("## Short Description");
    contentLines.push(shortDesc.trim());
    contentLines.push("");

    contentLines.push("## Selected Projects");
    if (selectedProjects.length === 0) {
      contentLines.push("- (none)");
    } else {
      selectedProjects.forEach((p) => {
        contentLines.push(
          `- ${p.projectName}${p.courseName ? ` (${p.courseName})` : ""}${
            p.yearSemester ? ` — ${p.yearSemester}` : ""
          }`
        );
      });
    }

    const content = contentLines.join("\n");

    // ✅ create portfolio doc (mock)
    await createDocument({
      title: title.trim(),
      content,
    });

    // ✅ refresh list in portfolio page แล้วกลับไป /portfolio เพื่อเห็น doc ใหม่
    await qc.invalidateQueries({ queryKey: ["portfolioDocs"] });
    navigate("/portfolio");
  }

  return (
    <div className="pageContainer">
      <PageHeader
        title="New Document"
        careerFocus={careerFocus}
        careerFocusOptions={
          ["Data Analyst", "Data Engineer", "Software Engineer"] as const
        }
        onCareerFocusChange={() => {}}
      />

      <div className="dividerLine" />

      <div className="ndWrap">
        {/* Row: Career focus box + Change */}
        <div className="ndRow">
          <div className="ndLabel">Career Focus:</div>
          <div className="ndValueBox">{careerFocus}</div>
          <button
            type="button"
            className="ndChange"
            onClick={() => alert("TODO: Change career focus (use header dropdown)")}
          >
            Change
          </button>
        </div>

        {/* Row: Use personal info checkbox */}
        <div className="ndRow">
          <div className="ndLabel wide">
            Use Personal Information from SPARK Database?
          </div>

          <label className="ndCheck">
            <input
              type="checkbox"
              checked={usePersonalInfo}
              onChange={(e) => setUsePersonalInfo(e.target.checked)}
            />
            <span>Yes</span>
          </label>

          <div className="ndHint">
            (Mock) If enabled, the system will use your SPARK profile later.
          </div>
        </div>

        {/* Title */}
        <div className="ndField">
          <div className="ndFieldLabel">
            Title:<span className="ndReq">*</span>
          </div>
          <input
            className={`ndInput ${titleError ? "error" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            placeholder="Enter document title"
          />
          {titleError ? <div className="ndError">{titleError}</div> : null}
        </div>

        {/* Short Description */}
        <div className="ndField">
          <div className="ndFieldLabel">
            Short Description:<span className="ndReq">*</span>
          </div>
          <textarea
            className={`ndTextarea ${descError ? "error" : ""}`}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, shortDesc: true }))}
            placeholder="Write a short description (e.g., used for internship resume)"
          />
          {descError ? <div className="ndError">{descError}</div> : null}
        </div>

        {/* Projects Selected */}
        <div className="ndRow projectsRow">
          <div className="ndLabel">Projects Selected:</div>

          <div className="ndSelectedBox">
            <span>{selectedCount} Projects Selected</span>
            {selectedCount > 0 ? (
              <button
                type="button"
                className="ndClearX"
                onClick={clearProjects}
                title="Clear selected projects"
              >
                ×
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="ndChange"
            onClick={() => setShowProjectModal(true)}
          >
            Change
          </button>
        </div>

        {/* Buttons */}
        <div className="ndActions">
          <button
            type="button"
            className="ndBtn primary"
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            Generate Document
          </button>

          {/* ✅ Cancel = ไม่ navigate ไม่ reset อยู่กรอกต่อได้ */}
          <button
            type="button"
            className="ndBtn"
            onClick={() => {
              // do nothing — stay here, continue filling form
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ===== Modal: select projects ===== */}
      {showProjectModal ? (
        <div
          className="ndModalOverlay"
          onMouseDown={() => setShowProjectModal(false)}
        >
          <div className="ndModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ndModalHeader">
              <div className="ndModalTitle">Select Projects</div>
              <button
                type="button"
                className="ndModalClose"
                onClick={() => setShowProjectModal(false)}
              >
                ×
              </button>
            </div>

            <div className="ndModalBody">
              {isLoading ? (
                <div className="ndModalHint">Loading projects...</div>
              ) : (projects ?? []).length === 0 ? (
                <div className="ndModalHint">No projects found.</div>
              ) : (
                <div className="ndProjectList">
                  {(projects ?? []).map((p) => {
                    const checked = selectedProjectIds.includes(p.id);
                    return (
                      <label key={p.id} className="ndProjectItem">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(p.id)}
                        />
                        <div className="ndProjectInfo">
                          <div className="ndProjectName">{p.projectName}</div>
                          <div className="ndProjectMeta">
                            {p.courseName ? p.courseName : ""}
                            {p.yearSemester ? ` • ${p.yearSemester}` : ""}
                            {p.type ? ` • ${p.type}` : ""}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="ndModalFooter">
              <div className="ndModalCount">{selectedCount} selected</div>
              <button
                type="button"
                className="ndBtn primary small"
                onClick={() => setShowProjectModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
