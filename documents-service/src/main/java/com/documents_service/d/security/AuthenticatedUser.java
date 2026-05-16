package com.documents_service.d.security;

import java.util.List;
import java.util.UUID;

public record AuthenticatedUser(
        String email,
        List<String> roles,
        List<UUID> departmentIds
) {
    public boolean isAdmin() {
        return roles != null && roles.stream().anyMatch(r -> r.equals("ROLE_ADMIN"));
    }
}
