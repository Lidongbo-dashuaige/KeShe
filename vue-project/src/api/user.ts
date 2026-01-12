import request from './axios';
import type { Result, LoginForm, RegisterForm, User, LoginResponse } from '../types';

export const userApi = {
  async login(form: LoginForm): Promise<Result<LoginResponse>> {
    const res = await request({
      url: '/user/login',
      method: 'post',
      data: form
    });
    return res.data;
  },

  async register(form: RegisterForm): Promise<Result<User>> {
    const res = await request({
      url: '/user/register',
      method: 'post',
      data: form
    });
    return res.data;
  }
};
