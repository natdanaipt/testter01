import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AssetsPage from "./pages/AssetsPage";
import UsersPage from "./pages/UsersPage";
import AuditLogPage from "./pages/AuditLogPage";
import InspectionPage from "./pages/InspectionPage";
import CategoriesPage from "./pages/CategoriesPage";
import AssetItemsPage from "./pages/AssetItemsPage";
import { theme, font } from "./styles/theme";

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: font,
          background: theme.bg,
        }}
      >
        <Sidebar />
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/asset-items" element={<AssetItemsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit-logs" element={<AuditLogPage />} />
            <Route path="/inspections" element={<InspectionPage />} />
            <Route path="/asset-items" element={<AssetItemsPage />} />
            <Route
              path="/asset-problems"
              element={<AssetItemsPage defaultTab="problems" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
