CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  personal_email VARCHAR(255),
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255)
);
