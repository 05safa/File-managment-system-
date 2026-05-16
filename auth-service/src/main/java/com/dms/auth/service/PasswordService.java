package com.dms.auth.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateSalt() {
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String hashPassword(String rawPassword, String salt) {
        return encoder.encode(rawPassword + salt);
    }

    public boolean matches(String rawPassword, String salt, String passwordHash) {
        return encoder.matches(rawPassword + salt, passwordHash);
    }
}
