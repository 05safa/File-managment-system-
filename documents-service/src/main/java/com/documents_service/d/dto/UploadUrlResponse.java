package com.documents_service.d.dto;

public record UploadUrlResponse(
        String uploadUrl,
        String objectKey,
        String fileName,
        String contentType
) {
}
