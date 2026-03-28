import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

import { http } from "../services/http";
import {
  createDocument,
  getDocument,
  PORTFOLIO_DOCS_QUERY_KEY,
  updateDocument,
  type PortfolioDocLite,
} from "../features/portfolio/services/portfolio.api";
import {
  useCareerFocus,
  type CareerFocusOption,
  type CareerFocus,
} from "../features/careerFocus/useCareerFocus";
import type { PortfolioDraftData } from "../features/portfolio/types";

import "../styles/page.css";
import "./NewDocumentPage.css";

type Project = {
  id: string;
  projectName: string;
  courseName?: string;
  yearSemester?: string;
  type?: string;
  relevancePercent?: number;
};

type ParsedSection = {
  heading: string;
  lines: string[];
};

async function fetchProjects(careerFocus: CareerFocusOption): Promise<Project[]> {
  const { data } = await http.get("/api/projects", {
    params: { careerFocus },
  });
  return data;
}

const PORTFOLIO_CONTENT_ROUTE = "/portfolio";

function parseMarkdownSections(text: string): ParsedSection[] {
  const lines = String(text ?? "").split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      current = { heading: line.replace(/^##\s+/, ""), lines: [] };
      sections.push(current);
      continue;
    }

    if (!current || !line) continue;

    if (line.startsWith("- ")) {
      current.lines.push(line.replace(/^\-\s+/, ""));
      continue;
    }

    current.lines.push(line);
  }

  return sections;
}

function normalizeInlineMarkdown(line: string) {
  return line.replace(/\*\*/g, "").replace(/_/g, "");
}

function extractLineValue(lines: string[], startsWith: string) {
  const found = lines.find((line) => line.startsWith(startsWith));
  if (!found) return "";
  return normalizeInlineMarkdown(found.slice(startsWith.length).trim());
}

function buildContent(input: {
  title: string;
  careerFocus: string;
  aboutMe: string;
  selectedProjects: Project[];
}) {
  const contentLines: string[] = [];

  contentLines.push(`# ${input.title.trim()}`);
  contentLines.push("");

  contentLines.push("## Basic Information");
  contentLines.push(`- Career Focus: **${input.careerFocus}**`);
  contentLines.push("");

  contentLines.push("## Occupation / Position");
  contentLines.push(input.careerFocus.trim());
  contentLines.push("");

  contentLines.push("## About Me");
  contentLines.push(input.aboutMe.trim());
  contentLines.push("");

  contentLines.push("## Academic Projects");
  if (input.selectedProjects.length === 0) {
    contentLines.push("- (none)");
  } else {
    input.selectedProjects.forEach((project, idx) => {
      const metaParts: string[] = [];
      if (project.courseName) metaParts.push(project.courseName);
      if (project.yearSemester) metaParts.push(project.yearSemester);
      if (project.type) metaParts.push(project.type);

      const meta = metaParts.length ? ` — ${metaParts.join(" • ")}` : "";
      contentLines.push(`${idx + 1}. **${project.projectName}**${meta}`);
    });
  }

  return contentLines.join("\n");
}

export default function NewDocumentPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { docId } = useParams();
  const isEditing = Boolean(docId);

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();

  const [title, setTitle] = useState<string>("");
  const [aboutMe, setAboutMe] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);

  const [touched, setTouched] = useState<{
    title: boolean;
    aboutMe: boolean;
  }>({
    title: false,
    aboutMe: false,
  });

  const { data: existingDoc, isLoading: isDocLoading } = useQuery({
    queryKey: ["portfolioDoc", docId],
    enabled: isEditing && !!docId,
    queryFn: () => getDocument(String(docId)),
  });

  useEffect(() => {
    if (!existingDoc || hasHydratedDraft) return;

    const draft = existingDoc.data;
    const sections = parseMarkdownSections(existingDoc.content ?? "");
    const basicSection = sections.find((section) => section.heading.toLowerCase() === "basic information");
    const aboutSection = sections.find((section) =>
      ["about me", "profile / about me", "short description"].includes(section.heading.toLowerCase())
    );

    const draftCareerFocus =
      draft?.careerFocus || extractLineValue(basicSection?.lines ?? [], "Career Focus:");
    setTitle(existingDoc.title ?? "");
    setCareerFocus((draftCareerFocus || "") as CareerFocus);
    setAboutMe(draft?.aboutMe || aboutSection?.lines?.join(" ").trim() || "");
    setSelectedProjectIds(draft?.selectedProjectIds ?? []);
    setHasHydratedDraft(true);
  }, [existingDoc, hasHydratedDraft, setCareerFocus]);

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", careerFocus],
    enabled: !!careerFocus,
    queryFn: () => fetchProjects(careerFocus as CareerFocusOption),
  });

  const rankedProjects = useMemo(() => {
    const list = projects ?? [];
    return [...list].sort((a, b) => (b.relevancePercent ?? 0) - (a.relevancePercent ?? 0));
  }, [projects]);

  const selectedCount = selectedProjectIds.length;

  const selectedProjects = useMemo(() => {
    const projectMap = new Map(rankedProjects.map((project) => [project.id, project]));
    return selectedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter((project): project is Project => Boolean(project));
  }, [rankedProjects, selectedProjectIds]);

  const titleError = touched.title && title.trim().length === 0 ? "Title is required" : "";
  const aboutMeError =
    touched.aboutMe && aboutMe.trim().length === 0 ? "About Me is required" : "";

  const canGenerate =
    title.trim().length > 0 &&
    aboutMe.trim().length > 0 &&
    !!careerFocus &&
    !isProjectsLoading &&
    !isDocLoading;

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearProjects() {
    setSelectedProjectIds([]);
  }

  function goBack() {
    navigate(isEditing && docId ? `/portfolio/${docId}` : PORTFOLIO_CONTENT_ROUTE);
  }

  async function onGenerate() {
    setTouched({ title: true, aboutMe: true });
    if (!canGenerate) return;

    const draftData: PortfolioDraftData = {
      careerFocus,
      occupation: careerFocus.trim(),
      aboutMe: aboutMe.trim(),
      selectedProjectIds,
    };

    const content = buildContent({
      title,
      careerFocus,
      aboutMe,
      selectedProjects,
    });

    try {
      if (isEditing && docId) {
        await updateDocument(docId, {
          title: title.trim(),
          content,
          data: draftData,
        });
        await qc.invalidateQueries({ queryKey: PORTFOLIO_DOCS_QUERY_KEY });
        await qc.invalidateQueries({ queryKey: ["portfolioDoc", docId] });
        navigate(`/portfolio/${docId}`);
        return;
      }

      const created = await createDocument({
        title: title.trim(),
        content,
        data: draftData,
      });

      qc.setQueryData<PortfolioDocLite[]>(
        PORTFOLIO_DOCS_QUERY_KEY,
        (prev) => [created, ...(prev ?? [])]
      );
      await qc.invalidateQueries({ queryKey: PORTFOLIO_DOCS_QUERY_KEY });
      navigate(`/portfolio/${created.id}`);
    } catch {
      alert(isEditing ? "Save failed. Please try again." : "Generate failed. Please try again.");
    }
  }

  return (
    <div className="pageContainer">
      <PageHeader
        title={isEditing ? "Edit Document" : "New Document"}
        careerExtra={
          <button type="button" className="ndBackBtn" onClick={goBack}>
            ← Back
          </button>
        }
      />

      <div className="dividerLine" />

      <div className="ndWrap ndCard">
        <div className="ndRow ndCareerRow">
          <div className="ndLabel">Career Focus:</div>

          <select
            className="ndSelect"
            value={careerFocus}
            onChange={(e) => setCareerFocus(e.target.value as CareerFocus)}
          >
            <option value="">Select career focus</option>
            {careerFocusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <div className="ndCareerHint">Used to recommend projects and skills in the portfolio</div>
        </div>

        <div className="ndLine" />

        <div className="ndField">
          <div className="ndFieldLabel">
            Title:<span className="ndReq">*</span>
          </div>
          <input
            className={`ndInput ${titleError ? "error" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
            placeholder="Enter document title"
          />
          {titleError ? <div className="ndError">{titleError}</div> : null}
        </div>

        <div className="ndField">
          <div className="ndFieldLabel">
            About Me:<span className="ndReq">*</span>
          </div>
          <textarea
            className={`ndTextarea ${aboutMeError ? "error" : ""}`}
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, aboutMe: true }))}
            placeholder="Write your own introduction for the portfolio"
          />
          {aboutMeError ? <div className="ndError">{aboutMeError}</div> : null}
        </div>

        <div className="ndRow projectsRow">
          <div className="ndLabel">Academic Projects:</div>

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

          <button type="button" className="ndChange" onClick={() => setShowProjectModal(true)}>
            Change
          </button>
        </div>

        {selectedProjects.length > 0 ? (
          <div className="ndSelectedProjects">
            {selectedProjects.map((project) => (
              <div key={project.id} className="ndSelectedProjectCard">
                <div className="ndSelectedProjectName">{project.projectName}</div>
                <div className="ndSelectedProjectMeta">
                  {project.courseName ? project.courseName : "No course name"}
                  {project.yearSemester ? ` • ${project.yearSemester}` : ""}
                  {project.type ? ` • ${project.type}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="ndActions">
          <button
            type="button"
            className="ndBtn primary"
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            {isEditing ? "Save Portfolio" : "Generate Document"}
          </button>
        </div>
      </div>

      {showProjectModal ? (
        <div className="ndModalOverlay" onMouseDown={() => setShowProjectModal(false)}>
          <div className="ndModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ndModalHeader">
              <div className="ndModalTitle">Select Academic Projects</div>
              <button
                type="button"
                className="ndModalClose"
                onClick={() => setShowProjectModal(false)}
              >
                ×
              </button>
            </div>

            <div className="ndModalBody">
              {!careerFocus ? (
                <div className="ndModalHint">Select a career focus first to load recommended projects.</div>
              ) : isProjectsLoading ? (
                <div className="ndModalHint">Loading projects...</div>
              ) : rankedProjects.length === 0 ? (
                <div className="ndModalHint">No projects found.</div>
              ) : (
                <div className="ndProjectList">
                  <div className="ndModalHint">
                    Ranked by relevance for <b>{careerFocus}</b> (highest first)
                  </div>
                  {rankedProjects.map((project) => {
                    const checked = selectedProjectIds.includes(project.id);
                    return (
                      <label key={project.id} className="ndProjectItem">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(project.id)}
                        />
                        <div className="ndProjectInfo">
                          <div className="ndProjectName">{project.projectName}</div>
                          <div className="ndProjectMeta">
                            {project.courseName ? project.courseName : ""}
                            {project.yearSemester ? ` • ${project.yearSemester}` : ""}
                            {project.type ? ` • ${project.type}` : ""}
                            {typeof project.relevancePercent === "number"
                              ? ` • ${project.relevancePercent}% relevance`
                              : ""}
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
