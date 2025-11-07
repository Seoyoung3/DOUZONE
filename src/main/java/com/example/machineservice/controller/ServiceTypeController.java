package com.example.machineservice.controller;

import com.example.machineservice.dto.ServiceTypeDto;
import com.example.machineservice.entity.ServiceType;
import com.example.machineservice.service.ServiceTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceTypeController {

    private final ServiceTypeService service;

    public ServiceTypeController(ServiceTypeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ServiceTypeDto>> getAll() {
        List<ServiceType> list = service.getAll();
        if (list.isEmpty())
            return ResponseEntity.noContent().build();

        List<ServiceTypeDto> dtoList = list.stream()
                .map(s -> new ServiceTypeDto(s.getId(), s.getServiceName(), s.getDescription()))
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    @PostMapping
    public ResponseEntity<ServiceTypeDto> create(@RequestBody ServiceTypeDto.CreateRequest req) {
        ServiceType created = service.create(req);
        ServiceTypeDto dto = new ServiceTypeDto(created.getId(), created.getServiceName(), created.getDescription());
        return ResponseEntity.status(201).body(dto);
    }
}
