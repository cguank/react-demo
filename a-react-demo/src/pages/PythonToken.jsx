import React from 'react';
import axios from 'axios';
import { httpclient, setAccessToken} from'../httpclient'

const baseurl = 'http://127.0.0.1:8000';
let at = ''
// const httpclient = axios.create({
//   baseURL: baseurl,
//   withCredentials:true
// })
// httpclient.interceptors.request.use((request) => {
//   request.headers.set('Authorization', `Bearer ${at}`)
//   return request
// })
// httpclient.interceptors.response.use((r) => r, async (response) => {
//   if (response.status === 401) {
//     const refreshres = await httpclient.post('/auth/refresh')
//     at=refreshres.data.access_token
//   }
//   return {
//     data: response,
//     code:response.status
//   }
// })
export function PythonToken (params) {
  const login = async () => {
    const form = new FormData();
    form.append('username', 'user@example.com');
    form.append('password', 'stringst');
    const res = await httpclient.post('/auth/login', form);
    setAccessToken(res.access_token);
    console.log(res);
  };
  const handleMe = async () => {
    try {
      const res = await httpclient.get('/auth/me');
      console.log('=====handleMe',res);
      
    } catch (error) {
      console.log(error);
            
    }
    
  }
  const handleRefresh = async () => {
    try {
      const res = await httpclient.post('/auth/refresh');
      console.log('=====handleMrefesh',res);
      
    } catch (error) {
      console.log(error);
            
    }
    
  }
  return (
    <>
      <div onClick={login}>login</div>
      <div onClick={handleMe}>me</div>
      <div onClick={handleRefresh}>refresh</div>
    </>
  );
}
