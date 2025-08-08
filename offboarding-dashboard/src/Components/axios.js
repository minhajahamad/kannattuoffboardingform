import axios from 'axios';

const API_BASE_URL = 'https://backend.hrms.pixelsoft.online/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
