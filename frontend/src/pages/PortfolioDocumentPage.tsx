import { useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { getDocument } from "../features/portfolio/services/portfolio.api";
import { useMe } from "../features/student/hooks/useMe";
import { http } from "../services/http";

import "../styles/page.css";
import "./PortfolioDocumentPage.css";

type ParsedSection = {
  heading: string;
  lines: string[];
};

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
  personalEmail?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

type Project = {
  id: string;
  projectName: string;
  courseName: string;
  yearSemester: string;
  type: "Group" | "Individual";
  competencyTags: string[];
  relevancePercent: number;
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

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

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

    if (line.startsWith("### ")) {
      current.lines.push(line.replace(/^###\s+/, ""));
      continue;
    }

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
  if (!found) return "—";
  const value = found.slice(startsWith.length).trim();
  return normalizeInlineMarkdown(value) || "—";
}

function normalizeUrl(url: string) {
  if (!url || url === "—") return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function formatBirthDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function projectDescriptionForFocus(project: Project, careerFocus: string) {
  const focus = careerFocus.toLowerCase();
  if (focus.includes("software")) {
    return `${project.projectName} demonstrates delivery-oriented software engineering through ${project.type.toLowerCase()} implementation, code collaboration, and practical system building.`;
  }
  if (focus.includes("engineer")) {
    return `${project.projectName} aligns with data engineering goals by emphasizing data systems usage, structured implementation, and technical reliability.`;
  }
  return `${project.projectName} supports analyst outcomes by showing data interpretation, evidence-based insights, and communication of project results.`;
}

function extractCourseCode(text: string) {
  const match = String(text ?? "").toUpperCase().match(/[A-Z]{2,}\d{2,}/);
  return match?.[0] ?? "";
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

export default function PortfolioDocumentPage() {
  useProtectedRoute();
  const { docId } = useParams();
  const { data: me } = useMe();
  const docPaperRef = useRef<HTMLElement | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["portfolioDoc", docId],
    enabled: !!docId,
    queryFn: () => getDocument(String(docId)),
    // Sometimes the first click can hit a short race; retry brief 404 once.
    retry: (failureCount, err: any) => {
      const status = err?.response?.status;
      if (status === 404 && failureCount < 2) return true;
      return failureCount < 1;
    },
    retryDelay: 250,
  });
  const { data: profile } = useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const res = await http.get<ProfileDetail>("/api/me/profile");
      return res.data;
    },
  });

  const { data: studentRow } = useQuery<StudentRow | null>({
    queryKey: ["student"],
    queryFn: async () => {
      const res = await http.get("/api/student");
      return (res.data?.data?.[0] ?? null) as StudentRow | null;
    },
    retry: false,
  });

  const sections = useMemo(
    () => parseMarkdownSections(data?.content ?? ""),
    [data?.content]
  );
  const basicSection = useMemo(
    () => sections.find((s) => s.heading.toLowerCase() === "basic information"),
    [sections]
  );
  const shortSection = useMemo(
    () =>
      sections.find((s) =>
        ["about me", "profile / about me", "short description"].includes(
          s.heading.toLowerCase()
        )
      ),
    [sections]
  );
  const occupationSection = useMemo(
    () =>
      sections.find((s) =>
        ["occupation / position", "chosen occupation"].includes(s.heading.toLowerCase())
      ),
    [sections]
  );
  const selectedProjects = useMemo(
    () =>
      sections.find((s) =>
        ["academic projects", "selected projects"].includes(s.heading.toLowerCase())
      ),
    [sections]
  );

  const studentName = `${me?.name ?? ""} ${me?.surname ?? ""}`.trim() || "Student";
  const careerFocus = extractLineValue(basicSection?.lines ?? [], "Career Focus:");
  const selectedProjectNames = useMemo(
    () =>
      (selectedProjects?.lines ?? [])
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) =>
          normalizeInlineMarkdown(
            line
              .replace(/^\d+\.\s*/, "")
              .replace(/\*\*/g, "")
              .split("—")[0]
              .trim()
          )
        ),
    [selectedProjects]
  );
  const { data: projects = [] } = useQuery({
    queryKey: ["portfolio-projects-by-focus", careerFocus],
    enabled: !!careerFocus && careerFocus !== "—",
    queryFn: async () => {
      const res = await http.get<Project[]>("/api/projects", {
        params: { careerFocus },
      });
      return res.data;
    },
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["portfolio-courses-by-focus", careerFocus],
    enabled: !!careerFocus && careerFocus !== "—",
    queryFn: async () => {
      const res = await http.get<Course[]>("/api/courses", {
        params: { careerFocus },
      });
      return res.data;
    },
  });
  const { data: skillScores = [] } = useQuery<SkillScoreRow[]>({
    queryKey: ["skillScoreByFocus", careerFocus],
    enabled: !!careerFocus && careerFocus !== "—",
    queryFn: async () => {
      const res = await http.get<{ data: SkillScoreRow[] }>("/api/skill_score", {
        params: { careerFocus },
      });
      return res.data?.data ?? [];
    },
    retry: false,
  });
  const descriptionLines = (shortSection?.lines ?? []).map(normalizeInlineMarkdown);
  const aboutMe = descriptionLines.join(" ").trim() || "—";
  const occupation =
    occupationSection?.lines.map(normalizeInlineMarkdown).join(" ").trim() ||
    careerFocus ||
    "—";
  const projectLines = selectedProjects?.lines.filter((line) => /^\d+\./.test(line.trim())) ?? [];
  const selectedProjectDetails = useMemo(() => {
    if (!selectedProjectNames.length) return [];
    const set = new Set(selectedProjectNames.map((x) => x.toLowerCase()));
    return projects.filter((p) => set.has(p.projectName.toLowerCase()));
  }, [projects, selectedProjectNames]);
  const fallbackProjectItems = useMemo(
    () => projectLines.map((line) => normalizeInlineMarkdown(line)),
    [projectLines]
  );
  const selectedCourseCodes = useMemo(() => {
    const codes = new Set<string>();
    selectedProjectDetails.forEach((project) => {
      const code = extractCourseCode(project.courseName);
      if (code) codes.add(code);
    });
    fallbackProjectItems.forEach((line) => {
      const code = extractCourseCode(line);
      if (code) codes.add(code);
    });
    return Array.from(codes);
  }, [selectedProjectDetails, fallbackProjectItems]);
  const selectedCourses = useMemo(() => {
    if (!selectedCourseCodes.length) return [];
    const set = new Set(selectedCourseCodes);
    return courses.filter((course) => set.has(course.courseCode.toUpperCase()));
  }, [courses, selectedCourseCodes]);
  const projectSkills = useMemo(() => {
    const tags = new Set<string>();
    selectedProjectDetails.forEach((project) => {
      project.competencyTags.forEach((tag) => {
        const clean = tag.trim();
        if (clean) tags.add(clean);
      });
    });
    return Array.from(tags);
  }, [selectedProjectDetails]);
  const courseSkills = useMemo(() => {
    const tags = new Set<string>();
    selectedCourses.forEach((course) => {
      course.competencyTags.forEach((tag) => {
        const clean = tag.trim();
        if (clean) tags.add(clean);
      });
    });
    return Array.from(tags);
  }, [selectedCourses]);
  const allSkills = useMemo(() => {
    const tags = new Set<string>();
    projectSkills.forEach((skill) => tags.add(skill));
    courseSkills.forEach((skill) => tags.add(skill));
    return Array.from(tags);
  }, [projectSkills, courseSkills]);
  const skillScoreSkills = useMemo(() => {
    const titles = new Set<string>();
    skillScores.forEach((row) => {
      const title = String(row.skill_title ?? "").trim();
      if (title) titles.add(title);
    });
    return Array.from(titles).sort((a, b) => a.localeCompare(b));
  }, [skillScores]);
  const hardSkills = useMemo(() => {
    if (skillScoreSkills.length > 0) {
      return skillScoreSkills;
    }
    return allSkills.filter((skill) => !isSoftSkill(skill));
  }, [skillScoreSkills, allSkills]);
  const softSkills = useMemo(
    () => allSkills.filter((skill) => isSoftSkill(skill)),
    [allSkills]
  );
  const personalEmail =
    profile?.personalEmail ||
    profile?.email ||
    studentRow?.personal_email ||
    studentRow?.personalEmail ||
    "—";
  const linkedInUrl =
    profile?.linkedinUrl ||
    studentRow?.linkedin_url ||
    studentRow?.linkedinUrl ||
    "";
  const githubUrl =
    profile?.githubUrl ||
    studentRow?.github_url ||
    studentRow?.githubUrl ||
    "";
  const universityEmail = profile?.universityEmail || "—";

  if (!docId) return <div className="pageContainer">Loading document...</div>;
  if (isLoading || (isFetching && !data)) {
    return <div className="pageContainer">Loading document...</div>;
  }
  if (error || !data) return <div className="pageContainer">Document not found.</div>;
  const docTitle = data.title || "portfolio";

  function onExportWord() {
    const paperHtml = docPaperRef.current?.outerHTML;
    if (!paperHtml) return;

    const wordHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${docTitle}</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; color: #111827; margin: 0; padding: 24px; }
      .docPaper { width: 100%; max-width: 800px; margin: 0 auto; }
      .docPaperHeader { border-bottom: 1px solid #d1d5db; padding-bottom: 10px; margin-bottom: 12px; }
      .docPaperTitle { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
      .docMetaRow { font-size: 12px; color: #374151; display: flex; gap: 12px; flex-wrap: wrap; }
      .docSection { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-top: 10px; }
      .docSection h2 { margin: 0 0 8px; font-size: 16px; }
      .docSection p, .docSection li, .docInlineList, .docSlipRow { font-size: 12px; line-height: 1.5; }
      .docInlineList { display: grid; gap: 4px; }
      .docSocialGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .docSocialCard { border: 1px solid #dbe7fb; border-radius: 8px; padding: 10px; background: #f8fbff; }
      .docSocialLabel { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
      a { color: #1d4ed8; text-decoration: underline; }
    </style>
  </head>
  <body>
    ${paperHtml}
  </body>
</html>`;

    const blob = new Blob(["\ufeff", wordHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.replace(/[^\w\-]+/g, "_") || "portfolio"}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onExportPdf() {
    const paperHtml = docPaperRef.current?.outerHTML;
    if (!paperHtml) return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      alert("Popup was blocked. Please allow popups for this site, then try Export PDF again.");
      return;
    }

    const printHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${docTitle}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      html, body { margin: 0; padding: 0; }
      body { font-family: Calibri, Arial, sans-serif; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .docPaper { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; padding: 10mm; }
      .docPaperHeader { border-bottom: 1px solid #d1d5db; padding-bottom: 10px; margin-bottom: 10px; }
      .docPaperTitle { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
      .docMetaRow { font-size: 11px; color: #374151; display: flex; gap: 10px; flex-wrap: wrap; }
      .docSection { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; margin-top: 9px; break-inside: avoid; page-break-inside: avoid; }
      .docSection h2 { margin: 0 0 6px; font-size: 14px; }
      .docSection p, .docSection li, .docInlineList, .docSlipRow { font-size: 11.5px; line-height: 1.45; }
      .docInlineList { display: grid; gap: 4px; }
      .docSocialGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .docSocialCard { border: 1px solid #dbe7fb; border-radius: 8px; padding: 8px 10px; background: #f8fbff; break-inside: avoid; page-break-inside: avoid; }
      .docSocialLabel { font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px; }
      a { color: #1d4ed8; text-decoration: underline; }
      .hideOnPrint, .docActions { display: none !important; }
    </style>
  </head>
  <body>
    ${paperHtml}
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();

    // Print after DOM paints. Keep a fallback retry for slower browsers.
    setTimeout(() => {
      try {
        printWindow.print();
      } catch {
        alert("Unable to start printing. Please try again.");
      }
    }, 350);
  }

  return (
    <div className="pageContainer">
      <div className="hideOnPrint">
        <PageHeader
          title="Portfolio Document"
          careerExtra={
            <Link className="docBackLink" to="/portfolio">
              ← Back to Portfolio
            </Link>
          }
        />
        <div className="dividerLine" />
      </div>

      <div className="docWrap">
        <div className="docActions hideOnPrint">
          <Link to={`/portfolio/${docId}/edit`} className="docBtn secondary">
            Edit Portfolio
          </Link>
          <button type="button" className="docBtn" onClick={onExportPdf}>
            Export PDF
          </button>
          <button type="button" className="docBtn primary" onClick={onExportWord}>
            Export Word
          </button>
        </div>

        <article ref={docPaperRef} className="docPaper">
          <header className="docPaperHeader">
            <div className="docPaperTitle">{data.title}</div>
            <div className="docMetaRow">
              <span>
                <b>Student:</b> {studentName}
              </span>
              <span>
                <b>Student ID:</b> {me?.studentId ?? "—"}
              </span>
              <span>
                <b>Date:</b> {formatDate(data.createdAt)}
              </span>
            </div>
          </header>

          <section className="docSection">
            <h2>Occupation / Position</h2>
            <p>{occupation}</p>
          </section>

          <section className="docSection">
            <h2>Name and Surname</h2>
            <p>{studentName}</p>
          </section>

          <section className="docSection">
            <h2>About Me</h2>
            <p>{aboutMe}</p>
          </section>

          <section className="docSection">
            <h2>Contact Information</h2>
            <div className="docInlineList">
              <span><b>Birthdate:</b> {formatBirthDate(profile?.dateOfBirth)}</span>
              <span><b>Phone:</b> {profile?.contactNumber || "—"}</span>
              <span><b>University Email:</b> {universityEmail}</span>
              <span><b>Personal Email:</b> {personalEmail}</span>
            </div>
          </section>

          <section className="docSection">
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
          </section>

          <section className="docSection">
            <h2>Skills</h2>
            <p><b>Hard Skills</b></p>
            {hardSkills.length ? (
              <ul className="docSkillsGrid">
                {hardSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
            <p className="docSoftSkillsHeading"><b>Soft Skills</b></p>
            {softSkills.length ? (
              <ul>
                {softSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </section>

          <section className="docSection">
            <h2>Academic Projects</h2>
            {selectedProjectDetails.length > 0 ? (
              <ul>
                {selectedProjectDetails.map((project) => (
                  <li key={project.id}>
                    <b>{project.projectName}</b> ({project.courseName}, {project.yearSemester})<br />
                    {projectDescriptionForFocus(project, careerFocus)}
                  </li>
                ))}
              </ul>
            ) : fallbackProjectItems.length > 0 ? (
              <ul>
                {fallbackProjectItems.map((projectLine, idx) => (
                  <li key={`${projectLine}-${idx}`}>
                    <b>{projectLine}</b><br />
                    Relevant to {careerFocus} through applied coursework and deliverables.
                  </li>
                ))}
              </ul>
            ) : (
              <p>No project selected.</p>
            )}
          </section>

        </article>
      </div>
    </div>
  );
}
