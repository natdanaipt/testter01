import { useEffect, useState } from "react";
import { getAuditLogs } from "../services/api";
import { theme, font } from "../styles/theme";

const actionColor = {
  LOGIN:  { bg: theme.blueBg, color: theme.blue },
  CREATE: { bg: theme.greenBg, color: theme.green },
  UPDATE: { bg: theme.orangeBg, color: theme.orange },
  DELETE: { bg: theme.redBg, color: theme.red },
  EXPORT: { bg: theme.purpleBg, color: theme.purple },
};

const thStyle = {
  padding: "11px 14px", textAlign: "left", fontWeight: 600,
  fontSize: 12, letterSpacing: 0.5, whiteSpace: "nowrap",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then((r) => setLogs(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) =>
    l.actor_name?.includes(search) ||
    l.action?.includes(search) ||
    l.description?.includes(search)
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.textPrimary, letterSpacing: -0.3 }}>บันทึกประวัติ</h2>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: "5px 0 0" }}>ประวัติการดำเนินการทั้งหมดในระบบ</p>
      </div>

      <input
        placeholder="ค้นหาชื่อผู้ใช้ หรือการกระทำ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px 14px", border: `1.5px solid ${theme.border}`,
          borderRadius: theme.radius.md, fontSize: 14, width: 300,
          marginBottom: 20, fontFamily: font, outline: "none",
          color: theme.textPrimary, background: theme.surface,
          boxShadow: theme.shadow.sm,
        }}
        onFocus={e => e.target.style.borderColor = theme.primary}
        onBlur={e => e.target.style.borderColor = theme.border}
      />

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
                  {["วันที่/เวลา", "ผู้ดำเนินการ", "การกระทำ", "ตาราง", "รายละเอียด", "IP"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 50, color: theme.textMuted }}>ไม่พบข้อมูล</td></tr>
                ) : filtered.map((l, i) => {
                  const ac = actionColor[l.action] || { bg: theme.bg, color: theme.textSecondary };
                  const dt = l.action_timestamp ? new Date(l.action_timestamp).toLocaleString("th-TH") : "-";
                  return (
                    <tr key={l.id} style={{
                      background: i % 2 === 0 ? theme.surface : theme.bg,
                      borderBottom: `1px solid ${theme.borderLight}`,
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = theme.primaryGhost}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? theme.surface : theme.bg}
                    >
                      <td style={{ padding: "9px 14px", whiteSpace: "nowrap", fontSize: 12, color: theme.textMuted }}>{dt}</td>
                      <td style={{ padding: "9px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: theme.textPrimary }}>{l.actor_name || "-"}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{l.actor_email}</div>
                      </td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{
                          background: ac.bg, color: ac.color,
                          padding: "3px 10px", borderRadius: theme.radius.full,
                          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                        }}>{l.action}</span>
                      </td>
                      <td style={{ padding: "9px 14px", color: theme.textSecondary, fontSize: 13 }}>{l.target_table || "-"}</td>
                      <td style={{ padding: "9px 14px", color: theme.textPrimary, fontSize: 13, maxWidth: 200 }}>{l.description || "-"}</td>
                      <td style={{ padding: "9px 14px", fontSize: 11, color: theme.textMuted }}>{l.ip_address || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>ทั้งหมด {filtered.length} รายการ</p>
    </div>
  );
}
