import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RegisterData {
  name: string;      // Changed to name
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