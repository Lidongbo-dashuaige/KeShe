<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, type LoginForm } from '../api/user';
import { useUserStore } from '../stores/user';

const router = useRouter();
const { setUser } = useUserStore();
const form = ref<LoginForm>({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  console.log('点击登录按钮');
  
  if (!form.value.username || !form.value.password) {
    console.log('验证失败：用户名或密码为空');
    error.value = '请填写用户名和密码';
    return;
  }

  console.log('开始登录请求');
  loading.value = true;
  error.value = '';

  try {
    const res = await userApi.login(form.value);
    console.log('登录响应:', res);
    if (res.success && res.data) {
      // 从响应中提取 user 和 token
      const userData = res.data.user;
      const token = res.data.token;
      console.log('提取的用户数据:', userData);
      console.log('提取的token:', token);
      setUser(userData, token);
      router.push('/');
    } else {
      error.value = res.errorMsg || '登录失败';
    }
  } catch (e) {
    console.error('登录错误:', e);
    error.value = '网络错误，请检查后端服务是否启动';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="card-header">
        <h2>欢迎回来</h2>
        <p>登录您的账户</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="card-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 104px);
  padding: 40px 20px;
}

.login-card {
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
}

.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.card-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.card-header p {
  color: #999;
  font-size: 15px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input::placeholder {
  color: #bbb;
}

.error-message {
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #f5222d;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  color: #999;
  font-size: 14px;
}

.card-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.card-footer a:hover {
  text-decoration: underline;
}
</style>
