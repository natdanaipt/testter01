import { useEffect, useState } from "react";
import { getUsers } from "../services/api";
import { theme, font } from "../styles/theme";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers()
      .then((r) => setUsers(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.full_name_th?.includes(search) || u.email?.includes(search)
  );

  const roleColor = {
    "ผู้ดูแลระบบ": { bg: theme.primaryGhost, color: theme.primary },
    "เจ้าหน้าที่พัสดุ": { bg: theme.greenBg, color: theme.green },
    "ผู้ถือครองทรัพย์สิน": { bg: theme.orangeBg, color: theme.orange },
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.textPrimary, letterSpacing: -0.3 }}>บุคลากร</h2>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}>รายชื่อบุคลากรฝ่ายพัฒนาระบบสารสนเทศ</p>
      </div>

      <input
        placeholder="ค้นหาชื่อ หรืออีเมล..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px 14px", border: `1.5px solid ${theme.border}`,
          borderRadius: theme.radius.md, fontSize: 14, width: 300,
          marginBottom: 20, fontFamily: font,
          outline: "none", color: theme.textPrimary,
          background: theme.surface, boxShadow: theme.shadow.sm,
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = theme.primary}
        onBlur={e => e.target.style.borderColor = theme.border}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.textMuted, fontSize: 14 }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: theme.textMuted }}>ไม่พบข้อมูล</div>
          ) : filtered.map((u) => {
            const rc = roleColor[u.role] || { bg: theme.bg, color: theme.textSecondary };
            const initials = (u.full_name_th || "").replace(/[^ก-๙a-zA-Z]/g, "").slice(0, 2).toUpperCase();
            return (
              <div key={u.id} style={{
                background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: theme.radius.lg, padding: "20px 22px",
                boxShadow: theme.shadow.sm, transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = theme.shadow.md; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = theme.shadow.sm; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16, fontWeight: 700,
                    flexShrink: 0, boxShadow: `0 2px 8px ${theme.primaryBorder}`,
                  }}>
                    {initials || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.textPrimary }}>{u.full_name_th}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{u.position_name}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 5 }}>✉ {u.email}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>☎ {u.phone || "-"}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{u.department}</span>
                  <span style={{
                    background: rc.bg, color: rc.color,
                    padding: "3px 12px", borderRadius: theme.radius.full,
                    fontSize: 11, fontWeight: 600,
                  }}>{u.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 16 }}>ทั้งหมด {filtered.length} คน</p>
    </div>
  );
}
