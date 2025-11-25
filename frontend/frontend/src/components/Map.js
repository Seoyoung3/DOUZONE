/* global kakao */
import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8080";

/** 문자열 정규화 */
const normalize = (s = "") =>
  s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/역$/, "")
    .trim();

/** 거리 계산(Haversine, km) */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
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
  const [filters, setFilters] = useState({ keyword: "", line: "" });
  const [selectedMachine, setSelectedMachine] = useState(null); // 상세 패널용

  const scriptLoadedRef = useRef(false);
  const mapRef = useRef(null);
  const machinesRef = useRef([]);

  const userMarkerRef = useRef(null);
  const nearestMarkerRef = useRef(null);
  const lineRef = useRef(null);

  /** 지도 생성 + 현재 필터로 마커 그리기 */
  const initKakaoMap = (filtersNow) => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("map");
    if (!container) return;

    container.innerHTML = "";

    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });
    mapRef.current = map;

    const bounds = new kakao.maps.LatLngBounds();
    const places = new kakao.maps.services.Places();

    const createMarker = (lat, lon, machine) => {
      const position = new kakao.maps.LatLng(lat, lon);

      const marker = new kakao.maps.Marker({
        map,
        position,
      });

      // 마커 클릭하면 상세 패널 열기
      kakao.maps.event.addListener(marker, "click", () => {
        setSelectedMachine(machine);
      });

      bounds.extend(position);
    };

    fetch(`${API_BASE}/api/machines`)
      .then((res) => (res.status === 204 ? [] : res.json()))
      .then((data) => {
        machinesRef.current = data;

        // 필터 적용
        const filtered = data.filter((m) => {
          const stationNorm = normalize(m.stationName);
          const detailNorm = normalize(m.detailLocation);
          const lineNorm = (m.line || "").toLowerCase().trim();

          const keywordNorm = normalize(filtersNow.keyword || "");
          const filterLine = (filtersNow.line || "").toLowerCase().trim();

          if (keywordNorm) {
            const match =
              stationNorm.includes(keywordNorm) ||
              keywordNorm.includes(stationNorm) ||
              (detailNorm && detailNorm.includes(keywordNorm));
            if (!match) return false;
          }

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

        // 마커 표시(백엔드 좌표 → 프론트 지오코딩)
        filtered.forEach((m) => {
          if (m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0) {
            createMarker(m.latitude, m.longitude, m);
            return;
          }

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

        setTimeout(() => {
          if (!bounds.isEmpty()) map.setBounds(bounds);
        }, 1000);
      })
      .catch(console.error);
  };

  /** 📍 내 위치로 이동 */
  const handleMoveToMyLocation = () => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map || !kakao) return;

    if (!navigator.geolocation) {
      alert("GPS를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const userPos = new kakao.maps.LatLng(lat, lon);

        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

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

  /** 🔍 가장 가까운 발급기 찾기 */
  const handleFindNearest = () => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map || !kakao) return;

    if (!navigator.geolocation) {
      alert("GPS를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const userPos = new kakao.maps.LatLng(userLat, userLon);

        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

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

        const machines = machinesRef.current.filter(
          (m) => m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0
        );

        if (machines.length === 0) {
          alert("좌표가 있는 발급기 데이터가 없습니다.");
          return;
        }

        const sorted = machines
          .map((m) => ({
            ...m,
            distance: getDistance(userLat, userLon, m.latitude, m.longitude),
          }))
          .sort((a, b) => a.distance - b.distance);

        const nearest = sorted[0];
        setSelectedMachine(nearest); // 가까운 발급기도 패널 열기

        const nearestPos = new kakao.maps.LatLng(nearest.latitude, nearest.longitude);

        if (nearestMarkerRef.current) nearestMarkerRef.current.setMap(null);

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

        if (lineRef.current) lineRef.current.setMap(null);

        lineRef.current = new kakao.maps.Polyline({
          map,
          path: [userPos, nearestPos],
          strokeWeight: 3,
          strokeColor: "#ff0000",
          strokeOpacity: 0.8,
        });

        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(userPos);
        bounds.extend(nearestPos);
        map.setBounds(bounds);
      },
      (err) => alert("GPS 정보를 가져올 수 없습니다: " + err.message)
    );
  };

  // Kakao SDK 로드
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

  // 필터 변경 시 재렌더
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
    <div style={{ position: "relative" }}>
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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleMoveToMyLocation}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              backgroundColor: "#3867A0FF",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔷 내 위치로 이동
          </button>

          <button
            onClick={handleFindNearest}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              backgroundColor: "#5AB1D1FF",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔍 가까운 발급기 찾기
          </button>
        </div>
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

      {/* ✅ 상세 패널 */}
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 0,
          width: 320,
          height: "calc(600px - 10px)",
          backgroundColor: "white",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-6px 0 16px rgba(0,0,0,0.08)",
          transform: selectedMachine ? "translateX(0)" : "translateX(110%)",
          transition: "transform 0.25s ease",
          padding: 16,
          borderRadius: "12px 0 0 12px",
          overflowY: "auto",
          zIndex: 9999,
        }}
      >
        {!selectedMachine ? (
          <div style={{ color: "#64748b" }}>
            마커를 클릭하면 상세 정보가 여기에 표시됩니다.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>
                {selectedMachine.stationName} ({selectedMachine.line})
              </h3>
              <button
                onClick={() => setSelectedMachine(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* 사진(지금은 없으니 placeholder) */}
            <div
              style={{
                marginTop: 12,
                height: 160,
                background: "#f1f5f9",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              사진 준비 중
            </div>

            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
              <div><b>상세 위치</b><br />{selectedMachine.detailLocation || "정보 없음"}</div>
              <div style={{ marginTop: 8 }}><b>지상/지하</b><br />{selectedMachine.locationType || "정보 없음"}</div>
              <div style={{ marginTop: 8 }}><b>역층</b><br />{selectedMachine.floor || "정보 없음"}</div>
              <div style={{ marginTop: 8 }}><b>관리기관/업체</b><br />{selectedMachine.contractor || "정보 없음"}</div>
              <div style={{ marginTop: 8 }}><b>전화번호</b><br />{selectedMachine.phone || "정보 없음"}</div>

              {/* 아래는 나중에 DB에 필드 추가하면 자동 표시됨 */}
              <div style={{ marginTop: 12 }}>
                <b>업무 가능한 민원 종류</b><br />
                {selectedMachine.services?.length
                  ? selectedMachine.services.join(", ")
                  : "정보 없음"}
              </div>
            </div>

            {/* 길찾기 버튼(선택) */}
            {selectedMachine.latitude && selectedMachine.longitude ? (
              <button
                onClick={() =>
                  window.open(
                    `https://map.kakao.com/link/to/${selectedMachine.stationName},${selectedMachine.latitude},${selectedMachine.longitude}`
                  )
                }
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#111827",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                카카오맵으로 길찾기
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Map;
