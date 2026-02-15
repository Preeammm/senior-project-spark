const DEFAULT_COMPETENCY_TAGS = [
  "Problem Solving",
  "Software Design",
  "Technical Communication",
  "Team Collaboration",
  "Version Control (Git)",
  "Software Testing",
] as const;

const CONTEXT_TAG_RULES: Array<{ keywords: string[]; tags: readonly string[] }> = [
  {
    keywords: ["web", "frontend", "front-end", "react", "ui", "ux", "html", "css", "javascript"],
    tags: [
      "Web Programming",
      "Frontend Development",
      "UI/UX Design",
      "JavaScript",
      "API Integration",
      "Version Control (Git)",
    ],
  },
  {
    keywords: ["database", "dbms", "sql", "data model", "schema", "query"],
    tags: [
      "Database Design",
      "SQL Querying",
      "Data Modeling",
      "Database Optimization",
      "Backend Development",
      "Data Integrity",
    ],
  },
  {
    keywords: ["api", "backend", "server", "microservice", "rest"],
    tags: [
      "API Development",
      "Backend Development",
      "System Design",
      "Authentication & Authorization",
      "Database Integration",
      "Software Testing",
    ],
  },
  {
    keywords: ["intelligent", "machine learning", "ml", "ai", "data mining", "analytics"],
    tags: [
      "Machine Learning Basics",
      "Data Analysis",
      "Python Programming",
      "Model Evaluation",
      "Data Preprocessing",
      "Problem Solving",
    ],
  },
];

function normalizeContext(s: string) {
  return s.trim().toLowerCase();
}

function pickContextTags(contextText?: string) {
  const ctx = normalizeContext(contextText ?? "");
  if (!ctx) return DEFAULT_COMPETENCY_TAGS;

  let best: readonly string[] = DEFAULT_COMPETENCY_TAGS;
  let bestScore = 0;
  for (const rule of CONTEXT_TAG_RULES) {
    const score = rule.keywords.reduce((sum, kw) => sum + (ctx.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      best = rule.tags;
      bestScore = score;
    }
  }
  return best;
}

function mapPlaceholderTag(tag: string, fallbackIndex: number, contextTags: readonly string[]) {
  const text = tag.trim();
  const match = text.match(/^tag\s*(\d+)$/i);
  if (!match) return text;

  const n = Number(match[1]);
  if (Number.isFinite(n) && n > 0) {
    return contextTags[(n - 1) % contextTags.length];
  }
  return contextTags[fallbackIndex % contextTags.length];
}

export function normalizeCompetencyTags(tags: string[], contextText?: string) {
  const contextTags = pickContextTags(contextText);
  return tags.map((tag, i) => mapPlaceholderTag(tag, i, contextTags));
}
