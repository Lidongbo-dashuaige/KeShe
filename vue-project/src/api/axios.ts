import axios from 'axios';

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端API基础URL
  timeout: 10000, // 请求超时时间
});

// TODO后端做处理即可
// 请求拦截器
// service.interceptors.request.use(
//   (config) => {
//     // 可以在这里添加token等认证信息
//     return config;
//   },
//   (error) => {
//     console.error('请求错误:', error);
//     return Promise.reject(error);
//   }
// );

// // 响应拦截器
// service.interceptors.response.use(
//   (response) => {
//     // 返回完整响应，让调用方自行处理数据结构
//     return response;
//   },
//   (error) => {
//     console.error('响应错误:', error);
//     return Promise.reject(error);
//   }
// );

export default service;