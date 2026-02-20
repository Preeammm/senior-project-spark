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

    // read-only university email + editable personal email
    universityEmail: "yaowapa.sab@student.mahidol.ac.th",
    personalEmail: "",
    contactNumber: "0899999999",
    address: "Street 999 Moo 8 Chayangkul Rd., Soi Salaya  T.Mahidol, Nakhonpathom 99888",
    githubUrl: "https://github.com/Preeammm",
    linkedinUrl: "https://www.linkedin.com/in/yaowapa-sabkasedkid",
    dateOfBirth: "08/12/2004",
    gender: "female",
  },

  u2: {
    studentId: "6588096",
    name: "Panipak",
    surname: "Sittiprasert",
    faculty: "Faculty of Information and Communication Technology",
    minor: "Database and Intelligent Systems (ITDB)",
    year: 4,

    avatarUrl: null,

    // read-only university email + editable personal email
    universityEmail: "u6588096@student.mahidol.ac.th",
    personalEmail: "panipak@gmail.com",
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

    // read-only university email + editable personal email
    universityEmail: "u6588107@student.mahidol.ac.th",
    personalEmail: "apivich@gmail.com",
    contactNumber: "",
    address: "",
    githubUrl: "",
    linkedinUrl: "",
    dateOfBirth: "",
    gender: "",
  },
};

export default me;
