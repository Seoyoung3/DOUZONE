package com.example.machineservice.repository;

import com.example.machineservice.entity.MachineInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MachineInfoRepository extends JpaRepository<MachineInfo, Integer> {
}
