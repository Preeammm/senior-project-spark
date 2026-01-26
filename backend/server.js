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

// (ถ้าจะเสิร์ฟไฟล์ pdf จริง)
app.use("/static", express.static("static"));

app.get("/api/me", (req, res) => {
  res.json({
    studentId: "6588087",
    name: "Yaowapa Sabkasedkid",
    faculty: "Faculty of Information and Communication Technology",
    major: "Database and Intelligent Systems (ITDB)",
    classYear: 4,
    avatarUrl: null,
  });
});

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
      materials: [
        { name: "Report.pdf", url: "http://localhost:3000/static/report.pdf" },
        {
          name: "Instruction.pdf",
          url: "http://localhost:3000/static/instruction.pdf",
        },
      ],
    },

    // 🔹 NEW DATA (แถวที่ 2)
    {
      id: "p2",
      projectName: "Database Mini Project",
      courseName: "ITCS241 - Database Management Systems",
      yearSemester: "Year 2 Semester 1",
      type: "Individual",
      competencyTags: ["Tag 1", "Tag 2"],
      relevancePercent: 85,
      materials: [
        { name: "Report.pdf", url: "http://localhost:3000/static/report2.pdf" },
        {
          name: "Instruction.pdf",
          url: "http://localhost:3000/static/instruction2.pdf",
        },
        {
          name: "query.sql",
          url: "http://localhost:3000/static/query.sql",
        },
      ],
    },
  ]);
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
