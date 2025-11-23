// 발급기 저장 시 지오코딩 + DB 저장

package com.example.machineservice.service;

import com.example.machineservice.entity.MachineInfo;
import com.example.machineservice.exception.ResourceNotFoundException;
import com.example.machineservice.repository.MachineInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineInfoRepository machineRepository;
    private final GeocodingService geocodingService;

    /** 전체 조회 */
    public List<MachineInfo> getAllMachines() {
        return machineRepository.findAll();
    }

    /** 단건 조회 */
    public Optional<MachineInfo> getMachineById(String id) {
        return machineRepository.findById(id);
    }

    /** 생성: 역명 + 호선으로 지오코딩 후 저장 */
    public MachineInfo createMachine(MachineInfo machine) {
        double[] coords = geocodingService.getCoordinates(
                machine.getStationName(),
                machine.getLine());
        machine.setLatitude(coords[0]);
        machine.setLongitude(coords[1]);

        // 2) 위도/경도 → city/district
        String[] region = geocodingService.reverseGeocode(coords[0], coords[1]);
        machine.setCity(region[0]);
        machine.setDistrict(region[1]);

        machine.setCreateDate(LocalDateTime.now());
        machine.setModifyDate(LocalDateTime.now());

        return machineRepository.save(machine);
    }

    /** 수정: 일부 필드만 수정 (필요 시 지오코딩도 재실행 가능) */
    public MachineInfo updateMachine(String id, MachineInfo req) {
        return machineRepository.findById(id)
                .map(existing -> {
                    // 필요에 따라 수정할 필드들만 반영
                    existing.setDetailLocation(req.getDetailLocation());
                    existing.setContractor(req.getContractor());
                    existing.setPhone(req.getPhone());
                    existing.setFloor(req.getFloor());

                    // 만약 역명/호선도 수정 가능하게 할 거면 여기에 추가:
                    // existing.setStationName(req.getStationName());
                    // existing.setLine(req.getLine());
                    // 그리고 다시 지오코딩:
                    // double[] coords = geocodingService.getCoordinates(
                    // existing.getStationName(),
                    // existing.getLine()
                    // );
                    // existing.setLatitude(coords[0]);
                    // existing.setLongitude(coords[1]);

                    existing.setModifyDate(LocalDateTime.now());
                    return machineRepository.save(existing);
                })
                .orElseThrow(() -> new ResourceNotFoundException("해당 발급기를 찾을 수 없습니다. id=" + id));
    }

    /** 삭제 */
    public void deleteMachine(String id) {
        if (!machineRepository.existsById(id)) {
            throw new ResourceNotFoundException("해당 발급기를 찾을 수 없습니다. id=" + id);
        }
        machineRepository.deleteById(id);
    }

    /** 시/도 검색 */
    public List<MachineInfo> getMachinesByCity(String city) {
        return machineRepository.findByCity(city);
    }

    /** 시/도 + 시/군/구 검색 */
    public List<MachineInfo> getMachinesByCityAndDistrict(String city, String district) {
        return machineRepository.findByCityAndDistrict(city, district);
    }
}
