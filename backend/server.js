import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ===== USER คนเดียว =====
const USER = {
  username: "u6588087",
  password: "P1234567_",
  studentId: "6588087",
  name: "Yaowapa Sabkasedkid",
  faculty: "Faculty of Information and Communication Technology",
  major: "Database and Intelligent Systems (ITDB)",
  classYear: 4,
  avatarUrl: null,
};

// ===== LOGIN =====
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== USER.username || password !== USER.password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // ไม่ส่ง password กลับ
  const { password: _, ...userData } = USER;
  res.json(userData);
});

// ===== ME =====
app.get("/api/me", (req, res) => {
  const { password: _, ...userData } = USER;
  res.json(userData);
});

// ===== PROJECTS =====
app.get("/api/projects", (req, res) => {
  res.json([
    {
      id: "p1",
      projectName: "Final Project",
      courseName:
        "ITCS495 - Special Topics in Databases and Intelligent Systems",
      yearSemester: "Year 4 Semester 1",
      type: "Group",
      competencyTags: ["Tag 1", "Tag 2", "Tag 3"],
      relevancePercent: 90,
      materials: [],
    },
    {
      id: "p2",
      projectName: "Database Mini Project",
      courseName: "ITCS241 - Database Management Systems",
      yearSemester: "Year 2 Semester 1",
      type: "Individual",
      competencyTags: ["Tag 1", "Tag 2"],
      relevancePercent: 85,
      materials: [],
    },
  ]);
});

app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});
