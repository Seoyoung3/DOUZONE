// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const linkStyle = (path) => ({
    padding: "10px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    color: location.pathname === path ? "#111827" : "#4b5563",
    backgroundColor: location.pathname === path ? "#e5e7eb" : "transparent",
    fontSize: "14px",
  });

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#111827",
        color: "#e5e7eb",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}>
        서울 무인민원발급기
      </h2>
      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px" }}>
        위치 조회 · 발급기 관리
      </div>
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Link to="/" style={linkStyle("/")}>
          홈
        </Link>
        <Link to="/map" style={linkStyle("/map")}>
          무인발급기 찾기
        </Link>
        <Link to="/manage" style={linkStyle("/manage")}>
          무인민원발급기 관리
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
