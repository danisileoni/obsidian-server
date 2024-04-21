import axios from 'axios';

const BASE_URL = process.env.API_URL_;
const API_CLIENT = process.env.API_CLIENT;
const API_SECRET = process.env.API_SECRET;

const axiosPaypal = axios.create({
  baseURL: BASE_URL,
  auth: {
    username: API_CLIENT,
    password: API_SECRET,
  },
});

axiosPaypal.interceptors.request.use(
  (config) => config,
  (error) => error,
);

export default axiosPaypal;
