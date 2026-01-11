function handleLogout() {
  console.log('退出登录按钮被点击');  // 1. 打印日志
  logout();                            // 2. 清除登录状态（清空 user store 和 localStorage）
  showDropdown.value = false;          // 3. 关闭下拉菜单
  router.push('/');                    // 4. 跳转到首页
}<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const { isLoggedIn, user, logout } = useUserStore();
const showDropdown = ref(false);

const features = [
  {
    icon: '🤖',
    title: 'AI 智能解析',
    desc: '每道题都有 AI 提供的详细解析和解题思路'
  },
  {
    icon: '📚',
    title: '海量题库',
    desc: '覆盖各学科领域，实时更新最新真题'
  },
  {
    icon: '📊',
    title: '智能记录',
    desc: '自动记录学习进度，精准分析薄弱环节'
  },
  {
    icon: '🎯',
    title: '个性化推荐',
    desc: '根据学习情况智能推荐练习题目'
  }
];

const hotTopics = [
  { id: 16, name: '数据结构', count: 10, difficulty: '中等' },
  { id: 1, name: 'Java基础', count: 5, difficulty: '入门' },
  { id: 2, name: 'Python基础', count: 3, difficulty: '入门' },
  { id: 3, name: '数据库', count: 3, difficulty: '中等' },
  { id: 4, name: 'Web开发', count: 3, difficulty: '中等' },
  { id: 5, name: '操作系统', count: 2, difficulty: '困难' },
  { id: 17, name: '计算机网络', count: 8, difficulty: '进阶' }
];

const stats = [
  { label: '总题库数量', value: '10,000+' },
  { label: '活跃用户', value: '50,000+' },
  { label: 'AI 解析次数', value: '100万+' },
  { label: '平均正确率', value: '85%' }
];

function goToTopic(id: number) {
  router.push({ path: '/practice', query: { categoryId: id.toString() } });
}

function goToPractice() {
  router.push('/practice');
}

function handleLogout() {
  console.log('退出登录按钮被点击');
  logout();
  showDropdown.value = false;
  router.push('/');
}

function toggleDropdown() {
  console.log('切换下拉菜单:', !showDropdown.value);
  showDropdown.value = !showDropdown.value;
}

function goToProfile() {
  console.log('跳转到个人中心');
  showDropdown.value = false;
  router.push('/profile');
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-avatar-dropdown')) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="home">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🧠</span>
        <span class="logo-text">AI 刷题平台</span>
      </div>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/topics">题库</router-link>
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

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>AI 驱动的智能刷题平台</h1>
        <p>结合人工智能技术，为您提供个性化、智能化的学习体验</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="goToPractice">开始刷题</button>
          <button class="btn-secondary" @click="router.push('/topics')">浏览题库</button>
        </div>
      </div>
      <div class="hero-image">
        <div class="ai-badge">
          <span>🤖</span>
          <p>AI 智能分析中...</p>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features">
      <h2>平台特色</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 热门题库 -->
    <section class="hot-topics">
      <h2>热门题库</h2>
      <div class="topics-grid">
        <div
          v-for="topic in hotTopics"
          :key="topic.id"
          class="topic-card"
          @click="goToTopic(topic.id)"
        >
          <div class="topic-icon">📖</div>
          <div class="topic-info">
            <h3>{{ topic.name }}</h3>
            <p>{{ topic.count }} 道题目</p>
            <span :class="['difficulty', topic.difficulty]">{{ topic.difficulty }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- AI 解析示例 -->
    <section class="ai-demo">
      <h2>AI 智能解析</h2>
      <div class="demo-card">
        <div class="question">
          <span class="question-label">题目</span>
          <p>给定一个二叉树，找出其最大深度。</p>
        </div>
        <div class="answer">
          <span class="answer-label">AI 解析</span>
          <div class="ai-content">
            <p>这道题可以使用递归或迭代两种方法解决。</p>
            <p><strong>思路：</strong>最大深度等于根节点左右子树深度的最大值加一。</p>
            <p><strong>时间复杂度：</strong>O(n)，需要遍历每个节点</p>
            <div class="code-example">
              <pre>def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-icon">🧠</span>
          <span>AI 刷题平台</span>
        </div>
        <p>让学习更智能，让刷题更高效</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: opacity 0.3s;
}

.nav a:hover {
  opacity: 0.8;
}

.user-actions {
  display: flex;
  gap: 15px;
  position: relative;
  z-index: 20;
}

.user-actions .btn-login,
.user-actions .btn-register {
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-actions .btn-login {
  border: 1px solid #4CAF50;
  color: #4CAF50;
}

.user-actions .btn-login:hover {
  background: #4CAF50;
  color: white;
}

.user-actions .btn-register {
  background: #4CAF50;
  color: white;
}

.user-actions .btn-register:hover {
  background: #45a049;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: #e8e8e8;
}

.avatar-icon {
  font-size: 24px;
}

.username {
  font-weight: 500;
  color: #333;
}

.user-avatar-dropdown {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: #e8e8e8;
}

.avatar-icon {
  font-size: 24px;
}

.username {
  font-weight: 500;
  color: #333;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownFade 0.2s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item:first-child {
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-icon {
  font-size: 16px;
}

.btn-login, .btn-register {
  padding: 10px 24px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  color: white;
  border: 2px solid white;
}

.btn-register {
  background: white;
  color: #667eea;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  flex: 1;
  color: white;
}

.hero h1 {
  font-size: 56px;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.btn-primary, .btn-secondary {
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.ai-badge {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: white;
}

.ai-badge span {
  font-size: 80px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  padding: 60px 40px;
  background: rgba(255,255,255,0.1);
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-value {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

.features, .hot-topics, .ai-demo {
  padding: 80px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.features h2, .hot-topics h2, .ai-demo h2 {
  text-align: center;
  color: white;
  font-size: 36px;
  margin-bottom: 50px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  color: white;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 50px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.feature-card p {
  font-size: 14px;
  opacity: 0.9;
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
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.topic-icon {
  font-size: 40px;
}

.topic-info h3 {
  color: #333;
  font-size: 18px;
  margin-bottom: 5px;
}

.topic-info p {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.difficulty {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty.入门 {
  background: #e8f5e9;
  color: #4CAF50;
}

.difficulty.中等 {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty.困难 {
  background: #ffebee;
  color: #f44336;
}

.difficulty.进阶 {
  background: #e3f2fd;
  color: #2196F3;
}

.demo-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.question, .answer {
  padding: 30px;
}

.question {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.question-label, .answer-label {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
}

.question-label {
  background: #667eea;
  color: white;
}

.answer-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.question p {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
}

.ai-content p {
  margin-bottom: 15px;
  color: #555;
  line-height: 1.8;
}

.code-example {
  background: #282c34;
  border-radius: 10px;
  padding: 20px;
  margin-top: 15px;
  overflow-x: auto;
}

.code-example pre {
  color: #abb2bf;
  margin: 0;
  font-family: 'Consolas', monospace;
  font-size: 14px;
}

.footer {
  background: rgba(0,0,0,0.2);
  padding: 40px;
  text-align: center;
  color: white;
}

.footer-brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  margin-bottom: 10px;
}

.footer p {
  opacity: 0.8;
}
</style>
