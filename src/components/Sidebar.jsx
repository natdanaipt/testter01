import { NavLink } from "react-router-dom";
import { theme, font } from "../styles/theme";

const menu = [
  { path: "/", label: "หน้าหลัก", icon: "🏠" },
  { path: "/asset-items", label: "ครุภัณฑ์จริง", icon: "📦" },
  { path: "/categories", label: "หมวดหมู่", icon: "🗂️" },
  { path: "/users", label: "บุคลากร", icon: "👤" },
  { path: "/audit-logs", label: "บันทึกประวัติ", icon: "📋" },
  //{ path: "/inspections", label: "ตรวจสอบประจำปี", icon: "🔍" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${theme.sidebarDark} 0%, ${theme.sidebar} 100%)`,
        color: theme.sidebarText,
        display: "flex",
        flexDirection: "column",
        fontFamily: font,
        flexShrink: 0,
        boxShadow: "2px 0 20px rgba(0,0,0,0.18)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.sidebarAccent}, ${theme.primaryLight})`,
        }}
      />

      <div
        style={{
          padding: "28px 22px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.md,
              background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            e
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>
              e-Asset
            </div>
            <div
              style={{
                fontSize: 10,
                color: theme.sidebarMuted,
                marginTop: 1,
                letterSpacing: 1,
              }}
            >
              MANAGEMENT
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.sidebarMuted,
            lineHeight: 1.5,
            paddingLeft: 2,
          }}
        >
          สำนักพัฒนาเทคนิคศึกษา
        </div>
      </div>

      <div
        style={{
          padding: "16px 22px 6px",
          fontSize: 10,
          letterSpacing: 2,
          color: theme.sidebarMuted,
          fontWeight: 600,
        }}
      >
        เมนูหลัก
      </div>

      <nav style={{ flex: 1, padding: "4px 10px" }}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              margin: "2px 0",
              color: isActive ? "#fff" : theme.sidebarText,
              background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
              textDecoration: "none",
              fontSize: 14,
              borderRadius: theme.radius.md,
              borderLeft: isActive
                ? `3px solid ${theme.sidebarAccent}`
                : "3px solid transparent",
              transition: "all 0.18s ease",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: "16px 22px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11,
          color: theme.sidebarMuted,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>KMUTNB</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
