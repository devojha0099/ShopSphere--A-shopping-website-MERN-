import axios from 'axios';


const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, //for jwt cookie
});

//error message export
export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong';

export default api;
