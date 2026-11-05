# School Management System

A full-stack role-based web application for managing users, classes, and student grades, built with NestJS, React (Vite + TypeScript), PostgreSQL, and Docker.


## Tech Stack
* Backend: NestJS, TypeORM, PostgreSQL, Passport-JWT, Bcrypt, Swagger (OpenAPI)
* Frontend: React, Vite, TypeScript
* Infrastructure: Docker & Docker Compose


## Prerequisites
* Docker and Docker Compose (for containerized run)
* Node.js v22+ and npm (optional, for running services locally outside Docker)


## Option 1: Quick Start with Docker (Recommended)

The entire stack (PostgreSQL, Backend, Frontend) is containerized and automatically initializes the database schema and seed data on startup.

1. Clone the repository:
   ```bash
   git clone <YOUR_GIT_REPO_URL>
   cd school-management-system

2. Create a .env file inside the ./backend directory with the following data:
    ```bash
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=admin
    DB_PASSWORD=adminpassword
    DB_NAME=school_db
    JWT_SECRET=super_secret_jwt_key_2026
 (Note: When running inside Docker Compose, DB_HOST is automatically overriden to postgres)

3. Build and start the container:
    ```bash
    docker compose up -d --build

4. Access the application:
* Frontend Application: http://localhost:5173
* Backend API: http://localhost:3000
* Swagger API documentation: http://localhost:3000/api/docs

## Option 2: Running Locally (Hybrid Mode)
If you prefer running the Node.js services directly on your host machine:

1. Start only the PostgreSQL database in Docker:
    ```bash
    docker compose up -d postgres

2. Start the backend:
    ```bash
    cd backend
    npm install --legacy-peer-deps
    npm run start:dev

3. Start the Frontend (in a new terminal): 
    ```bash
    cd frontend
    npm install --legacy-peer-deps
    npm run dev

## Database Setup & Seeding:
* Schema Initialization: TypeORM is configured with synchronize: true, which automatically creates all database tables (users, classes, grades) and relations upon startup.
* Automatic Seeding: A custom SeedService (implementing OnApplicationBootstrap) automatically checks if the database is empty on startup and populates it with sample users, classes (10A), and grades.

## Test credentials:
Use the following pre-populated accounts to test Role-Based Access Control (RBAC):

Role,Email,Password,Permissions Summary
Administrator,admin@school.com,Password1!,"Full CRUD on users, classes, and grades. Self-deletion protection enabled."
Teacher,teacher@school.com,Password1!,View classes & students; assign and update student grades.
Student,student@school.com,Password1!,View assigned class and personal grades only.

| Role | Email | Password | Permission Summary |
| :--- | :---: | :---: | :---: |
| Administrator | admin@school.com | Password1! |  Full CRUD on users, classes, and grades. Self-deletion protection enabled. |
| Teacher | teacher@school.com | Password1! | View classes & students; assign and update student grades.|
| Student | student@school.com | Password1! | View personal information, assigned class and personal grades only. |

## API Documentation:
* URL: http://localhost:3000/api/docs

Core Endpoints Overview:
- Auth:
  - POST `/auth/login` – Authenticate user and return JWT token.
- Users:
  - GET `/users` – List all users (Admin/Teacher).
  - POST `/users` – Create a new user (Admin only).
  - PATCH `/users/:id` – Update user details/role (Admin only).
  - DELETE `/users/:id` – Delete a user (Admin only).
- Classes:
  - GET `/classes` – List all classes and enrolled students.
  - POST `/classes` – Create a new class (Admin only).
  - DELETE `/classes/:id` – Remove a class (Admin only).
- Grades:
  - GET `/grades` – Retrieve grades (filtered automatically for Students).
  - POST `/grades` – Assign a student a grade (Admin/Teacher).
  - PATCH `/grades/:id` – Update an existing grade (Admin/Teacher).
  - DELETE `/grades/:id` – Delete a grade (Admin only).