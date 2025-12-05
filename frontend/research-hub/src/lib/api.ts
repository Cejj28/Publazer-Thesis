import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
});

interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

export const registerUser = async (userData: RegisterData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (credentials: LoginData) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

// Define the shape of the data we send
interface PaperData {
  title: string;
  abstract: string;
  keywords: string;
  fileName: string;
  author: string;
  authorId: string;
  department?: string;
}

export const uploadPaper = async (formData: FormData) => {
  // Note: We don't manually set Content-Type here; 
  // axios/browser sets it automatically to 'multipart/form-data' when it sees FormData
  const response = await api.post('/papers/upload', formData);
  return response.data;
};

// Update this function to accept an options object
export const getPapers = async (filters: { authorId?: string; status?: string; search?: string } = {}) => {
  const response = await api.get('/papers', { 
    params: filters 
  });
  return response.data;
};

export const deletePaper = async (id: string) => {
  const response = await api.delete(`/papers/${id}`);
  return response.data;
};

export const updatePaper = async (id: string, data: { title: string; abstract: string; keywords: string }) => {
  const response = await api.put(`/papers/${id}`, data);
  return response.data;
};

// Update this function to accept comments
export const updatePaperStatus = async (id: string, status: 'approved' | 'rejected', comments?: string) => {
  // We send both status and comments to the backend
  const response = await api.put(`/papers/${id}`, { status, comments });
  return response.data;
};

// CHECK PLAGIARISM
export const checkPlagiarism = async (formData: FormData) => {
  return api.post("/plagiarism/check", formData).then(res => res.data);
};

// USER MANAGEMENT FUNCTIONS
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUser = async (id: string, data: { 
  name: string; 
  email: string; 
  role: string;
  department?: string;
  password?: string; 
}) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Update this function to accept the full object
export const createUser = async (userData: { 
  name: string; 
  email: string; 
  role: string; 
  password?: string; 
  department?: string; 
}) => {
  const response = await api.post('/users', userData);
  return response.data;
};

