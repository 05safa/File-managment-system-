package com.documents_service.d.repository;

import com.documents_service.d.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByTitleContainingIgnoreCase(String title);
    Optional<Document> findByObjectKey(String objectKey);
    List<Document> findByDepartmentIdIn(List<UUID> departmentIds);
}
