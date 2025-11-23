package com.example.machineservice.service;

import com.example.machineservice.entity.MachineInfo;
import com.example.machineservice.repository.MachineInfoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicDataImportService {

    private final MachineInfoRepository machineInfoRepository; // MongoDB 저장용
    private final WebClient.Builder webClientBuilder; // HTTP 호출용
    private final GeocodingService geocodingService; // 지오코딩/역지오코딩
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱

    @Value("${publicdata.api.url}")
    private String apiUrl;

    @Value("${publicdata.api.key}")
    private String apiKey;

    @Transactional
    public void importData(int page, int size) throws Exception {

        WebClient client = webClientBuilder.build();

        // ✅ 공공데이터 공식 스펙에 맞게 URL 구성
        String fullUrl = apiUrl
                + "?page=" + page
                + "&perPage=" + size
                + "&serviceKey=" + apiKey;

        System.out.println("공공데이터 API 호출 URL: " + fullUrl);

        String response;

        // 1) API 호출
        try {
            response = client.get()
                    .uri(fullUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) {
                throw new IllegalStateException("공공데이터 API 응답이 null 입니다.");
            }

            System.out.println("API 응답 확인 (앞 500자): "
                    + response.substring(0, Math.min(500, response.length())));

        } catch (WebClientResponseException e) {
            // HTTP 401/403/500 등 status 찍어보기
            System.err.println("공공데이터 API 호출 실패 - status: " + e.getRawStatusCode());
            System.err.println("응답 바디: " + e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            System.err.println("공공데이터 API 호출 중 예외: " + e.getMessage());
            throw e;
        }

        // 2) JSON 파싱 & MongoDB 저장
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode dataArray = root.path("data"); // odcloud 기본 구조 { page, perPage, data: [...] }

            System.out.println("data 배열 크기: " + dataArray.size());

            List<MachineInfo> machineList = new ArrayList<>();

            for (JsonNode node : dataArray) {
                MachineInfo mi = new MachineInfo();

                // 컬럼명은 data.go.kr에서 본 그대로 사용 :contentReference[oaicite:1]{index=1}
                mi.setStationName(node.path("역명").asText(""));
                mi.setLine(node.path("호선").asText(""));
                mi.setDeviceType(node.path("기기종류").asText(""));
                mi.setLocationType(node.path("지상지하구분").asText(""));
                mi.setFloor(node.path("역층").asText(""));
                mi.setDetailLocation(node.path("상세위치").asText(""));
                mi.setContractor(node.path("계약자(업체명)").asText(""));
                mi.setPhone(node.path("전화번호").asText(""));

                mi.setCreateDate(LocalDateTime.now());
                mi.setModifyDate(LocalDateTime.now());

                // 3) 지오코딩 (역명 + 호선 → 위도/경도)
                double[] coords = geocodingService.getCoordinates(
                        mi.getStationName(),
                        mi.getLine());
                mi.setLatitude(coords[0]);
                mi.setLongitude(coords[1]);

                // 4) 역지오코딩 (위도/경도 → 시/구)
                String[] region = geocodingService.reverseGeocode(
                        mi.getLatitude(),
                        mi.getLongitude());
                mi.setCity(region[0]);
                mi.setDistrict(region[1]);

                machineList.add(mi);
            }

            System.out.println("MongoDB 저장할 데이터 수: " + machineList.size());
            machineInfoRepository.saveAll(machineList);
            System.out.println("MongoDB 저장 완료");

        } catch (Exception e) {
            System.err.println("공공데이터 파싱/저장 중 예외: " + e.getMessage());
            e.printStackTrace();
            throw e; // @Transactional → 에러 시 전체 롤백
        }
    }
}
