/* global kakao */

import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8080";

/** 문자열 정규화: 소문자, 공백 제거, 괄호 제거, 끝의 '역' 제거 */
const normalize = (s = "") =>
  s
    .toLowerCase()
    .replace(/\s+/g, "")        // 모든 공백 제거
    .replace(/\(.*?\)/g, "")    // 괄호 내용 제거
    .replace(/역$/, "")         // 끝의 '역' 제거
    .trim();

/** Haversine 거리 계산 (km) */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Map = () => {
  const scriptLoadedRef = useRef(false);
  const mapRef = useRef(null);           // kakao map 객체 저장
  const machinesRef = useRef([]);        // 전체 발급기 저장

  const userMarkerRef = useRef(null);    // 내 위치 마커
  const nearestMarkerRef = useRef(null); // 가장 가까운 발급기 마커
  const lineRef = useRef(null);          // 내 위치-발급기 연결선

  const [filters, setFilters] = useState({ keyword: "", line: "" });

  /** 지도 생성 + 마커 렌더링 */
  const initKakaoMap = (filtersNow) => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) {
      console.error("Kakao Maps 객체가 없습니다.");
      return;
    }

    const container = document.getElementById("map");
    if (!container) {
      console.error("#map 요소가 없습니다.");
      return;
    }

    container.innerHTML = ""; // 기존 지도 초기화

    // 지도 생성
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });
    mapRef.current = map;

    const bounds = new kakao.maps.LatLngBounds();
    const places = new kakao.maps.services.Places();

    // 마커 생성 함수
    const createMarker = (lat, lon, machine) => {
      const position = new kakao.maps.LatLng(lat, lon);

      const marker = new kakao.maps.Marker({
        map,
        position,
      });

      const infoHtml = `
        <div style="padding:5px; font-size:12px;">
          <strong>${machine.stationName} (${machine.line})</strong><br/>
          ${machine.detailLocation || ""}<br/>
          ${machine.contractor || ""}<br/>
          ${machine.phone || ""}
        </div>
      `;

      const iw = new kakao.maps.InfoWindow({ content: infoHtml });
      kakao.maps.event.addListener(marker, "click", () => iw.open(map, marker));

      bounds.extend(position);
    };

    // 데이터 불러오기
    fetch(`${API_BASE}/api/machines`)
      .then((res) => (res.status === 204 ? [] : res.json()))
      .then((data) => {
        machinesRef.current = data;

        // --------------------
        // 필터 적용 (역명/상세위치 + 호선)
        // --------------------
        const filtered = data.filter((m) => {
          const stationNorm = normalize(m.stationName);
          const detailNorm = normalize(m.detailLocation);
          const lineNorm = (m.line || "").toLowerCase().trim();

          const keywordNorm = normalize(filtersNow.keyword || "");
          const filterLine = (filtersNow.line || "").toLowerCase().trim();

          // 역명/상세 위치 필터
          if (keywordNorm) {
            const match =
              stationNorm.includes(keywordNorm) ||
              keywordNorm.includes(stationNorm) ||
              (detailNorm && detailNorm.includes(keywordNorm));
            if (!match) return false;
          }

          // 호선 필터
          if (filterLine) {
            const onlyNumber = lineNorm.replace(/[^0-9]/g, "");
            const filterOnlyNumber = filterLine.replace(/[^0-9]/g, "");

            const matchLine =
              lineNorm.includes(filterLine) ||
              (onlyNumber && onlyNumber === filterOnlyNumber);

            if (!matchLine) return false;
          }

          return true;
        });

        if (filtered.length === 0) return;

        // --------------------
        // 마커 표시: 백엔드 좌표 → 프론트 지오코딩 순
        // --------------------
        filtered.forEach((m) => {
          // 1) 백엔드 좌표가 있으면 그대로 사용
          if (m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0) {
            createMarker(m.latitude, m.longitude, m);
            return;
          }

          // 2) 프론트 지오코딩
          const baseName = normalize(m.stationName);
          const onlyNumber = (m.line || "").replace(/[^0-9]/g, "").trim();
          const lineText = onlyNumber ? `${onlyNumber}호선` : "";

          const candidates = [
            `서울 ${baseName}역 ${lineText}`,
            `${baseName}역 ${lineText}`,
            `서울 ${baseName}역`,
            `${baseName}역`,
            baseName,
          ];

          const trySearch = (idx) => {
            if (idx >= candidates.length) return;

            const key = candidates[idx];
            places.keywordSearch(key, (results, status) => {
              if (status === kakao.maps.services.Status.OK && results.length > 0) {
                const place = results[0];
                createMarker(parseFloat(place.y), parseFloat(place.x), m);
                return;
              }
              trySearch(idx + 1);
            });
          };

          trySearch(0);
        });

        // 마커 범위 맞추기
        setTimeout(() => {
          if (!bounds.isEmpty()) map.setBounds(bounds);
        }, 1000);
      })
      .catch((e) => console.error("지도 데이터 로딩 실패:", e));
  };

  /** 📍 내 위치로 지도 이동 */
  const handleMoveToMyLocation = () => {
    const { kakao } = window;
    const map = mapRef.current;

    if (!navigator.geolocation) {
      alert("GPS를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const userPos = new kakao.maps.LatLng(lat, lon);

        // 기존 내 위치 마커 제거
        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

        // 파란 별 마커
        const userMarkerImage = new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35),
          { offset: new kakao.maps.Point(12, 35) }
        );

        userMarkerRef.current = new kakao.maps.Marker({
          map,
          position: userPos,
          title: "내 위치",
          image: userMarkerImage,
          zIndex: 9999,
        });

        map.panTo(userPos);
      },
      (err) => alert("GPS 정보를 가져올 수 없습니다: " + err.message)
    );
  };

  /** ✅ 내 위치에서 가장 가까운 발급기 찾기 */
  const handleFindNearest = () => {
    const { kakao } = window;
    const map = mapRef.current;

    if (!navigator.geolocation) {
      alert("GPS를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const userPos = new kakao.maps.LatLng(userLat, userLon);

        // 기존 내 위치 마커 제거
        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

        // 파란 별 내 위치 마커
        const userMarkerImage = new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35),
          { offset: new kakao.maps.Point(12, 35) }
        );

        userMarkerRef.current = new kakao.maps.Marker({
          map,
          position: userPos,
          title: "내 위치",
          image: userMarkerImage,
          zIndex: 9999,
        });

        // 좌표 있는 발급기만 대상으로
        const machines = machinesRef.current.filter(
          (m) =>
            m.latitude &&
            m.longitude &&
            m.latitude !== 0 &&
            m.longitude !== 0
        );

        if (machines.length === 0) {
          alert("좌표가 있는 발급기 데이터가 없습니다.");
          return;
        }

        // 거리 계산 후 정렬
        const sorted = machines
          .map((m) => ({
            ...m,
            distance: getDistance(userLat, userLon, m.latitude, m.longitude),
          }))
          .sort((a, b) => a.distance - b.distance);

        const nearest = sorted[0];
        const nearestPos = new kakao.maps.LatLng(
          nearest.latitude,
          nearest.longitude
        );

        // 기존 가까운 발급기 마커 제거
        if (nearestMarkerRef.current) nearestMarkerRef.current.setMap(null);

        // 빨간 마커(가까운 발급기)
        nearestMarkerRef.current = new kakao.maps.Marker({
          map,
          position: nearestPos,
          title: `가장 가까운 발급기: ${nearest.stationName} (${nearest.line})`,
          image: new kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/common/marker_red.png",
            new kakao.maps.Size(30, 44),
            { offset: new kakao.maps.Point(15, 44) }
          ),
          zIndex: 9000,
        });

        // 기존 라인 제거
        if (lineRef.current) lineRef.current.setMap(null);

        // 내 위치 ↔ 가까운 발급기 선(Line)
        lineRef.current = new kakao.maps.Polyline({
          map,
          path: [userPos, nearestPos],
          strokeWeight: 3,
          strokeColor: "#ff0000",
          strokeOpacity: 0.8,
        });

        // 내 위치 + 가까운 발급기 둘 다 보이도록 bounds
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(userPos);
        bounds.extend(nearestPos);
        map.setBounds(bounds);

        alert(
          `가장 가까운 발급기: ${nearest.stationName} (${nearest.line})\n거리: ${nearest.distance.toFixed(
            2
          )} km`
        );
      },
      (err) => alert("GPS 정보를 가져올 수 없습니다: " + err.message)
    );
  };

  // --------------------
  // 최초 로딩: Kakao SDK 로드
  // --------------------
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      scriptLoadedRef.current = true;
      initKakaoMap(filters);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=d057d5f413376b47054b8aaaf59541c2&libraries=services";
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      initKakaoMap(filters);
    };

    script.onerror = () => console.error("Kakao Maps 스크립트 로드 실패");
    document.head.appendChild(script);
  }, []);

  // 필터 변경 시 지도 리렌더
  useEffect(() => {
    if (!scriptLoadedRef.current) return;
    initKakaoMap(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handleReset = () => setFilters({ keyword: "", line: "" });

  return (
    <div>
      {/* 필터 UI */}
      <div
        style={{
          marginBottom: "12px",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <strong>필터</strong>

        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={handleChange}
          placeholder="역명/위치 (강남, 강남역...)"
          style={{ padding: "4px 8px", minWidth: "220px" }}
        />
        <input
          type="text"
          name="line"
          value={filters.line}
          onChange={handleChange}
          placeholder="호선 (예: 3, 3호선)"
          style={{ padding: "4px 8px", width: "120px" }}
        />

        <button onClick={handleReset} style={{ padding: "6px 10px" }}>
          초기화
        </button>

        {/* 내 위치로 이동 */}
        <button
          onClick={handleMoveToMyLocation}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          📍 내 위치로 이동
        </button>

        {/* 가까운 발급기 찾기 */}
        <button
          onClick={handleFindNearest}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔍 가까운 발급기 찾기
        </button>
      </div>

      {/* 지도 */}
      <div
        id="map"
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
          backgroundColor: "#eee",
        }}
      />
    </div>
  );
};

export default Map;
