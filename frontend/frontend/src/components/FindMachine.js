// 검색 폼 + 지도 표시

// src/components/FindMachine.jsx (이름은 네가 쓰는 경로에 맞춰 조정)

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet 기본 마커 아이콘 (DummyMap에서 쓰던거 재사용)
const icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const API_BASE = "http://localhost:8080";

function FindMachine() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [machines, setMachines] = useState([]);

  const handleSearch = async () => {
    try {
      let url = "";

      // 아무것도 안 넣으면 전체 조회
      if (!city && !district) {
        url = `${API_BASE}/api/machines`;
      }
      // 시/도만
      else if (city && !district) {
        url = `${API_BASE}/api/machines/search?city=${encodeURIComponent(
          city
        )}`;
      }
      // 시/도 + 시/군/구
      else {
        url = `${API_BASE}/api/machines/search?city=${encodeURIComponent(
          city
        )}&district=${encodeURIComponent(district)}`;
      }

      const response = await fetch(url);

      if (response.status === 204) {
        setMachines([]);
        alert("검색 결과가 없습니다.");
        return;
      }

      const data = await response.json();
      setMachines(data);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>무인민원발급기 찾기</h2>

      {/* 검색 입력 영역 */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="시/도 입력 (예: 서울특별시)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="시/군/구 입력 (예: 강남구)"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 지도 */}
      <MapContainer
        center={[37.5665, 126.978]} // 서울 시청 근처
        zoom={11}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {machines.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={icon}
          >
            <Popup>
              <strong>
                {m.stationName} ({m.line})
              </strong>
              <br />
              {m.detailLocation}
              <br />
              {m.contractor}
              <br />
              {m.phone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FindMachine;
