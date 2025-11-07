package com.example.machineservice.controller;

import com.example.machineservice.entity.MachineInfo;
import com.example.machineservice.service.MachineServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    @Autowired
    private MachineServiceService machineServiceService;

    // 전체 발급기 조회
    @GetMapping
    public ResponseEntity<List<MachineInfo>> getAllMachines() {
        List<MachineInfo> list = machineServiceService.getAllMachines();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    // 단일 발급기 조회
    @GetMapping("/{id}")
    public ResponseEntity<MachineInfo> getMachine(@PathVariable Integer id) {
        return machineServiceService.getMachineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 발급기 생성
    @PostMapping
    public ResponseEntity<MachineInfo> createMachine(@RequestBody MachineInfo machine) {
        MachineInfo saved = machineServiceService.saveMachine(machine);
        return ResponseEntity.status(201).body(saved);
    }

    // 발급기 수정
    @PutMapping("/{id}")
    public ResponseEntity<MachineInfo> updateMachine(@PathVariable Integer id, @RequestBody MachineInfo machine) {
        return machineServiceService.getMachineById(id)
                .map(existing -> {
                    existing.setDetailLocation(machine.getDetailLocation());
                    existing.setContractor(machine.getContractor());
                    existing.setPhone(machine.getPhone());
                    existing.setFloor(machine.getFloor());
                    MachineInfo updated = machineServiceService.saveMachine(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 발급기 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable Integer id) {
        machineServiceService.deleteMachine(id);
        return ResponseEntity.ok("삭제 완료");
    }
}
