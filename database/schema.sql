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
    password VARCHAR(255) NOT NULL, -- Stores the account password (plain text for this demo)
    security_question VARCHAR(255) NOT NULL, -- Stores the selected security question
    security_answer VARCHAR(255) NOT NULL, -- Stores the security answer (plain text for this demo)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Records when the account was created
);

-- Creates catalog of available courses
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    summary VARCHAR(255) DEFAULT NULL,
    UNIQUE KEY uq_course_title (title)
);

-- Link table for user enrollments
CREATE TABLE IF NOT EXISTS user_courses (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    CONSTRAINT fk_user_courses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Ensures legacy tables pick up the denormalized course name column
ALTER TABLE user_courses
    ADD COLUMN IF NOT EXISTS course_name VARCHAR(150) NOT NULL AFTER course_id;

-- Seeds a broad course catalog (duplicates ignored on re-run)
INSERT INTO courses (title, category, summary) VALUES
    ('Python Fundamentals', 'Programming', 'Introductory Python syntax, control flow, and functions.'),
    ('Data Structures & Algorithms', 'Computer Science', 'Core data structures and algorithmic problem solving.'),
    ('C Programming Essentials', 'Programming', 'Pointers, memory management, and procedural design in C.'),
    ('C++ Programming Fundamentals', 'Programming', 'OOP concepts, STL, and modern C++ practices.'),
    ('Java Programming Bootcamp', 'Programming', 'Classes, inheritance, collections, and JVM tooling.'),
    ('JavaScript for Web Apps', 'Web Development', 'DOM manipulation, fetch API, and modular JS.'),
    ('HTML & CSS Mastery', 'Web Development', 'Responsive layouts, flexbox, grid, and modern CSS.'),
    ('React Basics', 'Web Development', 'Component-driven UI development with hooks and state.'),
    ('Node.js Essentials', 'Backend', 'Asynchronous patterns, Express.js, and REST APIs.'),
    ('SQL for Developers', 'Database', 'Query design, joins, subqueries, and optimization.'),
    ('NoSQL Concepts', 'Database', 'Document stores, key-value databases, and modeling strategies.'),
    ('DevOps Foundations', 'DevOps', 'CI/CD pipelines, infrastructure as code, and monitoring.'),
    ('Docker in Practice', 'DevOps', 'Containerization workflows, images, and orchestration basics.'),
    ('Kubernetes Primer', 'DevOps', 'Pods, services, deployments, and cluster fundamentals.'),
    ('Linux Command Line', 'Systems', 'Shell navigation, scripting, and system utilities.'),
    ('Git Version Control', 'Tools', 'Branching strategies, pull requests, and collaboration.'),
    ('Agile Project Management', 'Management', 'Scrum ceremonies, kanban flow, and stakeholder alignment.'),
    ('UI/UX Principles', 'Design', 'User research, wireframing, and usability heuristics.'),
    ('Adobe XD Rapid Prototyping', 'Design', 'Interactive prototypes and design systems in XD.'),
    ('Data Visualization with Tableau', 'Data', 'Dashboards, calculated fields, and storytelling.'),
    ('Power BI for Analysts', 'Data', 'Data modeling, DAX fundamentals, and report design.'),
    ('Machine Learning Concepts', 'AI', 'Supervised learning, evaluation metrics, and pipelines.'),
    ('Deep Learning Basics', 'AI', 'Neural network foundations and hands-on experimentation.'),
    ('Natural Language Processing', 'AI', 'Text preprocessing, embeddings, and sentiment analysis.'),
    ('Cloud Computing Essentials', 'Cloud', 'IaaS, PaaS, SaaS, and core provider services.'),
    ('AWS Practitioner', 'Cloud', 'Identity, networking, and compute services on AWS.'),
    ('Azure Fundamentals', 'Cloud', 'Resource groups, storage, and deployment options in Azure.'),
    ('Google Cloud Jumpstart', 'Cloud', 'Compute Engine, Cloud Run, and managed databases.'),
    ('Cybersecurity Basics', 'Security', 'Threat modeling, defensive design, and incident response.'),
    ('Ethical Hacking 101', 'Security', 'Reconnaissance, exploitation techniques, and mitigation.'),
    ('Mobile App Development with Flutter', 'Mobile', 'Cross-platform UI building with Dart and Flutter.'),
    ('Android Native Development', 'Mobile', 'Kotlin-based Android apps with modern architecture.'),
    ('iOS Development with SwiftUI', 'Mobile', 'Declarative UI, state management, and Swift best practices.'),
    ('Project Portfolio Workshop', 'Career', 'Packaging projects, presenting outcomes, and storytelling.')
ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    summary = VALUES(summary);
