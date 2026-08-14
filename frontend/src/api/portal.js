import apiClient from "./client";
export const getEmployees = () => apiClient.get("/api/employees");
export const createEmployee = (employee) => apiClient.post("/api/employees", employee);
export const startSync = () => apiClient.post("/api/sync");
export const createLiveDemoTrade = () => apiClient.post("/api/demo-trade");
export const getViewData = (view, { employeeId, filters, manager }) => {
  if (view === "employee-clients") return apiClient.get("/api/employee-clients");
  const params = view === "trades" ? { ...filters, ...(manager && employeeId ? { employeeId } : {}) } : undefined;
  return apiClient.get(`/api/${view}`, { params });
};
