<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

interface Activity {
  type: string;
  topic?: string;
  score?: number;
  title?: string;
  date: string;
  time: string;
}

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

interface FavoriteTopic {
  id: number;
  name: string;
  progress: number;
  icon: string;
}

interface WeeklyStat {
  day: string;
  questions: number;
  time: number;
}

const router = useRouter();
const { user, logout, updateUser } = useUserStore();

const activeTab = ref('overview');
const showEditModal = ref(false);
const editForm = ref({
  username: '',
  email: '',
  avatar: ''
});
const editError = ref('');
const editLoading = ref(false);

const showPasswordModal = ref(false);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const passwordError = ref('');
const passwordLoading = ref(false);

const avatarOptions = ['👤', '🧑‍🎓', '👨‍💻', '👩‍💻', '🤖', '🧙', '🧑‍🔬', '👨‍🎨', '🧑‍🎭', '👽'];

const userInfo = computed(() => user.value);

const recentActivity = ref<Activity[]>([
  { type: 'practice', topic: '数据结构与算法', score: 92, date: '2024-01-20', time: '10:30' },
  { type: 'practice', topic: '机器学习基础', score: 88, date: '2024-01-19', time: '15:20' },
  { type: 'practice', topic: 'Python 编程', score: 95, date: '2024-01-18', time: '09:15' },
  { type: 'achievement', title: '连续学习 7 天', date: '2024-01-18', time: '00:00' },
  { type: 'practice', topic: '深度学习实战', score: 78, date: '2024-01-17', time: '20:45' }
]);

const weeklyStats = ref<WeeklyStat[]>([
  { day: '周一', questions: 45, time: 45 },
  { day: '周二', questions: 62, time: 55 },
  { day: '周三', questions: 38, time: 40 },
  { day: '周四', questions: 55, time: 50 },
  { day: '周五', questions: 70, time: 65 },
  { day: '周六', questions: 85, time: 80 },
  { day: '周日', questions: 95, time: 90 }
]);

const maxQuestions = computed(() => Math.max(...weeklyStats.value.map(s => s.questions)));

onMounted(() => {
  if (!user.value) {
    router.push('/login');
  }
});

function getActivityIcon(type: string) {
  return type === 'practice' ? '📝' : '🏆';
}

function getScoreColor(score: number) {
  if (score >= 90) return '#52c41a';
  if (score >= 70) return '#faad14';
  return '#f5222d';
}

function openEditModal() {
  if (user.value) {
    editForm.value = {
      username: user.value.username,
      email: user.value.email || '',
      avatar: user.value.avatar || '👤'
    };
  }
  showEditModal.value = true;
  editError.value = '';
}

function closeEditModal() {
  showEditModal.value = false;
}

async function saveProfile() {
  if (!editForm.value.username.trim()) {
    editError.value = '用户名不能为空';
    return;
  }

  editLoading.value = true;
  editError.value = '';

  try {
    updateUser({
      username: editForm.value.username,
      email: editForm.value.email,
      avatar: editForm.value.avatar
    });
    closeEditModal();
  } catch (e) {
    editError.value = '保存失败，请稍后重试';
  } finally {
    editLoading.value = false;
  }
}

function openPasswordModal() {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError.value = '';
  showPasswordModal.value = true;
}

function closePasswordModal() {
  showPasswordModal.value = false;
}

async function changePassword() {
  if (!passwordForm.value.oldPassword) {
    passwordError.value = '请输入当前密码';
    return;
  }
  
  if (!passwordForm.value.newPassword) {
    passwordError.value = '请输入新密码';
    return;
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码至少需要6个字符';
    return;
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致';
    return;
  }

  passwordLoading.value = true;
  passwordError.value = '';

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    closePasswordModal();
    alert('密码修改成功！');
  } catch (e) {
    passwordError.value = '密码修改失败，请检查当前密码是否正确';
  } finally {
    passwordLoading.value = false;
  }
}

function handleLogout() {
  logout();
  router.push('/');
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-content">
      <aside class="user-sidebar">
        <div class="user-card">
          <div class="avatar">{{ userInfo?.avatar || '👤' }}</div>
          <h2>{{ userInfo?.username || '用户' }}</h2>
          <p class="email">{{ userInfo?.email || '未设置邮箱' }}</p>
          <p class="join-date">加入于 {{ userInfo?.joinDate || '最近' }}</p>
        </div>

        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">1,256</span>
            <span class="stat-label">刷题总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">85.5%</span>
            <span class="stat-label">正确率</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">12</span>
            <span class="stat-label">连续天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">#188</span>
            <span class="stat-label">排名</span>
          </div>
        </div>

        <div class="menu-list">
          <button
            :class="['menu-item', { active: activeTab === 'overview' }]"
            @click="activeTab = 'overview'"
          >
            <span class="menu-icon">📊</span>
            <span>数据概览</span>
          </button>
          <button
            :class="['menu-item', { active: activeTab === 'activity' }]"
            @click="activeTab = 'activity'"
          >
            <span class="menu-icon">📝</span>
            <span>学习记录</span>
          </button>
          <button
            :class="['menu-item', { active: activeTab === 'settings' }]"
            @click="activeTab = 'settings'"
          >
            <span class="menu-icon">⚙️</span>
            <span>个人设置</span>
          </button>
        </div>

        <button class="logout-btn" @click="handleLogout">
          <span>🚪</span>
          <span>退出登录</span>
        </button>
      </aside>

      <main class="main-content">
        <div v-if="activeTab === 'overview'" class="tab-content">
          <div class="content-header">
            <div class="header-top">
              <button class="back-btn" @click="router.go(-1)">
                <span>←</span>
                <span>返回</span>
              </button>
              <h1>数据概览</h1>
            </div>
            <p>您的学习数据统计与分析</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <span class="stat-value">1,256</span>
                <span class="stat-label">总刷题量</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <span class="stat-value">1,074</span>
                <span class="stat-label">正确题目数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <span class="stat-value">12 天</span>
                <span class="stat-label">连续学习</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <span class="stat-value">128h</span>
                <span class="stat-label">学习时长</span>
              </div>
            </div>
          </div>

          <div class="chart-section">
            <h2>本周学习情况</h2>
            <div class="bar-chart">
              <div v-for="day in weeklyStats" :key="day.day" class="bar-item">
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :style="{ height: (day.questions / maxQuestions * 100) + '%' }"
                  ></div>
                </div>
                <span class="bar-label">{{ day.day }}</span>
                <span class="bar-value">{{ day.questions }}题</span>
              </div>
            </div>
          </div>

          <div class="recent-section">
            <h2>最近学习</h2>
            <div class="activity-list">
              <div v-for="(activity, index) in recentActivity.slice(0, 5)" :key="index" class="activity-item">
                <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
                <div class="activity-info">
                  <p class="activity-title">
                    {{ activity.type === 'practice' ? `完成了 ${activity.topic} 练习` : activity.title }}
                  </p>
                  <p class="activity-meta">{{ activity.date }} {{ activity.time }}</p>
                </div>
                <span
                  v-if="activity.score"
                  class="activity-score"
                  :style="{ color: getScoreColor(activity.score) }"
                >
                  {{ activity.score }}分
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'activity'" class="tab-content">
          <div class="content-header">
            <div class="header-top">
              <button class="back-btn" @click="router.go(-1)">
                <span>←</span>
                <span>返回</span>
              </button>
              <h1>学习记录</h1>
            </div>
            <p>查看您的历史学习记录</p>
          </div>

          <div class="activity-full-list">
            <div v-for="(activity, index) in recentActivity" :key="index" class="activity-row">
              <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
              <div class="activity-details">
                <p class="activity-title">
                  {{ activity.type === 'practice' ? `完成了 ${activity.topic} 练习` : activity.title }}
                </p>
                <p class="activity-date">{{ activity.date }} {{ activity.time }}</p>
              </div>
              <span
                v-if="activity.score"
                class="activity-score"
                :style="{ color: getScoreColor(activity.score) }"
              >
                {{ activity.score }}分
              </span>
              <span v-else class="activity-badge">新成就</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="tab-content">
          <div class="content-header">
            <div class="header-top">
              <button class="back-btn" @click="router.go(-1)">
                <span>←</span>
                <span>返回</span>
              </button>
              <h1>个人设置</h1>
            </div>
            <p>管理您的账户设置</p>
          </div>

          <div class="settings-form">
            <div class="form-section">
              <h3>基本信息</h3>
              <div class="form-group">
                <label>用户名</label>
                <input type="text" :value="userInfo?.username || ''" readonly />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" :value="userInfo?.email || ''" readonly />
              </div>
              <div class="form-group">
                <label>头像</label>
                <div class="avatar-display">
                  <span class="current-avatar">{{ userInfo?.avatar || '👤' }}</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="edit-btn" @click="openEditModal">
                <span>✏️</span>
                <span>编辑资料</span>
              </button>
            </div>

            <div class="security-section">
              <h3>安全设置</h3>
              <div class="security-item">
                <div class="security-info">
                  <span class="security-icon">🔒</span>
                  <div class="security-text">
                    <p class="security-title">密码</p>
                    <p class="security-desc">定期修改密码可以保护账户安全</p>
                  </div>
                </div>
                <button class="change-pwd-btn" @click="openPasswordModal">修改密码</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>编辑个人资料</h2>
          <button class="close-btn" @click="closeEditModal">✕</button>
        </div>

        <form @submit.prevent="saveProfile" class="edit-form">
          <div v-if="editError" class="error-message">{{ editError }}</div>

          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="editForm.username"
              type="text"
              placeholder="请输入用户名"
              maxlength="20"
            />
          </div>

          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="editForm.email"
              type="email"
              placeholder="请输入邮箱（可选）"
            />
          </div>

          <div class="form-group">
            <label>头像</label>
            <div class="avatar-selector">
              <div
                v-for="avatar in avatarOptions"
                :key="avatar"
                :class="['avatar-option', { selected: editForm.avatar === avatar }]"
                @click="editForm.avatar = avatar"
              >
                {{ avatar }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
            <button type="submit" class="save-btn" :disabled="editLoading">
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>修改密码</h2>
          <button class="close-btn" @click="closePasswordModal">✕</button>
        </div>

        <form @submit.prevent="changePassword" class="edit-form">
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>

          <div class="form-group">
            <label>当前密码</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
            />
          </div>

          <div class="form-group">
            <label>新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少6个字符）"
            />
          </div>

          <div class="form-group">
            <label>确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closePasswordModal">取消</button>
            <button type="submit" class="save-btn" :disabled="passwordLoading">
              {{ passwordLoading ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 104px);
  background: #f5f7fa;
}

.profile-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  gap: 30px;
}

.user-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.avatar {
  font-size: 72px;
  margin-bottom: 16px;
}

.user-card h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 8px;
}

.email {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.join-date {
  color: #999;
  font-size: 12px;
}

.user-stats {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-value {
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  color: #999;
}

.menu-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.menu-icon {
  font-size: 20px;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: white;
  border: 1px solid #ffccc7;
  border-radius: 10px;
  color: #f5222d;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fff2f0;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.content-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.content-header h1 {
  font-size: 26px;
  color: #333;
  margin-bottom: 8px;
  margin-top: 0;
}

.content-header p {
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  display: block;
  font-size: 26px;
  font-weight: bold;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.chart-section {
  margin-bottom: 40px;
}

.chart-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 24px;
}

.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 180px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  width: 36px;
  height: 140px;
  background: #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  transition: height 0.3s;
}

.bar-label {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
}

.bar-value {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.recent-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 10px;
}

.activity-icon {
  font-size: 28px;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 12px;
  color: #999;
}

.activity-score {
  font-size: 20px;
  font-weight: bold;
}

.activity-full-list {
  display: flex;
  flex-direction: column;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-details {
  flex: 1;
}

.activity-date {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.activity-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.settings-form {
  max-width: 500px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fafafa;
}

.form-group input:read-only {
  cursor: not-allowed;
}

.form-group input:focus:not(:read-only) {
  outline: none;
  border-color: #667eea;
}

.avatar-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-avatar {
  font-size: 56px;
}

.form-actions {
  margin-bottom: 32px;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.security-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.security-icon {
  font-size: 28px;
}

.security-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 13px;
  color: #999;
}

.change-pwd-btn {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.change-pwd-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  animation: modalFade 0.2s ease;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 20px;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #ffccc7;
  color: #f5222d;
}

.edit-form {
  padding: 24px;
}

.error-message {
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #f5222d;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.edit-form .form-group {
  margin-bottom: 20px;
}

.edit-form .form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.edit-form .form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.edit-form .form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.avatar-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.avatar-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  background: #e8e8e8;
}

.avatar-option.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.save-btn {
  flex: 1;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>