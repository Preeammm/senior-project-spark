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

function resolveActiveCareer(careers: CareerDetail[], params: URLSearchParams): CareerDetail | null {
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

export default function CareerDetailsPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const from = params.get("from") ?? ""; // ✅ source page

  const careersQuery = useQuery({
    queryKey: ["careers"],
    queryFn: getCareers,
  });

  const activeCareer = useMemo(() => {
    if (!careersQuery.data) return null;
    return resolveActiveCareer(careersQuery.data, params);
  }, [careersQuery.data, params]);

  // ✅ open/close groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Developer: true,
    Data: true,
  });

  // ✅ group careers by "group" field from API
  const grouped = useMemo(() => {
    const list = careersQuery.data ?? [];
    const map = new Map<string, CareerDetail[]>();

    list.forEach((c) => {
      const g = c.group ?? "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    });

    // sort in each group
    for (const [g, items] of map.entries()) {
      items.sort((a, b) => a.title.localeCompare(b.title));
      map.set(g, items);
    }

    const order = ["Developer", "Data", "Other"];
    const out: { group: string; items: CareerDetail[] }[] = [];

    order.forEach((g) => {
      if (map.has(g)) out.push({ group: g, items: map.get(g)! });
    });

    // extra groups
    for (const [g, items] of map.entries()) {
      if (!order.includes(g)) out.push({ group: g, items });
    }

    return out;
  }, [careersQuery.data]);

  return (
    <div className="pageContainer">
      <PageHeader
        title="Career Details"
        careerExtra={
          <span
            className="cdBackLink"
            role="button"
            onClick={() => {
              // ✅ always go back to the page you came from
              if (from) navigate(from);
              else navigate("/home");
            }}
          >
            ← Back
          </span>
        }
      />

      <div className="dividerLine" />

      {careersQuery.isLoading && <div style={{ padding: 16 }}>Loading careers…</div>}

      {careersQuery.isError && (
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Failed to load careers</div>
          <div style={{ opacity: 0.8 }}>
            {(careersQuery.error as Error)?.message ?? "Unknown error"}
          </div>
        </div>
      )}

      {careersQuery.data && activeCareer && (
        <div className="cdLayout">
          <aside className="cdSidebar">
            <div className="cdSidebarTitle">Careers</div>

            <div className="cdSidebarList">
              {grouped.map(({ group, items }) => {
                const isOpen = openGroups[group] ?? true;

                return (
                  <div key={group} className="cdGroup">
                    <button
                      type="button"
                      className="cdGroupHeader"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [group]: !isOpen }))}
                    >
                      <span>{group}</span>
                      <span className={`cdChevron ${isOpen ? "open" : ""}`}>▾</span>
                    </button>

                    {isOpen ? (
                      <div className="cdGroupItems">
                        {items.map((c) => {
                          const isActive = c.id === activeCareer.id;

                          return (
                            <button
                              key={c.id}
                              type="button"
                              className={`cdSidebarItem ${isActive ? "active" : ""}`}
                              onClick={() => {
                                // ✅ IMPORTANT: keep `from` in URL
                                setParams((prev) => {
                                  prev.set("careerId", c.id);
                                  prev.delete("focus");
                                  if (from) prev.set("from", from);
                                  return prev;
                                });
                              }}
                            >
                              {c.title}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="cdMain">
            <h1 className="cdTitle">{activeCareer.title}</h1>
            <p className="cdIntro">{activeCareer.intro}</p>

            {activeCareer.sections.map((sec) => (
              <section key={sec.title} className="cdSection">
                <h2 className="cdSectionTitle">{sec.title}</h2>
                <ul className="cdList">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </section>
            ))}
          </main>
        </div>
      )}
    </div>
  );
}
