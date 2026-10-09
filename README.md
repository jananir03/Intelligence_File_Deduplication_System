# Intelligent File Deduplication & Storage Optimization System

## 1. Project Overview

The Intelligent File Deduplication & Storage Optimization System is a
web application for uploading, managing, and downloading files. It uses
SHA-256 hashing to identify files with identical content, even when
their filenames are different. The application groups duplicate files,
displays storage statistics, estimates potential storage savings, and
records important activities.

## 2. Objectives

-   Manage files through a web interface.
-   Detect duplicate content using SHA-256 hashes.
-   Group duplicate files and calculate potential storage savings.
-   Process file hashing in the background.
-   Provide search, filtering, sorting, and pagination.
-   Protect files from unauthorized access and unsafe deletion.
-   Maintain deletion history and audit logs.

## 3. Technology Stack

  Component            Technology
  -------------------- --------------------------
  Backend              Python 3.12, FastAPI
  Database             MySQL 8.0
  ORM and migrations   SQLAlchemy, Alembic
  Data validation      Pydantic
  Background tasks     Celery, Redis
  Authentication       JWT
  Frontend             React, Vite, TypeScript
  UI components        Material UI (MUI)
  API testing          Postman, Swagger/OpenAPI
  Containers           Docker, Docker Compose
  Database tool        MySQL Workbench

## 4. Main Features

### Authentication

-   User registration and login.
-   Password hashing and JWT-based authentication.
-   Protected API endpoints.

### File Management

-   Upload and download files.
-   View file details and processing status.
-   Search, filter, sort, and paginate file records.
-   Delete files with confirmation and protection checks.

### SHA-256 Hashing and Deduplication

-   Calculate SHA-256 hashes for uploaded files.
-   Run hashing tasks asynchronously using Celery and Redis.
-   Identify files with matching content, regardless of filename.
-   Group duplicate files and identify the retained original.
-   Calculate potential storage savings.

### Dashboard

-   Display total files and storage usage.
-   Show duplicate information and potential savings.
-   Display largest files and recent uploads.

### Safety and Audit

-   Prevent deletion of protected files through the normal delete
    operation.
-   Record deletion history.
-   Maintain audit logs for important activities.
-   Check file ownership for authorized access.

## 5. How Deduplication Works

1.  A user uploads a file.
2.  The application stores the file and creates a database record.
3.  A background Celery task calculates the file's SHA-256 hash in
    chunks.
4.  The system compares the hash with existing hash records.
5.  Files with the same hash are grouped as duplicates after processing
    completes.
6.  The system updates duplicate counts and potential storage savings.
7.  The dashboard and duplicate-group page display the results.

## 6. Database Tables

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `users`                             Stores user accounts

  `files`                             Stores uploaded file records and
                                      details

  `file_hashes`                       Stores SHA-256 hash records

  `duplicate_groups`                  Stores duplicate-group information
                                      and potential savings

  `file_metadata`                     Stores additional file metadata

  `deletion_history`                  Records deleted-file information

  `audit_logs`                        Records important activities

  `alembic_version`                   Tracks database migration versions
  -----------------------------------------------------------------------

## 7. Main API Endpoints

  -------------------------------------------------------------------------------------------
  Method                  Endpoint                                    Purpose
  ----------------------- ------------------------------------------- -----------------------
  POST                    `/api/v1/auth/register`                     Register a user

  POST                    `/api/v1/auth/login`                        Log in and obtain a
                                                                      token

  GET                     `/api/v1/auth/me`                           Get the authenticated
                                                                      user's details

  POST                    `/api/v1/files/upload`                      Upload a file

  GET                     `/api/v1/files`                             List files

  GET                     `/api/v1/files/{file_id}`                   Get file details

  GET                     `/api/v1/files/{file_id}/download`          Download a file

  GET                     `/api/v1/duplicate-groups`                  List duplicate groups

  GET                     `/api/v1/duplicate-groups/{group_id}`       Get duplicate-group
                                                                      details

  GET                     `/api/v1/dashboard/summary`                 Get dashboard
                                                                      statistics

  GET                     `/api/v1/file-management/files`             List and filter files

  DELETE                  `/api/v1/file-management/files/{file_id}`   Delete a file

  GET                     `/api/v1/audit-logs`                        View audit logs
  -------------------------------------------------------------------------------------------

Interactive API documentation is available at `/docs` when the backend
is running.

## 8. Running the Project

### Prerequisites

-   Python 3.12
-   Node.js and npm
-   Docker Desktop and Docker Compose
-   MySQL Workbench (optional, for viewing database records)
-   Postman (optional, for API testing)

### Start Backend Services

From the backend project directory, run:

``` bash
docker compose up -d --build
```

Check service status:

``` bash
docker compose ps
```

Open the API documentation:

``` text
http://localhost:8000/docs
```

The project configuration uses these local ports:

-   FastAPI backend: `8000`
-   MySQL host port: `3307`
-   Redis host port: `6380`

The backend and Celery containers communicate with MySQL and Redis using
their Docker Compose service names and internal ports. Keep the
project's `.env` settings consistent with the supplied Docker Compose
configuration.

### Start Frontend

Open a terminal in the frontend directory and run:

``` bash
npm install
npm run dev
```

Open the local URL printed by Vite, commonly:

``` text
http://localhost:5173
```

## 9. Testing

Use Swagger UI or Postman to test the APIs.

Recommended test flow:

1.  Register a user and log in.
2.  Use the returned JWT token for protected endpoints.
3.  Upload a file and confirm that processing completes.
4.  Upload the same content with a different filename.
5.  Verify that both files have the same SHA-256 hash and appear in a
    duplicate group.
6.  Check dashboard statistics and potential savings.
7.  Test file listing, search, filtering, download, and deletion.
8.  Verify deletion history and audit logs.
9.  Test unauthorized requests and protected-file deletion.

For database verification, inspect the `files`, `file_hashes`,
`duplicate_groups`, `deletion_history`, and `audit_logs` tables in MySQL
Workbench.

## 10. Configuration and Security

-   Configure environment variables in the project's `.env` file using
    `.env.example` as a guide, if provided.
-   Do not commit passwords, JWT secrets, or other credentials to source
    control.
-   Use a valid JWT token for protected API requests.
-   Keep file uploads within the configured size limit.
-   Ensure MySQL, Redis, the backend, and the Celery worker are running
    before testing background hashing.

## 11. Conclusion

This project combines file management, SHA-256-based duplicate
detection, background processing, storage analysis, secure deletion, and
audit logging in a full-stack web application.
