import axios from 'axios';
import CryptoJS from 'crypto-js';

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 300000; // 5 minutes

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = cache.get(cacheKey);

      if (cached && cached.expiry > Date.now()) {
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          });
      }
    }

    const hmacSecret = process.env.NEXT_PUBLIC_HMAC_SECRET_KEY;

    if (hmacSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();

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
  (response) => {
    // Store in cache for GET requests
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      cache.set(cacheKey, {
        data: response.data,
        expiry: Date.now() + CACHE_TTL,
      });
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
