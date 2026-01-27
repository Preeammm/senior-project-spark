import express from "express";
import cors from "cors";

// ✅ import จาก mock_data
import me from "./mock_data/me.js";
import projects from "./mock_data/project.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ===== USER LOGIN (mock auth) =====
const USER_AUTH = {
  username: "u6588087",
  password: "P1234567_",
};

// ===== LOGIN =====
app.post("/api/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (
    username !== USER_AUTH.username ||
    password !== USER_AUTH.password
  ) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  res.json(me); // ❌ ไม่ส่ง password
});

// ===== ME =====
app.get("/api/me", (req, res) => {
  res.json(me);
});

// ===== PROJECTS =====
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.listen(3000, () => {
  console.log("✅ API running at http://localhost:3000");
});
