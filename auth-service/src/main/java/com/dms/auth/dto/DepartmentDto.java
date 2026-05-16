package com.dms.auth.dto;

import java.util.UUID;

public record DepartmentDto(UUID id, String name, String description, int userCount) {}
