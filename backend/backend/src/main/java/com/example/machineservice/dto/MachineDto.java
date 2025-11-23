// 프론트로 보내는 응답 전용 객체

package com.example.machineservice.dto;

import lombok.*; // 자바 클래스에서 반복적으로 쓰는 코드를 자동으로 생성해주는 라이브러리

public class MachineDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Integer id;
        private String line; // 호선
        private String stationName; // 역명 => 좌표 검색해서 지도에 표시
        private String locationType; // 지상, 지하 구분
        private String floor; // 역층
        private String detailLocation; // 상세 위치
        private String contractor; // 계약자(업체명)
        private String phone; // 전화번호
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceSimple {
        private Integer id;
        private String serviceName;
    }
}
