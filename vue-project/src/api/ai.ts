import type { ChatForm } from '../types';

const API_BASE = 'http://localhost:8080/api';

//获取ai回答（流式）
export const aiApi = {
  async getAiResponse(form: ChatForm): Promise<String> {
    const res = await fetch(`${API_BASE}/xiaobao/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.text();
  }
};