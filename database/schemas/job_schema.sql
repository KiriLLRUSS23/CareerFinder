-- database/schemas/job_schema.sql
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    employer_id INT NOT NULL,
    location_region VARCHAR(100) NOT NULL, -- Регион Поволжья
    location_city VARCHAR(100),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship'),
    experience_level ENUM('no_experience', 'junior', 'middle', 'senior', 'lead'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индекс для поиска по региону и типу занятости
CREATE INDEX idx_jobs_region_employment ON jobs(location_region, employment_type);