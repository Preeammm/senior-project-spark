/**
 * Mock Student Database
 * Used by server.js (in-memory store)
 * Each key = user id from USER_AUTH
 */

const me = {
  u1: {
    studentId: "6588087",
    name: "Yaowapa Sabkasedkid",
    faculty: "Faculty of Information and Communication Technology",
    major: "Database and Intelligent Systems (ITDB)",
    classYear: 4,

    // Optional fields
    avatarUrl: null,

    // ✅ Social Links (editable via /api/me/links)
    linkedinUrl: "",
    githubUrl: "",
  },

  u2: {
    studentId: "6588096",
    name: "Panipak Sittiprasert",
    faculty: "Faculty of Information and Communication Technology",
    major: "Database and Intelligent Systems (ITDB)",
    classYear: 4,

    avatarUrl: null,

    linkedinUrl: "",
    githubUrl: "",
  },

  u3: {
    studentId: "6588107",
    name: "Apivich Preedaarkaraphun",
    faculty: "Faculty of Information and Communication Technology",
    major: "Database and Intelligent Systems (ITDB)",
    classYear: 4,

    avatarUrl: null,

    linkedinUrl: "",
    githubUrl: "",
  },
};

export default me;
