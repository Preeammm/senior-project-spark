ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE IF EXISTS students
  ALTER COLUMN student_id TYPE INT USING student_id::INT,
  ALTER COLUMN student_id SET NOT NULL;

ALTER TABLE IF EXISTS students
  DROP CONSTRAINT IF EXISTS students_pkey;

ALTER TABLE IF EXISTS students
  ADD PRIMARY KEY (student_id);

ALTER TABLE IF EXISTS students
  DROP COLUMN IF EXISTS id;

ALTER TABLE IF EXISTS courses
  ALTER COLUMN course_code TYPE VARCHAR(20),
  ALTER COLUMN semester TYPE VARCHAR(5) USING semester::VARCHAR(5),
  ALTER COLUMN course_code SET NOT NULL,
  ALTER COLUMN semester SET NOT NULL;

CREATE TABLE IF NOT EXISTS students (
  student_id INT PRIMARY KEY,
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  personal_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sfia_skills (
  skill_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  skill_title VARCHAR(255) NOT NULL,
  skill_description TEXT
);

CREATE TABLE IF NOT EXISTS sfia_levels (
  level_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL,
  level_description TEXT,
  level_weight FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS careers (
  career_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  career_name VARCHAR(255) NOT NULL,
  career_description TEXT,
  year INT
);

CREATE TABLE IF NOT EXISTS courses (
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  course_name VARCHAR(255),
  PRIMARY KEY (course_code, semester)
);

CREATE TABLE IF NOT EXISTS clo (
  clo_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  level_id INT NOT NULL,
  skill_id INT NOT NULL,
  clo_code INT NOT NULL,
  clo_description TEXT,
  CONSTRAINT fk_clo_course
    FOREIGN KEY (course_code, semester) REFERENCES courses (course_code, semester),
  CONSTRAINT fk_clo_level
    FOREIGN KEY (level_id) REFERENCES sfia_levels (level_id),
  CONSTRAINT fk_clo_skill
    FOREIGN KEY (skill_id) REFERENCES sfia_skills (skill_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  assessment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  assessment_type VARCHAR(50) NOT NULL,
  CONSTRAINT fk_assessment_course
    FOREIGN KEY (course_code, semester) REFERENCES courses (course_code, semester)
);

CREATE TABLE IF NOT EXISTS assessment_clo_mapping (
  assessment_id INT NOT NULL,
  clo_id INT NOT NULL,
  full_score_clo FLOAT NOT NULL,
  PRIMARY KEY (assessment_id, clo_id),
  CONSTRAINT fk_assessment_clo_mapping_assessment
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id),
  CONSTRAINT fk_assessment_clo_mapping_clo
    FOREIGN KEY (clo_id) REFERENCES clo (clo_id)
);

CREATE TABLE IF NOT EXISTS student_assessment_scores (
  student_id INT NOT NULL,
  assessment_id INT NOT NULL,
  clo_id INT NOT NULL,
  student_score_clo FLOAT NOT NULL,
  PRIMARY KEY (student_id, assessment_id, clo_id),
  CONSTRAINT fk_student_assessment_scores_student
    FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_student_assessment_scores_assessment
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id),
  CONSTRAINT fk_student_assessment_scores_clo
    FOREIGN KEY (clo_id) REFERENCES clo (clo_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  student_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  enrollment_type VARCHAR(20),
  PRIMARY KEY (student_id, course_code, semester),
  CONSTRAINT fk_enrollments_student
    FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_enrollments_course
    FOREIGN KEY (course_code, semester) REFERENCES courses (course_code, semester)
);

CREATE TABLE IF NOT EXISTS portfolios (
  portfolio_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id INT NOT NULL,
  career_id INT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_portfolios_student
    FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_portfolios_career
    FOREIGN KEY (career_id) REFERENCES careers (career_id)
);

CREATE TABLE IF NOT EXISTS portfolio_sections (
  section_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  portfolio_id INT NOT NULL,
  section_type VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_portfolio_sections_portfolio
    FOREIGN KEY (portfolio_id) REFERENCES portfolios (portfolio_id)
);

CREATE TABLE IF NOT EXISTS projects (
  project_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_projects_course
    FOREIGN KEY (course_code, semester) REFERENCES courses (course_code, semester)
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  portfolio_id INT NOT NULL,
  project_id INT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  PRIMARY KEY (portfolio_id, project_id),
  CONSTRAINT fk_portfolio_projects_portfolio
    FOREIGN KEY (portfolio_id) REFERENCES portfolios (portfolio_id),
  CONSTRAINT fk_portfolio_projects_project
    FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

CREATE TABLE IF NOT EXISTS course_relevance (
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(5) NOT NULL,
  career_id INT NOT NULL,
  relevance_percent FLOAT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_code, semester, career_id),
  CONSTRAINT fk_course_relevance_course
    FOREIGN KEY (course_code, semester) REFERENCES courses (course_code, semester),
  CONSTRAINT fk_course_relevance_career
    FOREIGN KEY (career_id) REFERENCES careers (career_id)
);

CREATE TABLE IF NOT EXISTS assessment_performance (
  student_id INT NOT NULL,
  assessment_id INT NOT NULL,
  performance_score FLOAT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, assessment_id),
  CONSTRAINT fk_assessment_performance_student
    FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_assessment_performance_assessment
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id)
);

CREATE TABLE IF NOT EXISTS spider_chart_data (
  student_id INT NOT NULL,
  career_id INT NOT NULL,
  level_id INT NOT NULL,
  spider_chart_score FLOAT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, career_id, level_id),
  CONSTRAINT fk_spider_chart_data_student
    FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_spider_chart_data_career
    FOREIGN KEY (career_id) REFERENCES careers (career_id),
  CONSTRAINT fk_spider_chart_data_level
    FOREIGN KEY (level_id) REFERENCES sfia_levels (level_id)
);

CREATE TABLE IF NOT EXISTS career_skill_mapping (
  career_id INT NOT NULL,
  level_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (career_id, skill_id),
  CONSTRAINT fk_career_skill_mapping_career
    FOREIGN KEY (career_id) REFERENCES careers (career_id),
  CONSTRAINT fk_career_skill_mapping_level
    FOREIGN KEY (level_id) REFERENCES sfia_levels (level_id),
  CONSTRAINT fk_career_skill_mapping_skill
    FOREIGN KEY (skill_id) REFERENCES sfia_skills (skill_id)
);
