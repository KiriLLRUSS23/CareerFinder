-- database/schemas/czn_schema.sql
CREATE TABLE czn_data (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE, -- ID из внешнего API ЦЗН
    title VARCHAR(200) NOT NULL,
    description TEXT,
    source VARCHAR(50) NOT NULL, -- 'fss', 'rabota_ru', etc.
    region VARCHAR(100) NOT NULL, -- Регион Поволжья
    city VARCHAR(100),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для поиска по региону и активности
CREATE INDEX idx_czn_data_region_active ON czn_data(region, is_active);