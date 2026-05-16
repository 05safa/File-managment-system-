package com.dms.auth.dto;

import java.util.List;

public record RegisterRequest(String email, String password, List<String> roles) {}
