// Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      {/* Hero */}
      <section
        style={{
          padding: "28px 24px",
          borderRadius: 14,
          background: "linear-gradient(135deg, #041140FF 0%, #1F5D78FF 100%)",
          color: "white",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ fontSize: 25, marginBottom: 8 }}>
          서울 무인민원발급기 위치·정보 통합 서비스
        </h1>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
          서울 지하철역 내 무인민원발급기의 <b>위치와 상세 정보</b>를 지도에서
          한눈에 확인하고, 관리자 페이지에서 손쉽게 최신 정보를 관리할 수 있는
          웹서비스입니다.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/map"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#FFFFFFFF",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.5)"
            }}
          >
            🗺️ 지도에서 발급기 찾기
          </Link>
          <Link
            to="/manage"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            ⚙️ 발급기 정보 관리
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>주요 기능</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <FeatureCard
            title="지도 기반 검색"
            desc="서울 시내 발급기를 지도 위 마커로 확인할 수 있어요."
            icon="📌"
          />
          <FeatureCard
            title="역명/호선 필터"
            desc="역명 또는 호선 조건으로 원하는 발급기만 빠르게 찾습니다."
            icon="🔎"
          />
          <FeatureCard
            title="가까운 발급기 추천"
            desc="내 위치 기준 가장 가까운 발급기를 자동으로 안내합니다."
            icon="📍"
          />
          <FeatureCard
            title="관리자 CRUD"
            desc="신규 등록, 수정, 삭제로 정보를 최신 상태로 유지합니다."
            icon="🛠️"
          />
        </div>
        </section>
      {/* 사용 방법 */}
<section style={{ marginTop: 22 }}>
  <h2 style={{ fontSize: 18, marginBottom: 12 }}>사용 방법</h2>

  <div
    style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "16px 18px",
      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
      lineHeight: 1.7,
      fontSize: 15,
    }}
  >
    <ol style={{ margin: 0, paddingLeft: 18 }}>
      <li><b>무인발급기 찾기</b> 메뉴에서 지도에 표시된 마커를 확인합니다.</li>
      <li>상단 필터에 <b>역명/호선</b>을 입력하면 조건에 맞는 발급기만 표시됩니다.</li>
      <li><b>내 위치로 이동</b> 또는 <b>가까운 발급기 찾기</b> 버튼으로 주변 기기를 탐색합니다.</li>
      <li><b>관리자 메뉴</b>에서 발급기 정보를 등록·수정·삭제합니다.</li>
    </ol>
  </div>
</section>

      {/* 데이터 출처 */}
<section style={{ marginTop: 22 }}>
  <h2 style={{ fontSize: 18, marginBottom: 10 }}>데이터 출처</h2>

  <div
    style={{
      background: "white",
      border: "1px solid #e2e8f0",
      padding: "16px 18px",
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
      lineHeight: 1.6,
      fontSize: 15,
    }}
  >
    본 서비스는 공공데이터포털의 <b>‘서울교통공사_무인민원발급기현황’</b> 데이터를 기반으로 합니다.<br/>
    제공 데이터에는 위도·경도가 포함되어 있지 않아, 역명/호선 정보를 기반으로
    <b>카카오맵 지오코딩</b>을 수행해 좌표를 생성하고 지도에 시각화합니다.
  </div>
</section>


      {/* Footer note */}
      <p style={{ marginTop: 18, color: "#64748b", fontSize: 13 }}>
        ※ 발급기 위치/운영 정보는 공공데이터 및 관리자 업데이트에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon }) => (
  <div
    style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "14px 14px",
      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
    }}
  >
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
      {desc}
    </div>
  </div>
);

export default Home;





