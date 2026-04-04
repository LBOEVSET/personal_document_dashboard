export const login = async (username: string, password: string) => {
  const res = await fetch('http://localhost:3111/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  // 🔥 FIX ตรงนี้
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);

  localStorage.setItem('userId', 'mock-fingerprint-123');

  return data;
};
