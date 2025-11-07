package com.example.machineservice.repository;

import com.example.machineservice.entity.MachineService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MachineServiceRepository extends JpaRepository<MachineService, Integer> {
}
