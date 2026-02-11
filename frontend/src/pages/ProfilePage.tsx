import { useEffect, useMemo, useState } from "react";
import "./ProfilePage.css";
import { http } from "../services/http";

type Gender = "" | "Male" | "Female" | "Other";

type Profile = {
  // default (read-only)
  studentId: string;
  name: string;
  surname: string;
  year: string | number;
  minor: string;
  faculty: string;

  // editable
  email: string;
  contactNumber: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
};

const EMPTY: Profile = {
  studentId: "",
  name: "",
  surname: "",
  year: "",
  minor: "",
  faculty: "",

  email: "",
  contactNumber: "",
  address: "",
  githubUrl: "",
  linkedinUrl: "",
  dateOfBirth: "",
  gender: "",
};

type EditSection = null | "personal" | "address" | "links";

function initialsOf(name?: string, surname?: string) {
  const a = (name ?? "").trim()[0] ?? "";
  const b = (surname ?? "").trim()[0] ?? "";
  const v = `${a}${b}`.toUpperCase();
  return v || "U";
}

function formatDob(iso: string) {
  // display like 12-10-1990 style (DD-MM-YYYY) when not editing
  if (!iso) return "—";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, y, mm, dd] = m;
  return `${dd}-${mm}-${y}`;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="pfField">
      <div className="pfLabel">{label}</div>
      <div className="pfValue">{value || "—"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [draft, setDraft] = useState<Profile>(EMPTY);

  const [editing, setEditing] = useState<EditSection>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const avatarText = useMemo(
    () => initialsOf(profile.name, profile.surname),
    [profile.name, profile.surname]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const res = await http.get("/api/me/profile");
        const p = { ...EMPTY, ...(res.data ?? {}) };
        if (!alive) return;
        setProfile(p);
        setDraft(p);
      } catch (e) {
        console.log(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(section: EditSection) {
    setDraft(profile);
    setEditing(section);
    setMsg("");
  }

  function cancelEdit() {
    setDraft(profile);
    setEditing(null);
    setMsg("");
  }

  async function save() {
    setSaving(true);
    setMsg("");

    try {
      // send only editable fields
      const payload = {
        email: draft.email,
        contactNumber: draft.contactNumber,
        address: draft.address,
        githubUrl: draft.githubUrl,
        linkedinUrl: draft.linkedinUrl,
        dateOfBirth: draft.dateOfBirth,
        gender: draft.gender,
      };

      const res = await http.put("/api/me/profile", payload);
      const merged: Profile = {
        ...profile,
        ...payload,
        ...(res.data ?? {}),
      };

      setProfile(merged);
      setDraft(merged);
      setEditing(null);
      setMsg("Saved!");
      setTimeout(() => setMsg(""), 1200);
    } catch {
      setMsg("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pfPage">
        <div className="pfWrap">
          <div className="pfTitle">My Profile</div>
          <div className="pfCard">Loading...</div>
        </div>
      </div>
    );
  }

  const fullName = `${profile.name} ${profile.surname}`.trim() || "Student";
  const roleText = "Student";
  const subtitleText = profile.address ? profile.address : `${profile.faculty || ""}`.trim() || "—";

  const isPersonal = editing === "personal";
  const isAddress = editing === "address";
  const isLinks = editing === "links";

  return (
    <div className="pfPage">
      <div className="pfWrap">
        <div className="pfTitle">My Profile</div>

        {/* TOP CARD (avatar + name + role + subtitle) */}
        <div className="pfCard pfTopCard">
          <div className="pfTopLeft">
            <div className="pfAvatar">
              <div className="pfAvatarText">{avatarText}</div>
              <div className="pfAvatarCam" title="Change photo (mock)">
                📷
              </div>
            </div>

            <div className="pfTopInfo">
              <div className="pfTopName">{fullName}</div>
              <div className="pfTopRole">{roleText}</div>
              <div className="pfTopSub">{subtitleText}</div>
            </div>
          </div>

          {/* Small info badges (optional, looks nice) */}
          <div className="pfBadges">
            <div className="pfBadge">
              <div className="pfBadgeK">Student ID</div>
              <div className="pfBadgeV">{profile.studentId || "—"}</div>
            </div>
            <div className="pfBadge">
              <div className="pfBadgeK">Year</div>
              <div className="pfBadgeV">{String(profile.year ?? "—")}</div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION CARD */}
        <div className="pfCard">
          <div className="pfCardHead">
            <div className="pfCardHeadTitle">Personal Information</div>

            {isPersonal ? (
              <div className="pfHeadActions">
                <button className="pfBtn ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button className="pfBtn primary" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button className="pfBtn editOrange" onClick={() => startEdit("personal")}>
                Edit ✎
              </button>
            )}
          </div>

          <div className="pfGrid">
            {/* Row 1 */}
            <div className="pfCell">
              <div className="pfCellLabel">First Name</div>
              {isPersonal ? (
                <input className="pfInput" value={profile.name} disabled />
              ) : (
                <div className="pfCellValue">{profile.name || "—"}</div>
              )}
            </div>

            <div className="pfCell">
              <div className="pfCellLabel">Last Name</div>
              {isPersonal ? (
                <input className="pfInput" value={profile.surname} disabled />
              ) : (
                <div className="pfCellValue">{profile.surname || "—"}</div>
              )}
            </div>

            <div className="pfCell">
              <div className="pfCellLabel">Date of Birth</div>
              {isPersonal ? (
                <input
                  className="pfInput"
                  type="date"
                  name="dateOfBirth"
                  value={draft.dateOfBirth}
                  onChange={onChange}
                />
              ) : (
                <div className="pfCellValue">{formatDob(profile.dateOfBirth)}</div>
              )}
            </div>

            {/* Row 2 */}
            <div className="pfCell">
              <div className="pfCellLabel">Email Address</div>
              {isPersonal ? (
                <input
                  className="pfInput"
                  name="email"
                  value={draft.email}
                  onChange={onChange}
                  placeholder="your@email.com"
                />
              ) : (
                <div className="pfCellValue">{profile.email || "—"}</div>
              )}
            </div>

            <div className="pfCell">
              <div className="pfCellLabel">Phone Number</div>
              {isPersonal ? (
                <input
                  className="pfInput"
                  name="contactNumber"
                  value={draft.contactNumber}
                  onChange={onChange}
                  placeholder="08x-xxx-xxxx"
                />
              ) : (
                <div className="pfCellValue">{profile.contactNumber || "—"}</div>
              )}
            </div>

            <div className="pfCell">
              <div className="pfCellLabel">Gender</div>
              {isPersonal ? (
                <select className="pfInput" name="gender" value={draft.gender} onChange={onChange}>
                  <option value="">—</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="pfCellValue">{profile.gender || "—"}</div>
              )}
            </div>
          </div>

          {/* Read-only student info (as requested) */}
          <div className="pfDivider" />
          <div className="pfMiniGrid">
            <Field label="Faculty" value={profile.faculty} />
            <Field label="Minor" value={profile.minor} />
            <Field label="Year" value={String(profile.year ?? "")} />
            <Field label="Student ID" value={profile.studentId} />
          </div>
        </div>

        {/* ADDRESS CARD */}
        <div className="pfCard">
          <div className="pfCardHead">
            <div className="pfCardHeadTitle">Address</div>

            {isAddress ? (
              <div className="pfHeadActions">
                <button className="pfBtn ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button className="pfBtn primary" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button className="pfBtn editGray" onClick={() => startEdit("address")}>
                Edit ✎
              </button>
            )}
          </div>

          <div className="pfGrid">
            <div className="pfCell pfCellFull">
              <div className="pfCellLabel">Address</div>
              {isAddress ? (
                <textarea
                  className="pfTextarea"
                  name="address"
                  value={draft.address}
                  onChange={onChange}
                  placeholder="Your address"
                  rows={3}
                />
              ) : (
                <div className="pfCellValue">{profile.address || "—"}</div>
              )}
            </div>
          </div>
        </div>

        {/* LINKS CARD */}
        <div className="pfCard">
          <div className="pfCardHead">
            <div className="pfCardHeadTitle">Links</div>

            {isLinks ? (
              <div className="pfHeadActions">
                <button className="pfBtn ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button className="pfBtn primary" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button className="pfBtn editGray" onClick={() => startEdit("links")}>
                Edit ✎
              </button>
            )}
          </div>

          <div className="pfGrid">
            <div className="pfCell">
              <div className="pfCellLabel">LinkedIn</div>
              {isLinks ? (
                <input
                  className="pfInput"
                  name="linkedinUrl"
                  value={draft.linkedinUrl}
                  onChange={onChange}
                  placeholder="https://linkedin.com/in/..."
                />
              ) : (
                <div className="pfCellValue">
                  {profile.linkedinUrl ? (
                    <a className="pfLink" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                      {profile.linkedinUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              )}
            </div>

            <div className="pfCell">
              <div className="pfCellLabel">GitHub</div>
              {isLinks ? (
                <input
                  className="pfInput"
                  name="githubUrl"
                  value={draft.githubUrl}
                  onChange={onChange}
                  placeholder="https://github.com/..."
                />
              ) : (
                <div className="pfCellValue">
                  {profile.githubUrl ? (
                    <a className="pfLink" href={profile.githubUrl} target="_blank" rel="noreferrer">
                      {profile.githubUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {msg && <div className="pfToast">{msg}</div>}
      </div>
    </div>
  );
}
