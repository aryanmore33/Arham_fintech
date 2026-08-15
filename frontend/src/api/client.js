import axios from "axios";

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, withCredentials: true, headers: { "Content-Type": "application/json" } });
apiClient.interceptors.response.use((response) => response.data, (error) => Promise.reject(new Error(error.response?.data?.error || "Request failed. Confirm that the backend is running on port 3000.")));
export default apiClient;
