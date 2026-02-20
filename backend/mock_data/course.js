const courses = [
  {
    id: "c1",
    courseCode: "ITCS495",
    courseName: "Special Topics in Databases and Intelligent Systems",
    competencyTags: [
      "Machine Learning Fundamentals",
      "Feature Engineering",
      "Model Evaluation",
      "Data Storytelling",
      "Experiment Design",
      "Team Collaboration",
    ],
    relevancePercent: 90,
    grade: "A",
    visibleTo: ["u1", "u2", "u3"],
  },
  {
    id: "c2",
    courseCode: "ITCS212",
    courseName: "Web Programming",
    competencyTags: ["JavaScript", "REST API Integration", "Frontend Development"],
    relevancePercent: 75,
    grade: "B+",
    visibleTo: ["u1", "u2", "u3"],
  },
  {
    id: "c3",
    courseCode: "ITCS241",
    courseName: "Database Management Systems",
    competencyTags: ["SQL", "Database Design"],
    relevancePercent: 85,
    grade: "A",
    visibleTo: ["u1", "u2", "u3"],
  },
];

export default courses;
