import request from './axios';

// 题库分类接口
export const getQuestionCategories = () => {
  return request({
    url: '/question/categories',
    method: 'get'
  });
};

// 根据分类获取题目
export const getQuestionsByCategory = (categoryId: number) => {
  return request({
    url: '/question/list',
    method: 'get',
    params: { categoryId }
  });
};

// 获取题目详情
export const getQuestionDetail = (questionId: number) => {
  return request({
    url: `/question/${questionId}`,
    method: 'get'
  });
};

// 获取题目选项
export const getOptionsByQuestionId = (questionId: number) => {
  return request({
    url: `/question/detail/${questionId}`,
    method: 'get'
  });
};