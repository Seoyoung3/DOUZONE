package com.example.machineservice.service;

import com.example.machineservice.dto.ServiceTypeDto;
import com.example.machineservice.entity.ServiceType;
import com.example.machineservice.exception.ResourceNotFoundException;
import com.example.machineservice.repository.ServiceTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceTypeService {

    private final ServiceTypeRepository repository;

    public ServiceTypeService(ServiceTypeRepository repository) {
        this.repository = repository;
    }

    public List<ServiceType> getAll() {
        return repository.findAll();
    }

    public ServiceType getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found: " + id));
    }

    @Transactional
    public ServiceType create(ServiceTypeDto.CreateRequest req) {
        ServiceType s = new ServiceType();
        s.setServiceName(req.getServiceName());
        s.setDescription(req.getDescription());
        s.setCreateDate(LocalDateTime.now());
        s.setModifyDate(LocalDateTime.now());
        return repository.save(s);
    }
}
