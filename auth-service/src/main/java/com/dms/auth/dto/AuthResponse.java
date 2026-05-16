package com.dms.auth.dto;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String email,
        List<String> roles,
        List<UUID> departmentIds
) {}
