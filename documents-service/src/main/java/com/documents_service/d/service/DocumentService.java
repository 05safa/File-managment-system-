package com.documents_service.d.service;

import com.documents_service.d.dto.ConfirmUploadRequest;
import com.documents_service.d.dto.UploadUrlResponse;
import com.documents_service.d.exception.AccessDeniedException;
import com.documents_service.d.model.Document;
import com.documents_service.d.repository.DocumentRepository;
import com.documents_service.d.security.AuthenticatedUser;
import com.documents_service.d.security.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private MinIOService minIOService;

    @Autowired
    private TranslationService translationService;

    public List<Document> getAllDocuments() {
        AuthenticatedUser user = requireUser();
        if (user.isAdmin()) {
            return documentRepository.findAll();
        }
        if (user.departmentIds().isEmpty()) {
            return List.of();
        }
        return documentRepository.findByDepartmentIdIn(user.departmentIds());
    }

    @Cacheable(value = "documents", key = "#id")
    public Optional<Document> getDocumentById(UUID id) {
        Optional<Document> document = documentRepository.findById(id);
        document.ifPresent(this::assertCanAccess);
        return document;
    }

    @CacheEvict(value = "documents", key = "#id")
    public void deleteDocument(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document with id " + id + " not found"));
        assertCanAccess(document);
        if (document.getFileName() != null) {
            try {
                minIOService.deleteFile(id, document.getFileName());
            } catch (Exception e) {
                System.err.println("Error deleting file from MinIO: " + e.getMessage());
            }
        }
        documentRepository.deleteById(id);
    }

    public Document addDocument(Document document) {
        AuthenticatedUser user = requireUser();
        if (document.getDepartmentId() == null) {
            throw new IllegalArgumentException("departmentId is required");
        }
        assertCanUseDepartment(document.getDepartmentId());

        document.setOwnerEmail(user.email());
        document.setTranslatedTitle(translationService.translateTitleToFrench(document.getTitle()));
        return documentRepository.save(document);
    }

    public UploadUrlResponse getPresignedUploadUrl(UUID documentId, String fileName, String contentType) throws Exception {
        Document document = getAccessibleDocument(documentId);
        String uploadUrl = minIOService.generatePresignedUploadUrl(documentId, fileName, contentType, 300);
        String objectKey = "doc-" + documentId + "/" + fileName;
        return new UploadUrlResponse(uploadUrl, objectKey, fileName, contentType);
    }

    @CacheEvict(value = "documents", key = "#documentId")
    public Document confirmUpload(UUID documentId, ConfirmUploadRequest request) throws Exception {
        Document document = getAccessibleDocument(documentId);
        if (document.getObjectKey() != null && document.getFileName() != null && !document.getFileName().equals(request.fileName())) {
            try {
                minIOService.deleteFile(documentId, document.getFileName());
            } catch (Exception e) {
                System.err.println("Error deleting old file: " + e.getMessage());
            }
        }

        document.setFileName(request.fileName());
        document.setFileSize(request.fileSize());
        document.setContentType(request.contentType());
        document.setObjectKey("doc-" + documentId + "/" + request.fileName());
        document.setHasFile(true);

        return documentRepository.save(document);
    }

    @CacheEvict(value = "documents", key = "#documentId")
    public Document uploadFileToDocument(UUID documentId, MultipartFile file) throws Exception {
        Document document = getAccessibleDocument(documentId);
        if (document.getObjectKey() != null) {
            try {
                minIOService.deleteFile(documentId, document.getFileName());
            } catch (Exception e) {
                System.err.println("Error deleting old file: " + e.getMessage());
            }
        }

        minIOService.uploadFile(documentId, file);
        document.setFileName(file.getOriginalFilename());
        document.setFileSize(file.getSize());
        document.setContentType(file.getContentType());
        document.setObjectKey("doc-" + documentId + "/" + file.getOriginalFilename());
        document.setHasFile(true);

        return documentRepository.save(document);
    }

    public InputStream downloadFileFromDocument(UUID documentId) throws Exception {
        Document document = getAccessibleDocument(documentId);
        if (document.getFileName() == null) {
            throw new IllegalArgumentException("No file attached to document with id " + documentId);
        }
        return minIOService.downloadFile(documentId, document.getFileName());
    }

    public Document getDocumentFileMetadata(UUID documentId) {
        return getAccessibleDocument(documentId);
    }

    private Document getAccessibleDocument(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document with id " + id + " not found"));
        assertCanAccess(document);
        return document;
    }

    private void assertCanAccess(Document document) {
        AuthenticatedUser user = requireUser();
        if (user.isAdmin()) {
            return;
        }
        if (document.getDepartmentId() == null || !user.departmentIds().contains(document.getDepartmentId())) {
            throw new AccessDeniedException("You do not have access to this document");
        }
    }

    private void assertCanUseDepartment(UUID departmentId) {
        AuthenticatedUser user = requireUser();
        if (user.isAdmin() || user.departmentIds().contains(departmentId)) {
            return;
        }
        throw new AccessDeniedException("You cannot create documents in this department");
    }

    private AuthenticatedUser requireUser() {
        AuthenticatedUser user = UserContext.get();
        if (user == null) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return user;
    }
}
