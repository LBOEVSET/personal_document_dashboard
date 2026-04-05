'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import DashboardFingerprint from '@/components/DashboardFingerprint'; // 📌 นำเข้า Component สแกนนิ้วมือจริง

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ================= NORMAL LOGIN =================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const user = res.data.user;

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      localStorage.setItem('userId', user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('role', user.role);
      localStorage.setItem('profileImage', user.profileImage || '');
      localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ================= FINGERPRINT LOGIN (API จริง) =================
  const handleFingerprintSuccess = async (inmateId: string) => {
    try {
      const res = await api('/auth/login/fingerprint', {
        method: 'POST',
        body: JSON.stringify({
          userId: inmateId, // 📌 ส่งรหัสที่ได้จากเครื่องสแกนไปให้ Backend
        }),
      });

      const user = res.data.user;

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      localStorage.setItem('userId', user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('role', user.role);
      localStorage.setItem('profileImage', user.profileImage || '');
      localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Fingerprint login failed (ไม่พบข้อมูลในระบบ หรือเชื่อมต่อผิดพลาด)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black">
      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-6">
        
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mt-2">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Username</label>
            <input
              className="input-modern"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Password</label>
            <input
              type="password"
              className="input-modern"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">หรือ</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* 📌 วาง Component เครื่องสแกนนิ้วมือ */}
          <div className="flex justify-center">
            <DashboardFingerprint onScanSuccess={handleFingerprintSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}