# Image Upload Guide

## Overview
The job board application supports image uploads for various content types including company logos for jobs.

## Supported Upload Targets
- `member` - Member profile images
- `job` - Company logos for job postings
- `board-article` - Article images
- `comment` - Comment images

## GraphQL Mutations

### Single Image Upload
```graphql
mutation ImageUploader($file: Upload!, $target: String!) {
  imageUploader(file: $file, target: $target)
}
```

### Multiple Images Upload
```graphql
mutation ImagesUploader($files: [Upload!]!, $target: String!) {
  imagesUploader(files: $files, target: $target)
}
```

## Usage Examples

### Upload Company Logo for Job
```graphql
mutation UploadCompanyLogo($file: Upload!) {
  imageUploader(file: $file, target: "job")
}
```

### Upload Member Profile Image
```graphql
mutation UploadProfileImage($file: Upload!) {
  imageUploader(file: $file, target: "member")
}
```

## File Requirements
- **Supported formats**: PNG, JPG, JPEG
- **Maximum file size**: 15MB
- **Maximum files per upload**: 10 files

## File Storage
- Files are stored in the `uploads/{target}/` directory
- Each file gets a unique UUID-based filename
- Files are accessible via `/uploads/{target}/{filename}` URL

## Error Handling
- Invalid file types will return `PROVIDE_ALLOWED_FILE_TYPE` error
- Invalid upload targets will return `INVALID_UPLOAD_TARGET` error
- Upload failures will return `UPLOAD_FAILED` error

## Authentication
All upload mutations require authentication via the `AuthGuard`.

## Directory Structure
```
uploads/
├── job/           # Company logos
├── member/        # Profile images
├── board-article/ # Article images
└── comment/       # Comment images
```
