package com.dms.auth.repository;

import com.dms.auth.model.UserDepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserDepartmentRepository extends JpaRepository<UserDepartmentEntity, UserDepartmentEntity.UserDepartmentId> {
    List<UserDepartmentEntity> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
