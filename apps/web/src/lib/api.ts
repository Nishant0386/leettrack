// apps/web/src/lib/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/auth/signin';
    }
    return Promise.reject(err);
  },
);

// ─── API functions ────────────────────────────────

export const classesApi = {
  list: () => api.get('/classes'),
  get: (id: string) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  join: (data: { code?: string; inviteLink?: string }) => api.post('/classes/join', data),
  leave: (id: string) => api.delete(`/classes/${id}/leave`),
  getStudents: (id: string) => api.get(`/classes/${id}/students`),
};

export const analyticsApi = {
  getClassDashboard: (classId: string) => api.get(`/analytics/class/${classId}`),
  getStudentDetail: (studentId: string, classId: string) =>
    api.get(`/analytics/student/${studentId}?classId=${classId}`),
};

export const leetcodeApi = {
  getMyData: () => api.get('/leetcode/my-data'),
  getProfile: (username: string) => api.get(`/leetcode/profile/${username}`),
  forceSync: () => api.post('/leetcode/sync'),
};

export const assignmentsApi = {
  list: (classId?: string) => api.get('/assignments', { params: classId ? { classId } : {} }),
  create: (data: any) => api.post('/assignments', data),
  submit: (id: string, data: FormData) => api.post(`/assignments/${id}/submit`, data),
  grade: (id: string, studentId: string, data: any) =>
    api.post(`/assignments/${id}/grade/${studentId}`, data),
};

export const liveSessionsApi = {
  list: (classId: string) => api.get(`/live-sessions?classId=${classId}`),
  create: (data: any) => api.post('/live-sessions', data),
  start: (id: string) => api.post(`/live-sessions/${id}/start`),
  end: (id: string) => api.post(`/live-sessions/${id}/end`),
  join: (id: string) => api.post(`/live-sessions/${id}/join`),
  leave: (id: string) => api.post(`/live-sessions/${id}/leave`),
  cancel: (id: string) => api.post(`/live-sessions/${id}/cancel`),
};

export const emailApi = {
  send: (data: any) => api.post('/email/send', data),
  sendBulk: (data: any) => api.post('/email/bulk', data),
};

export const reportsApi = {
  studentReport: (studentId: string, classId: string) =>
    api.get(`/reports/student/${studentId}?classId=${classId}`, { responseType: 'blob' }),
  classReport: (classId: string) =>
    api.get(`/reports/class/${classId}`, { responseType: 'blob' }),
};
