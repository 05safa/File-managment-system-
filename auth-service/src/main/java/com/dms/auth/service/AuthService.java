package com.dms.auth.service;

import com.dms.auth.dto.AuthResponse;
import com.dms.auth.dto.RegisterRequest;
import com.dms.auth.dto.UserDto;
import com.dms.auth.model.UserDepartmentEntity;
import com.dms.auth.model.UserEntity;
import com.dms.auth.repository.UserDepartmentRepository;
import com.dms.auth.repository.UserRepository;
import com.dms.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       UserDepartmentRepository userDepartmentRepository,
                       PasswordService passwordService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.userDepartmentRepository = userDepartmentRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public AuthResponse login(String email, String password) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordService.matches(password, user.getSalt(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        List<UUID> departmentIds = getDepartmentIds(user.getId());
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRoles(), departmentIds);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRoles(), departmentIds);
    }

    public void logout(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            user.setLastLogout(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public UserDto register(RegisterRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        String salt = passwordService.generateSalt();
        List<String> roles = request.roles() == null || request.roles().isEmpty()
                ? List.of("ROLE_USER")
                : request.roles();

        UserEntity user = UserEntity.builder()
                .email(request.email().trim().toLowerCase())
                .salt(salt)
                .passwordHash(passwordService.hashPassword(request.password(), salt))
                .roles(new ArrayList<>(roles))
                .build();

        user = userRepository.save(user);
        return toUserDto(user);
    }

    public List<UserDto> listUsers() {
        return userRepository.findAll().stream().map(this::toUserDto).toList();
    }

    public void assignDepartments(UUID userId, List<UUID> departmentIds) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userDepartmentRepository.deleteByUserId(user.getId());
        if (departmentIds != null) {
            for (UUID deptId : departmentIds) {
                userDepartmentRepository.save(new UserDepartmentEntity(user.getId(), deptId));
            }
        }
    }

    public List<UUID> getDepartmentIds(UUID userId) {
        return userDepartmentRepository.findByUserId(userId).stream()
                .map(UserDepartmentEntity::getDepartmentId)
                .toList();
    }

    private UserDto toUserDto(UserEntity user) {
        return new UserDto(user.getId(), user.getEmail(), user.getRoles(), getDepartmentIds(user.getId()));
    }
}
