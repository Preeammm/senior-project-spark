import express from "express";
import cors from "cors";

import me from "./mock_data/me.js";
import projects from "./mock_data/project.js";
import courses from "./mock_data/course.js";
import careers from "./mock_data/careers.js";

const app = express();
app.use(express.json());

// ✅ Make "me" mutable (acts like tiny in-memory database)
let meStore = JSON.parse(JSON.stringify(me));

/**
 * ✅ CORS
 * - If you set env: CORS_ORIGIN=http://localhost:5173,http://localhost:5174
 *   it will allow only those origins.
 * - If not set, allow common dev origins.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      const raw = process.env.CORS_ORIGIN;

      // default allowlist in dev
      const defaultAllow = ["http://localhost:5173", "http://localhost:5174"];

      const allowed = raw
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : defaultAllow;

      // allow same-origin requests / tools without origin
      if (!origin) return callback(null, true);

      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ===== USER LOGIN (mock auth) =====
const USER_AUTH = [
  { id: "u1", username: "u6588087", password: "ICT087", defaultPath: "/home" },
  { id: "u2", username: "u6588096", password: "ICT096", defaultPath: "/home" },
  { id: "u3", username: "u6588107", password: "ICT107", defaultPath: "/home" },
];

// helper: session object to store in localStorage
function pickSession(user) {
  const profile = meStore[user.id];
  return {
    id: user.id,
    username: user.username,
    defaultPath: user.defaultPath,
    studentId: profile?.studentId,
    name: profile?.name,
    surname: profile?.surname,
  };
}

// middleware: protect routes
function requireUser(req, res, next) {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ message: "Missing x-user-id" });

  const user = USER_AUTH.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: "Invalid user" });

  req.user = user;
  next();
}

// ===== LOGIN =====
app.post("/api/login", (req, res) => {
  const { username, password } = req.body ?? {};

  const user = USER_AUTH.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  res.json(pickSession(user));
});

// ===== ME (protected) =====
// Used by Home page student info card
app.get("/api/me", requireUser, (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  // Home wants: name, surname, year, minor, studentId, faculty, githubUrl, linkedinUrl
  res.json({
    studentId: profile.studentId ?? "",
    name: profile.name ?? "",
    surname: profile.surname ?? "",
    faculty: profile.faculty ?? "",
    minor: profile.minor ?? "",
    year: profile.year ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
  });
});

// ===== Helpers =====
function sanitizeUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";

  // allow only http/https (avoid javascript: etc)
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}

function sanitizeText(value, max = 300) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function sanitizeEmail(email) {
  const v = sanitizeText(email, 120);
  if (!v) return "";
  // simple check (OK for mock)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "";
  return v;
}

function sanitizePhone(phone) {
  const v = sanitizeText(phone, 40);
  if (!v) return "";
  return v.replace(/[^\d+\-\s()]/g, "");
}

function sanitizeDob(dob) {
  const v = sanitizeText(dob, 20);
  if (!v) return "";
  // allow YYYY-MM-DD only
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  return v;
}

function sanitizeGender(g) {
  const v = sanitizeText(g, 20);
  const allowed = ["Male", "Female", "Other", ""];
  return allowed.includes(v) ? v : "";
}

// ===== ME LINKS (legacy endpoints, optional keep) =====
app.get("/api/me/links", requireUser, (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  res.json({
    linkedinUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
  });
});

app.put("/api/me/links", requireUser, (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const linkedinUrl = sanitizeUrl(req.body?.linkedinUrl);
  const githubUrl = sanitizeUrl(req.body?.githubUrl);

  profile.linkedinUrl = linkedinUrl;
  profile.githubUrl = githubUrl;

  res.json({
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
  });
});

// ===== ME PROFILE (FULL PROFILE PAGE) =====
// Profile page needs default+editable fields
app.get("/api/me/profile", requireUser, (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  res.json({
    // default read-only
    studentId: profile.studentId ?? "",
    name: profile.name ?? "",
    surname: profile.surname ?? "",
    faculty: profile.faculty ?? "",
    minor: profile.minor ?? "",
    year: profile.year ?? "",

    // editable
    email: profile.email ?? "",
    contactNumber: profile.contactNumber ?? "",
    address: profile.address ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "",
  });
});

app.put("/api/me/profile", requireUser, (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  // update only editable fields
  profile.email = sanitizeEmail(req.body?.email);
  profile.contactNumber = sanitizePhone(req.body?.contactNumber);
  profile.address = sanitizeText(req.body?.address, 300);

  profile.githubUrl = sanitizeUrl(req.body?.githubUrl);
  profile.linkedinUrl = sanitizeUrl(req.body?.linkedinUrl);

  profile.dateOfBirth = sanitizeDob(req.body?.dateOfBirth);
  profile.gender = sanitizeGender(req.body?.gender);

  // return full profile again
  res.json({
    studentId: profile.studentId ?? "",
    name: profile.name ?? "",
    surname: profile.surname ?? "",
    faculty: profile.faculty ?? "",
    minor: profile.minor ?? "",
    year: profile.year ?? "",

    email: profile.email ?? "",
    contactNumber: profile.contactNumber ?? "",
    address: profile.address ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "",
  });
});

// ===== PROJECTS (protected) =====
app.get("/api/projects", requireUser, (req, res) => {
  const userId = req.user.id;

  const filtered = projects.filter((p) => {
    if (!p.visibleTo) return true;
    return p.visibleTo.includes(userId);
  });

  res.json(filtered);
});

// ===== COURSES (protected) =====
app.get("/api/courses", requireUser, (req, res) => {
  const userId = req.user.id;

  const filtered = courses.filter((c) => {
    if (!c.visibleTo) return true;
    return c.visibleTo.includes(userId);
  });

  res.json(filtered);
});

// ===== COURSE DETAIL (protected) =====
app.get("/api/courses/:courseId", requireUser, (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  const course = courses.find(
    (c) => c.id === courseId || c.courseCode === courseId
  );

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (course.visibleTo && !course.visibleTo.includes(userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({
    ...course,
    description: "Mock course detail data (replace later).",
    learningOutcomes: ["Outcome 1 (mock)", "Outcome 2 (mock)", "Outcome 3 (mock)"],
    credits: "3 (3–0–6)",
    semester: 1,
    year: 4,
    instructors: [{ name: "Asst. Prof. Dr. (Mock Instructor)", email: "instructor@mahidol.ac.th" }],
    courseTitleEN: course.courseName,
    courseTitleTH: "—",
  });
});

// ===== CAREERS (protected) =====
app.get("/api/careers", requireUser, (req, res) => {
  res.json(careers);
});

app.get("/api/careers/:careerId", requireUser, (req, res) => {
  const { careerId } = req.params;

  const career = careers.find((c) => c.id === careerId);
  if (!career) return res.status(404).json({ message: "Career not found" });

  res.json(career);
});

// ===== PORTFOLIO DOCUMENTS (protected, in-memory) =====
let portfolioDocs = [
  {
    id: "d1",
    title: "My Portfolio (Mock)",
    createdAt: new Date().toISOString(),
    content:
      "This is a mock portfolio document. Use POST /api/portfolio/documents to create new ones.",
  },
];

// list (WITH snippet preview)
app.get("/api/portfolio/documents", requireUser, (req, res) => {
  res.json(
    portfolioDocs.map(({ content, ...rest }) => {
      const text = typeof content === "string" ? content : "";
      const oneLine = text.replace(/\n+/g, " ").trim();
      return {
        ...rest,
        snippet: oneLine.slice(0, 180),
      };
    })
  );
});

// create
app.post("/api/portfolio/documents", requireUser, (req, res) => {
  const { title, content } = req.body ?? {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "title is required" });
  }

  const doc = {
    id: `d${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    content: typeof content === "string" ? content : "",
  };

  portfolioDocs = [doc, ...portfolioDocs];

  res.status(201).json({
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
  });
});

// get doc detail (with content)
app.get("/api/portfolio/documents/:docId", requireUser, (req, res) => {
  const { docId } = req.params;
  const doc = portfolioDocs.find((d) => d.id === docId);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
});

// download as txt
app.get("/api/portfolio/documents/:docId/download", requireUser, (req, res) => {
  const { docId } = req.params;
  const doc = portfolioDocs.find((d) => d.id === docId);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=portfolio-${docId}.txt`);
  res.send(`${doc.title}\n\n${doc.content}`);
});

// PATCH rename doc
app.patch("/api/portfolio/documents/:docId", requireUser, (req, res) => {
  const { docId } = req.params;
  const { title } = req.body ?? {};

  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "title is required" });
  }

  const doc = portfolioDocs.find((d) => d.id === docId);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  doc.title = title;
  res.json({ id: doc.id, title: doc.title });
});

// DELETE document
app.delete("/api/portfolio/documents/:docId", requireUser, (req, res) => {
  const { docId } = req.params;

  const idx = portfolioDocs.findIndex((d) => d.id === docId);
  if (idx === -1) return res.status(404).json({ message: "Document not found" });

  portfolioDocs.splice(idx, 1);
  res.status(204).send();
});

// ===== START SERVER =====
app.listen(3000, () => {
  console.log("✅ API running at http://localhost:3000");
});
