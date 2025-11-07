package com.example.machineservice.service;

import com.example.machineservice.entity.MachineInfo;
import com.example.machineservice.repository.MachineInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MachineServiceService {

    @Autowired
    private MachineInfoRepository machineRepository;

    public List<MachineInfo> getAllMachines() {
        return machineRepository.findAll();
    }

    public Optional<MachineInfo> getMachineById(Integer id) {
        return machineRepository.findById(id);
    }

    public MachineInfo saveMachine(MachineInfo machine) {
        return machineRepository.save(machine);
    }

    public void deleteMachine(Integer id) {
        machineRepository.deleteById(id);
    }
}
