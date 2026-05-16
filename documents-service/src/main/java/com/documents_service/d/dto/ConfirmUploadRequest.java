package com.documents_service.d.dto;

public record ConfirmUploadRequest(
        String fileName,
        Long fileSize,
        String contentType
) {
}
