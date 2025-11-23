package com.example.machineservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeDto {

    private Integer id;
    private String serviceName;
    private String description;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String serviceName;
        private String description;
    }
}
