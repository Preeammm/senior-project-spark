import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

import "../styles/page.css";
import "./PortfolioGeneratorPage.css";

import {
  deleteDocument,
  getDocuments,
  renameDocument,
  type PortfolioDocLite,
} from "../features/portfolio/services/portfolio.api";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function PortfolioGeneratorPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // menu state (⋮)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // rename modal
  const [renameTarget, setRenameTarget] = useState<PortfolioDocLite | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<PortfolioDocLite | null>(null);

  // click outside menu
  const menuRootRef = useRef<HTMLDivElement | null>(null);

  const { data: docs, isLoading, error } = useQuery({
    queryKey: ["portfolioDocs"],
    queryFn: getDocuments,
  });

  const docList = useMemo(() => docs ?? [], [docs]);

  // close menu when click outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openMenuId) return;
      const root = menuRootRef.current;
      if (!root) return setOpenMenuId(null);
      if (!root.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openMenuId]);

  function onOpenDoc(id: string) {
    alert("TODO: Open document page (later)");
  }

  function onAskRename(doc: PortfolioDocLite) {
    setOpenMenuId(null);
    setRenameTarget(doc);
    setRenameValue(doc.title ?? "");
  }

  function onAskDelete(doc: PortfolioDocLite) {
    setOpenMenuId(null);
    setDeleteTarget(doc);
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDocument(deleteTarget.id);
      await qc.invalidateQueries({ queryKey: ["portfolioDocs"] });
      setDeleteTarget(null);
    } catch {
      alert("Delete failed. Please try again.");
    }
  }

  async function onConfirmRename() {
    if (!renameTarget) return;
    const newTitle = renameValue.trim();
    if (!newTitle) return;

    try {
      await renameDocument(renameTarget.id, newTitle);
      await qc.invalidateQueries({ queryKey: ["portfolioDocs"] });
      setRenameTarget(null);
      setRenameValue("");
    } catch {
      alert("Rename failed. Please try again.");
    }
  }

  return (
    <div className="pageContainer">
      {/* ✅ ไม่มี Career Focus แต่ยังมี View all career details */}
      <PageHeader
        title="Portfolio Content Generator"
        careerExtra={
          <span
            className="pcgCareerLink"
            onClick={() => alert("TODO: Career details page")}
          >
            View all career details
          </span>
        }
      />

      <div className="dividerLine" />

      {/* Your Items */}
      <div className="pcgSectionTitle">Your Items</div>
      <div className="pcgItemsRow">
        <div className="pcgItemCard" onClick={() => navigate("/projects")} role="button">
          <div className="pcgItemCardTop" />
          <div className="pcgItemCardBottom">
            <span className="pcgItemLink">My Projects</span>
          </div>
        </div>
      </div>

      <div className="pcgDivider" />

      {/* My Document */}
      <div className="pcgSectionTitle">My Document</div>

      <div className="pcgDocRow" ref={menuRootRef}>
        {/* Create new doc tile */}
        <button
          type="button"
          className="pcgCreateTile"
          onClick={() => navigate("/portfolio/new")}
        >
          <div className="pcgPaper">
            <div className="pcgPlus">+</div>
          </div>
          <div className="pcgCreateCaption">Create New Document</div>
        </button>

        {/* Docs */}
        {isLoading ? (
          <div className="pcgHint">Loading documents...</div>
        ) : error ? (
          <div className="pcgHint">Failed to load documents.</div>
        ) : docList.length === 0 ? (
          <div className="pcgHint">No documents yet. Click + to create one.</div>
        ) : (
          docList.map((doc) => {
            const isMenuOpen = openMenuId === doc.id;

            return (
              <div
                key={doc.id}
                className="pcgThumbCard"
                onClick={() => onOpenDoc(doc.id)}
                role="button"
              >
                {/* ✅ 3 dots ALWAYS visible TOP-RIGHT (inside pcgThumbCard) */}
                <button
                  type="button"
                  className="pcgMenuBtn"
                  title="More"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === doc.id ? null : doc.id));
                  }}
                >
                  ⋮
                </button>

                {/* dropdown menu (ใต้ปุ่ม ⋮) */}
                {isMenuOpen ? (
                  <div className="pcgMenu" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="pcgMenuItem"
                      onClick={() => onAskRename(doc)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="pcgMenuItem danger"
                      onClick={() => onAskDelete(doc)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}

                <div className="pcgThumbPreview">
                  <div className="pcgPreviewLine w60" />
                  <div className="pcgPreviewLine w90" />
                  <div className="pcgPreviewLine w85" />
                  <div className="pcgPreviewLine w80" />
                  <div className="pcgPreviewLine w90" />
                  <div className="pcgPreviewLine w55" />
                </div>

                <div className="pcgThumbFooter">
                  <div className="pcgThumbTitle">{doc.title}</div>
                  <div className="pcgThumbMeta">Last modified: {formatDate(doc.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== Rename Modal ===== */}
      {renameTarget ? (
        <div className="pcgModalOverlay" onMouseDown={() => setRenameTarget(null)}>
          <div className="pcgModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pcgModalTitle">Rename document</div>
            <div className="pcgModalSub">
              Enter a new name for: <b>{renameTarget.title}</b>
            </div>

            <input
              className="pcgModalInput"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="New document name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirmRename();
                if (e.key === "Escape") setRenameTarget(null);
              }}
            />

            <div className="pcgModalActions">
              <button type="button" className="pcgBtn" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="pcgBtn primary"
                onClick={onConfirmRename}
                disabled={renameValue.trim().length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== Delete Confirm Modal ===== */}
      {deleteTarget ? (
        <div className="pcgModalOverlay" onMouseDown={() => setDeleteTarget(null)}>
          <div className="pcgModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pcgModalTitle">Delete document?</div>
            <div className="pcgModalSub">
              Are you sure you want to delete <b>{deleteTarget.title}</b>? <br />
              This action cannot be undone.
            </div>

            <div className="pcgModalActions">
              <button type="button" className="pcgBtn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="pcgBtn danger" onClick={onConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
