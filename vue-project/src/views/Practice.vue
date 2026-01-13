<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getQuestionsByCategory } from '../api/questionApi';
import { RouterLink } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { isLoggedIn, user, logout } = useUserStore();
const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const showAnswer = ref(false);
const answers = ref<number[]>([]);
const timeSpent = ref(0);
const isComplete = ref(false);
const isLoading = ref(false);
const error = ref('');
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

// 获取URL参数中的分类ID
const categoryId = computed(() => {
  return parseInt(route.query.categoryId as string) || 1;
});

const topicName = ref('题库');

// 定义题目数据类型
interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  type: string;
  difficulty: string;
  question: string;
  options: Option[];
  correctAnswer: number;
  explanation: string;
  aiHint: string;
}

const questions = ref<Question[]>([]);

// 从后端API获取题目数据
async function fetchQuestions() {
    isLoading.value = true;
    error.value = '';
    try {
      console.log('开始获取题目数据，分类ID:', categoryId.value);
      const response: any = await getQuestionsByCategory(categoryId.value);
      console.log('API响应:', response);
      
      // 确保response存在
      if (!response) {
        error.value = '获取题目数据失败：服务器未返回数据';
        questions.value = [];
        return;
      }
      
      // 获取实际的响应数据
      const responseData = response.data || {};
      
      // 根据API返回格式提取题目数据
      let questionsData = [];
      if (responseData) {
        if (Array.isArray(responseData)) {
          // 直接返回题目数组
          questionsData = responseData;
        } else if (Array.isArray(responseData.questions)) {
          // 返回格式为 { questions: [...] }
          questionsData = responseData.questions;
          topicName.value = responseData.categoryName || '题库';
        } else if (responseData.success === true && responseData.data && Array.isArray(responseData.data.questions)) {
          // 返回格式为 { success: true, data: { questions: [...] } }
          questionsData = responseData.data.questions;
          topicName.value = responseData.data.categoryName || '题库';
        } else if (responseData.success === false) {
          // API返回错误
          error.value = responseData.message || '获取题目数据失败';
          questions.value = [];
          return;
        }
      }
      
      console.log('提取的题目数据:', questionsData);
      
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        const apiQuestions = questionsData.map((q: any) => {
          // 确保q是一个对象
          if (!q || typeof q !== 'object') {
            return {
              id: 0,
              type: 'single',
              difficulty: '中等',
              question: '题目数据异常',
              options: Array(4).fill(0).map((_, index: number) => ({
                id: index,
                text: `选项 ${String.fromCharCode(65 + index)}`
              })),
              correctAnswer: 0,
              explanation: '暂无解析',
              aiHint: '暂无提示'
            };
          }
          
          return {
            id: q.id || 0,
            type: q.type === 1 ? 'single' : 'multiple', // 1=单选题，2=多选题
            difficulty: q.difficulty ? ['入门', '中等', '困难', '进阶'][q.difficulty - 1] || '中等' : '中等',
            question: q.title || '',
            // 处理选项，确保options字段存在
            options: Array.isArray(q.options) ? q.options.map((opt: any, index: number) => ({
              id: index,
              text: opt.content || opt.text || '' // 兼容content和text字段
            })) : Array(4).fill(0).map((_, index: number) => ({
              id: index,
              text: `选项 ${String.fromCharCode(65 + index)}`
            })),
            correctAnswer: q.correctAnswer ?? 0, // 确保有默认值
            explanation: q.explanation || '暂无解析',
            aiHint: q.aiHint || '暂无提示'
          };
        });
        
        console.log('处理后的题目数据:', apiQuestions);
        questions.value = apiQuestions;
        
        // 如果没有题目，显示错误信息
        const questionsLength = (questions.value || []).length;
        if (questionsLength === 0) {
          error.value = '该分类下暂无题目';
        }
      } else {
        // 如果questionsData不是数组或为空，显示错误信息
        error.value = '获取题目数据失败：数据格式不正确或无题目';
        questions.value = [];
      }
    } catch (err: any) {
      console.error('获取题目数据失败:', err);
      error.value = '获取题目数据失败，请稍后重试';
      questions.value = [];
    } finally {
      isLoading.value = false;
    }
  }

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);
const progress = computed(() => (questions.value || []).length > 0 ? ((currentQuestionIndex.value + 1) / (questions.value || []).length) * 100 : 0);
const correctCount = computed(() => {
  // 安全计算正确答案数量
  return answers.value.filter((a, i) => {
    const question = questions.value[i];
    return question && a === question.correctAnswer;
  }).length;
});

function selectAnswer(index: number) {
  if (showAnswer.value || isLoading.value) return;
  selectedAnswer.value = index;
}

function submitAnswer() {
  if (selectedAnswer.value === null || isLoading.value) return;
  
  if (answers.value.length > currentQuestionIndex.value) {
    answers.value[currentQuestionIndex.value] = selectedAnswer.value;
  } else {
    answers.value.push(selectedAnswer.value);
  }
  
  showAnswer.value = true;
}

function nextQuestion() {
  const questionsLength = (questions.value || []).length;
  if (questionsLength > 0 && currentQuestionIndex.value < questionsLength - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = answers.value[currentQuestionIndex.value] ?? null;
    showAnswer.value = selectedAnswer.value !== null;
  } else {
    isComplete.value = questionsLength > 0;
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = answers.value[currentQuestionIndex.value] ?? null;
    showAnswer.value = selectedAnswer.value !== null;
  }
}

function getOptionClass(index: number) {
  // 添加防御性检查
  const question = currentQuestion.value;
  if (!question) return '';
  
  if (!showAnswer.value) {
    return selectedAnswer.value === index ? 'selected' : '';
  }
  if (question.correctAnswer !== undefined && index === question.correctAnswer) return 'correct';
  if (selectedAnswer.value !== null && index === selectedAnswer.value && question.correctAnswer !== undefined && selectedAnswer.value !== question.correctAnswer) return 'wrong';
  return '';
}

function restart() {
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  showAnswer.value = false;
  answers.value = [];
  timeSpent.value = 0;
  isComplete.value = false;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 当分类ID变化时重新获取题目
watch(categoryId, () => {
  fetchQuestions();
  restart();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchQuestions();
  
  // 启动计时器
  const timer = setInterval(() => {
    if (!isComplete.value && !isLoading.value) {
      timeSpent.value++;
    }
  }, 1000);
  
  // 组件卸载时清理计时器
  return () => clearInterval(timer);
});
</script>

<template>
  <div class="practice-page">
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
        <router-link to="/practice" class="active">刷题</router-link>
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
        <p>登录后即可开始刷题，保存学习进度</p>
        <div class="prompt-actions">
          <router-link to="/login" class="btn-login-primary">立即登录</router-link>
          <router-link to="/register" class="btn-register-secondary">注册账号</router-link>
        </div>
      </div>
    </div>

    <!-- 已登录用户看到的内容 -->
    <template v-else>
      <!-- 刷题完成页面 -->
      <div v-if="isComplete" class="result-page">
        <div class="result-card">
          <div class="result-icon">🎉</div>
          <h1>刷题完成！</h1>
          <div class="score-display">
            <div class="score-circle">
            <span class="score">{{ (questions || []).length > 0 ? Math.round((correctCount / (questions || []).length) * 100) : 0 }}%</span>
            <span class="label">正确率</span>
          </div>
          </div>
          <div class="result-stats">
            <div class="stat">
              <span class="value">{{ correctCount }}</span>
              <span class="label">正确题数</span>
            </div>
            <div class="stat">
              <span class="value">{{ (questions || []).length - correctCount }}</span>
              <span class="label">错误题数</span>
            </div>
            <div class="stat">
              <span class="value">{{ formatTime(timeSpent) }}</span>
              <span class="label">用时</span>
            </div>
          </div>
          <div class="result-actions">
            <button class="btn-primary" @click="restart">重新刷题</button>
            <router-link to="/topics" class="btn-secondary">选择其他题库</router-link>
          </div>
        </div>
      </div>

      <!-- 刷题主界面 -->
      <div v-else class="practice-content">
        <!-- 左侧边栏 -->
        <aside class="sidebar">
          <div class="topic-info">
            <h3>{{ topicName }}</h3>
            <span class="question-count">题目 {{ currentQuestionIndex + 1 }}/{{ (questions || []).length }}</span>
          </div>
          
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(progress) }}% 完成</span>
          </div>

          <div class="timer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">{{ formatTime(timeSpent) }}</span>
          </div>

          <div class="question-navigator">
            <h4>题目列表</h4>
            <div class="navigator-grid">
              <button
                v-for="(q, index) in (questions || [])"
                :key="q.id || index"
                :class="['nav-btn', {
                  'current': index === currentQuestionIndex,
                  'answered': answers[index] !== undefined,
                  'correct': showAnswer && answers[index] !== undefined && q?.correctAnswer !== undefined && answers[index] === q?.correctAnswer,
                  'wrong': showAnswer && answers[index] !== undefined && q?.correctAnswer !== undefined && answers[index] !== q?.correctAnswer
                }]"
                @click="currentQuestionIndex = index"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>
        </aside>

        <!-- 题目区域 -->
        <main class="main-content">
          <div class="question-card">
            <div v-if="currentQuestion" class="question-content">
              <div class="question-header">
                <span :class="['difficulty-badge', currentQuestion?.difficulty]">{{ currentQuestion?.difficulty }}</span>
                <span class="question-type">{{ currentQuestion?.type === 'single' ? '单选题' : '多选题' }}</span>
              </div>
                
              <div class="question-body">
                <p class="question-text">{{ currentQuestion?.question }}</p>
              </div>

              <div class="options">
                <button
                  v-for="(option, index) in (currentQuestion?.options || [])"
                  :key="index"
                  :class="['option-btn', getOptionClass(index)]"
                  @click="selectAnswer(index)"
                  :disabled="showAnswer"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                  <span class="option-text">{{ option.text }}</span>
                  <span v-if="showAnswer && currentQuestion && index === currentQuestion?.correctAnswer" class="option-mark">✓</span>
                  <span v-if="showAnswer && selectedAnswer !== null && index === selectedAnswer && currentQuestion && selectedAnswer !== currentQuestion?.correctAnswer" class="option-mark">✗</span>
                </button>
              </div>

              <!-- AI 解析 -->
              <div v-if="showAnswer && currentQuestion" class="analysis-section">
                <div class="ai-hint">
                  <span class="ai-icon">🤖</span>
                  <div class="ai-content">
                    <h4>AI 提示</h4>
                    <p>{{ currentQuestion?.aiHint }}</p>
                  </div>
                </div>
                <div class="explanation">
                  <h4>答案解析</h4>
                  <p><strong>正确答案：</strong>{{ currentQuestion?.correctAnswer !== undefined ? String.fromCharCode(65 + currentQuestion?.correctAnswer) : '暂无' }}. {{ currentQuestion?.options?.[currentQuestion?.correctAnswer]?.text || '暂无' }}</p>
                  <p>{{ currentQuestion?.explanation }}</p>
                </div>
              </div>
            </div>
            <div v-else-if="isLoading" class="loading">
              <div class="loading-spinner">加载中...</div>
            </div>
            <div v-else class="no-data">
              <div class="no-data-icon">📭</div>
              <p>暂无题目数据</p>
            </div>

            <div class="question-actions">
              <button
                class="btn-prev"
                @click="prevQuestion"
                :disabled="currentQuestionIndex === 0"
              >
                上一题
              </button>
              
              <button 
                v-if="!showAnswer" 
                class="btn-submit" 
                @click="submitAnswer"
                :disabled="selectedAnswer === null"
              >
                提交答案
              </button>
              
              <button 
                v-else 
                class="btn-next" 
                @click="nextQuestion"
              >
                {{ currentQuestionIndex < (questions || []).length - 1 ? '下一题' : '查看结果' }}
              </button>
            </div>
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<style scoped>
.practice-page {
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
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
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

.practice-content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 280px;
  background: white;
  padding: 25px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}

.topic-info {
  margin-bottom: 25px;
}

.topic-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.question-count {
  color: #667eea;
  font-weight: 600;
}

.progress-info {
  margin-bottom: 25px;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #666;
}

.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  margin-bottom: 25px;
}

.timer-icon {
  font-size: 24px;
}

.timer-text {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Consolas', monospace;
}

.question-navigator h4 {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.navigator-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.nav-btn.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.nav-btn.answered {
  background: #e3f2fd;
  border-color: #2196F3;
  color: #2196F3;
}

.nav-btn.correct {
  background: #e8f5e9;
  border-color: #4CAF50;
  color: #4CAF50;
}

.nav-btn.wrong {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.main-content {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
}

.question-card {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.difficulty-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.difficulty-badge.入门 {
  background: #e8f5e9;
  color: #4CAF50;
}

.difficulty-badge.中等 {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty-badge.困难 {
  background: #ffebee;
  color: #f44336;
}

.difficulty-badge.进阶 {
  background: #e3f2fd;
  color: #2196F3;
}

.question-type {
  color: #999;
  font-size: 14px;
}

.question-text {
  font-size: 20px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.option-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102,126,234,0.05);
}

.option-btn.selected {
  border-color: #667eea;
  background: rgba(102,126,234,0.1);
}

.option-btn.correct {
  border-color: #4CAF50;
  background: rgba(76,175,80,0.1);
}

.option-btn.wrong {
  border-color: #f44336;
  background: rgba(244,67,54,0.1);
}

.option-btn:disabled {
  cursor: default;
}

.option-letter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  font-weight: 600;
  color: #666;
}

.option-btn.selected .option-letter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-btn.correct .option-letter {
  background: #4CAF50;
  color: white;
}

.option-btn.wrong .option-letter {
  background: #f44336;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.option-mark {
  font-size: 20px;
  font-weight: bold;
}

.option-btn.correct .option-mark {
  color: #4CAF50;
}

.option-btn.wrong .option-mark {
  color: #f44336;
}

.analysis-section {
  margin-bottom: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
}

.ai-hint {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.ai-icon {
  font-size: 30px;
}

.ai-content h4, .explanation h4 {
  font-size: 16px;
  color: #667eea;
  margin-bottom: 10px;
}

.ai-content p, .explanation p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 10px;
}

.explanation {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.question-actions {
  display: flex;
  justify-content: space-between;
}

.btn-prev, .btn-next, .btn-submit {
  padding: 14px 40px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-prev {
  background: #f5f7fa;
  color: #666;
}

.btn-prev:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-prev:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 结果页面 */
.result-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.result-card {
  background: white;
  padding: 60px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  max-width: 500px;
}

.result-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.result-card h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 40px;
}

.score-display {
  margin-bottom: 40px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.score {
  font-size: 42px;
  font-weight: bold;
  color: white;
}

.label {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
}

.result-stats .stat {
  text-align: center;
}

.result-stats .value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

.result-stats .label {
  font-size: 14px;
  color: #999;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-primary, .btn-secondary {
  padding: 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-secondary {
  background: #f5f7fa;
  color: #666;
}
</style>
