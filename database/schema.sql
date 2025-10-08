-- Creates the student_crm database if it does not already exist
CREATE DATABASE IF NOT EXISTS student_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Switches to using the student_crm database
USE student_crm;
-- Creates the users table for storing account records
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each user
    first_name VARCHAR(100) NOT NULL, -- Stores the user's first name
    last_name VARCHAR(100) NOT NULL, -- Stores the user's last name
    email VARCHAR(150) NOT NULL UNIQUE, -- Stores the user's email address (unique)
    password VARCHAR(255) NOT NULL, -- Stores the hashed password
    security_question VARCHAR(255) NOT NULL, -- Stores the selected security question
    security_answer VARCHAR(255) NOT NULL, -- Stores the hashed security answer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Records when the account was created
);
