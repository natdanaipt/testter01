import { useEffect, useState } from "react";
import { getAssets, getUsers, getAuditLogs, getInspections } from "../services/api";
import { theme, font } from "../styles/theme";

const PageHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.textPrimary, letterSpacing: -0.3 }}>{title}</h2>
    <p style={{ color: theme.textMuted, fontSize: 13, margin: "5px 0 0" }}>{subtitle}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ assets: 0, users: 0, logs: 0, inspections: 0 });

  useEffect(() => {
    Promise.all([getAssets(), getUsers(), getAuditLogs(), getInspections()])
      .then(([a, u, l, i]) => {
        setStats({
          assets: a.data.total || 0,
          users: u.data.total || 0,
          logs: l.data.total || 0,
          inspections: i.data.total || 0,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "ครุภัณฑ์ทั้งหมด", value: stats.assets, unit: "รายการ", icon: "◈", color: theme.primary, bg: theme.primaryGhost, border: theme.primaryBorder },
    { label: "บุคลากร", value: stats.users, unit: "คน", icon: "◎", color: theme.blue, bg: theme.blueBg, border: "#C5D5EE" },
    { label: "บันทึกประวัติ", value: stats.logs, unit: "รายการ", icon: "≡", color: theme.orange, bg: theme.orangeBg, border: "#F0D5B0" },
    { label: "การตรวจสอบ", value: stats.inspections, unit: "ครั้ง", icon: "◉", color: theme.green, bg: theme.greenBg, border: "#B5D9C3" },
  ];

  return (
    <div>
      <PageHeader title="ภาพรวมระบบ" subtitle="ระบบจัดการครุภัณฑ์ ฝ่ายพัฒนาระบบสารสนเทศ" />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: theme.radius.lg,
            padding: "20px 24px",
            flex: 1,
            minWidth: 160,
            boxShadow: theme.shadow.sm,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = theme.shadow.md; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = theme.shadow.sm; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: c.color, fontWeight: 600, letterSpacing: 0.2 }}>{c.label}</span>
              <span style={{ fontSize: 20, color: c.color, opacity: 0.7 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: c.color, marginTop: 6, opacity: 0.7 }}>{c.unit}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius.lg,
        padding: "20px 24px",
        boxShadow: theme.shadow.sm,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 28, height: 28, borderRadius: theme.radius.sm,
            background: theme.primaryGhost, border: `1px solid ${theme.primaryBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: theme.primary,
          }}>ℹ</div>
          <strong style={{ fontSize: 14, color: theme.textPrimary }}>คำแนะนำการใช้งาน</strong>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          {[
            ["◈ ครุภัณฑ์", "เพิ่ม / แก้ไข / ลบ / ค้นหาครุภัณฑ์"],
            ["◎ บุคลากร", "ดูรายชื่อบุคลากรในฝ่าย"],
            ["≡ บันทึกประวัติ", "ตรวจสอบประวัติการแก้ไขข้อมูล"],
            ["◉ ตรวจสอบประจำปี", "บันทึกและดูผลการตรวจนับครุภัณฑ์"],
          ].map(([key, val]) => (
            <div key={key} style={{ fontSize: 13, color: theme.textSecondary, padding: "6px 0", borderBottom: `1px solid ${theme.borderLight}`, display: "flex", gap: 8 }}>
              <span style={{ color: theme.primary, fontWeight: 600, minWidth: 110 }}>{key}</span>
              <span>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
