<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getQuestionCategories } from '../api/questionApi';

const router = useRouter();
const { isLoggedIn, user, logout } = useUserStore();
const searchKeyword = ref('');
const selectedCategory = ref('全部');
const selectedDifficulty = ref('全部');
const isLoading = ref(false);
const showDropdown = ref(false);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function handleLogout() {
  logout();
  showDropdown.value = false;
  router.push('/');
}

function goToProfile() {
  showDropdown.value = false;
  router.push('/profile');
}

// 定义分类数据类型
interface Topic {
  id: number;
  name: string;
  description: string;
  questionCount: number;
  difficulty: string;
  category: string;
  icon: string;
  completionRate: number;
  avgScore: number;
}

const topics = ref<Topic[]>([]);
const categories = ref(['全部']);
const difficulties = ['全部', '入门', '中等', '困难', '进阶'];

// 从后端API获取分类数据
async function fetchTopics() {
  isLoading.value = true;
  try {
    const response = await getQuestionCategories();
    if (response) {
      // 获取实际的响应数据
      const responseData = response.data || {};
      
      // 将API返回的分类数据转换为前端需要的格式
      let topicsData;
      if (Array.isArray(responseData)) {
        topicsData = responseData;
      } else if (Array.isArray(responseData.data)) {
        topicsData = responseData.data;
      } else if (responseData.success === true && Array.isArray(responseData.data)) {
        topicsData = responseData.data;
      } else if (responseData.success === false) {
        // API返回错误
        console.error('获取分类数据失败：', responseData.message);
        topics.value = [];
        return;
      }
      
      if (Array.isArray(topicsData)) {
        const apiTopics = topicsData.map((category: any) => ({
          id: category.id,
          name: category.name,
          description: category.description || '暂无描述',
          questionCount: category.questionCount || 0,
          difficulty: category.difficulty ? ['入门', '中等', '困难', '进阶'][category.difficulty - 1] || '中等' : '中等',
          category: category.name,
          icon: ['📊', '🤖', '🧠', '🐍', '🗄️', '💻', '🌐', '⚡'][category.id % 8] || '📊',
          completionRate: Math.floor(Math.random() * 30) + 50, // 模拟完成率
          avgScore: Math.floor(Math.random() * 20) + 70 // 模拟平均分
        }));
        
        topics.value = apiTopics;
        
        // 更新分类筛选选项
        categories.value = ['全部', ...apiTopics.map(topic => topic.name)];
      } else {
        // 如果topicsData不是数组，显示错误信息
        console.error('获取分类数据失败：数据格式不正确');
        topics.value = [];
      }
    } else {
      // 如果response为空，显示错误信息
      console.error('获取分类数据失败：服务器未返回数据');
      topics.value = [];
    }
  } catch (error) {
    console.error('获取分类数据失败:', error);
    topics.value = [];
  } finally {
    isLoading.value = false;
  }
}

// 过滤分类
const filteredTopics = computed(() => {
  return topics.value.filter(topic => {
    const matchKeyword = topic.name.includes(searchKeyword.value) || 
                        topic.description.includes(searchKeyword.value);
    const matchCategory = selectedCategory.value === '全部' || topic.category === selectedCategory.value;
    const matchDifficulty = selectedDifficulty.value === '全部' || topic.difficulty === selectedDifficulty.value;
    return matchKeyword && matchCategory && matchDifficulty;
  });
});

// 跳转到刷题页面
function goToPractice(topicId: number) {
  router.push({ path: '/practice', query: { categoryId: topicId.toString() } });
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTopics();
});
</script>

<template>
  <div class="topics-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo">
        <router-link to="/">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">AI 刷题平台</span>
        </router-link>
      </div>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/topics" class="active">题库</router-link>
        <router-link to="/practice">刷题</router-link>
        <router-link to="/ai-assistant">AI 助手</router-link>
      </nav>
      <div class="user-actions" v-if="!user">
        <router-link to="/login" class="btn-login">登录</router-link>
        <router-link to="/register" class="btn-register">注册</router-link>
      </div>
      <div class="user-actions" v-else>
        <div class="user-avatar-dropdown" @click.stop>
          <div class="user-avatar" @click.stop="toggleDropdown">
            <span class="avatar-icon">{{ user?.avatar || '👤' }}</span>
            <span class="username">{{ user?.username || '用户' }}</span>
          </div>
          <div class="dropdown-menu" v-if="showDropdown" @click.stop>
            <div class="dropdown-item" @click.stop="handleLogout">
              <span class="dropdown-icon">🚪</span>
              退出登录
            </div>
            <div class="dropdown-item" @click.stop="goToProfile">
              <span class="dropdown-icon">👤</span>
              个人中心
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 未登录提示 -->
    <div v-if="!isLoggedIn()" class="login-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">🔐</div>
        <h2>请先登录</h2>
        <p>登录后即可访问题库内容和刷题功能</p>
        <div class="prompt-actions">
          <router-link to="/login" class="btn-login-primary">立即登录</router-link>
          <router-link to="/register" class="btn-register-secondary">注册账号</router-link>
        </div>
      </div>
    </div>

    <!-- 已登录用户看到的内容 -->
    <template v-else>
      <!-- 页面标题 -->
      <section class="page-header">
        <h1>题库中心</h1>
        <p>选择您感兴趣的学科，开始智能刷题之旅</p>
      </section>

      <!-- 搜索和筛选 -->
      <section class="search-section">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索题库名称或描述..."
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-bar">
          <div class="filter-group">
            <label>分类：</label>
            <select v-model="selectedCategory">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>难度：</label>
            <select v-model="selectedDifficulty">
              <option v-for="diff in difficulties" :key="diff" :value="diff">{{ diff }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 题库列表 -->
      <section class="topics-section">
        <div class="topics-grid">
          <div 
            v-for="topic in filteredTopics" 
            :key="topic.id" 
            class="topic-card"
          >
            <div class="topic-header">
              <span class="topic-icon">{{ topic.icon }}</span>
              <span :class="['difficulty-tag', topic.difficulty]">{{ topic.difficulty }}</span>
            </div>
            <h3>{{ topic.name }}</h3>
            <p class="topic-desc">{{ topic.description }}</p>
            <div class="topic-stats">
              <div class="stat">
                <span class="stat-value">{{ topic.questionCount }}</span>
                <span class="stat-label">题目数</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ topic.completionRate }}%</span>
                <span class="stat-label">完成率</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ topic.avgScore }}</span>
                <span class="stat-label">平均分</span>
              </div>
            </div>
            <button class="start-btn" @click="goToPractice(topic.id)">
              开始刷题
            </button>
          </div>
        </div>
        
        <div v-if="filteredTopics.length === 0" class="no-results">
          <span class="no-icon">📭</span>
          <p>没有找到相关的题库</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.topics-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 未登录提示样式 */
.login-prompt {
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
}

.prompt-content {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.prompt-icon {
  font-size: 80px;
  margin-bottom: 30px;
  color: #667eea;
}

.prompt-content h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
}

.prompt-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.prompt-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-login-primary, .btn-register-secondary {
  padding: 14px 36px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-login-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-login-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.4);
}

.btn-register-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-register-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logo a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
  padding: 8px 16px;
  border-radius: 20px;
}

.nav a:hover, .nav a.active {
  color: #667eea;
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
}

.user-actions {
  display: flex;
  gap: 15px;
}

.btn-login, .btn-register {
  padding: 10px 24px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-register {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header {
  text-align: center;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header h1 {
  font-size: 42px;
  margin-bottom: 15px;
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
}

.search-section {
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.filter-bar {
  display: flex;
  gap: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: #666;
  font-weight: 500;
}

.filter-group select {
  padding: 10px 30px 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.topics-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.topic-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.topic-icon {
  font-size: 40px;
}

.difficulty-tag {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.difficulty-tag.入门 {
  background: #e8f5e9;
  color: #4CAF50;
}

.difficulty-tag.中等 {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty-tag.困难 {
  background: #ffebee;
  color: #f44336;
}

.difficulty-tag.进阶 {
  background: #e3f2fd;
  color: #2196F3;
}

.topic-card h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.topic-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-stats {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.start-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 20px rgba(102,126,234,0.4);
}

.no-results {
  text-align: center;
  padding: 60px;
  color: #999;
}

.no-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 20px;
}
</style>
