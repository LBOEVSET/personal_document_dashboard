const BASE = 'http://localhost:3111/api/v1';

let isRefreshing = false;
let queue: any[] = [];

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

// =========================
// 🔐 BASE API (WITH REFRESH)
// =========================
export const api = async (url: string, options: any = {}) => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const isFormData = options.body instanceof FormData;

  const doRequest = async (token: string | null) => {
    return fetch(BASE + url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(isFormData
          ? {}
          : { 'Content-Type': 'application/json' }), // 🔥 FIX ตรงนี้
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  };

  let res = await doRequest(accessToken);

  // 🔥 ถ้า token หมดอายุ
  if (res.status === 401 && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(BASE + '/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const refreshData = await refreshRes.json();

        if (!refreshRes.ok) {
          throw new Error('Refresh failed');
        }

        const newAccessToken = refreshData.accessToken;

        // ✅ save token ใหม่
        localStorage.setItem('accessToken', newAccessToken);

        // ✅ ปล่อย queue
        processQueue(newAccessToken);

        // ✅ retry request เดิม
        res = await doRequest(newAccessToken);
      } catch (err) {
        console.error('REFRESH FAIL', err);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        window.location.href = '/login';
        return;
      } finally {
        isRefreshing = false;
      }
    } else {
      // 🔥 ถ้ามี request อื่นรออยู่
      return new Promise((resolve, reject) => {
        queue.push(async (newToken: string) => {
          try {
            const retryRes = await doRequest(newToken);

            const data = await retryRes.json();

            if (!retryRes.ok) {
              reject(new Error(data?.message || 'API Error'));
            } else {
              resolve(data);
            }
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  let data: any = null;

  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Invalid JSON response');
  }

  if (!res.ok) {
    throw new Error(data?.message || 'API Error');
  }

  return data;
};

// =========================
// 👤 INMATE
// =========================

// 🔼 upload profile image
export const uploadProfile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return api('/admin/upload/profileImage?userType=inmate', {
    method: 'POST',
    body: formData,
  });
};

// ➕ create inmate
export const createInmate = async (data: any) => {
  return api('/auth/register/inmate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// 📥 get inmate list
export const getInmates = async () => {
  return api('/inmate/profile', {
    method: 'GET',
  });
};

// =========================
// 📄 DOCUMENT
// =========================

// 🔼 upload document (support full hierarchy)
export const uploadDocument = async (
  file: File,
  body: {
    department?: string;
    mainId?: string;
    subId?: string;
    groupId?: string;
  }
) => {
  const formData = new FormData();

  formData.append('file', file);

  if (body.department) formData.append('department', body.department);
  if (body.mainId) formData.append('mainId', body.mainId);
  if (body.subId) formData.append('subId', body.subId);
  if (body.groupId) formData.append('groupId', body.groupId);

  return api('/admin/upload/document', {
    method: 'POST',
    body: formData,
  });
};

// ➕ create document
export const createDocument = async (data: {
  title: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF';
  department: 'LEGAL' | 'PR';
  mainId: string;
  subId?: string;
  groupId?: string;
  file: string;
}) => {
  return api('/admin/add/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// 📥 get document list
export const getDocuments = async () => {
  return api('/media/contentList', {
    method: 'GET',
  });
};
