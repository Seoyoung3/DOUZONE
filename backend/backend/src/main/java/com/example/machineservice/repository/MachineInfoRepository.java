// MongoRepository 사용
// findAll(), findById(), save(), deleteById() 자동 제공

package com.example.machineservice.repository;

import com.example.machineservice.entity.MachineInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineInfoRepository extends MongoRepository<MachineInfo, String> {

    // 시/도만 검색
    List<MachineInfo> findByCity(String city);

    // 시/도 + 시/군/구 검색
    List<MachineInfo> findByCityAndDistrict(String city, String district);

    // (선택) 상세 주소에 키워드가 포함된 데이터 검색 – 필요하면 사용
    List<MachineInfo> findByDetailLocationContaining(String keyword);
}
