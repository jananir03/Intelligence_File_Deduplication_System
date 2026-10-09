# Intelligent File Deduplication System - Frontend Phase 4

## Phase 4: My Files, Upload, Search and Filters

This phase adds the main file-library workflow on top of the working authentication and dashboard phases.

## Backend endpoints used

### Upload

```text
POST /api/v1/files/upload
```

The backend expects a multipart form field named:

```text
uploaded_file
```

The backend returns `202 Accepted` because SHA-256 hashing and duplicate detection run asynchronously through Celery.

### File search and filtering

```text
GET /api/v1/file-management/files
```

Supported query parameters:

- `filename`
- `file_type`
- `min_size`
- `max_size`
- `duplicate`
- `start_date`
- `end_date`
- `page`
- `page_size`
- `sort_by`
- `sort_order`

### File details

```text
GET /api/v1/files/{file_id}
```

### Download

```text
GET /api/v1/files/{file_id}/download
```

## Frontend features

- My Files page
- Pastel/nude visual design consistent with authentication and dashboard
- Single-file upload dialog
- Drag-and-drop upload area
- Upload progress
- Backend validation/error messages
- Asynchronous processing status
- Filename search
- File-type filtering
- Duplicate/unique filtering
- Minimum and maximum size filtering in KB
- Upload date range filtering
- Sorting
- Pagination
- File type icons
- File status chips
- Protected-file indicator
- Secure authenticated download
- Empty, loading and error states
- Dashboard storage-overview wording improved to explain that the percentage is the share of used storage occupied by duplicates

## Setup

```powershell
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

## Recommended test flow

1. Login.
2. Open **My Files**.
3. Upload a small text file.
4. Confirm the upload progress reaches 100%.
5. Confirm the file initially appears as `Processing` if the worker has not finished.
6. Refresh after Celery completes the hash.
7. Confirm the file becomes `Completed`.
8. Upload the same content with a different filename.
9. Confirm the duplicate status appears after asynchronous processing completes.
10. Search by filename.
11. Filter by file type.
12. Filter by duplicate status.
13. Filter by size.
14. Filter by upload date.
15. Test sorting.
16. Test pagination if enough files exist.
17. Download a completed file.
18. Verify the downloaded filename matches the original filename.
19. Return to Dashboard and verify the duplicate metrics update.

## Design rule

The frontend uses the same muted pastel/nude visual foundation established during authentication:

- lavender
- dusty rose
- soft sage
- muted blue
- warm cream

No neon or harsh bright colors are used.
