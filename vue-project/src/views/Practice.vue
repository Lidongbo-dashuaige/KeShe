<script setup lang="ts">
import { ref, computed } from 'vue';

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const showAnswer = ref(false);
const answers = ref<number[]>([]);
const timeSpent = ref(0);
const isComplete = ref(false);

const topicName = '数据结构与算法';

const questions = [
  {
    id: 1,
    type: 'single',
    difficulty: '中等',
    question: '以下哪种数据结构可以实现 O(1) 时间复杂度的插入和删除操作（平均情况）？',
    options: [
      { id: 0, text: '数组（Array）' },
      { id: 1, text: '链表（Linked List）' },
      { id: 2, text: '哈希表（Hash Table）' },
      { id: 3, text: '二叉搜索树（BST）' }
    ],
    correctAnswer: 2,
    explanation: '哈希表在平均情况下支持 O(1) 时间的插入、删除和查找操作。数组的插入和删除需要移动元素，链表虽然插入删除是 O(1) 但查找是 O(n)，二叉搜索树的操作是 O(log n)。',
    aiHint: '这道题考察的是数据结构的时间复杂度特性。哈希表通过哈希函数直接计算存储位置，因此具有优秀的平均时间性能。'
  },
  {
    id: 2,
    type: 'single',
    difficulty: '中等',
    question: '在二叉堆中，插入一个新元素的时间复杂度是？',
    options: [
      { id: 0, text: 'O(1)' },
      { id: 1, text: 'O(log n)' },
      { id: 2, text: 'O(n)' },
      { id: 3, text: 'O(n log n)' }
    ],
    correctAnswer: 1,
    explanation: '二叉堆插入元素时，需要将元素放到末尾，然后进行上浮操作。上浮操作的时间复杂度取决于堆的高度，即 O(log n)。',
    aiHint: '注意二叉堆的结构特性：是完全二叉树，高度为 log n。上浮和下沉操作都需要沿路径进行，因此是 O(log n)。'
  },
  {
    id: 3,
    type: 'single',
    difficulty: '困难',
    question: '给定一个数组 [3, 1, 4, 1, 5, 9, 2, 6]，使用快速排序算法，第一轮排序后的数组状态是？（以第一个元素为基准）',
    options: [
      { id: 0, text: '[1, 1, 2, 3, 4, 5, 6, 9]' },
      { id: 1, text: '[2, 1, 1, 3, 5, 4, 9, 6]' },
      { id: 2, text: '[1, 3, 2, 1, 5, 4, 9, 6]' },
      { id: 3, text: '[1, 1, 2, 3, 4, 5, 6, 9]' }
    ],
    correctAnswer: 1,
    explanation: '基准为 3，从右往左找比 3 小的 2，交换；从左往右找比 3 大的 4，交换；继续移动指针，最后将基准放到正确位置。过程：3,1,4,1,5,9,2,6 → 2,1,4,1,5,9,3,6 → 2,1,3,1,5,9,4,6',
    aiHint: '快速排序的分区过程要仔细模拟。注意指针移动的方向和交换的时机。最终基准会放到正确的位置，左边都比它小，右边都比它大。'
  },
  {
    id: 4,
    type: 'single',
    difficulty: '入门',
    question: '下列关于 BFS（广度优先搜索）的描述，错误的是？',
    options: [
      { id: 0, text: 'BFS 使用队列来实现' },
      { id: 1, text: 'BFS 能找到最短路径（在无权图中）' },
      { id: 2, text: 'BFS 的空间复杂度通常是 O(V)' },
      { id: 3, text: 'BFS 总是比 DFS 效率更高' }
    ],
    correctAnswer: 3,
    explanation: 'BFS 和 DFS 的效率取决于具体场景。对于某些问题（如找最短路径）BFS 更优，而对于其他问题 DFS 可能更快。不能说 BFS 总是比 DFS 效率高。',
    aiHint: '这道题是找错误的描述。要注意各种算法的适用场景，没有绝对的优劣之分，只有在特定问题下的相对优劣。'
  },
  {
    id: 5,
    type: 'single',
    difficulty: '进阶',
    question: '使用动态规划解决最长公共子序列（LCS）问题的时间复杂度和空间复杂度分别是？',
    options: [
      { id: 0, text: 'O(mn) 时间，O(mn) 空间' },
      { id: 1, text: 'O(mn) 时间，O(min(m,n)) 空间' },
      { id: 2, text: 'O(m+n) 时间，O(m+n) 空间' },
      { id: 3, text: 'O(2^n) 时间，O(n) 空间' }
    ],
    correctAnswer: 1,
    explanation: '标准 DP 解法是 O(mn) 时间。如果只需要 LCS 长度，可以用滚动数组优化到 O(min(m,n)) 空间。如果需要回溯路径，则需要 O(mn) 空间。',
    aiHint: '经典 DP 问题。状态转移方程 dp[i][j] = dp[i-1][j-1] + 1 或 max(dp[i-1][j], dp[i][j-1])。空间优化技巧值得掌握。'
  }
];

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.length) * 100);
const correctCount = computed(() => answers.value.filter((a, i) => a === questions[i].correctAnswer).length);

function selectAnswer(index: number) {
  if (showAnswer.value) return;
  selectedAnswer.value = index;
}

function submitAnswer() {
  if (selectedAnswer.value === null) return;
  
  if (answers.value.length > currentQuestionIndex.value) {
    answers.value[currentQuestionIndex.value] = selectedAnswer.value;
  } else {
    answers.value.push(selectedAnswer.value);
  }
  
  showAnswer.value = true;
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = answers.value[currentQuestionIndex.value] ?? null;
    showAnswer.value = selectedAnswer.value !== null;
  } else {
    isComplete.value = true;
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
  if (!showAnswer.value) {
    return selectedAnswer.value === index ? 'selected' : '';
  }
  if (index === currentQuestion.value.correctAnswer) return 'correct';
  if (index === selectedAnswer.value && selectedAnswer.value !== currentQuestion.value.correctAnswer) return 'wrong';
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
      <div class="user-actions">
        <router-link to="/login" class="btn-login">登录</router-link>
        <router-link to="/register" class="btn-register">注册</router-link>
      </div>
    </header>

    <!-- 刷题完成页面 -->
    <div v-if="isComplete" class="result-page">
      <div class="result-card">
        <div class="result-icon">🎉</div>
        <h1>刷题完成！</h1>
        <div class="score-display">
          <div class="score-circle">
            <span class="score">{{ Math.round((correctCount / questions.length) * 100) }}%</span>
            <span class="label">正确率</span>
          </div>
        </div>
        <div class="result-stats">
          <div class="stat">
            <span class="value">{{ correctCount }}</span>
            <span class="label">正确题数</span>
          </div>
          <div class="stat">
            <span class="value">{{ questions.length - correctCount }}</span>
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
          <span class="question-count">题目 {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span>
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
              v-for="(q, index) in questions"
              :key="q.id"
              :class="['nav-btn', {
                'current': index === currentQuestionIndex,
                'answered': answers[index] !== undefined,
                'correct': showAnswer && answers[index] === q.correctAnswer,
                'wrong': showAnswer && answers[index] !== undefined && answers[index] !== q.correctAnswer
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
          <div class="question-header">
            <span :class="['difficulty-badge', currentQuestion.difficulty]">{{ currentQuestion.difficulty }}</span>
            <span class="question-type">单选题</span>
          </div>
          
          <div class="question-body">
            <p class="question-text">{{ currentQuestion.question }}</p>
          </div>

          <div class="options">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              :class="['option-btn', getOptionClass(index)]"
              @click="selectAnswer(index)"
              :disabled="showAnswer"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option.text }}</span>
              <span v-if="showAnswer && index === currentQuestion.correctAnswer" class="option-mark">✓</span>
              <span v-if="showAnswer && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer" class="option-mark">✗</span>
            </button>
          </div>

          <!-- AI 解析 -->
          <div v-if="showAnswer" class="analysis-section">
            <div class="ai-hint">
              <span class="ai-icon">🤖</span>
              <div class="ai-content">
                <h4>AI 提示</h4>
                <p>{{ currentQuestion.aiHint }}</p>
              </div>
            </div>
            <div class="explanation">
              <h4>答案解析</h4>
              <p><strong>正确答案：</strong>{{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}. {{ currentQuestion.options[currentQuestion.correctAnswer].text }}</p>
              <p>{{ currentQuestion.explanation }}</p>
            </div>
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
              {{ currentQuestionIndex < questions.length - 1 ? '下一题' : '查看结果' }}
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.practice-page {
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
