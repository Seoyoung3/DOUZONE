// ManageMachines.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

const ManageMachines = () => {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({
    stationName: "",
    line: "",
    detailLocation: "",
    contractor: "",
    phone: "",
  });

  const loadMachines = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/machines`);
    console.log("GET /api/machines status:", res.status);

    if (res.status === 204) {
      console.log("데이터 없음 (204)");
      setMachines([]);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("백엔드 에러 응답:", text);
      alert("백엔드에서 발급기 목록을 가져오는 중 오류가 발생했습니다.");
      return;
    }

    const data = await res.json();
    console.log("발급기 개수:", data.length);
    setMachines(data);
  } catch (err) {
    console.error("[LOAD ERROR] fetch 자체 실패:", err);
    alert("발급기 목록을 불러오는 중 오류가 발생했습니다.");
  }
};

  useEffect(() => {
    loadMachines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!form.stationName || !form.line) {
      alert("역명과 호선은 필수입니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("등록 실패");
      }

      const saved = await res.json();
      setMachines((prev) => [...prev, saved]);
      setForm({
        stationName: "",
        line: "",
        detailLocation: "",
        contractor: "",
        phone: "",
      });
    } catch (err) {
      console.error(err);
      alert("발급기 등록 중 오류가 발생했습니다.");
    }
  };
  // 여기서는 상세위치/업체/전화만 수정 
  // stationName/line은 고정이라고 가정 
  // => 백엔드에서 updateMachine을 상세위치/업체/전화번호/층만 수정이라고 잡아놨었음. 역명, 호선을 바꾸면 지오코딩도 다시 돌려야해서
  // 역명, 호선은 처음 등록할 때만 정하고, 위치/업체/전화 번호 위주로 관리
  const handleEdit = async (m) => {
    const detailLocation = prompt(
      "상세 위치를 수정하세요:",
      m.detailLocation || ""
    );
    if (detailLocation === null) return;

    const contractor = prompt(
      "계약자/업체명을 수정하세요:",
      m.contractor || ""
    );
    if (contractor === null) return;

    const phone = prompt("전화번호를 수정하세요:", m.phone || "");
    if (phone === null) return;

    const body = {
      ...m,
      detailLocation,
      contractor,
      phone,
    };

    try {
      const res = await fetch(`${API_BASE}/api/machines/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("수정 실패");
      }

      const updated = await res.json();
      setMachines((prev) =>
        prev.map((item) => (item.id === m.id ? updated : item))
      );
    } catch (err) {
      console.error(err);
      alert("발급기 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/machines/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      setMachines((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("발급기 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">무인민원발급기 관리</h1>
            <p className="card-subtitle">
              새로운 발급기를 등록하고, 기존 발급기의 상세 정보를 관리합니다.
            </p>
          </div>
        </div>

        {/* 등록 폼 */}
        <form
          onSubmit={handleAdd}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr)) auto",
            gap: "8px",
            marginBottom: "16px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            name="stationName"
            value={form.stationName}
            onChange={handleChange}
            placeholder="역명 (예: 강남역)"
          />
          <input
            type="text"
            name="line"
            value={form.line}
            onChange={handleChange}
            placeholder="호선 (예: 2호선)"
          />
          <input
            type="text"
            name="detailLocation"
            value={form.detailLocation}
            onChange={handleChange}
            placeholder="상세 위치"
          />
          <input
            type="text"
            name="contractor"
            value={form.contractor}
            onChange={handleChange}
            placeholder="업체명"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="전화번호"
          />
          <button type="submit" className="btn btn-primary">
            등록
          </button>
        </form>

        {/* 테이블 */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>역명</th>
                <th>호선</th>
                <th>상세위치</th>
                <th>업체명</th>
                <th>전화번호</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {machines.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                    등록된 발급기가 없습니다.
                  </td>
                </tr>
              )}
              {machines.map((m) => (
                <tr key={m.id}>
                  <td>{m.stationName}</td>
                  <td>
                    <span className="badge-line">{m.line}</span>
                  </td>
                  <td>{m.detailLocation}</td>
                  <td>{m.contractor}</td>
                  <td>{m.phone}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleEdit(m)}
                      style={{ marginRight: "4px" }}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDelete(m.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageMachines;
