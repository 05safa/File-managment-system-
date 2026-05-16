package com.dms.auth.controller;

import com.dms.auth.dto.AuthResponse;
import com.dms.auth.dto.LoginRequest;
import com.dms.auth.dto.RegisterRequest;
import com.dms.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(value = "X-User-Email", required = false) String email) {
        if (email != null) {
            authService.logout(email);
        }
    }
}
