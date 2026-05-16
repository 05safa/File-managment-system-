package com.dms.auth.service;

import com.dms.auth.dto.DepartmentDto;
import com.dms.auth.model.DepartmentEntity;
import com.dms.auth.repository.DepartmentRepository;
import com.dms.auth.repository.UserDepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserDepartmentRepository userDepartmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository,
                             UserDepartmentRepository userDepartmentRepository) {
        this.departmentRepository = departmentRepository;
        this.userDepartmentRepository = userDepartmentRepository;
    }

    public List<DepartmentDto> list() {
        return departmentRepository.findAll().stream().map(this::toDto).toList();
    }

    public DepartmentDto create(String name, String description) {
        if (departmentRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department already exists");
        }
        DepartmentEntity dept = departmentRepository.save(
                DepartmentEntity.builder().name(name.trim()).description(description).build()
        );
        return toDto(dept);
    }

    public void delete(UUID id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentDto toDto(DepartmentEntity dept) {
        int count = userDepartmentRepository.findAll().stream()
                .filter(ud -> ud.getDepartmentId().equals(dept.getId()))
                .toList().size();
        return new DepartmentDto(dept.getId(), dept.getName(), dept.getDescription(), count);
    }
}
