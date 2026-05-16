package com.dms.auth.controller;

import com.dms.auth.dto.*;
import com.dms.auth.service.AuthService;
import com.dms.auth.service.CategoryService;
import com.dms.auth.service.DepartmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final DepartmentService departmentService;
    private final CategoryService categoryService;

    public AdminController(AuthService authService,
                           DepartmentService departmentService,
                           CategoryService categoryService) {
        this.authService = authService;
        this.departmentService = departmentService;
        this.categoryService = categoryService;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return authService.listUsers();
    }

    @PostMapping("/users")
    public UserDto createUser(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PutMapping("/users/{userId}/departments")
    public UserDto assignDepartments(@PathVariable UUID userId, @RequestBody AssignDepartmentsRequest request) {
        authService.assignDepartments(userId, request.departmentIds());
        return authService.listUsers().stream()
                .filter(u -> u.id().equals(userId))
                .findFirst()
                .orElseThrow();
    }

    @GetMapping("/departments")
    public List<DepartmentDto> listDepartments() {
        return departmentService.list();
    }

    @PostMapping("/departments")
    public DepartmentDto createDepartment(@RequestBody Map<String, String> body) {
        return departmentService.create(body.get("name"), body.getOrDefault("description", ""));
    }

    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable UUID id) {
        departmentService.delete(id);
    }

    @GetMapping("/categories")
    public List<CategoryDto> listCategories() {
        return categoryService.list();
    }

    @PostMapping("/categories")
    public CategoryDto createCategory(@RequestBody Map<String, String> body) {
        return categoryService.create(body.get("name"));
    }
}
