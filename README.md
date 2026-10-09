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


## 5. Running the Project


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

### Start Frontend

Open a terminal in the frontend directory and run:

``` bash
npm install
npm run dev
```

