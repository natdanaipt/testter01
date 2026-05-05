import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const getUsers = () => API.get("/users/get");
export const getAssets = () => API.get("/assets");
export const getAsset = (id) => API.get(`/assets/${id}`);
export const createAsset = (data) => API.post("/assets", data);
export const updateAsset = (id, data) => API.put(`/assets/${id}`, data);
export const deleteAsset = (id) => API.delete(`/assets/${id}`);
export const getAuditLogs = () => API.get("/audit-logs");
export const getInspections = () => API.get("/inspections");
export const getInspectionByYear = (year) =>
  API.get(`/inspections/year/${year}`);
export const scanQR = (qr) => API.get(`/inspections/scan/${qr}`);
export const createInspection = (data) => API.post("/inspections", data);

export default API;

// Asset Categories
export const getCategories = () => API.get("/asset-cat/get");
export const createCategory = (data) => API.post("/asset-cat", data);
export const updateCategory = (id, data) => API.put(`/asset-cat/${id}`, data);
export const deleteCategory = (id) => API.delete(`/asset-cat/${id}`);
