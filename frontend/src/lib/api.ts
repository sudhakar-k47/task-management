// Centralized API service for frontend <-> backend communication
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // Adjust if your backend runs on a different base URL or port

// --- Task APIs ---
export const getTasks = async () => {
  const res = await axios.get(`${API_BASE}/tasks`);
  return res.data;
};

export const getTask = async (id: string) => {
  const res = await axios.get(`${API_BASE}/tasks/${id}`);
  return res.data;
};

export const createTask = async (data: any) => {
  const res = await axios.post(`${API_BASE}/tasks`, data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

export const updateTask = async (id: string, data: any) => {
  const res = await axios.put(`${API_BASE}/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id: string) => {
  const res = await axios.delete(`${API_BASE}/tasks/${id}`);
  return res.data;
};

// --- User APIs ---
export const getUsers = async () => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const getUser = async (id: string) => {
  const res = await axios.get(`${API_BASE}/users/${id}`);
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await axios.post(`${API_BASE}/users`, data);
  return res.data;
};

export const updateUser = async (id: string, data: any) => {
  const res = await axios.put(`${API_BASE}/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`${API_BASE}/users/${id}`);
  return res.data;
};

// --- Auth APIs ---
export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  if (res.data.token && res.data.user) {
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { username, email, password });
  if (res.data.token && res.data.user) {
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getCurrentUser = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// Axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers && typeof config.headers === 'object') {
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
