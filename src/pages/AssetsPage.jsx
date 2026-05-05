import { useEffect, useState } from "react";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getCategories,
} from "../services/api";
import { theme, font } from "../styles/theme";

const statusLabel = {
  active: { text: "ใช้งานอยู่", color: theme.green, bg: theme.greenBg },
  broken: { text: "ชำรุด", color: theme.red, bg: theme.redBg },
  pending_sale: { text: "รอจำหน่าย", color: theme.orange, bg: theme.orangeBg },
  transferred: { text: "โอนย้าย", color: theme.blue, bg: theme.blueBg },
  duplicate: { text: "⚠️ เลขซ้ำ", color: theme.blue, bg: theme.blueBg },
};

const emptyForm = {
  asset_id: "",
  asset_name: "",
  description: "",
  unit: "เครื่อง",
  price_per_unit: "",
  quantity: 1,
  category_id: 1,
  acquisition_type: "ซื้อ",
  acquisition_date: "",
  useful_life_years: 5,
  expiry_date: "",
  status: "active",
  location_id: 1,
  custodian_id: 1,
  department_id: 1,
  created_by: 1,
  remark: "",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid ${theme.border}`,
  borderRadius: theme.radius.md,
  fontSize: 14,
  fontFamily: font,
  boxSizing: "border-box",
  outline: "none",
  color: theme.textPrimary,
  background: "#fff",
  transition: "border-color 0.15s",
};

const thStyle = {
  padding: "11px 14px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getAssets()
      .then((r) => setAssets(r.data.data || []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getCategories()
      .then((r) =>
        setCategories(Array.isArray(r.data) ? r.data : r.data.data || []),
      )
      .catch(() => setCategories([]));
  }, []);

  const filtered = assets.filter(
    (a) =>
      a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_id?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.asset_id || !form.asset_name) {
      setError("กรุณากรอกรหัสและชื่อครุภัณฑ์");
      return;
    }
    try {
      if (editId) {
        await updateAsset(editId, form);
      } else {
        await createAsset(form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      setError("");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (a) => {
    setForm({ ...a });
    setEditId(a.id);
    setShowForm(true);
    setError("");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบครุภัณฑ์นี้?")) return;
    await deleteAsset(id);
    load();
  };

  const inp = (e) => ({
    ...inputStyle,
    borderColor: e ? theme.primary : theme.border,
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              color: theme.textPrimary,
              letterSpacing: -0.3,
            }}
          >
            ครุภัณฑ์
          </h2>
          <p
            style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}
          >
            จัดการข้อมูลครุภัณฑ์ทั้งหมด
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm(emptyForm);
            setEditId(null);
            setError("");
          }}
          style={{
            background: theme.primary,
            color: "#fff",
            border: "none",
            borderRadius: theme.radius.md,
            padding: "10px 20px",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: font,
            fontWeight: 600,
            boxShadow: theme.shadow.sm,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = theme.primaryDark;
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = theme.primary;
            e.target.style.transform = "translateY(0)";
          }}
        >
          + เพิ่มครุภัณฑ์
        </button>
      </div>

      <input
        placeholder="ค้นหาชื่อ หรือรหัสครุภัณฑ์..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: 20, width: 320 }}
        onFocus={(e) => (e.target.style.borderColor = theme.primary)}
        onBlur={(e) => (e.target.style.borderColor = theme.border)}
      />

      {/* Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,10,13,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: theme.radius.xl,
              padding: "28px 32px",
              width: 540,
              maxHeight: "88vh",
              overflowY: "auto",
              fontFamily: font,
              boxShadow: "0 20px 60px rgba(90,20,32,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.textPrimary,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {editId ? "แก้ไขครุภัณฑ์" : "เพิ่มครุภัณฑ์ใหม่"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: theme.textMuted,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: theme.redBg,
                  color: theme.red,
                  padding: "10px 14px",
                  borderRadius: theme.radius.md,
                  marginBottom: 16,
                  fontSize: 13,
                  border: `1px solid #F0B8BE`,
                }}
              >
                {error}
              </div>
            )}

            {[
              { label: "รหัสครุภัณฑ์ *", key: "asset_id" },
              { label: "ชื่อครุภัณฑ์ *", key: "asset_name" },
              { label: "รายละเอียด", key: "description" },
              { label: "หน่วยนับ", key: "unit" },
              { label: "ราคา/หน่วย", key: "price_per_unit", type: "number" },
              { label: "วันที่รับเข้า", key: "acquisition_date", type: "date" },
              { label: "วันหมดอายุ", key: "expiry_date", type: "date" },
              { label: "หมายเหตุ", key: "remark" },
            ].map(({ label, key, type = "text" }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = theme.primary)}
                  onBlur={(e) => (e.target.style.borderColor = theme.border)}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                  display: "block",
                  marginBottom: 5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                }}
              >
                หมวดหมู่
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                style={inputStyle}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_code} — {c.category_name_th}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                  display: "block",
                  marginBottom: 5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                }}
              >
                สถานะ
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                <option value="active">ใช้งานอยู่</option>
                <option value="broken">ชำรุด</option>
                <option value="pending_sale">รอจำหน่าย</option>
                <option value="transferred">โอนย้าย</option>
                <option value="duplicate">⚠️ เลขซ้ำ</option>
              </select>
            </div>

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                style={{
                  padding: "9px 20px",
                  borderRadius: theme.radius.md,
                  border: `1.5px solid ${theme.border}`,
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: font,
                  fontSize: 14,
                  color: theme.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "9px 20px",
                  borderRadius: theme.radius.md,
                  border: "none",
                  background: theme.primary,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: font,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {editId ? "บันทึกการแก้ไข" : "เพิ่มครุภัณฑ์"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: theme.textMuted,
            fontSize: 14,
          }}
        >
          กำลังโหลด...
        </div>
      ) : (
        <div
          style={{
            background: theme.surface,
            borderRadius: theme.radius.lg,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow.sm,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                fontFamily: font,
              }}
            >
              <thead>
                <tr style={{ background: theme.primary, color: "#fff" }}>
                  {[
                    "รหัสครุภัณฑ์",
                    "ชื่อครุภัณฑ์",
                    "หน่วย",
                    "ราคา/หน่วย",
                    "สถานะ",
                    "ผู้ครอบครอง",
                    "จัดการ",
                  ].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 50,
                        color: theme.textMuted,
                      }}
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => {
                    const st = statusLabel[a.status] || {
                      text: a.status,
                      color: theme.textSecondary,
                      bg: theme.bg,
                    };
                    return (
                      <tr
                        key={a.id}
                        style={{
                          background: i % 2 === 0 ? theme.surface : theme.bg,
                          borderBottom: `1px solid ${theme.borderLight}`,
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            theme.primaryGhost)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0 ? theme.surface : theme.bg)
                        }
                      >
                        <td
                          style={{
                            padding: "10px 14px",
                            fontWeight: 700,
                            color: theme.primary,
                            fontSize: 13,
                          }}
                        >
                          {a.asset_id}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            color: theme.textPrimary,
                          }}
                        >
                          {a.asset_name}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            color: theme.textSecondary,
                          }}
                        >
                          {a.unit}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            color: theme.textSecondary,
                          }}
                        >
                          {a.price_per_unit
                            ? Number(a.price_per_unit).toLocaleString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              background: st.bg,
                              color: st.color,
                              padding: "3px 12px",
                              borderRadius: theme.radius.full,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {st.text}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            color: theme.textSecondary,
                          }}
                        >
                          {a.custodian_name || "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <button
                            onClick={() => handleEdit(a)}
                            style={{
                              background: theme.blueBg,
                              color: theme.blue,
                              border: `1px solid #C5D5EE`,
                              borderRadius: theme.radius.sm,
                              padding: "5px 12px",
                              cursor: "pointer",
                              fontSize: 12,
                              marginRight: 6,
                              fontFamily: font,
                              fontWeight: 600,
                            }}
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            style={{
                              background: theme.redBg,
                              color: theme.red,
                              border: `1px solid #F0B8BE`,
                              borderRadius: theme.radius.sm,
                              padding: "5px 12px",
                              cursor: "pointer",
                              fontSize: 12,
                              fontFamily: font,
                              fontWeight: 600,
                            }}
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>
        ทั้งหมด {filtered.length} รายการ
      </p>
    </div>
  );
}
