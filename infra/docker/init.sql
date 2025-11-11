-- Create database and user
CREATE USER careerfinder WITH PASSWORD 'secure-production-password-change-me';
CREATE DATABASE careerfinder_v7_production;
GRANT ALL PRIVILEGES ON DATABASE careerfinder_v7_production TO careerfinder;

-- Connect to the database
\c careerfinder_v7_production

-- Create extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create schemas for multi-tenancy
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS tatarstan;
CREATE SCHEMA IF NOT EXISTS samara;
CREATE SCHEMA IF NOT EXISTS bashkortostan;
CREATE SCHEMA IF NOT EXISTS ulyanovsk;
CREATE SCHEMA IF NOT EXISTS penza;
CREATE SCHEMA IF NOT EXISTS chuvashia;
CREATE SCHEMA IF NOT EXISTS mordovia;

-- Grant privileges to user
GRANT USAGE ON SCHEMA public, tatarstan, samara, bashkortostan, ulyanovsk, penza, chuvashia, mordovia TO careerfinder;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, tatarstan, samara, bashkortostan, ulyanovsk, penza, chuvashia, mordovia TO careerfinder;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public, tatarstan, samara, bashkortostan, ulyanovsk, penza, chuvashia, mordovia TO careerfinder;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public, tatarstan, samara, bashkortostan, ulyanovsk, penza, chuvashia, mordovia TO careerfinder;

-- Create pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO careerfinder;
