import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

import { getCareers, type CareerDetail } from "../features/careers/services/careers.api";

import "../styles/page.css";
import "./CareerDetailsPage.css";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function sectionAnchorId(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `sec-${slug || "section"}`;
}

function resolveActiveCareer(
  careers: CareerDetail[],
  params: URLSearchParams
): CareerDetail | null {
  const careerId = params.get("careerId");
  if (careerId) {
    const byId = careers.find((c) => c.id === careerId);
    if (byId) return byId;
  }

  const focus = params.get("focus");
  if (focus) {
    const byTitle = careers.find((c) => normalize(c.title) === normalize(focus));
    if (byTitle) return byTitle;
  }

  return careers[0] ?? null;
}

type GroupKey = "Developer" | "Data" | "Other";

function groupKeyForCareer(title: string): GroupKey {
  const t = normalize(title);

  // ✅ Data group
  if (
    t.includes("data engineer") ||
    t.includes("data scientist") ||
    t.includes("data analyst")
  ) {
    return "Data";
  }

  // ✅ Developer group
  if (
    t.includes("software engineer") ||
    t.includes("front-end developer")
  ) {
    return "Developer";
  }

  return "Other";
}

export default function CareerDetailsPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const careersQuery = useQuery({
    queryKey: ["careers"],
    queryFn: getCareers,
  });

  const activeCareer = useMemo(() => {
    if (!careersQuery.data) return null;
    return resolveActiveCareer(careersQuery.data, params);
  }, [careersQuery.data, params]);

  // ✅ Back behavior: go to `from` if provided, otherwise history back
  const from = params.get("from"); // ex: "/projects"
  function goBack() {
    if (from) navigate(from);
    else navigate(-1);
  }

  // ✅ Group careers
  const grouped = useMemo(() => {
    const list = careersQuery.data ?? [];
    const dev: CareerDetail[] = [];
    const data: CareerDetail[] = [];
    const other: CareerDetail[] = [];

    for (const c of list) {
      const g = groupKeyForCareer(c.title);
      if (g === "Developer") dev.push(c);
      else if (g === "Data") data.push(c);
      else other.push(c);
    }

    // optional: sort alphabetically
    const byTitle = (a: CareerDetail, b: CareerDetail) => a.title.localeCompare(b.title);
    dev.sort(byTitle);
    data.sort(byTitle);
    other.sort(byTitle);

    return { Developer: dev, Data: data, Other: other };
  }, [careersQuery.data]);

  // ✅ accordion open/close
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Developer: true,
    Data: true,
    Other: false,
  });

  function toggleGroup(key: string) {
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  }

  function setActive(c: CareerDetail) {
    setParams((prev) => {
      prev.set("careerId", c.id);
      prev.delete("focus");
      // keep from param
      if (from) prev.set("from", from);
      return prev;
    });
  }

  return (
    <div className="pageContainer">
      <PageHeader
        title="Career Details"
        careerExtra={
          <button type="button" className="cdBackBtn" onClick={goBack}>
            ← Back
          </button>
        }
      />

      <div className="dividerLine" />

      {careersQuery.isLoading && <div className="cdState">Loading careers…</div>}

      {careersQuery.isError && (
        <div className="cdState">
          <div className="cdStateTitle">Failed to load careers</div>
          <div className="cdStateMsg">
            {(careersQuery.error as Error)?.message ?? "Unknown error"}
          </div>
        </div>
      )}

      {careersQuery.data && activeCareer && (
        <div className="cdLayout">
          {/* Sidebar */}
          <aside className="cdSidebar">
            <div className="cdSidebarHeader">
              <div className="cdSidebarTitle">Careers</div>
              <div className="cdSidebarSub">Select a career to view details</div>
            </div>

            {/* Group: Developer */}
            <div className="cdGroup">
              <button
                type="button"
                className="cdGroupHeader"
                onClick={() => toggleGroup("Developer")}
              >
                <span className="cdGroupLabel">Developer</span>
                <span className={`cdChevron ${openGroups.Developer ? "open" : ""}`}>▾</span>
              </button>

              {openGroups.Developer ? (
                <div className="cdGroupList">
                  {grouped.Developer.map((c) => {
                    const isActive = c.id === activeCareer.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`cdItem ${isActive ? "active" : ""}`}
                        onClick={() => setActive(c)}
                      >
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Group: Data */}
            <div className="cdGroup">
              <button type="button" className="cdGroupHeader" onClick={() => toggleGroup("Data")}>
                <span className="cdGroupLabel">Data</span>
                <span className={`cdChevron ${openGroups.Data ? "open" : ""}`}>▾</span>
              </button>

              {openGroups.Data ? (
                <div className="cdGroupList">
                  {grouped.Data.map((c) => {
                    const isActive = c.id === activeCareer.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`cdItem ${isActive ? "active" : ""}`}
                        onClick={() => setActive(c)}
                      >
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Group: Other (optional) */}
            {grouped.Other.length > 0 ? (
              <div className="cdGroup">
                <button
                  type="button"
                  className="cdGroupHeader"
                  onClick={() => toggleGroup("Other")}
                >
                  <span className="cdGroupLabel">Other</span>
                  <span className={`cdChevron ${openGroups.Other ? "open" : ""}`}>▾</span>
                </button>

                {openGroups.Other ? (
                  <div className="cdGroupList">
                    {grouped.Other.map((c) => {
                      const isActive = c.id === activeCareer.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`cdItem ${isActive ? "active" : ""}`}
                          onClick={() => setActive(c)}
                        >
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>

          {/* Main content */}
          <main className="cdMain">
            <div className="cdMainCard">
              <div className="cdMainInner">
                <div className="cdTitleRow">
                  <h1 className="cdTitle">{activeCareer.title}</h1>
                  <span className="cdBadge">{groupKeyForCareer(activeCareer.title)}</span>
                </div>

                <nav className="cdQuickLinks" aria-label="On this page">
                  {activeCareer.sections.map((sec) => (
                    <a key={sec.title} className="cdQuickLink" href={`#${sectionAnchorId(sec.title)}`}>
                      {sec.title}
                    </a>
                  ))}
                </nav>

                <p className="cdIntro">{activeCareer.intro}</p>

                <div className="cdSections">
                  {activeCareer.sections.map((sec) => (
                    <section key={sec.title} className="cdSection" id={sectionAnchorId(sec.title)}>
                      <h2 className="cdSectionTitle">{sec.title}</h2>
                      <ul className="cdList">
                        {sec.bullets.map((b, idx) => (
                          <li key={idx} className="cdListItem">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>

              <div className="cdReference">
                <span className="cdReferenceLabel">Reference:</span>
                <a
                  className="cdReferenceLink"
                  href="https://roadmap.thaiprogrammer.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  roadmap.thaiprogrammer.org
                </a>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
