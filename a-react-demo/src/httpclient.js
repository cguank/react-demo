import axios from 'axios';

const service = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 15000,
  withCredentials: true, // 必须开！让浏览器自动带 Cookie(RT)
});

// ====================
// 1. Access Token 存在内存（最安全）
// ====================
let accessToken = '';

export const setAccessToken = token => {
  accessToken = token;
};

// ====================
// 2. 刷新锁 + 队列
// ====================
let isRefreshing = false;
let requestQueue = [];

// ====================
// 3. 刷新接口（RT 自动在 Cookie 里，不用传！）
// ====================
const refreshToken = () => {
  return service.post(
    '/auth/refresh',
    {},
    {
      _retry: true, // 标记是刷新请求，避免死循环
    }
  );
};

// ====================
// 4. 请求拦截器
// ====================
service.interceptors.request.use(
  config => {
    console.log('====request interceptors',accessToken,config._retry);
    
    // 正常接口带上 AT
    if (accessToken && !config._retry) {
      console.log('=====at', accessToken);
      
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ====================
// 5. 响应拦截器（核心无感刷新）
// ====================
service.interceptors.response.use(
  response => response.data,
  error => {
    const originalReq = error.config;

    // 防止刷新接口也 401 导致死循环
    if (originalReq._retry) {
      // 刷新失败 → 跳登录
      accessToken = '';
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 401 = AT 过期
    if (error.response?.status === 401) {
      originalReq._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        // 开始刷新（RT 自动在 Cookie 里）
        return refreshToken()
          .then(res => {
            console.log('=====refresh start',res.access_token);
            
            const newAT = res.access_token;
            accessToken = newAT;

            // 重试队列
            requestQueue.forEach(cb => cb(newAT));
            requestQueue = [];

            // 重试当前请求
            console.log('=====retry', originalReq);
            originalReq._retry = false;
            return service(originalReq);
          })
          .catch((err) => {
            console.log('=====catch',err);
            
            accessToken = '';
            window.location.href = '/login';
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // 正在刷新 → 进入队列
      return new Promise(resolve => {
        requestQueue.push(newToken => {
          originalReq.headers.Authorization = `Bearer ${newToken}`;
          resolve(service(originalReq));
        });
      });
    }

    return Promise.reject(error);
  }
);
export const httpclient = service
