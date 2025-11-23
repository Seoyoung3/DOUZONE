import React from "react";
import Map from "./Map";   // 같은 폴더면 이렇게

const MapScreen = () => {
  return (
    <div style={{ width: "100%" }}>
      <h1>무인발급기 찾기</h1>
      <Map />
    </div>
  );
};

export default MapScreen;