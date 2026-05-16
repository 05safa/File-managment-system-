package com.dms.auth.repository;

import com.dms.auth.model.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, UUID> {
    Optional<DepartmentEntity> findByNameIgnoreCase(String name);
}
