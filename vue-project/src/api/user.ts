export interface Result<T = any> {
  success: boolean;
  errorMsg?: string;
  data?: T;
  total?: number;
}

const API_BASE = 'http://localhost:8080/api';

export const userApi = {
  async login(form: LoginForm): Promise<Result<User>> {
    const res = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.json();
  },

  async register(form: RegisterForm): Promise<Result<User>> {
    const res = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.json();
  }
};
