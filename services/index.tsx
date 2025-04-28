import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // thêm dòng này

let BASE_URL = '';
if (process.env.NODE_ENV === 'development') {
  // http://localhost:3001/api
  BASE_URL = 'https://ruby-rails-boilerplate-3s9t.onrender.com/api';
} else {
  BASE_URL = 'https://ruby-rails-boilerplate-3s9t.onrender.com/api';
}

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-lang': 'EN'
  },
});

// Interceptor cho request
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const rememberToken = await AsyncStorage.getItem('remember_token');
      
      if (token) {
        (config as any).headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token} ${rememberToken || ''}`,
        };
      }
    } catch (error) {
      console.error('Error reading token from AsyncStorage', error);
    }
    return config as any;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
