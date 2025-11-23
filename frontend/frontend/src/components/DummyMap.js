import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 마커 아이콘 설정
const icon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DummyMap = () => {
  const [machines, setMachines] = useState([]);

  // 더미 데이터 가져오기 (API 호출 느낌)
  useEffect(() => {
    // 실제로는 fetch("http://localhost:8080/api/machines") 이렇게 하면 됨
    const fetchDummyData = async () => {
      // 1초 기다렸다가 데이터 반환
      const dummyData = [
        { stationName: "서울역", line: "1호선", latitude: 37.554722, longitude: 126.970833 },
        { stationName: "강남역", line: "2호선", latitude: 37.497942, longitude: 127.027621 },
        { stationName: "잠실역", line: "2호선", latitude: 37.513119, longitude: 127.100555 },
      ];

      // 실제 API 호출처럼 Promise 사용
      await new Promise((res) => setTimeout(res, 1000));
      setMachines(dummyData);
    };

    fetchDummyData();
  }, []);

  return (
    <MapContainer center={[37.5665, 126.978]} zoom={12} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />
      {machines.map((m, idx) => (
        <Marker key={idx} position={[m.latitude, m.longitude]} icon={icon}>
          <Popup>
            {m.stationName} - {m.line}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DummyMap;
