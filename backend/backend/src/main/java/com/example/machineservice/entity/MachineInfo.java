// MongoDB의 machine_info 컬렉션에 저장됨

package com.example.machineservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "machine_info") // MongoDB 컬렉션 이름
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineInfo {

    @Id
    private String id; // Oracle Number → MongoDB ObjectId (String 사용 가능)

    private String line;
    private String stationName;
    private String deviceType;
    private String locationType;
    private String floor;
    private String detailLocation;
    private String contractor;
    private String phone;

    private Double latitude;
    private Double longitude;

    // 지역 기반 검색 필터링
    private String city; // 시/도
    private String district; // 시/군/구

    private LocalDateTime createDate;
    private LocalDateTime modifyDate;
}
