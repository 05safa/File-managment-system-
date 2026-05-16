package com.documents_service.d.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public AuthenticatedUser parseUser(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        String email = claims.getSubject();
        List<String> roles = claims.get("roles", List.class);
        if (roles == null) {
            roles = List.of();
        }

        List<UUID> departmentIds = new ArrayList<>();
        Object rawDeptIds = claims.get("departmentIds");
        if (rawDeptIds instanceof List<?> list) {
            for (Object item : list) {
                departmentIds.add(UUID.fromString(item.toString()));
            }
        }

        return new AuthenticatedUser(email, roles, departmentIds);
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
