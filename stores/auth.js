import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      user.value = response.data;
    }
  };

  const signup = async (username, email, password) => {
    await axios.post(`${API_URL}/register`, { username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('user');
    user.value = null;
  };

  return {
    user,
    login,
    signup,
    logout,
  };
});
