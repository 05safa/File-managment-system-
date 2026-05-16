package com.documents_service.d.service;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class MinIOService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    @Qualifier("presignedMinioClient")
    private MinioClient presignedMinioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Upload a file to MinIO
     */
    public void uploadFile(UUID documentId, MultipartFile file) throws Exception {
        try {
            ensureBucketExists();

            String objectName = buildObjectName(documentId, file.getOriginalFilename());

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error uploading file to MinIO: " + e.getMessage(), e);
        }
    }

    public String generatePresignedUploadUrl(UUID documentId, String fileName, String contentType, int expirySeconds) throws Exception {
        try {
            ensureBucketExists();
            String objectName = buildObjectName(documentId, fileName);
            return presignedMinioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expirySeconds)
                            .build()
            );
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error generating presigned upload URL: " + e.getMessage(), e);
        }
    }

    public String generatePresignedDownloadUrl(UUID documentId, String fileName, int expirySeconds) throws Exception {
        try {
            String objectName = buildObjectName(documentId, fileName);
            return presignedMinioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expirySeconds)
                            .build()
            );
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error generating presigned download URL: " + e.getMessage(), e);
        }
    }

    /**
     * Download a file from MinIO
     */
    public InputStream downloadFile(UUID documentId, String filename) throws Exception {
        try {
            String objectName = buildObjectName(documentId, filename);

            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error downloading file from MinIO: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from MinIO
     */
    public void deleteFile(UUID documentId, String filename) throws Exception {
        try {
            String objectName = buildObjectName(documentId, filename);

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error deleting file from MinIO: " + e.getMessage(), e);
        }
    }

    private void ensureBucketExists() throws Exception {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException e) {
            throw new Exception("Error ensuring MinIO bucket exists: " + e.getMessage(), e);
        }
    }

    private String buildObjectName(UUID documentId, String fileName) {
        return "doc-" + documentId + "/" + fileName;
    }
}
