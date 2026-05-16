# Document Upload/Download Feature with MinIO S3

## Overview
This implementation adds the ability to upload and download document files using MinIO S3 storage. Users can create a document and then attach files to it, retrieving the file later using the same document ID.

## Services & Ports

### Updated Service Ports
- **Gateway Service**: `8085` (Docker) / `8080` (Local)
- **Document Service (documents-service)**: `8084` (Docker/Local)
- **Messages Service (comments-service)**: `8086` (Docker/Local)
- **MinIO API**: `9000`
- **MinIO Console**: `9001`

## API Endpoints

### Document Management

#### Get All Documents
```
GET /api/documents/list
```
Returns a list of all documents with their metadata.

#### Get Document by ID
```
GET /api/documents/get/{id}
```
Returns a specific document with its metadata including file information.

#### Create Document
```
POST /api/documents/add
Content-Type: application/json

{
  "title": "Document A"
}
```
Creates a new document and returns the created document with ID.

### File Upload/Download

#### Upload File to Document
```
POST /api/documents/{id}/upload
Content-Type: multipart/form-data

Form parameter:
- file: <binary file data>
```
Uploads a file and associates it with a document ID. The file is stored in MinIO S3 with the naming pattern: `doc-{documentId}/{filename}`

**Response**:
```json
{
  "id": 1,
  "title": "Document A",
  "filename": "report.pdf",
  "contentType": "application/pdf",
  "fileSize": 12345,
  "s3ObjectName": "doc-1/report.pdf",
  "hasFile": true
}
```

#### Download File from Document
```
GET /api/documents/{id}/download
```
Downloads the file associated with a document. The response includes the appropriate Content-Disposition header for file download.

#### Get File Metadata
```
GET /api/documents/{id}/file-info
```
Returns metadata about the file attached to a document (filename, size, content type, etc.)

## MinIO Configuration

### Environment Variables
- `MINIO_ROOT_USER`: admin
- `MINIO_ROOT_PASSWORD`: ensia123456
- `MINIO_BUCKET_NAME`: documents

### Connection Details
- **Endpoint**: http://minio:9000 (Docker) / http://localhost:9000 (Local)
- **Access Key**: admin
- **Secret Key**: ensia123456
- **Bucket**: documents

### File Storage Structure
Files are organized in MinIO S3 using the following pattern:
```
documents/
├── doc-1/
│   ├── report.pdf
│   └── image.png
├── doc-2/
│   └── spreadsheet.xlsx
```

## Document Model

The Document entity now includes the following fields:
- `id`: Document ID (auto-generated)
- `title`: Document title
- `filename`: Name of the attached file
- `contentType`: MIME type of the file
- `fileSize`: File size in bytes
- `s3ObjectName`: Object name in MinIO storage
- `hasFile`: Boolean flag indicating if a file is attached

## Docker Compose

The updated `docker-compose.yml` includes:
- Gateway service on port 8085
- Document service (d) on port 8084
- Messages service (m) on port 8086
- MinIO service on ports 9000 and 9001
- Network dependency and environment variable configuration
- MinIO data volume for persistence

## Building and Running

### Local Development (without Docker)
1. Ensure MinIO is running on http://localhost:9000
2. Start the Document Service on port 8084
3. Start the Messages Service on port 8086
4. Start the Gateway Service on port 8080

### Docker Deployment
```bash
docker-compose up --build
```

This will start all services including MinIO.

## File Upload Constraints
- Maximum file size: 100MB (configurable via `spring.servlet.multipart.max-file-size`)
- Maximum request size: 100MB (configurable via `spring.servlet.multipart.max-request-size`)

## Workflow Example

1. **Create a Document**
   ```
   POST /api/documents/add
   {"title": "My Report"}
   Response: {"id": 1, "title": "My Report", "hasFile": false, ...}
   ```

2. **Upload a File**
   ```
   POST /api/documents/1/upload
   [Upload report.pdf]
   Response: Document with file metadata
   ```

3. **Download the File**
   ```
   GET /api/documents/1/download
   Response: File content with appropriate headers
   ```

4. **Get File Information**
   ```
   GET /api/documents/1/file-info
   Response: File metadata (name, size, type, etc.)
   ```

## Error Handling

- **Document Not Found**: Returns 404 when document ID doesn't exist
- **No File Attached**: Returns 404 when trying to download a document with no file
- **File Upload Error**: Returns 500 with error message if upload fails
- **Empty File**: Returns 400 if attempting to upload an empty file


