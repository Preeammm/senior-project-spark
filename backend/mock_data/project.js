const project = [
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
  ]

export default project;