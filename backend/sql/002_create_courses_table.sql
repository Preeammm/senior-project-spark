CREATE TABLE IF NOT EXISTS courses (
  course_code VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  course_name VARCHAR(255),
  PRIMARY KEY (course_code, semester)
);
