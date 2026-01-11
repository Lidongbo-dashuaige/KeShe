<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '../stores/user';
import { aiApi } from '../api/ai'

const router = useRouter();
const { isLoggedIn, user, logout } = useUserStore();
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

const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是 AI 学习助手，可以帮助你解答学习问题、提供解题思路、分析错题原因等。有什么我可以帮你的吗？'
  }
]);

const userInput = ref('');
const isLoading = ref(false);
const selectedTemplate = ref('');

// 添加点击外部关闭下拉菜单的功能
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-avatar-dropdown')) {
    showDropdown.value = false;
  }
}

// 生命周期钩子：组件挂载后添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 生命周期钩子：组件卸载前移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

//TODO 快捷方式无效
const quickQuestions = [
  { icon: '📝', text: '帮我解释这道题' },
  { icon: '💡', text: '提供解题思路' },
  { icon: '🔍', text: '分析错误原因' },
  { icon: '📚', text: '推荐相关知识点' },
  { icon: '✅', text: '验证我的答案' },
  { icon: '🎯', text: '制定学习计划' }
];

//TODO 模板无效
const templates = [
  {
    id: 'explain',
    title: '题目解析',
    placeholder: '请粘贴题目内容，我会帮你详细分析...',
    example: '给定一个数组 [1,2,3,4,5]，找出所有子数组的和的最大值。'
  },
  {
    id: 'wrong',
    title: '错题分析',
    placeholder: '请描述你的错题或错误答案，我会帮你分析原因...',
    example: '我在一道二叉树的题目上总是出错，不知道如何选择遍历方式。'
  },
  {
    id: 'knowledge',
    title: '知识咨询',
    placeholder: '有什么知识点想深入了解？',
    example: '请帮我解释动态规划的核心思想，以及常见的应用场景。'
  },
  {
    id: 'plan',
    title: '学习计划',
    placeholder: '告诉我你的学习目标和当前水平，我来帮你制定计划...',
    example: '我想在一个月内掌握数据结构与算法，需要准备面试。'
  }
];

function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return;

  messages.value.push({
    role: 'user',
    content: userInput.value
  });

  isLoading.value = true;

  // 创建10秒超时的Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时，请稍后重试'));
    }, 10000);
  });

  // 使用Promise.race实现超时检测
  Promise.race([
    aiApi.getAiResponse({
      memoryId: selectedTemplate.value,
      userMessage: userInput.value,
    }),
    timeoutPromise
  ])
    .then((response) => {
      messages.value.push({
        role: 'assistant',
        content: response as unknown as string
      });
    })
    .catch((error) => {
      console.error('获取AI响应失败:', error);
      messages.value.push({
        role: 'assistant',
        content: error.message || '抱歉，获取AI响应失败，请稍后重试。'
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
  userInput.value = '';
  selectedTemplate.value = '';
}

function useTemplate(template: { id: string, title: string, placeholder: string, example: string }) {
  selectedTemplate.value = template.id;
  userInput.value = '';
}

function clearChat() {
  messages.value = [{
    role: 'assistant',
    content: '对话已清空。有什么新的问题想问吗？'
  }];
}
</script>

<template>
  <div class="ai-assistant-page">
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
        <router-link to="/topics">题库</router-link>
        <router-link to="/practice">刷题</router-link>
        <router-link to="/ai-assistant" class="active">AI 助手</router-link>
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
              <span class="dropdown-icon">🚪</span>退出登录
            </div>
            <div class="dropdown-item" @click.stop="goToProfile">
              <span class="dropdown-icon">👤</span>个人中心
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="main-container">
      <!-- 左侧功能区 -->
      <aside class="sidebar">
        <div class="features-section">
          <h3>快捷功能</h3>
          <div class="quick-actions">
            <button v-for="q in quickQuestions" :key="q.text" class="quick-btn">
              <span class="quick-icon">{{ q.icon }}</span>
              <span>{{ q.text }}</span>
            </button>
          </div>
        </div>

        <div class="templates-section">
          <h3>对话模板</h3>
          <div class="templates-list">
            <button v-for="template in templates" :key="template.id"
              :class="['template-btn', { active: selectedTemplate === template.id }]" @click="useTemplate(template)">
              <span class="template-title">{{ template.title }}</span>
              <span class="template-desc">{{ template.placeholder.split('，')[0] }}</span>
            </button>
          </div>
        </div>

        <div class="tips-section">
          <h3>使用提示</h3>
          <div class="tip-item">
            <span class="tip-icon">💬</span>
            <p>描述越详细，回答越准确</p>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📋</span>
            <p>可以粘贴题目代码和错误信息</p>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔄</span>
            <p>追问可以获取更深入的解释</p>
          </div>
        </div>
      </aside>

      <!-- 聊天区域 -->
      <main class="chat-area">
        <div class="chat-header">
          <h2>AI 学习助手</h2>
          <button class="clear-btn" @click="clearChat">清空对话</button>
        </div>

        <div class="messages-container">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
            <div class="message-avatar">
              {{ msg.role === 'assistant' ? '🤖' : '👤' }}
            </div>
            <div class="message-content">
              <div class="message-text" v-html="msg.content.replace(/\n/g, '<br>')"></div>
            </div>
          </div>

          <div v-if="isLoading" class="message assistant loading">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrapper">
            <textarea v-model="userInput" placeholder="输入您的问题..." rows="3"
              @keydown.enter.exact.prevent="sendMessage"></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim() || isLoading">
              <span>发送</span>
              <span class="send-icon">➤</span>
            </button>
          </div>
          <p class="input-hint">按 Enter 发送，Shift + Enter 换行</p>
        </div>
      </main>

      <!-- 右侧推荐区 -->
      <aside class="recommend-sidebar">
        <div class="recommend-section">
          <h3>推荐题库</h3>
          <div class="recommend-list">
            <div class="recommend-item">
              <span class="rec-icon">📊</span>
              <div class="rec-info">
                <h4>数据结构与算法</h4>
                <p>1256 题 · 中等难度</p>
              </div>
            </div>
            <div class="recommend-item">
              <span class="rec-icon">🤖</span>
              <div class="rec-info">
                <h4>机器学习基础</h4>
                <p>892 题 · 入门难度</p>
              </div>
            </div>
            <div class="recommend-item">
              <span class="rec-icon">🐍</span>
              <div class="rec-info">
                <h4>Python 编程</h4>
                <p>2341 题 · 入门难度</p>
              </div>
            </div>
          </div>
          <router-link to="/topics" class="more-link">查看更多 →</router-link>
        </div>

        <div class="stats-section">
          <h3>本周学习</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">156</span>
              <span class="stat-label">刷题数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">85%</span>
              <span class="stat-label">正确率</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">3.5h</span>
              <span class="stat-label">学习时长</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
}

.nav a:hover,
.nav a.active {
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.user-actions {
  display: flex;
  gap: 15px;
}

.btn-login,
.btn-register {
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

.main-container {
  display: flex;
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px;
  gap: 30px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.features-section,
.templates-section,
.tips-section,
.recommend-section,
.stats-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

.features-section h3,
.templates-section h3,
.tips-section h3,
.recommend-section h3,
.stats-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: #f5f7fa;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  text-align: left;
}

.quick-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.quick-icon {
  font-size: 18px;
}

.templates-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-btn {
  padding: 15px;
  background: #f5f7fa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s;
}

.template-btn:hover,
.template-btn.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.template-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.template-desc {
  font-size: 12px;
  color: #999;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 20px;
}

.tip-item p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.chat-area {
  flex: 1;
  background: white;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.chat-header h2 {
  font-size: 20px;
  color: #333;
}

.clear-btn {
  padding: 8px 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.messages-container {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.message {
  display: flex;
  gap: 15px;
  max-width: 85%;
}

.message.user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message.user .message-avatar {
  background: #e0e0e0;
}

.message-content {
  flex: 1;
}

.message-text {
  padding: 18px 22px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.message.assistant .message-text {
  background: #f5f7fa;
  color: #333;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 20px;
}

.typing-indicator span {
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.input-area {
  padding: 25px 30px;
  border-top: 1px solid #f0f0f0;
}

.input-wrapper {
  display: flex;
  gap: 15px;
  background: #f5f7fa;
  border-radius: 15px;
  padding: 15px;
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  outline: none;
  font-family: inherit;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  font-size: 14px;
}

.input-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.recommend-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 15px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.rec-icon {
  font-size: 28px;
}

.rec-info h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
}

.rec-info p {
  font-size: 12px;
  color: #999;
}

.more-link {
  display: block;
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 10px;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}
</style>
