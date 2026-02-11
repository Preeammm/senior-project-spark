/**
 * Mock Student Database
 * Used by server.js (in-memory store)
 * Each key = user id from USER_AUTH
 */

const me = {
  u1: {
    studentId: "6588087",
    name: "Yaowapa",
    surname: "Sabkasedkid",
    faculty: "Faculty of Information and Communication Technology",
    minor: "Database and Intelligent Systems (ITDB)",
    year: 4,

    avatarUrl: null,

    // editable
    email: "yaowapa@gmail.com",
    contactNumber: "",
    address: "",
    githubUrl: "https://github.com/Preeammm",
    linkedinUrl: "https://www.linkedin.com/in/yaowapa-sabkasedkid",
    dateOfBirth: "",
    gender: "",
  },

  u2: {
    studentId: "6588096",
    name: "Panipak",
    surname: "Sittiprasert",
    faculty: "Faculty of Information and Communication Technology",
    minor: "Database and Intelligent Systems (ITDB)",
    year: 4,

    avatarUrl: null,

    // editable
    email: "panipak@gmail.com",
    contactNumber: "",
    address: "",
    githubUrl: "",
    linkedinUrl: "",
    dateOfBirth: "",
    gender: "",
  },

  u3: {
    studentId: "6588107",
    name: "Apivich",
    surname: "Preedaarkaraphun",
    faculty: "Faculty of Information and Communication Technology",
    minor: "Database and Intelligent Systems (ITDB)",
    year: 4,

    avatarUrl: null,

    // editable
    email: "apivich@gmail.com",
    contactNumber: "",
    address: "",
    githubUrl: "",
    linkedinUrl: "",
    dateOfBirth: "",
    gender: "",
  },
};

export default me;
