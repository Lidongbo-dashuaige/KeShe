<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { topicApi, type Topic, type TopicForm, type TopicQuery } from '../api/topic';

const topics = ref<Topic[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);
const searchName = ref('');
const total = ref(0);
const query = ref<TopicQuery>({ page: 1, size: 10 });

const form = ref<TopicForm>({
  name: '',
  description: '',
  promptTemplate: '',
  status: 1
});

async function fetchTopics() {
  loading.value = true;
  try {
    query.value.name = searchName.value;
    const res = await topicApi.query(query.value);
    if (res.code === 0) {
      topics.value = res.data;
      total.value = res.data.length || topics.value.length;
    }
  } catch (e) {
    console.error('获取列表失败', e);
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  isEdit.value = false;
  currentId.value = null;
  form.value = { name: '', description: '', promptTemplate: '', status: 1 };
  dialogVisible.value = true;
}

function openEditDialog(topic: Topic) {
  isEdit.value = true;
  currentId.value = topic.id;
  form.value = {
    name: topic.name,
    description: topic.description || '',
    promptTemplate: topic.promptTemplate || '',
    status: topic.status
  };
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!form.value.name) {
    alert('请填写名称');
    return;
  }

  loading.value = true;
  try {
    let res;
    if (isEdit.value && currentId.value) {
      res = await topicApi.update(currentId.value, form.value);
    } else {
      res = await topicApi.create(form.value);
    }

    if (res.success && res.data) {
      dialogVisible.value = false;
      fetchTopics();
    } else {
      alert(res.errorMsg || '操作失败');
    }
  } catch (e) {
    alert('网络错误');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.value.page = 1;
  fetchTopics();
}

function handleReset() {
  searchName.value = '';
  handleSearch();
}

onMounted(() => {
  fetchTopics();
});
</script>

<template>
  <div class="container">
    <div class="header">
      <h2>知识点管理</h2>
      <button class="btn-primary" @click="openCreateDialog">新建知识点</button>
    </div>

    <div class="search-bar">
      <input v-model="searchName" placeholder="搜索名称" @keyup.enter="handleSearch" />
      <button @click="handleSearch">搜索</button>
      <button @click="handleReset">重置</button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>描述</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="loading">加载中...</td>
          </tr>
          <tr v-else-if="topics.length === 0">
            <td colspan="6" class="empty">暂无数据</td>
          </tr>
          <tr v-for="topic in topics" :key="topic.id">
            <td>{{ topic.id }}</td>
            <td>{{ topic.name }}</td>
            <td>{{ topic.description || '-' }}</td>
            <td>
              <span :class="['status', topic.status === 1 ? 'active' : 'inactive']">
                {{ topic.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ topic.createTime || '-' }}</td>
            <td>
              <button class="btn-edit" @click="openEditDialog(topic)">编辑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span>共 {{ total }} 条</span>
    </div>

    <div v-if="dialogVisible" class="dialog-overlay">
      <div class="dialog">
        <h3>{{ isEdit ? '编辑知识点' : '新建知识点' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="form.name" required placeholder="请输入名称" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3" placeholder="请输入描述"></textarea>
          </div>
          <div class="form-group">
            <label>Prompt 模板</label>
            <textarea v-model="form.promptTemplate" rows="3" placeholder="请输入 Prompt 模板"></textarea>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </div>
          <div class="dialog-footer">
            <button type="button" @click="dialogVisible = false">取消</button>
            <button type="submit" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
h2 {
  margin: 0;
  color: #333;
}
.btn-primary {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary:hover {
  background: #45a049;
}
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.search-bar input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}
.search-bar button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
th {
  background: #f5f5f5;
  font-weight: 600;
}
.loading, .empty {
  text-align: center;
  color: #999;
  padding: 40px;
}
.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status.active {
  background: #e8f5e9;
  color: #4CAF50;
}
.status.inactive {
  background: #ffebee;
  color: #f44336;
}
.btn-edit {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.pagination {
  margin-top: 20px;
  color: #666;
}
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}
.dialog h3 {
  margin: 0 0 20px;
  color: #333;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.dialog-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.dialog-footer button[type="button"] {
  background: #ddd;
}
.dialog-footer button[type="submit"] {
  background: #4CAF50;
  color: white;
}
</style>
