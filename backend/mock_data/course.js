const courses = [
  {
    id: "c1",
    courseCode: "ITCS495",
    courseName: "Special Topics in Databases and Intelligent Systems",
    competencyTags: ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5", "Tag 6"],
    relevancePercent: 90,
    grade: "A",
    visibleTo: ["u1"], // ✅ only user 1
  },
  {
    id: "c2",
    courseCode: "ITCS212",
    courseName: "Web Programming",
    competencyTags: ["Tag 1", "Tag 2", "Tag 3"],
    relevancePercent: 75,
    grade: "B+",
    visibleTo: ["u1", "u2", "u3"], // ✅ users 2 & 3
  },
];

export default courses;
