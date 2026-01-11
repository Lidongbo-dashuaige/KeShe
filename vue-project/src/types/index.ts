// Topic相关类型
export interface TopicQuery {
  page?: number;
  size?: number;
  name?: string;
}

export interface TopicForm {
  name: string;
  description?: string;
  difficulty?: number;
  questionCount?: number;
}

export interface Topic {
  id: number;
  name: string;
  description?: string;
  difficulty?: number;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// User相关类型
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  email?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Result类型（如果需要）
export interface Result<T = any> {
  success: boolean;
  errorMsg?: string;
  data?: T;
  total?: number;
}
