import { useEffect, useState } from "react";
import { getInspectionByYear, scanQR, createInspection } from "../services/api";
import { theme, font } from "../styles/theme";

const inputStyle = {
  padding: "9px 12px", border: `1.5px solid ${theme.border}`,
  borderRadius: theme.radius.md, fontSize: 14,
  fontFamily: font, width: "100%", boxSizing: "border-box",
  outline: "none", color: theme.textPrimary, background: "#fff",
  transition: "border-color 0.15s",
};

const thStyle = { padding: "11px 14px", textAlign: "left", fontWeight: 600, fontSize: 12, letterSpacing: 0.5, whiteSpace: "nowrap" };

export default function InspectionPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset_id: "", inspection_year: new Date().getFullYear(),
    inspection_date: new Date().toISOString().split("T")[0],
    inspected_by: 1, physical_count: 1, system_count: 1,
    status_found: "active", note: "",
  });

  const load = () => {
    setLoading(true);
    getInspectionByYear(year)
      .then((r) => setInspections(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year]);

  const handleScan = async () => {
    if (!qrInput) return;
    try {
      const r = await scanQR(qrInput);
      setScanResult(r.data.data); setScanError("");
      setForm((f) => ({ ...f, asset_id: r.data.data.id }));
    } catch { setScanResult(null); setScanError("ไม่พบครุภัณฑ์ที่ค้นหา"); }
  };

  const handleCreate = async () => {
    try {
      await createInspection(form);
      setShowForm(false); setScanResult(null); setQrInput(""); load();
      alert("บันทึกการตรวจสอบสำเร็จ");
    } catch (e) { alert(e.response?.data?.message || "เกิดข้อผิดพลาด"); }
  };

  const fi = (focused) => ({ ...inputStyle, borderColor: focused ? theme.primary : theme.border });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.textPrimary, letterSpacing: -0.3 }}>ตรวจสอบประจำปี</h2>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}>บันทึกและดูผลการตรวจนับครุภัณฑ์</p>
      </div>

      {/* QR Scan Box */}
      <div style={{
        background: theme.primaryGhost, border: `1px solid ${theme.primaryBorder}`,
        borderRadius: theme.radius.lg, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ fontWeight: 700, color: theme.primary, marginBottom: 14, fontSize: 14 }}>
          ◉ ค้นหาด้วย QR Code / รหัสครุภัณฑ์
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="เช่น PC690001"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            style={{ ...inputStyle, width: 280 }}
            onFocus={e => e.target.style.borderColor = theme.primary}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
          <button onClick={handleScan} style={{
            background: theme.primary, color: "#fff", border: "none",
            borderRadius: theme.radius.md, padding: "9px 20px",
            cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: 600,
            whiteSpace: "nowrap",
          }}>ค้นหา</button>
        </div>

        {scanError && <p style={{ color: theme.red, fontSize: 13, marginTop: 10 }}>{scanError}</p>}

        {scanResult && (
          <div style={{
            background: theme.surface, border: `1px solid ${theme.primaryBorder}`,
            borderRadius: theme.radius.md, padding: "16px 20px", marginTop: 14,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: theme.textPrimary, marginBottom: 8 }}>
              {scanResult.asset_id} — {scanResult.asset_name}
            </div>
            <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 2, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span>หมวดหมู่: {scanResult.category || "-"}</span>
              <span>สถานะ: {scanResult.status}</span>
              <span>ผู้ครอบครอง: {scanResult.custodian_name || "-"}</span>
            </div>
            <button onClick={() => setShowForm(true)} style={{
              marginTop: 12, background: theme.green, color: "#fff",
              border: "none", borderRadius: theme.radius.md, padding: "8px 18px",
              cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 600,
            }}>+ บันทึกการตรวจสอบ</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,10,13,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          <div style={{
            background: "#fff", borderRadius: theme.radius.xl,
            padding: "28px 32px", width: 480, fontFamily: font,
            boxShadow: "0 20px 60px rgba(90,20,32,0.25)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: 18, fontWeight: 700 }}>บันทึกผลการตรวจสอบ</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: theme.textMuted }}>✕</button>
            </div>

            {[
              { label: "จำนวนที่นับได้จริง", key: "physical_count", type: "number" },
              { label: "จำนวนในระบบ", key: "system_count", type: "number" },
              { label: "หมายเหตุ", key: "note" },
            ].map(({ label, key, type = "text" }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: theme.textSecondary, display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = theme.primary}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: theme.textSecondary, display: "block", marginBottom: 5, fontWeight: 600 }}>สภาพที่พบ</label>
              <select value={form.status_found} onChange={(e) => setForm({ ...form, status_found: e.target.value })} style={inputStyle}>
                <option value="active">ใช้งานได้ปกติ</option>
                <option value="broken">ชำรุด</option>
                <option value="pending_sale">รอจำหน่าย</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "9px 20px", borderRadius: theme.radius.md, border: `1.5px solid ${theme.border}`, background: "#fff", cursor: "pointer", fontFamily: font, fontSize: 14, color: theme.textSecondary }}>
                ยกเลิก
              </button>
              <button onClick={handleCreate}
                style={{ padding: "9px 20px", borderRadius: theme.radius.md, border: "none", background: theme.primary, color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: 600 }}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Year Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 600 }}>ปีที่ตรวจสอบ:</span>
        <select value={year} onChange={(e) => setYear(e.target.value)}
          style={{ ...inputStyle, width: "auto", padding: "7px 12px" }}>
          {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y + 543}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.textMuted, fontSize: 14 }}>กำลังโหลด...</div>
      ) : (
        <div style={{
          background: theme.surface, borderRadius: theme.radius.lg,
          border: `1px solid ${theme.border}`, boxShadow: theme.shadow.sm,
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: font }}>
              <thead>
                <tr style={{ background: theme.primary, color: "#fff" }}>
                  {["รหัสครุภัณฑ์", "ชื่อครุภัณฑ์", "ผู้ตรวจ", "วันที่ตรวจ", "จำนวนจริง", "จำนวนระบบ", "ผล", "สภาพ", "หมายเหตุ"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 50, color: theme.textMuted }}>ไม่พบข้อมูลการตรวจสอบ</td></tr>
                ) : inspections.map((ins, i) => (
                  <tr key={ins.id} style={{
                    background: i % 2 === 0 ? theme.surface : theme.bg,
                    borderBottom: `1px solid ${theme.borderLight}`,
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.primaryGhost}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? theme.surface : theme.bg}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: theme.primary, fontSize: 13 }}>{ins.asset_id}</td>
                    <td style={{ padding: "10px 14px", color: theme.textPrimary }}>{ins.asset_name}</td>
                    <td style={{ padding: "10px 14px", color: theme.textSecondary }}>{ins.inspected_by_name || "-"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: theme.textMuted }}>{ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString("th-TH") : "-"}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600 }}>{ins.physical_count}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600 }}>{ins.system_count}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        background: ins.is_matched ? theme.greenBg : theme.redBg,
                        color: ins.is_matched ? theme.green : theme.red,
                        padding: "3px 12px", borderRadius: theme.radius.full,
                        fontSize: 11, fontWeight: 600,
                      }}>{ins.is_matched ? "ตรงกัน" : "ไม่ตรงกัน"}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: theme.textSecondary, fontSize: 13 }}>{ins.status_found}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: theme.textMuted }}>{ins.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>ทั้งหมด {inspections.length} รายการ</p>
    </div>
  );
}
