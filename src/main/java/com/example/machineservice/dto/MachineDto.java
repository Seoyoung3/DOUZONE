package com.example.machineservice.dto;

import lombok.*;
import java.util.List;

public class MachineDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Integer id;
        private String stationName;
        private String locationType;
        private String floor;
        private String detailLocation;
        private Double latitude;
        private Double longitude;
        private String contractor;
        private String phone;
        private List<ServiceSimple> services;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceSimple {
        private Integer id;
        private String serviceName;
    }
}
