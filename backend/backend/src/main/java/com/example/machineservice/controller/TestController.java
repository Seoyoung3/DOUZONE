package com.example.machineservice.controller;

import com.example.machineservice.service.PublicDataImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final PublicDataImportService publicDataImportService;

    @GetMapping("/import")
    public String importData() throws Exception {
        publicDataImportService.importData(1, 100); // 1페이지, 10개씩
        return "데이터 가져오기 완료";
    }
}