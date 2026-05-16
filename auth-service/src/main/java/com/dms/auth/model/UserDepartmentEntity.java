package com.dms.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "user_departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserDepartmentEntity.UserDepartmentId.class)
public class UserDepartmentEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "department_id")
    private UUID departmentId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDepartmentId implements Serializable {
        private UUID userId;
        private UUID departmentId;
    }
}
