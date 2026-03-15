import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const hmacSecret = process.env.NEXT_PUBLIC_HMAC_SECRET_KEY;
    console.log({hmacSecret});
    
    // Only sign if the secret is available
    if (hmacSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      
      // Axios request data might be undefined, stringified, or an object
      let bodyStr = '';
      if (config.data) {
        bodyStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      }
      
      const payloadToSign = `${timestamp}.${bodyStr}`;
      const signature = CryptoJS.HmacSHA256(payloadToSign, hmacSecret).toString(CryptoJS.enc.Hex);
      
      config.headers['X-Timestamp'] = timestamp;
      config.headers['X-Signature'] = signature;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
