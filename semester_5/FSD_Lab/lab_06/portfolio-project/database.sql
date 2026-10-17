CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- 1. Profile / Basic Info (Single record managed via UPSERT)
CREATE TABLE IF NOT EXISTS profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    email VARCHAR(100),
    github VARCHAR(255),
    linkedin VARCHAR(255),
    profile_image VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default initial profile row if empty
INSERT INTO profile (id, full_name, headline, bio, email, github, linkedin, profile_image)
SELECT 1, 'Full Stack Developer', 'Building Scalable Full-Stack Systems', 
       'Passionate software engineer specializing in backend architectures and modern web apps.',
       'dev@example.com', 'https://github.com', 'https://linkedin.com', ''
WHERE NOT EXISTS (SELECT 1 FROM profile WHERE id = 1);

-- 2. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('Backend', 'Frontend', 'Database', 'Tools') DEFAULT 'Backend',
    proficiency INT DEFAULT 80
);

-- 3. Experience Table
CREATE TABLE IF NOT EXISTS experiences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT
);

-- 4. Education Table
CREATE TABLE IF NOT EXISTS education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    degree VARCHAR(150) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    year VARCHAR(50) NOT NULL,
    details VARCHAR(255)
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    tech_stack VARCHAR(255),
    project_url VARCHAR(255)
);