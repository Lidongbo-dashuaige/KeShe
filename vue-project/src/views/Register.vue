<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, type RegisterForm } from '../api/user';

const router = useRouter();
const form = ref<RegisterForm>({ username: '', password: '', email: '' });
const loading = ref(false);
const error = ref('');

async function handleRegister() {
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const res = await userApi.register(form.value);
    if (res.success && res.data) {
      router.push('/login');
    } else {
      error.value = res.errorMsg || '注册失败';
    }
  } catch (e) {
    error.value = '网络错误，请检查后端服务是否启动';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" />
        </div>
        <div class="form-group">
          <label>邮箱（可选）</label>
          <input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <p class="link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}
input:focus {
  outline: none;
  border-color: #4CAF50;
}
button {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
button:hover {
  background: #45a049;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.error {
  color: #f44336;
  margin-bottom: 15px;
  text-align: center;
}
.link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
.link a {
  color: #4CAF50;
}
</style>
