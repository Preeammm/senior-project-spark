const projects = [
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
    visibleTo: ["u1"], // ✅ only user 1
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
    visibleTo: ["u1","u2", "u3"], // ✅ users 2 & 3
  },
];

export default projects;
