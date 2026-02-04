import express from "express";
import cors from "cors";

import me from "./mock_data/me.js";
import projects from "./mock_data/project.js";
import courses from "./mock_data/course.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
  const profile = me[user.id];
  return {
    id: user.id,
    username: user.username,
    defaultPath: user.defaultPath,
    studentId: profile?.studentId,
    name: profile?.name,
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
app.get("/api/me", requireUser, (req, res) => {
  const profile = me[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  res.json(profile);
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

  // ✅ IMPORTANT FIX: allow lookup by internal id (c1/c2/...) OR courseCode (ITCS495/ITCS241/...)
  const course = courses.find((c) => c.id === courseId || c.courseCode === courseId);

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
    instructors: [
      { name: "Asst. Prof. Dr. (Mock Instructor)", email: "instructor@mahidol.ac.th" },
    ],
    courseTitleEN: course.courseName,
    courseTitleTH: "—",
  });
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

// list (no content)
app.get("/api/portfolio/documents", requireUser, (req, res) => {
  res.json(portfolioDocs.map(({ content, ...rest }) => rest));
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

// ✅ PATCH rename doc
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

// ✅ DELETE document (ONLY ONCE)
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
