import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/api";
import { theme, font } from "../styles/theme";

const emptyForm = {
  category_code: "",
  category_name_en: "",
  category_name_th: "",
  description: "",
};

const inputStyle = {
  width: "100%", padding: "9px 12px",
  border: `1.5px solid ${theme.border}`,
  borderRadius: theme.radius.md, fontSize: 14,
  fontFamily: font, boxSizing: "border-box",
  outline: "none", color: theme.textPrimary,
  background: "#fff", transition: "border-color 0.15s",
};

const thStyle = {
  padding: "11px 16px", textAlign: "left",
  fontWeight: 600, fontSize: 12, letterSpacing: 0.5, whiteSpace: "nowrap",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getCategories()
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : r.data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = categories.filter((c) =>
    c.category_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.category_name_th?.includes(search) ||
    c.category_name_en?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.category_code || !form.category_name_th) {
      setError("กรุณากรอกรหัสและชื่อหมวดหมู่ภาษาไทย");
      return;
    }
    try {
      if (editId) {
        await updateCategory(editId, form);
      } else {
        await createCategory(form);
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

  const handleEdit = (c) => {
    setForm({ ...c });
    setEditId(c.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบ "${name}"?`)) return;
    try {
      await deleteCategory(id);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "ไม่สามารถลบได้");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.textPrimary, letterSpacing: -0.3 }}>หมวดหมู่ครุภัณฑ์</h2>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}>จัดการประเภทและรหัสหมวดหมู่ครุภัณฑ์</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); setError(""); }}
          style={{
            background: theme.primary, color: "#fff", border: "none",
            borderRadius: theme.radius.md, padding: "10px 20px",
            fontSize: 14, cursor: "pointer", fontFamily: font,
            fontWeight: 600, boxShadow: theme.shadow.sm,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { e.target.style.background = theme.primaryDark; e.target.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.target.style.background = theme.primary; e.target.style.transform = "translateY(0)"; }}
        >+ เพิ่มหมวดหมู่</button>
      </div>

      {/* Search */}
      <input
        placeholder="ค้นหารหัส หรือชื่อหมวดหมู่..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, width: 300, marginBottom: 20 }}
        onFocus={e => e.target.style.borderColor = theme.primary}
        onBlur={e => e.target.style.borderColor = theme.border}
      />

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(26,10,13,0.5)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(2px)",
        }}>
          <div style={{
            background: "#fff", borderRadius: theme.radius.xl,
            padding: "28px 32px", width: 480, fontFamily: font,
            boxShadow: "0 20px 60px rgba(90,20,32,0.25)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: 18, fontWeight: 700 }}>
                {editId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </h3>
              <button onClick={() => { setShowForm(false); setError(""); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: theme.textMuted }}>✕</button>
            </div>

            {error && (
              <div style={{
                background: theme.redBg, color: theme.red, padding: "10px 14px",
                borderRadius: theme.radius.md, marginBottom: 16, fontSize: 13,
                border: `1px solid #F0B8BE`,
              }}>{error}</div>
            )}

            {/* Preview badge */}
            {form.category_code && (
              <div style={{
                background: theme.primaryGhost, border: `1px solid ${theme.primaryBorder}`,
                borderRadius: theme.radius.md, padding: "10px 16px",
                marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 11, color: theme.textMuted }}>ตัวอย่างรหัส:</span>
                <span style={{
                  background: theme.primary, color: "#fff",
                  padding: "2px 12px", borderRadius: theme.radius.full,
                  fontSize: 13, fontWeight: 700, letterSpacing: 1,
                }}>{form.category_code.toUpperCase()}</span>
              </div>
            )}

            {[
              { label: "รหัสหมวดหมู่ * (เช่น PC, NB, PR)", key: "category_code", placeholder: "2-4 ตัวอักษร เช่น PC" },
              { label: "ชื่อภาษาไทย *", key: "category_name_th", placeholder: "เช่น คอมพิวเตอร์" },
              { label: "ชื่อภาษาอังกฤษ", key: "category_name_en", placeholder: "เช่น Computer" },
              { label: "รายละเอียด", key: "description", placeholder: "รายละเอียดเพิ่มเติม (ถ้ามี)" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: theme.textSecondary, display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: 0.3 }}>{label}</label>
                <input
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: key === "category_code" ? e.target.value.toUpperCase() : e.target.value })}
                  placeholder={placeholder}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = theme.primary}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => { setShowForm(false); setError(""); }}
                style={{ padding: "9px 20px", borderRadius: theme.radius.md, border: `1.5px solid ${theme.border}`, background: "#fff", cursor: "pointer", fontFamily: font, fontSize: 14, color: theme.textSecondary }}>
                ยกเลิก
              </button>
              <button onClick={handleSubmit}
                style={{ padding: "9px 20px", borderRadius: theme.radius.md, border: "none", background: theme.primary, color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: 600 }}>
                {editId ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
                  {["รหัส", "ชื่อภาษาไทย", "ชื่อภาษาอังกฤษ", "รายละเอียด", "จัดการ"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 50, color: theme.textMuted }}>ไม่พบข้อมูล</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id} style={{
                    background: i % 2 === 0 ? theme.surface : theme.bg,
                    borderBottom: `1px solid ${theme.borderLight}`,
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.primaryGhost}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? theme.surface : theme.bg}
                  >
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        background: theme.primary, color: "#fff",
                        padding: "3px 12px", borderRadius: theme.radius.full,
                        fontSize: 12, fontWeight: 700, letterSpacing: 1,
                      }}>{c.category_code}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 600, color: theme.textPrimary }}>{c.category_name_th}</td>
                    <td style={{ padding: "10px 16px", color: theme.textSecondary }}>{c.category_name_en || "-"}</td>
                    <td style={{ padding: "10px 16px", color: theme.textMuted, fontSize: 13 }}>{c.description || "-"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <button onClick={() => handleEdit(c)}
                        style={{ background: theme.blueBg, color: theme.blue, border: `1px solid #C5D5EE`, borderRadius: theme.radius.sm, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginRight: 6, fontFamily: font, fontWeight: 600 }}>
                        แก้ไข
                      </button>
                      <button onClick={() => handleDelete(c.id, c.category_name_th)}
                        style={{ background: theme.redBg, color: theme.red, border: `1px solid #F0B8BE`, borderRadius: theme.radius.sm, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 600 }}>
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>ทั้งหมด {filtered.length} หมวดหมู่</p>
    </div>
  );
}
