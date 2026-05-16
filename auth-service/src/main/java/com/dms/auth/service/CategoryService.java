package com.dms.auth.service;

import com.dms.auth.dto.CategoryDto;
import com.dms.auth.model.CategoryEntity;
import com.dms.auth.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> list() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .toList();
    }

    public CategoryDto create(String name) {
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        CategoryEntity category = categoryRepository.save(CategoryEntity.builder().name(name.trim()).build());
        return new CategoryDto(category.getId(), category.getName());
    }
}
