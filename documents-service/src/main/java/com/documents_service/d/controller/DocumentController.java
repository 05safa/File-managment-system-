package com.documents_service.d.controller;

import com.documents_service.d.dto.ConfirmUploadRequest;
import com.documents_service.d.dto.UploadUrlResponse;
import com.documents_service.d.model.Document;
import com.documents_service.d.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @GetMapping("/list")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }
    
    @GetMapping("/get/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable UUID id) {
        Optional<Document> document = documentService.getDocumentById(id);
        return document.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/add")
    public ResponseEntity<Document> addDocument(@RequestBody Document document) {
        Document savedDocument = documentService.addDocument(document);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDocument);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/upload-url")
    public ResponseEntity<?> getUploadUrl(
            @PathVariable UUID id,
            @RequestParam("filename") String filename,
            @RequestParam(value = "contentType", required = false) String contentType) {
        try {
            UploadUrlResponse uploadUrl = documentService.getPresignedUploadUrl(id, filename, contentType == null ? "application/octet-stream" : contentType);
            return ResponseEntity.ok(uploadUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating upload URL: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm-upload")
    public ResponseEntity<?> confirmUpload(
            @PathVariable UUID id,
            @RequestBody ConfirmUploadRequest request) {
        try {
            Document updatedDocument = documentService.confirmUpload(id, request);
            return ResponseEntity.ok(updatedDocument);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error confirming file upload: " + e.getMessage());
        }
    }

    /**
     * Download a file from a document
     * GET /documents/{id}/download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadFileFromDocument(@PathVariable UUID id) {
        try {
            Document document = documentService.getDocumentFileMetadata(id);
            InputStream fileStream = documentService.downloadFileFromDocument(id);

            String filename = URLEncoder.encode(document.getFileName(), StandardCharsets.UTF_8);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .body(new InputStreamResource(fileStream));
        } catch (com.documents_service.d.exception.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file: " + e.getMessage());
        }
    }

    /**
     * Get file metadata for a document
     * GET /documents/{id}/file-info
     */
    @GetMapping("/{id}/file-info")
    public ResponseEntity<?> getFileInfo(@PathVariable UUID id) {
        try {
            Document document = documentService.getDocumentFileMetadata(id);
            if (document.getFileName() == null) {
                return ResponseEntity.ok()
                        .body("No file attached to this document");
            }
            return ResponseEntity.ok()
                    .body(document);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}

