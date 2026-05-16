package com.dms.auth.dto;

import java.util.List;
import java.util.UUID;

public record AssignDepartmentsRequest(List<UUID> departmentIds) {}
