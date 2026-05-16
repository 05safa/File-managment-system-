package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final List<User> hardcodedUsers = new ArrayList<>();
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostConstruct
    public void init() {
        // Adding the Admin user
        hardcodedUsers.add(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles(List.of("ROLE_ADMIN", "ROLE_USER"))
                .build());

        // Adding the regular User
        hardcodedUsers.add(User.builder()
                .username("user")
                .password(passwordEncoder.encode("user123"))
                .roles(List.of("ROLE_USER"))
                .build());
    }

    public Optional<User> findByUsername(String username) {
        return hardcodedUsers.stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst();
    }

    public List<User> getAllUsers() {
        return hardcodedUsers;
    }
}