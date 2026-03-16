import axios from 'axios';

const API_BASE = 'https://village-health-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (identifier, password) =>
  api.post('/auth/login', { identifier, email: identifier, password });

export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword });

// Admin
export const getDashboard = () => api.get('/admin/dashboard');
export const getAnalytics = (period = 'month') => api.get(`/admin/analytics?period=${period}`);
export const getStudents = () => api.get('/admin/students');
export const uploadStudents = (students) => api.post('/admin/upload-students', { students });
export const uploadHouses = (houses) => api.post('/admin/upload-houses', { houses });
export const runClustering = () => api.post('/admin/run-clustering');
export const resetStudentPassword = (studentId) =>
  api.post('/admin/reset-password', { studentId });

export default api;
