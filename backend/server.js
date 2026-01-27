import express from "express";
import cors from "cors";
import me from "./mock_data/me.js";
import project from "./mock_data/project.js";


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
  res.json(me);
});

app.get("/api/projects", (req, res) => {
  res.json(project);
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
