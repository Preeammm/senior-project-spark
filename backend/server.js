import express from "express";
import cors from "cors";

import me from "./mock_data/me.js";
import projects from "./mock_data/project.js";
import courses from "./mock_data/course.js";
import careers from "./mock_data/careers.js";
import pool from "./db.js";

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

// ===== TEST DB CONNECTION =====
app.get("/api/skill_score", requireUser, async (req, res) => {
  try {
    const profile = meStore[req.user.id];
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const studentId = profile.studentId;
    if (!studentId) return res.status(400).json({ message: "Missing student ID" });

    const careerFocus = normalizeCareerFocus(req.query?.careerFocus);
    if (!careerFocus) {
      return res.status(400).json({ message: "Missing or invalid career focus" });
    }

    const results = await pool.query(`
      WITH spider_chart AS (
      SELECT 
          cr.career_name,
          sfsk.skill_title,
          cos.course_name,
          c.clo_code,
          c.level_id,
          SUM(sas.student_score_clo) as total_st_score,
          SUM(acm.full_score_clo) as total_full_score

      FROM careers cr

      INNER JOIN career_skill_mapping csm
          ON cr.career_id = csm.career_id

      INNER JOIN sfia_skills sfsk
          ON csm.skill_id = sfsk.skill_id

      inner join sfia_levels sfle
          ON csm.level_id = sfle.level_id
          
      inner join clo c
          ON csm.skill_id = c.skill_id   

      inner join courses cos 
          ON c.course_code = cos.course_code and c.semester = cos.semester

      inner join assessments assm
          ON cos.course_code = assm.course_code and cos.semester = assm.semester

      inner join assessment_clo_mapping acm
          ON c.clo_id = acm.clo_id and assm.assessment_id = acm.assessment_id

      inner join student_assessment_scores sas
          ON acm.clo_id = sas.clo_id and acm.assessment_id = sas.assessment_id

      inner join students st
          ON sas.student_id = st.student_id

      WHERE 
        st.student_id = $1 and cr.career_name = $2 
        and c.semester = (
          SELECT MAX(c2.semester)
          FROM clo c2
          WHERE c2.course_code = c.course_code 
          )

      GROUP BY 
          cr.career_name,
          sfsk.skill_title,
          cos.course_name,
          c.clo_code,
          sfle.level_id,
          c.semester,
          c.clo_id

      ORDER BY 
          cr.career_name,
          sfsk.skill_title,
          cos.course_name, 
          c.semester
      )

      SELECT 
          career_name,
          skill_title,
          level_id,
          AVG(total_st_score::numeric / NULLIF(total_full_score, 0)) * level_id AS performance_score
      FROM spider_chart
      GROUP BY 
          career_name,
          level_id,
          skill_title
          
      order by skill_title
    `, [studentId, careerFocus]);

    res.status(200).json({
      data: results.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});//

app.get("/api/career_info", requireUser, async (req, res) => {
  const careerFocus = normalizeCareerFocus(req.query?.careerFocus);
    if (!careerFocus) {
      return res.status(400).json({ message: "Missing or invalid career focus" });
    }

  const results = await pool.query(`
    SELECT careers.career_name,
    csm.level_id,
    sfsk.skill_title
      FROM careers 
      INNER JOIN career_skill_mapping csm
        On careers.career_id = csm.career_id
      INNER JOIN sfia_skills sfsk
        on csm.skill_id = sfsk.skill_id
      WHERE career_name = $1`, [careerFocus]);
  res.status(200).json({
    data: results.rows,
  });
});// this call data for skills required for each career focus

app.get("/api/assessments", requireUser, async (req, res) => {
  try {
    const profile = meStore[req.user.id];
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const studentId = profile.studentId;
    if (!studentId) return res.status(400).json({ message: "Missing student ID" });

    const careerFocus = normalizeCareerFocus(req.query?.careerFocus);
    if (!careerFocus) {
      return res.status(400).json({ message: "Missing or invalid career focus" });
    }

    const results = await pool.query(`
    SELECT 
        c.course_code,
        cos.course_name,
        c.semester,
        ss.skill_title,
        AVG(sas.student_score_clo::float / acm.full_score_clo) AS total_normalized_score

    FROM student_assessment_scores sas

    INNER JOIN clo c 
        ON sas.clo_id = c.clo_id

    INNER JOIN enrollments e 
        ON sas.student_id = e.student_id 
        AND c.course_code = e.course_code
        AND c.semester = e.semester

    INNER JOIN career_skill_mapping csm 
        ON c.skill_id = csm.skill_id 
        AND c.level_id = csm.level_id

    INNER JOIN careers cr 
        ON csm.career_id = cr.career_id

    INNER JOIN assessment_clo_mapping acm
        ON c.clo_id = acm.clo_id
        AND sas.assessment_id = acm.assessment_id

    INNER JOIN assessments asm
        ON asm.assessment_id = acm.assessment_id

    INNER JOIN courses cos
        ON asm.course_code = cos.course_code
        AND asm.semester = cos.semester

    INNER JOIN sfia_skills ss
        ON c.skill_id = ss.skill_id

      WHERE sas.student_id = $1 AND cr.career_name = $2 AND asm.assessment_type = 'Project'

    GROUP BY 
        c.course_code,
        ss.skill_title,
        cos.course_name,
        c.semester;
    `, [studentId, careerFocus]);

    const data = results.rows.map((row) => ({
      ...row,
      total_normalized_score: Math.round(Number(row.total_normalized_score) * 100),
    }));

    res.status(200).json({
      data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});//this call data for asssessment scores calculated

app.get("/api/student", requireUser, async (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  const studentId = profile.studentId;
  if (!studentId) return res.status(400).json({ message: "Missing student ID" });

  const results = await pool.query("SELECT * FROM students WHERE student_id = $1", [studentId]);
  res.status(200).json({
    data: results.rows,
  });
}); // this call data for student information (personal email, github, linkedin)

app.get("/api/relavacne_scores", requireUser, async (req, res) => {
  try {
    const profile = meStore[req.user.id];
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const studentId = profile.studentId;
    if (!studentId) return res.status(400).json({ message: "Missing student ID" });

    const careerFocus = normalizeCareerFocus(req.query?.careerFocus);
    if (!careerFocus) {
      return res.status(400).json({ message: "Missing or invalid career focus" });
    }

    const results = await pool.query(`
    WITH ranked_data AS (
    SELECT 
        c.course_code,
        cr.career_name,
        cos.course_name,
        sfsk.skill_title,
        c.level_id as lcourse,
        csm.level_id as lcareer

    FROM careers cr

    INNER JOIN career_skill_mapping csm
        ON cr.career_id = csm.career_id

    INNER JOIN sfia_skills sfsk
        ON csm.skill_id = sfsk.skill_id

    INNER JOIN sfia_levels sfle
        ON csm.level_id = sfle.level_id
        
    INNER JOIN clo c
        ON csm.skill_id = c.skill_id   

    INNER JOIN courses cos 
        ON c.course_code = cos.course_code 
        AND c.semester = cos.semester

    INNER JOIN assessment_clo_mapping acm
        ON c.clo_id = acm.clo_id 

    INNER JOIN student_assessment_scores sas
        ON acm.clo_id = sas.clo_id 
        AND acm.assessment_id = sas.assessment_id

    INNER JOIN students st
        ON sas.student_id = st.student_id

    WHERE 
        st.student_id = $1
        AND cr.career_name = $2


        AND (c.skill_id, cos.course_name, c.semester, c.level_id, c.clo_code) IN (
            SELECT skill_id, course_name, semester, level_id, clo_code
            FROM (
                SELECT 
                    c2.skill_id,
                    cos2.course_name,
                    c2.semester,
                    c2.level_id,
                    c2.clo_code,

                    ROW_NUMBER() OVER (
                        PARTITION BY cos2.course_name,c2.skill_id
                        ORDER BY 
                            c2.semester DESC,
                            c2.level_id DESC,
                            c2.clo_code DESC
                    ) as rn

                FROM clo c2 

                INNER JOIN courses cos2
                    ON c2.course_code = cos2.course_code
            ) t
            WHERE rn = 1
        )

    group by c.course_code,
        c.semester,
        cr.career_name,
        sfsk.skill_title,
        cos.course_name,
        c.clo_code,
        c.level_id,
        csm.level_id
    )

    SELECT 
        course_code,
        career_name,
        course_name,
        LEAST(ROUND(SUM(lcourse)::numeric / NULLIF(SUM(lcareer), 0), 2),1) AS score,
        LEAST(ROUND(SUM(lcourse)::numeric / NULLIF(SUM(lcareer), 0), 2),1) + COUNT(course_name) AS index
    FROM ranked_data
    GROUP BY career_name, course_code,course_name;
    `, [studentId, careerFocus]);

    res.status(200).json({
      data: results.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});// this call data for relavacne scores (calculate from course levels and career focus)

app.get("/api/relavacne_info", requireUser, async (req, res) => {
  try {
    const profile = meStore[req.user.id];
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const studentId = profile.studentId;
    if (!studentId) return res.status(400).json({ message: "Missing student ID" });

    const careerFocus = normalizeCareerFocus(req.query?.careerFocus);
    if (!careerFocus) {
      return res.status(400).json({ message: "Missing or invalid career focus" });
    }

    const results = await pool.query(`
    WITH ranked_data AS (
    SELECT 
        c.course_code,
        cr.career_name,
        cos.course_name,
        sfsk.skill_title,
        c.level_id as lcourse,
        csm.level_id as lcareer

    FROM careers cr

    INNER JOIN career_skill_mapping csm
        ON cr.career_id = csm.career_id

    INNER JOIN sfia_skills sfsk
        ON csm.skill_id = sfsk.skill_id

    INNER JOIN sfia_levels sfle
        ON csm.level_id = sfle.level_id
        
    INNER JOIN clo c
        ON csm.skill_id = c.skill_id   

    INNER JOIN courses cos 
        ON c.course_code = cos.course_code 
        AND c.semester = cos.semester

    INNER JOIN assessment_clo_mapping acm
        ON c.clo_id = acm.clo_id 

    INNER JOIN student_assessment_scores sas
        ON acm.clo_id = sas.clo_id 
        AND acm.assessment_id = sas.assessment_id

    INNER JOIN students st
        ON sas.student_id = st.student_id

    WHERE 
        st.student_id = $1
        AND cr.career_name = $2

        AND (c.skill_id, cos.course_name, c.semester, c.level_id, c.clo_code) IN (
            SELECT skill_id, course_name, semester, level_id, clo_code
            FROM (
                SELECT 
                    c2.skill_id,
                    cos2.course_name,
                    c2.semester,
                    c2.level_id,
                    c2.clo_code,

                    ROW_NUMBER() OVER (
                        PARTITION BY cos2.course_name,c2.skill_id
                        ORDER BY 
                            c2.semester DESC,
                            c2.level_id DESC,
                            c2.clo_code DESC
                    ) as rn

                FROM clo c2 

                INNER JOIN courses cos2
                    ON c2.course_code = cos2.course_code
            ) t
            WHERE rn = 1
        )

      group by c.course_code,
          c.semester,
          cr.career_name,
          sfsk.skill_title,
          cos.course_name,
          c.clo_code,
          c.level_id,
          csm.level_id
      )

        SELECT *
        FROM ranked_data;
        
    `, [studentId, careerFocus]);

    res.status(200).json({
      data: results.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});// this call data for skills for each course

// ==============================


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

  // allow users to save common profile URLs with or without protocol
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
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

function deriveUniversityEmail(profile) {
  const explicit = sanitizeEmail(profile?.universityEmail);
  if (explicit) return explicit;

  const sid = sanitizeText(profile?.studentId, 40).replace(/[^\w.-]/g, "");
  if (!sid) return "";
  return `u${sid}@student.mahidol.ac.th`;
}
async function persistStudentProfile(profile) {
  if (!profile?.studentId) return;

const studentId = sanitizeText(profile.studentId, 40).replace(/[^\w.-]/g, "");
  if (!studentId) return;

  const personalEmail = sanitizeEmail(profile.personalEmail ?? profile.email ?? "");
  const githubUrl = sanitizeUrl(profile.githubUrl);
  const linkedinUrl = sanitizeUrl(profile.linkedinUrl);

  await pool.query(
    `INSERT INTO students (student_id, personal_email, github_url, linkedin_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id) DO UPDATE SET
       personal_email = EXCLUDED.personal_email,
       github_url = EXCLUDED.github_url,
       linkedin_url = EXCLUDED.linkedin_url`,
    [studentId, personalEmail, githubUrl, linkedinUrl]
  );
}

function normalizeCareerFocus(raw) {
  const value = String(raw ?? "").trim();
  return value ? value : "";
}

const COURSE_RELEVANCE_BY_FOCUS = {
  c1: { // ITCS495 - Special Topics in Databases and Intelligent Systems
    "Data Analyst": 90,
    "Data Engineer": 88,
    "Software Engineer": 66,
  },
  c2: { // ITCS212 - Web Programming
    "Data Analyst": 60,
    "Data Engineer": 72,
    "Software Engineer": 92,
  },
  c3: { // ITCS241 - Database Management Systems
    "Data Analyst": 85,
    "Data Engineer": 90,
    "Software Engineer": 72,
  },
};

const PROJECT_RELEVANCE_BY_FOCUS = {
  p1: {
    "Data Analyst": 90,
    "Data Engineer": 87,
    "Software Engineer": 70,
  },
  p2: {
    "Data Analyst": 85,
    "Data Engineer": 89,
    "Software Engineer": 68,
  },
};

function findCourseForProject(project) {
  const codeMatch = String(project?.courseName ?? "").match(/^([A-Za-z]{2,10}\d{2,6})\b/);
  const courseCode = codeMatch?.[1]?.toUpperCase();

  if (courseCode) {
    const matchedByCode = courses.find((course) => course.courseCode?.toUpperCase() === courseCode);
    if (matchedByCode) return matchedByCode;
  }

  const normalizedProjectCourse = String(project?.courseName ?? "")
    .split(" - ")
    .pop()
    ?.trim()
    .toLowerCase();

  if (!normalizedProjectCourse) return null;

  return (
    courses.find((course) => course.courseName?.trim().toLowerCase() === normalizedProjectCourse) ?? null
  );
}

function getFocusedRelevance(baseValue, profile, careerFocus) {
  if (!careerFocus || !profile || !(careerFocus in profile)) {
    return baseValue;
  }
  return profile[careerFocus];
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

    // read-only + editable
    universityEmail: deriveUniversityEmail(profile),
    personalEmail: profile.personalEmail ?? profile.email ?? "",
    // keep backward compatibility for existing consumers
    email: profile.personalEmail ?? profile.email ?? "",
    contactNumber: profile.contactNumber ?? "",
    address: profile.address ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "",
  });
});

app.put("/api/me/profile", requireUser, async (req, res) => {
  const profile = meStore[req.user.id];
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  const body = req.body ?? {};

  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const pickBodyValue = (...keys) => {
    for (const key of keys) {
      if (hasOwn(key)) return body[key];
    }
    return undefined;
  };

  // update only editable fields
  const personalEmailRaw = pickBodyValue("personalEmail", "email", "personal_email");
  if (personalEmailRaw !== undefined) {
    const nextPersonalEmail = sanitizeEmail(personalEmailRaw);
    profile.personalEmail = nextPersonalEmail;
    // keep backward compatibility for existing consumers
    profile.email = nextPersonalEmail;
  }

  if (hasOwn("contactNumber")) {
    profile.contactNumber = sanitizePhone(body.contactNumber);
  }
  if (hasOwn("address")) {
    profile.address = sanitizeText(body.address, 300);
  }

  const githubRaw = pickBodyValue("githubUrl", "githubURL", "github");
  if (githubRaw !== undefined) {
    profile.githubUrl = sanitizeUrl(githubRaw);
  }
  const linkedinRaw = pickBodyValue("linkedinUrl", "linkedInUrl", "linkedin");
  if (linkedinRaw !== undefined) {
    profile.linkedinUrl = sanitizeUrl(linkedinRaw);
  }

  if (hasOwn("dateOfBirth")) {
    profile.dateOfBirth = sanitizeDob(body.dateOfBirth);
  }
  if (hasOwn("gender")) {
    profile.gender = sanitizeGender(body.gender);
  }

  try {
    await persistStudentProfile(profile);
  } catch (error) {
    console.error("persistStudentProfile failed", error);
  }

  // return full profile again
  res.json({
    studentId: profile.studentId ?? "",
    name: profile.name ?? "",
    surname: profile.surname ?? "",
    faculty: profile.faculty ?? "",
    minor: profile.minor ?? "",
    year: profile.year ?? "",

    universityEmail: deriveUniversityEmail(profile),
    personalEmail: profile.personalEmail ?? profile.email ?? "",
    // keep backward compatibility for existing consumers
    email: profile.personalEmail ?? profile.email ?? "",
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
  const careerFocus = normalizeCareerFocus(req.query?.careerFocus);

  const filtered = projects.filter((p) => {
    if (!p.visibleTo) return true;
    return p.visibleTo.includes(userId);
  });

  const scored = filtered.map((project) => ({
    ...project,
    performancePercent: project.performancePercent ?? project.relevancePercent ?? 0,
    relevancePercent: getFocusedRelevance(
      project.relevancePercent,
      PROJECT_RELEVANCE_BY_FOCUS[project.id],
      careerFocus
    ),
    courseImportancePercent: (() => {
      const course = findCourseForProject(project);
      if (!course) return 0;
      return getFocusedRelevance(
        course.relevancePercent,
        COURSE_RELEVANCE_BY_FOCUS[course.id],
        careerFocus
      );
    })(),
  }));

  scored.sort((a, b) => {
    if (careerFocus) {
      return (
        b.courseImportancePercent - a.courseImportancePercent ||
        b.performancePercent - a.performancePercent
      );
    }

    return b.performancePercent - a.performancePercent;
  });
  res.json(scored);
});

// ===== COURSES (protected) =====
app.get("/api/courses", requireUser, (req, res) => {
  const userId = req.user.id;
  const careerFocus = normalizeCareerFocus(req.query?.careerFocus);

  const filtered = courses.filter((c) => {
    if (!c.visibleTo) return true;
    return c.visibleTo.includes(userId);
  });

  const scored = filtered.map((course) => ({
    ...course,
    relevancePercent: getFocusedRelevance(
      course.relevancePercent,
      COURSE_RELEVANCE_BY_FOCUS[course.id],
      careerFocus
    ),
  }));

  scored.sort((a, b) => b.relevancePercent - a.relevancePercent);
  res.json(scored);
});

// ===== COURSE DETAIL (protected) =====
app.get("/api/courses/:courseId", requireUser, (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  const careerFocus = normalizeCareerFocus(req.query?.careerFocus);

  const course = courses.find(
    (c) => c.id === courseId || c.courseCode === courseId
  );

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (course.visibleTo && !course.visibleTo.includes(userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({
    ...course,
    relevancePercent: getFocusedRelevance(
      course.relevancePercent,
      COURSE_RELEVANCE_BY_FOCUS[course.id],
      careerFocus
    ),
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
    updatedAt: new Date().toISOString(),
    content: `# My Portfolio (Mock)

## Basic Information
- Career Focus: **Data Analyst**
- Use SPARK Personal Info: **Yes**

## Occupation / Position
Data Analyst

## About Me
I am an ICT student focused on Data Analyst roles, with hands-on experience in data preparation, SQL querying, dashboard thinking, and presenting insights from project outcomes.

## Academic Projects
1. **Final Project** — ITCS495 - Special Topics in Databases and Intelligent Systems • Year 4 Semester 1 • Group
2. **Database Mini Project** — ITCS241 - Database Management Systems • Year 2 Semester 1 • Individual
`,
    data: {
      careerFocus: "Data Analyst",
      usePersonalInfo: true,
      occupation: "Data Analyst",
      aboutMe:
        "I am an ICT student focused on Data Analyst roles, with hands-on experience in data preparation, SQL querying, dashboard thinking, and presenting insights from project outcomes.",
      selectedProjectIds: [],
    },
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
  const { title, content, data } = req.body ?? {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "title is required" });
  }

  const now = new Date().toISOString();
  const doc = {
    id: `d${Date.now()}`,
    title,
    createdAt: now,
    updatedAt: now,
    content: typeof content === "string" ? content : "",
    data: data && typeof data === "object" ? data : null,
  };

  portfolioDocs = [doc, ...portfolioDocs];

  res.status(201).json({
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
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

// PATCH update doc
app.patch("/api/portfolio/documents/:docId", requireUser, (req, res) => {
  const { docId } = req.params;
  const { title, content, data } = req.body ?? {};

  const doc = portfolioDocs.find((d) => d.id === docId);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const hasTitle = typeof title === "string";
  const hasContent = typeof content === "string";
  const hasData = data && typeof data === "object";

  if (!hasTitle && !hasContent && !hasData) {
    return res.status(400).json({ message: "title, content, or data is required" });
  }

  if (hasTitle) {
    if (!title.trim()) {
      return res.status(400).json({ message: "title must not be empty" });
    }
    doc.title = title;
  }

  if (hasContent) {
    doc.content = content;
  }

  if (hasData) {
    doc.data = data;
  }

  doc.updatedAt = new Date().toISOString();

  res.json({
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    content: doc.content,
    data: doc.data ?? null,
  });
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
