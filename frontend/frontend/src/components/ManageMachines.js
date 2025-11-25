// ManageMachines.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

const ManageMachines = () => {
  const [machines, setMachines] = useState([]);

  // 모달(중앙 팝업 창)
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    stationName: "",
    line: "",
    detailLocation: "",
    contractor: "",
    phone: "",
  });

  /** 발급기 목록 조회 */
  const loadMachines = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/machines`);

      if (res.status === 204) {
        setMachines([]);
        return;
      }
      if (!res.ok) throw new Error("조회 실패");

      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error(err);
      alert("목록 조회 오류");
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  /** 입력 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 모달 열기 (등록) */
  const openAddModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      stationName: "",
      line: "",
      detailLocation: "",
      contractor: "",
      phone: "",
    });
    setModalOpen(true);
  };

  /** 모달 열기 (수정) */
  const openEditModal = (m) => {
    setEditMode(true);
    setCurrentId(m.id);
    setForm({
      stationName: m.stationName,
      line: m.line,
      detailLocation: m.detailLocation,
      contractor: m.contractor,
      phone: m.phone,
    });
    setModalOpen(true);
  };

  /** 등록 */
  const handleAdd = async () => {
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

      if (!res.ok) throw new Error("등록 실패");

      await loadMachines();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("등록 오류");
    }
  };

  /** 수정 */
  const handleEdit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/machines/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("수정 실패");

      await loadMachines();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("수정 오류");
    }
  };

  /** 삭제 */
  const handleDelete = async (id) => {
    if (!window.confirm("삭제할까요?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/machines/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제 실패");
      await loadMachines();
    } catch (err) {
      console.error(err);
      alert("삭제 오류");
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">무인민원발급기 관리</h1>
          <p className="card-subtitle">새 발급기 등록 및 정보 관리</p>

          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={openAddModal}
          >
            ➕ 신규 발급기 등록
          </button>
        </div>

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
                  <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                    등록된 발급기가 없습니다.
                  </td>
                </tr>
              )}
              {machines.map((m) => (
                <tr key={m.id}>
                  <td>{m.stationName}</td>
                  <td>{m.line}</td>
                  <td>{m.detailLocation}</td>
                  <td>{m.contractor}</td>
                  <td>{m.phone}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => openEditModal(m)}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDelete(m.id)}
                      style={{ marginLeft: 6 }}
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

      {/* ============================= */}
      {/*         중앙 모달 팝업        */}
      {/* ============================= */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480,
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0 }}>
                {editMode ? "발급기 정보 수정" : "신규 발급기 등록"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* 입력 폼 – 넓고 간격 넉넉하게 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "8px",
              }}
            >
              <input
                name="stationName"
                value={form.stationName}
                onChange={handleChange}
                placeholder="역명"
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                name="line"
                value={form.line}
                onChange={handleChange}
                placeholder="호선"
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                name="detailLocation"
                value={form.detailLocation}
                onChange={handleChange}
                placeholder="상세 위치"
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                name="contractor"
                value={form.contractor}
                onChange={handleChange}
                placeholder="업체명"
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="전화번호"
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={editMode ? handleEdit : handleAdd}
              style={{ width: "100%", padding: "12px", fontSize: "16px" }}
            >
              {editMode ? "수정 완료" : "등록 완료"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMachines;
