package com.dms.auth.dto;

import java.util.List;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        List<String> roles,
        List<UUID> departmentIds
) {}
