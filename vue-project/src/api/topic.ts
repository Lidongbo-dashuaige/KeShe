import request from './axios';
import type { Result, TopicQuery, TopicForm, Topic } from '../types';

// 题库分类接口
export const topicApi = {
  async query(params: TopicQuery = {}): Promise<Result<Topic[]>> {
    const res = await request({
      url: '/topic',
      method: 'get',
      params
    });
    return res.data;
  },

  async create(form: TopicForm): Promise<Result<Topic>> {
    const res = await request({
      url: '/topic',
      method: 'post',
      data: form
    });
    return res.data;
  },

  async update(id: number, form: TopicForm): Promise<Result<Topic>> {
    const res = await request({
      url: `/topic/${id}`,
      method: 'put',
      data: form
    });
    return res.data;
  }
};
