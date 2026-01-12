import request from './axios';
import type { ChatForm } from '../types';

//获取ai回答
export const aiApi = {
  async getAiResponse(form: ChatForm): Promise<string> {
    const res = await request({
      url: '/xiaobao/chat',
      method: 'post',
      data: form,
      responseType: 'text'
    });
    return res.data;
  }
};