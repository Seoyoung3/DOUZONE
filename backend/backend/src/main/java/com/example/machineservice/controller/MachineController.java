// 발급기 정보를 등록, 조회, 수정, 삭제하고 필요 시에 공공데이터에서 일괄 가져오는 엔드포인트 제공

package com.example.machineservice.controller;

import com.example.machineservice.entity.MachineInfo;
import com.example.machineservice.service.MachineService;
import com.example.machineservice.service.PublicDataImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/machines")
public class MachineController {

    @Autowired
    private MachineService machineService; // ✅ 통합된 서비스만 사용

    @Autowired
    private PublicDataImportService importService; // 공공데이터 임포트용

    // 전체 발급기 조회
    @GetMapping
    public ResponseEntity<List<MachineInfo>> getAllMachines() {
        List<MachineInfo> list = machineService.getAllMachines();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    // 단일 발급기 조회
    @GetMapping("/{id}")
    public ResponseEntity<MachineInfo> getMachine(@PathVariable String id) {
        return machineService.getMachineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 발급기 등록 (역명+호선 => 위도/경도 자동 저장)
    @PostMapping
    public ResponseEntity<MachineInfo> createMachine(@RequestBody MachineInfo machine) {
        MachineInfo saved = machineService.createMachine(machine);
        return ResponseEntity.status(201).body(saved);
    }

    // 발급기 수정
    @PutMapping("/{id}")
    public ResponseEntity<MachineInfo> updateMachine(@PathVariable String id,
            @RequestBody MachineInfo machine) {
        // 없으면 ResourceNotFoundException → GlobalExceptionHandler 에서 404 처리
        MachineInfo updated = machineService.updateMachine(id, machine);
        return ResponseEntity.ok(updated);
    }

    // 발급기 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable String id) {
        // 없으면 ResourceNotFoundException → GlobalExceptionHandler 에서 404 처리
        machineService.deleteMachine(id);
        return ResponseEntity.ok("삭제 완료");
    }

    // 공공데이터 임포트
    @PostMapping("/import")
    public ResponseEntity<String> importPublicData(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size) {
        try {
            importService.importData(page, size);
            return ResponseEntity.ok("공공데이터 임포트 완료");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("임포트 실패: " + e.getMessage());
        }
    }

    // /api/machines/search?city=서울특별시&district=강남구
    @GetMapping("/search")
    public ResponseEntity<List<MachineInfo>> searchByRegion(
            @RequestParam String city,
            @RequestParam(required = false) String district) {

        List<MachineInfo> list;

        // district가 없으면 시/도만 검색
        if (district == null || district.isBlank()) {
            list = machineService.getMachinesByCity(city);
        } else {
            list = machineService.getMachinesByCityAndDistrict(city, district);
        }

        if (list.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }

        return ResponseEntity.ok(list); // 200 + JSON 리스트
    }

}
