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
  email: string;
  contactNumber: string;
  address: string;
  linkedinUrl: string;
  githubUrl: string;
  dateOfBirth?: string;
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

function expectedGraduationYear(studyYear?: number | string) {
  const y = Number(studyYear);
  if (!Number.isFinite(y) || y <= 0) return "—";
  const programLength = 4;
  const yearsLeft = Math.max(0, programLength - y);
  return String(new Date().getFullYear() + yearsLeft);
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

function getSoftSkills(projects: Project[]) {
  const baseline = ["Team Collaboration", "Communication", "Problem Solving"];
  const fromProjects = projects.some((p) => p.type === "Group")
    ? ["Cross-functional teamwork"]
    : ["Independent ownership"];
  return [...baseline, ...fromProjects];
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

  const sections = useMemo(
    () => parseMarkdownSections(data?.content ?? ""),
    [data?.content]
  );
  const basicSection = useMemo(
    () => sections.find((s) => s.heading.toLowerCase() === "basic information"),
    [sections]
  );
  const shortSection = useMemo(
    () => sections.find((s) => s.heading.toLowerCase() === "short description"),
    [sections]
  );
  const selectedProjects = useMemo(
    () => sections.find((s) => s.heading.toLowerCase() === "selected projects"),
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
  const shortDescription =
    shortSection?.lines
      .map(normalizeInlineMarkdown)
      .join(" ")
      .trim() || "—";
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

  const hardSkills = useMemo(() => {
    const tags = new Set<string>();
    selectedProjectDetails.forEach((project) => {
      project.competencyTags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [selectedProjectDetails]);
  const softSkills = useMemo(() => getSoftSkills(selectedProjectDetails), [selectedProjectDetails]);
  const graduationYear = expectedGraduationYear(profile?.year || me?.year);

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
      .docContactSlip { margin-top: 12px; border: 1px dashed #94a3b8; padding: 10px; border-radius: 8px; }
      .docContactSlipTitle { font-weight: 700; margin-bottom: 6px; font-size: 13px; }
      .docInlineList { display: grid; gap: 4px; }
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
      .docContactSlip { margin-top: 12px; border: 1px dashed #94a3b8; border-radius: 8px; padding: 8px 10px; break-inside: avoid; page-break-inside: avoid; }
      .docContactSlipTitle { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
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
            <h2>Name and Surname</h2>
            <p>{studentName}</p>
          </section>

          <section className="docSection">
            <h2>University, Faculty, Minor</h2>
            <p>
              Mahidol University, {profile?.faculty || me?.faculty || "—"}, {profile?.minor || me?.minor || "—"}
            </p>
          </section>

          <section className="docSection">
            <h2>Chosen Occupation</h2>
            <p>{careerFocus}</p>
          </section>

          <section className="docSection">
            <h2>Profile / About Me</h2>
            <p>
              {studentName} is a {careerFocus} candidate with expertise in ICT coursework and project-based delivery.
              Career goal: contribute to impactful {careerFocus.toLowerCase()} work and continue growing through
              real-world systems and team collaboration.
            </p>
            <div className="docInlineList">
              <span><b>Birthdate:</b> {formatBirthDate(profile?.dateOfBirth)}</span>
              <span><b>Phone:</b> {profile?.contactNumber || "—"}</span>
              <span><b>Email:</b> {profile?.email || "—"}</span>
              <span>
                <b>LinkedIn:</b>{" "}
                {profile?.linkedinUrl ? (
                  <a href={normalizeUrl(profile.linkedinUrl)} target="_blank" rel="noreferrer">
                    {profile.linkedinUrl}
                  </a>
                ) : (
                  "—"
                )}
              </span>
              <span>
                <b>GitHub:</b>{" "}
                {profile?.githubUrl ? (
                  <a href={normalizeUrl(profile.githubUrl)} target="_blank" rel="noreferrer">
                    {profile.githubUrl}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </section>

          <section className="docSection">
            <h2>Education</h2>
            <ul>
              <li><b>Level:</b> Bachelor&apos;s Degree</li>
              <li><b>Faculty / University:</b> {(profile?.faculty || me?.faculty || "—")} / Mahidol University</li>
              <li><b>Year of Graduation:</b> {graduationYear}</li>
            </ul>
          </section>

          <section className="docSection">
            <h2>Skills</h2>
            <p><b>Technical Skills (Hard Skills)</b></p>
            {hardSkills.length ? (
              <ul>
                {hardSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
            <p><b>Collaboration Skills (Soft Skills)</b></p>
            <ul>
              {softSkills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>

          <section className="docSection">
            <h2>Chosen Projects</h2>
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

          <section className="docSection">
            <h2>Short Description</h2>
            <p>{shortDescription}</p>
          </section>

          <footer className="docContactSlip">
            <div className="docContactSlipTitle">Contact Information Slip (For HR)</div>
            <div className="docSlipRow"><b>Name:</b> {studentName}</div>
            <div className="docSlipRow"><b>Phone:</b> {profile?.contactNumber || "—"}</div>
            <div className="docSlipRow"><b>Email:</b> {profile?.email || "—"}</div>
            <div className="docSlipRow"><b>LinkedIn:</b> {profile?.linkedinUrl || "—"}</div>
            <div className="docSlipRow"><b>GitHub:</b> {profile?.githubUrl || "—"}</div>
          </footer>
        </article>
      </div>
    </div>
  );
}
