export interface Result<T = any> {
  success: boolean;
  errorMsg?: string;
  data?: T;
  total?: number;
}

const API_BASE = 'http://localhost:8080/api';

export const topicApi = {
  async query(params: TopicQuery = {}): Promise<Result<Topic[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.size) query.set('size', params.size.toString());
    if (params.name) query.set('name', params.name);

    const res = await fetch(`${API_BASE}/topic?${query.toString()}`);
    return res.json();
  },

  async create(form: TopicForm): Promise<Result<Topic>> {
    const res = await fetch(`${API_BASE}/topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.json();
  },

  async update(id: number, form: TopicForm): Promise<Result<Topic>> {
    const res = await fetch(`${API_BASE}/topic/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.json();
  }
};
