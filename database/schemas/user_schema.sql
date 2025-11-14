-- database/schemas/user_schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(150),
    user_type ENUM('job_seeker', 'employer', 'czn_staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для ускорения поиска по email
CREATE INDEX idx_users_email ON users(email);