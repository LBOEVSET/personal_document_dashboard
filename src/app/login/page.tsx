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
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('accessToken', res.data.accessToken);

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
    setShowScan(true);
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

      localStorage.setItem('accessToken', res.data.accessToken);

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Fingerprint login failed');
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center text-white gap-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        className="border p-3 w-[300px] text-white bg-black"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        className="border p-3 w-[300px] text-white bg-black"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-red-600 px-6 py-2 rounded"
      >
        Login
      </button>

      <button
        onClick={handleFingerprint}
        className="bg-blue-600 px-6 py-2 rounded"
      >
        ✋ Login with Fingerprint
      </button>

      {/* ================= SCAN MODAL ================= */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-xl text-center">
            <div className="font-bold mb-4">Scan Fingerprint</div>

            <div className="border p-6 mb-4">
              🖐 วางนิ้ว (mock)
            </div>

            <button
              onClick={handleConfirmScan}
              className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
            >
              Confirm
            </button>

            <button
              onClick={() => setShowScan(false)}
              className="text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
