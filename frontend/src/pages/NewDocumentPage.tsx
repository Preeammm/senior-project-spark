import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { useMe } from "../features/student/hooks/useMe";

import { http } from "../services/http";
import {
  createDocument,
  getDocument,
  PORTFOLIO_DOCS_QUERY_KEY,
  updateDocument,
  saveProjectsToPortfolio,
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

import type { Assessment } from "../features/assessments/types";

type ProfileDetail = {
  studentId: string;
  name: string;
  surname: string;
  faculty: string;
  minor: string;
  year: number | string;
  universityEmail?: string;
  personalEmail?: string;
  email: string;
  contactNumber: string;
  address: string;
  linkedinUrl: string;
  githubUrl: string;
  dateOfBirth?: string;
};

type StudentRow = {
  student_id?: string;
  personal_email?: string;
  linkedin_url?: string;
  github_url?: string;
  contact_number?: string;
  contactNumber?: string;
  personalEmail?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

type Course = {
  id: string;
  courseCode: string;
  courseName: string;
  competencyTags: string[];
  relevancePercent: number;
};

type SkillScoreRow = {
  career_name?: string;
  skill_title?: string;
  level_id?: number;
  performance_score?: number;
};

type Project = {
  projectId: number;
  projectName: string;
  courseName?: string;
  yearSemester?: string;
  type?: string;
  relevancePercent?: number;
  description?: string;
};

type ParsedSection = {
  heading: string;
  lines: string[];
};

function normalizeUrl(url: string) {
  if (!url || url === "—") return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function isSoftSkill(skill: string) {
  const value = skill.trim().toLowerCase();
  if (!value) return false;
  const softKeywords = [
    "collaboration",
    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "adaptability",
    "critical thinking",
    "time management",
    "presentation",
  ];
  return softKeywords.some((keyword) => value.includes(keyword));
}

async function fetchProjects(careerFocus: CareerFocusOption): Promise<Project[]> {
  const { data } = await http.get("/api/assessments", {
    params: { careerFocus },
  });
  
  const rows = Array.isArray(data?.data) ? data.data : [];
  
  function formatYearSemester(semester: any): string | undefined {
    if (!semester) return undefined;
    const parts = String(semester).trim().split(/[-\/]/);
    if (parts.length === 2) {
      const year = parts[0].length === 2 ? `25${parts[0]}` : parts[0];
      return `year ${year} semester ${parts[1]}`;
    }
    return String(semester);
  }
  
  return rows.map((row: any) => ({
    projectId: row.project_id || row.assessment_id,
    projectName: row.project_name || `${row.course_name} project` || row.clo_code || "Assessment",
    courseName: row.course_code ? `${row.course_code}_${row.course_name}` : undefined,
    yearSemester: formatYearSemester(row.semester),
    type: row.enrollment_type,
    relevancePercent: row.total_normalized_score ? Math.round(Number(row.total_normalized_score)) : 0,
  }));
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
  const [projectDescriptions, setProjectDescriptions] = useState<Record<string, string>>({});
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

  // Fetch portfolio project IDs when editing
  const { data: portfolioProjects } = useQuery({
    queryKey: ["portfolio-projects", docId],
    enabled: isEditing && !!docId,
    queryFn: async () => {
      const res = await http.get(`/api/projects/${docId}`);
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!existingDoc || hasHydratedDraft) return;

    const draft = existingDoc.data;

    setTitle(existingDoc.title ?? "");
    setCareerFocus((existingDoc.careerName || "") as CareerFocus);
    setAboutMe(existingDoc.aboutMe || "");
    
    // Use portfolio projects if available, otherwise use draft data
    if (portfolioProjects?.projectIds) {
      setSelectedProjectIds(
        portfolioProjects.projectIds.map((id: number) => String(id))
      );
      // Load project descriptions
      if (portfolioProjects.projectDescriptions) {
        setProjectDescriptions(portfolioProjects.projectDescriptions);
      }
    } else {
      setSelectedProjectIds(draft?.selectedProjectIds ?? []);
    }
    
    setHasHydratedDraft(true);
  }, [existingDoc, portfolioProjects, hasHydratedDraft, setCareerFocus]);

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", careerFocus],
    enabled: !!careerFocus,
    queryFn: () => fetchProjects(careerFocus as CareerFocusOption),
  });

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const res = await http.get<ProfileDetail>("/api/me/profile");
      return res.data;
    },
  });

  const { data: me } = useMe();

  const { data: studentRow } = useQuery<StudentRow | null>({
    queryKey: ["student"],
    queryFn: async () => {
      const res = await http.get("/api/student");
      return (res.data?.data?.[0] ?? null) as StudentRow | null;
    },
    retry: false,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["portfolio-courses-by-focus", careerFocus],
    enabled: !!careerFocus,
    queryFn: async () => {
      const res = await http.get<Course[]>("/api/courses", {
        params: { careerFocus },
      });
      return res.data;
    },
  });

  const { data: skillScores = [] } = useQuery<SkillScoreRow[]>({
    queryKey: ["skillScoreByFocus", careerFocus],
    enabled: !!careerFocus,
    queryFn: async () => {
      const res = await http.get<{ data: SkillScoreRow[] }>("/api/skill_score", {
        params: { careerFocus },
      });
      return res.data?.data ?? [];
    },
    retry: false,
  });

  const rankedProjects = useMemo(() => {
    const list = projects ?? [];
    return [...list].sort((a, b) => (b.relevancePercent ?? 0) - (a.relevancePercent ?? 0));
  }, [projects]);

  const selectedCount = selectedProjectIds.length;

  const selectedProjects = useMemo(() => {
    const projectMap = new Map(rankedProjects.map((project) => [project.projectId, project]));
    return selectedProjectIds
      .map((projectId) => projectMap.get(Number(projectId)))
      .filter((project): project is Project => Boolean(project));
  }, [rankedProjects, selectedProjectIds]);

  // Extract skills from skill scores
  const skillScoreSkills = useMemo(() => {
    const titles = new Set<string>();
    skillScores.forEach((row) => {
      const title = String(row.skill_title ?? "").trim();
      if (title) titles.add(title);
    });
    return Array.from(titles).sort((a, b) => a.localeCompare(b));
  }, [skillScores]);

  const hardSkills = useMemo(() => {
    return skillScoreSkills.filter((skill) => !isSoftSkill(skill));
  }, [skillScoreSkills]);

  const softSkills = useMemo(() => {
    return skillScoreSkills.filter((skill) => isSoftSkill(skill));
  }, [skillScoreSkills]);

  // Get contact information
  const personalEmail = profile?.personalEmail || profile?.email || studentRow?.personal_email || studentRow?.personalEmail || "—";
  const linkedInUrl = profile?.linkedinUrl || studentRow?.linkedin_url || studentRow?.linkedinUrl || "";
  const githubUrl = profile?.githubUrl || studentRow?.github_url || studentRow?.githubUrl || "";
  const contactNumber = profile?.contactNumber || studentRow?.contact_number || studentRow?.contactNumber || "—";
  const universityEmail = profile?.universityEmail || "—";
  const studentName = `${me?.name ?? ""} ${me?.surname ?? ""}`.trim() || "Student";

  const titleError = touched.title && title.trim().length === 0 ? "Title is required" : "";
  const aboutMeError =
    touched.aboutMe && aboutMe.trim().length === 0 ? "About Me is required" : "";

  const canGenerate =
    title.trim().length > 0 &&
    aboutMe.trim().length > 0 &&
    !!careerFocus &&
    !isProjectsLoading &&
    !isDocLoading;

  function toggleProject(id: number) {
    setSelectedProjectIds((prev) =>
      prev.includes(String(id)) ? prev.filter((x) => x !== String(id)) : [...prev, String(id)]
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
        // Save projects to portfolio
        if (selectedProjectIds.length > 0) {
          await http.post("/api/projects", {
            portfolioId: docId,
            projectIds: selectedProjectIds.map(Number),
            projectDescriptions,
          });
        }
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

      // Save projects to portfolio
      if (selectedProjectIds.length > 0) {
        await http.post("/api/projects", {
          portfolioId: created.id,
          projectIds: selectedProjectIds.map(Number),
          projectDescriptions,
        });
      }

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
          <button type="button" className="docBackLink" onClick={goBack}>
            ← Back
          </button>
        }
      />

      <div className="dividerLine" />

      <div className="docWrap">
        <div className="docPaper">
          <div className="docPaperHeader">
            <div className="docPaperTitle">
              {title || "Untitled Document"}
            </div>
            {careerFocus && (
              <div className="docMetaRow">
                <span>Career Focus: <strong>{careerFocus}</strong></span>
              </div>
            )}
          </div>

          <div className="docSection">
            <h2>Career Focus<span className="docReq">*</span></h2>
            <select
              className="docSelect"
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
            <p className="docHint">Used to recommend projects and skills in the portfolio</p>
          </div>

          <div className="docSection">
            <h2>Document Title<span className="docReq">*</span></h2>
            <input
              className={`docInput ${titleError ? "error" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              placeholder="Enter document title"
            />
            {titleError ? <div className="docError">{titleError}</div> : null}
          </div>
          
          <div className="docSection">
            <h2>Occupation / Position</h2>
            <p>{careerFocus || "—"}</p>
          </div>

          <div className="docSection">
            <h2>Name and Surname</h2>
            <p>{studentName}</p>
          </div>

          <div className="docSection">
            <h2>About Me<span className="docReq">*</span></h2>
            <textarea
              className={`docTextarea ${aboutMeError ? "error" : ""}`}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, aboutMe: true }))}
              placeholder="Write your own introduction for the portfolio"
            />
            {aboutMeError ? <div className="docError">{aboutMeError}</div> : null}
          </div>

          <div className="docSection">
            <h2>Skills</h2>
            {hardSkills.length > 0 ? (
              <ul className="docSkillsList">
                {hardSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No skills available yet. Select projects and career focus to see recommended skills.</p>
            )}
          </div>

          <div className="docSection">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ margin: 0 }}>Academic Projects</h2>
              <button type="button" className="docBtn secondary" onClick={() => setShowProjectModal(true)}>
                Select Projects
              </button>
            </div>
            
            <div className="docProjectsSummary">
              <span>{selectedCount} Projects Selected</span>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  className="docClearBtn"
                  onClick={clearProjects}
                  title="Clear selected projects"
                >
                  Clear All
                </button>
              ) : null}
            </div>

            {selectedProjects.length > 0 ? (
              <div className="docProjectsList">
                {selectedProjects.map((project, idx) => (
                  <div key={project.projectId} className="docProjectItem">
                    <div className="docProjectNumber">{idx + 1}</div>
                    <div className="docProjectContent">
                      <div className="docProjectName">{project.projectName}</div>
                      <div className="docProjectMeta">
                        {project.courseName ? project.courseName : "No course name"}
                        {project.yearSemester ? ` • ${project.yearSemester}` : ""}
                        {project.type ? ` • ${project.type}` : ""}
                      </div>
                      <div className="docProjectDescriptionBox">
                        <label className="docProjectDescriptionLabel">Description</label>
                        <textarea
                          className="docProjectDescriptionInput"
                          placeholder="Add a description for this project (optional)"
                          value={projectDescriptions[project.projectId] || ""}
                          onChange={(e) =>
                            setProjectDescriptions((prev) => ({
                              ...prev,
                              [project.projectId]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="" />

          <div className="docSection">
            <h2>Contact Information</h2>
            <div className="docInlineList">
              <span><b>University Email:</b> {universityEmail}</span>
              <span><b>Personal Email:</b> {personalEmail}</span>
              <span><b>Phone Number:</b> {contactNumber}</span>
              <span className="docReq">*Note: You can edit Personal Email and Phone Number in your profile settings.</span>
            </div>

          </div>

          <div className="docSection">
            <h2>LinkedIn / GitHub</h2>
            <div className="docSocialGrid">
              <div className="docSocialCard">
                <div className="docSocialLabel">LinkedIn</div>
                {linkedInUrl ? (
                  <a href={normalizeUrl(linkedInUrl)} target="_blank" rel="noreferrer">
                    {linkedInUrl}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="docSocialCard">
                <div className="docSocialLabel">GitHub</div>
                {githubUrl ? (
                  <a href={normalizeUrl(githubUrl)} target="_blank" rel="noreferrer">
                    {githubUrl}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>

          <div className="docActions">
            <button
              type="button"
              className="docBtn primary"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              {isEditing ? "Save Portfolio" : "Generate Document"}
            </button>
          </div>
        </div>
      </div>

      {showProjectModal ? (
        <div className="docModalOverlay" onMouseDown={() => setShowProjectModal(false)}>
          <div className="docModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="docModalHeader">
              <div className="docModalTitle">Select Academic Projects</div>
              <button
                type="button"
                className="docModalClose"
                onClick={() => setShowProjectModal(false)}
              >
                ×
              </button>
            </div>

            <div className="docModalBody">
              {!careerFocus ? (
                <div className="docModalHint">Select a career focus first to load recommended projects.</div>
              ) : isProjectsLoading ? (
                <div className="docModalHint">Loading projects...</div>
              ) : rankedProjects.length === 0 ? (
                <div className="docModalHint">No projects found.</div>
              ) : (
                <div className="docProjectList">
                  <div className="docModalHint">
                    Ranked by relevance for <b>{careerFocus}</b> (highest first)
                  </div>
                  {rankedProjects.map((project) => {
                    const checked = selectedProjectIds.includes(String(project.projectId));
                    return (
                      <label key={project.projectId} className="docProjectCheckItem">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(project.projectId)}
                        />
                        <div className="docProjectInfo">
                          <div className="docProjectName">{project.projectName}</div>
                          <div className="docProjectMeta">
                            {project.courseName ? project.courseName : ""}
                            {project.yearSemester ? ` • ${project.yearSemester}` : ""}
                            {project.type ? ` • ${project.type}` : ""}
                            {typeof project.relevancePercent === "number"
                              ? ` • ${project.relevancePercent}% performance`
                              : ""}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="docModalFooter">
              <div className="docModalCount">{selectedCount} selected</div>
              <button
                type="button"
                className="docBtn primary"
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
