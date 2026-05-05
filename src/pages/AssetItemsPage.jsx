import { useEffect, useState } from "react";
import { theme, font } from "../styles/theme";
import API, { getCategories } from "../services/api";

const getItems = () => API.get("/asset-items");
const getProblems = () => API.get("/asset-items/problems");
const createItem = (data) => API.post("/asset-items", data);
const updateItem = (id, data) => API.put(`/asset-items/${id}`, data);
const deleteItem = (id) => API.delete(`/asset-items/${id}`);
const searchItems = (kw) => API.get(`/asset-items/search/${kw}`);

const ASSET_CODES = [
  { code: "PC", label: "PC — คอมพิวเตอร์" },
  { code: "NB", label: "NB — โน้ตบุ๊ก" },
  { code: "MN", label: "MN — จอมอนิเตอร์" },
  { code: "PR", label: "PR — เครื่องพิมพ์" },
  { code: "SC", label: "SC — สแกนเนอร์" },
  { code: "NW", label: "NW — อุปกรณ์เครือข่าย" },
  { code: "SV", label: "SV — เซิร์ฟเวอร์" },
  { code: "OT", label: "OT — อื่นๆ" },
];

const statusLabel = {
  active: { text: "ใช้งานอยู่", color: theme.green, bg: theme.greenBg },
  broken: { text: "ชำรุด", color: theme.red, bg: theme.redBg },
  pending_sale: { text: "รอจำหน่าย", color: theme.orange, bg: theme.orangeBg },
  transferred: { text: "โอนย้าย", color: theme.blue, bg: theme.blueBg },
};

const emptyForm = {
  department_unit: "ฝ่ายพัฒนาระบบสารสนเทศ",
  asset_name: "",
  description: "",
  asset_no_main: "",
  budget_type: "001 เงินงบแผ่นดิน",
  budget_year: "2568",
  asset_code: "PC",
  supply_or_assets: "Assets",
  custodian: "",
  status: "active",
  storage_department: "ฝ่ายพัฒนาระบบสารสนเทศ",
  receive_date: "",
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

export default function AssetItemsPage({ defaultTab = "all" }) {
  const [items, setItems] = useState([]);
  const [problems, setProblems] = useState([]); // ← เพิ่มตรงนี้
  const [activeTab, setActiveTab] = useState(defaultTab); // ← เพิ่มตรงนี้
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const PER_PAGE = 20;

  const load = () => {
    setLoading(true);
    getItems()
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getCategories()
      .then((r) =>
        setCategories(Array.isArray(r.data) ? r.data : r.data.data || []),
      )
      .catch(() => setCategories([]));
    getProblems() // ← เพิ่ม
      .then((r) => setProblems(r.data.data || []))
      .catch(() => setProblems([]));
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) {
      load();
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      searchItems(search.trim())
        .then((r) => setItems(r.data.data || []))
        .catch(() => setItems([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(items.length / PER_PAGE);
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSubmit = async () => {
    if (!form.asset_name) {
      setError("กรุณากรอกชื่อครุภัณฑ์");
      return;
    }
    try {
      let res;
      if (editId) res = await updateItem(editId, form);
      else res = await createItem(form);

      if (res.data.isDuplicate) {
        // โหลด problems ใหม่แล้วเด้งไปแท็บ
        const r = await getProblems();
        setProblems(r.data.data || []);
        setActiveTab("problems"); // ← เด้งไปแท็บปัญหา
        alert(`⚠️ ${res.data.message}`);
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

  const handleEdit = (item) => {
    setForm({
      department_unit: item.department_unit || "",
      asset_name: item.asset_name || "",
      description: item.description || "",
      asset_no_main: item.asset_no_main || "",
      budget_type: item.budget_type || "001 เงินงบแผ่นดิน",
      budget_year: item.budget_year || "2568",
      asset_code: item.asset_code || "PC",
      supply_or_assets: item.supply_or_assets || "Assets",
      custodian: item.custodian || "",
      status: item.status || "active",
      storage_department: item.storage_department || "",
      receive_date: item.receive_date ? item.receive_date.split("T")[0] : "",
      remark: item.remark || "",
    });
    setEditId(item.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบ "${name}"?`)) return;
    try {
      await deleteItem(id);
      load();
    } catch (e) {
      alert("ไม่สามารถลบได้");
    }
  };

  const fi = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    style: inputStyle,
    onFocus: (e) => (e.target.style.borderColor = theme.primary),
    onBlur: (e) => (e.target.style.borderColor = theme.border),
  });

  return (
    <div>
      {/* Header */}
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
            ครุภัณฑ์ (ข้อมูลจริง)
          </h2>
          <p
            style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}
          >
            ทั้งหมด {items.length} รายการ · หน้า {page}/{totalPages || 1}
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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: `2px solid ${theme.border}`,
        }}
      >
        {[
          { key: "all", label: "ครุภัณฑ์ทั้งหมด", count: items.length },
          {
            key: "problems",
            label: "⚠️ ครุภัณฑ์ที่มีปัญหา",
            count: problems.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: font,
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 700 : 400,
              color:
                activeTab === tab.key ? theme.primary : theme.textSecondary,
              borderBottom:
                activeTab === tab.key
                  ? `2px solid ${theme.primary}`
                  : "2px solid transparent",
              marginBottom: -2,
            }}
          >
            {tab.label}
            <span
              style={{
                marginLeft: 8,
                background:
                  tab.key === "problems" ? "#ffebee" : theme.primaryGhost,
                color: tab.key === "problems" ? "#c62828" : theme.primary,
                padding: "1px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <input
          placeholder="ค้นหาชื่อ, รหัส, ผู้ครอบครอง..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, width: 320 }}
          onFocus={(e) => (e.target.style.borderColor = theme.primary)}
          onBlur={(e) => (e.target.style.borderColor = theme.border)}
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radius.md,
              padding: "9px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: theme.textSecondary,
              fontFamily: font,
            }}
          >
            ล้าง ✕
          </button>
        )}
        {searching && (
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            กำลังค้นหา...
          </span>
        )}
      </div>

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
              width: 580,
              maxHeight: "90vh",
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

            {/* Preview รหัส */}
            {!editId && (
              <div
                style={{
                  background: theme.primaryGhost,
                  border: `1px solid ${theme.primaryBorder}`,
                  borderRadius: theme.radius.md,
                  padding: "10px 16px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: theme.textSecondary,
                }}
              >
                รหัสครุภัณฑ์จะถูกสร้างอัตโนมัติ:{" "}
                <strong style={{ color: theme.primary }}>
                  {form.asset_code}
                  {String(form.budget_year).slice(-4)}XXXX
                </strong>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* ชื่อครุภัณฑ์ */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ชื่อครุภัณฑ์ *
                </label>
                <input
                  {...fi("asset_name")}
                  placeholder="เช่น เครื่องคอมพิวเตอร์ Dell..."
                />
              </div>

              {/* รายละเอียด */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  รายละเอียด
                </label>
                <input
                  {...fi("description")}
                  placeholder="รายละเอียดเพิ่มเติม"
                />
              </div>

              {/* เลขครุภัณฑ์หลัก */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  เลขครุภัณฑ์หลัก
                </label>
                <input
                  type="text"
                  {...fi("asset_no_main")}
                  placeholder="เช่น 744000010004-20506-00001"
                />
              </div>

              {/* ประเภทครุภัณฑ์ */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ประเภท (รหัส)
                </label>
                <select
                  value={form.asset_code}
                  onChange={(e) =>
                    setForm({ ...form, asset_code: e.target.value })
                  }
                  style={inputStyle}
                >
                  {/* เพิ่ม fallback ASSET_CODES ถ้า categories ยังไม่โหลด */}
                  {(categories.length > 0
                    ? categories
                    : ASSET_CODES.map((c) => ({
                        category_code: c.code,
                        category_name_en: c.label.split(" — ")[1],
                      }))
                  ).map((c) => (
                    <option key={c.category_code} value={c.category_code}>
                      {c.category_code} — {c.category_name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* ปีงบประมาณ */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ปีงบประมาณ (พ.ศ.)
                </label>
                <input {...fi("budget_year")} placeholder="เช่น 2568" />
              </div>

              {/* งบประมาณ */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  งบประมาณ
                </label>
                <select
                  value={form.budget_type}
                  onChange={(e) =>
                    setForm({ ...form, budget_type: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="001 เงินงบแผ่นดิน">001 เงินงบแผ่นดิน</option>
                  <option value="002 เงินรายได้">002 เงินรายได้</option>
                  <option value="003 เงินบริจาค">003 เงินบริจาค</option>
                </select>
              </div>

              {/* ประเภทพัสดุ */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ประเภทพัสดุ
                </label>
                <select
                  value={form.supply_or_assets}
                  onChange={(e) =>
                    setForm({ ...form, supply_or_assets: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="Assets">Assets — ครุภัณฑ์</option>
                  <option value="Supply">Supply — วัสดุ</option>
                </select>
              </div>

              {/* ผู้ถือครอง */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ผู้ถือครอง
                </label>
                <input
                  {...fi("custodian")}
                  placeholder="ชื่อ-นามสกุลผู้ถือครอง"
                />
              </div>

              {/* สถานที่เก็บ */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  สถานที่เก็บ
                </label>
                <input
                  {...fi("storage_department")}
                  placeholder="เช่น IT-ROOM / ส่วนกลาง"
                />
              </div>

              {/* วันที่รับเข้า */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  วันที่รับเข้า
                </label>
                <input type="date" {...fi("receive_date")} />
              </div>

              {/* สถานะ */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
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
                </select>
              </div>

              {/* หมายเหตุ */}
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  หมายเหตุ
                </label>
                <input {...fi("remark")} placeholder="หมายเหตุ (ถ้ามี)" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
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

      {/* Problems Tab */}
      {activeTab === "problems" && (
        <div
          style={{
            background: theme.surface,
            borderRadius: theme.radius.lg,
            border: `1px solid ${theme.border}`,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              fontFamily: font,
            }}
          >
            <thead>
              <tr style={{ background: "#c62828", color: "#fff" }}>
                {[
                  "รหัสครุภัณฑ์",
                  "ชื่อครุภัณฑ์",
                  "เลขซ้ำ",
                  "ผู้ถือครอง",
                  "หมายเหตุ",
                  "จัดการ",
                ].map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: theme.textMuted,
                    }}
                  >
                    ✅ ไม่มีรายการที่มีปัญหา
                  </td>
                </tr>
              ) : (
                problems.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#fff8f8",
                      borderBottom: `1px solid #fdd`,
                    }}
                  >
                    <td
                      style={{
                        padding: "9px 14px",
                        fontWeight: 700,
                        color: "#c62828",
                      }}
                    >
                      ⚠️ {item.asset_no_sub || "-"}
                    </td>
                    <td style={{ padding: "9px 14px", maxWidth: 260 }}>
                      <div style={{ fontWeight: 500 }}>{item.asset_name}</div>
                    </td>
                    <td
                      style={{
                        padding: "9px 14px",
                        fontSize: 12,
                        color: "#c62828",
                        fontWeight: 600,
                      }}
                    >
                      {item.asset_no_main || "-"}
                    </td>
                    <td
                      style={{
                        padding: "9px 14px",
                        fontSize: 12,
                        color: theme.textSecondary,
                      }}
                    >
                      {item.custodian || "-"}
                    </td>
                    <td
                      style={{
                        padding: "9px 14px",
                        fontSize: 12,
                        color: theme.textMuted,
                        maxWidth: 200,
                      }}
                    >
                      {item.remark || "-"}
                    </td>
                    <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          background: theme.blueBg,
                          color: theme.blue,
                          border: `1px solid #C5D5EE`,
                          borderRadius: theme.radius.sm,
                          padding: "4px 10px",
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
                        onClick={() => handleDelete(item.id, item.asset_name)}
                        style={{
                          background: theme.redBg,
                          color: theme.red,
                          border: `1px solid #F0B8BE`,
                          borderRadius: theme.radius.sm,
                          padding: "4px 10px",
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Table */}
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
        <>
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
                  fontSize: 13,
                  fontFamily: font,
                }}
              >
                <thead>
                  <tr style={{ background: theme.primary, color: "#fff" }}>
                    {[
                      "รหัสครุภัณฑ์",
                      "ชื่อครุภัณฑ์",
                      "ประเภท",
                      "ผู้ถือครอง",
                      "สถานที่",
                      "ปีงบ",
                      "สถานะ",
                      "จัดการ",
                    ].map((h) => (
                      <th key={h} style={thStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
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
                    paged.map((item, i) => {
                      const st = statusLabel[item.status] || {
                        text: item.status,
                        color: theme.textSecondary,
                        bg: theme.bg,
                      };
                      return (
                        <tr
                          key={item.id}
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
                              padding: "9px 14px",
                              fontWeight: 700,
                              color:
                                item.status === "duplicate"
                                  ? "#c62828"
                                  : theme.primary,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.status === "duplicate" && (
                              <span style={{ marginRight: 4 }}>⚠️</span>
                            )}
                            {item.asset_no_sub || "-"}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              color: theme.textPrimary,
                              maxWidth: 260,
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>
                              {item.asset_name}
                            </div>
                            {item.asset_no_main && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: theme.textMuted,
                                  marginTop: 2,
                                }}
                              >
                                {item.asset_no_main}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "9px 14px" }}>
                            <span
                              style={{
                                background: theme.primaryGhost,
                                color: theme.primary,
                                padding: "2px 10px",
                                borderRadius: theme.radius.full,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {item.asset_code}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              color: theme.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {item.custodian || "-"}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              color: theme.textMuted,
                              fontSize: 12,
                              maxWidth: 160,
                            }}
                          >
                            {item.storage_department || "-"}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              color: theme.textSecondary,
                              textAlign: "center",
                            }}
                          >
                            {item.budget_year || "-"}
                          </td>
                          <td style={{ padding: "9px 14px" }}>
                            <span
                              style={{
                                background: st.bg,
                                color: st.color,
                                padding: "3px 10px",
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
                              padding: "9px 14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <button
                              onClick={() => handleEdit(item)}
                              style={{
                                background: theme.blueBg,
                                color: theme.blue,
                                border: `1px solid #C5D5EE`,
                                borderRadius: theme.radius.sm,
                                padding: "4px 10px",
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
                              onClick={() =>
                                handleDelete(item.id, item.asset_name)
                              }
                              style={{
                                background: theme.redBg,
                                color: theme.red,
                                border: `1px solid #F0B8BE`,
                                borderRadius: theme.radius.sm,
                                padding: "4px 10px",
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.border}`,
                  background: page === 1 ? theme.bg : theme.surface,
                  cursor: page === 1 ? "default" : "pointer",
                  fontFamily: font,
                  fontSize: 13,
                  color: theme.textSecondary,
                }}
              >
                ← ก่อนหน้า
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p =
                  totalPages <= 7
                    ? i + 1
                    : page <= 4
                      ? i + 1
                      : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: theme.radius.md,
                      border: `1px solid ${p === page ? theme.primary : theme.border}`,
                      background: p === page ? theme.primary : theme.surface,
                      color: p === page ? "#fff" : theme.textSecondary,
                      cursor: "pointer",
                      fontFamily: font,
                      fontSize: 13,
                      fontWeight: p === page ? 700 : 400,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.border}`,
                  background: page === totalPages ? theme.bg : theme.surface,
                  cursor: page === totalPages ? "default" : "pointer",
                  fontFamily: font,
                  fontSize: 13,
                  color: theme.textSecondary,
                }}
              >
                ถัดไป →
              </button>
            </div>
          )}
          <p
            style={{
              fontSize: 13,
              color: theme.textMuted,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            แสดง {Math.min((page - 1) * PER_PAGE + 1, items.length)}–
            {Math.min(page * PER_PAGE, items.length)} จาก {items.length} รายการ
          </p>
        </>
      )}
    </div>
  );
}
