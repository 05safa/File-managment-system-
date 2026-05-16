package com.dms.auth.config;

import com.dms.auth.model.UserEntity;
import com.dms.auth.repository.UserRepository;
import com.dms.auth.service.PasswordService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordService passwordService) {
        return args -> {
            if (userRepository.findByEmailIgnoreCase("admin@ensia.dz").isEmpty()) {
                String salt = passwordService.generateSalt();
                userRepository.save(UserEntity.builder()
                        .email("admin@ensia.dz")
                        .salt(salt)
                        .passwordHash(passwordService.hashPassword("admin123", salt))
                        .roles(List.of("ROLE_ADMIN", "ROLE_USER"))
                        .build());
            }
        };
    }
}
