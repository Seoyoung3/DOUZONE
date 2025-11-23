package com.example.machineservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class GeocodingService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    // 키워드 검색(역명 → 좌표)
    private static final String KEYWORD_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json?query=";

    // 좌표 → 주소 변환(역지오코딩)
    private static final String REVERSE_API_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json";

    /**
     * 역명 + 호선 → (위도, 경도)
     * 실패 시 (0.0, 0.0) 반환
     */
    public double[] getCoordinates(String stationName, String line) {
        if (stationName == null || stationName.trim().isEmpty()) {
            return new double[] { 0.0, 0.0 };
        }

        // 1) 역 이름에서 괄호 안 내용 제거: 온수(성공회대입구) → 온수
        String baseName = stationName.replaceAll("\\(.*?\\)", "").trim(); // 괄호 포함 부분 제거
        String fullName = stationName.trim();

        // 2) 호선 정규화: "2", "2호선" → "2호선"
        String normalizedLine = "";
        if (line != null && !line.trim().isEmpty()) {
            String onlyNumber = line.replaceAll("[^0-9]", "").trim(); // 숫자만 남기기
            if (!onlyNumber.isEmpty()) {
                normalizedLine = onlyNumber + "호선";
            }
        }

        // 3) 시도할 검색어 패턴들
        String[] candidates = new String[] {
                "서울 " + baseName + "역 " + normalizedLine, // 서울 온수역 7호선
                "서울 " + baseName + "역",
                baseName + "역 " + normalizedLine,
                baseName + "역",
                fullName + "역",
                fullName,
                baseName
        };

        for (String keyword : candidates) {
            if (keyword == null || keyword.trim().isEmpty())
                continue;

            try {
                String encoded = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
                String url = KEYWORD_API_URL + encoded;

                System.out.println("[지오코딩] 시도 키워드: " + keyword);
                System.out.println("[지오코딩] 요청 URL: " + url);

                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "KakaoAK " + kakaoApiKey);

                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

                System.out.println("[지오코딩] 응답 코드: " + response.getStatusCode());

                JSONObject json = new JSONObject(response.getBody());
                JSONArray documents = json.getJSONArray("documents");
                System.out.println("[지오코딩] documents 개수: " + documents.length());

                if (documents.length() > 0) {
                    JSONObject first = documents.getJSONObject(0);
                    double lon = first.getDouble("x");
                    double lat = first.getDouble("y");
                    System.out.println("[지오코딩] 성공 lat=" + lat + ", lon=" + lon
                            + " (keyword=" + keyword + ")");
                    return new double[] { lat, lon };
                } else {
                    System.out.println("[지오코딩] 결과 없음 (keyword=" + keyword + ")");
                }
            } catch (Exception e) {
                System.err.println("[지오코딩] 예외 발생 (keyword=" + keyword + "): " + e.getMessage());
            }
        }

        System.err.println("[지오코딩] 모든 키워드 시도 실패: station=" + stationName + ", line=" + line);
        return new double[] { 0.0, 0.0 };
    }

    /**
     * (위도, 경도) → [city, district]
     * 실패 시 ["", ""] 반환
     */
    public String[] reverseGeocode(double lat, double lon) {
        try {
            String url = REVERSE_API_URL
                    + "?x=" + lon // Kakao는 x=경도, y=위도
                    + "&y=" + lat;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            JSONObject json = new JSONObject(response.getBody());
            JSONArray documents = json.getJSONArray("documents");

            if (documents.length() > 0) {
                JSONObject address = documents
                        .getJSONObject(0)
                        .getJSONObject("address");

                String city = address.getString("region_1depth_name"); // 서울특별시
                String district = address.getString("region_2depth_name"); // 영등포구 등

                return new String[] { city, district };
            }
        } catch (Exception e) {
            System.err.println("역지오코딩 실패: " + e.getMessage());
        }
        return new String[] { "", "" };
    }
}
