'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showScan, setShowScan] = useState(false);

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

      // ✅ TOKEN
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // 🔥 FIX: SAVE USER
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

  // ================= OPEN SCAN =================
  const handleFingerprint = () => {
    setShowScan(true); // ✅ เปิด modal
  };

  // ================= CONFIRM SCAN =================
  const handleConfirmScan = async () => {
    try {
      const mockUserId = '6462cba0-1993-42b0-9d93-c8498640a9c4';

      const res = await api('/auth/login/fingerprint', {
        method: 'POST',
        body: JSON.stringify({
          userId: mockUserId,
        }),
      });

      const user = res.data.user;

      // ✅ SAVE ทุกอย่างเหมือน login
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      localStorage.setItem('userId', user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('role', user.role);
      localStorage.setItem('profileImage', user.profileImage || '');
      localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

      setShowScan(false); // ปิด modal
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Fingerprint login failed');
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

          <button
            onClick={handleFingerprint}
            className="btn-primary bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
          >
            <span className="text-xl">🖐</span> สแกนลายนิ้วมือ
          </button>
        </div>
      </div>

      {/* SCAN MODAL */}
      {showScan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl transform transition-all">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-3xl">🖐</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Scan Fingerprint</h3>
            <p className="text-zinc-400 text-sm mb-6">กรุณาวางนิ้วบนเครื่องสแกนเพื่อเข้าสู่ระบบ</p>

            <button
              onClick={handleConfirmScan}
              className="btn-primary bg-blue-600 hover:bg-blue-500 text-white w-full mb-3"
            >
              ยืนยันสแกน
            </button>

            <button
              onClick={() => setShowScan(false)}
              className="text-zinc-500 hover:text-white transition-colors text-sm w-full py-2"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}