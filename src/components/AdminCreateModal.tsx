'use client';

import { useState } from 'react';
import { api, uploadProfile } from '@/lib/api';

export default function AdminCreateModal({ onClose }: any) {
  const [form, setForm] = useState<any>({
    username: '',
    password: '',
    name: '',
    userId: '',
    profileImage: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [showScan, setShowScan] = useState(false);

  // 🔥 mock fingerprint
  const genUserId = () => {
    return 'admin-' + Math.random().toString(36).substring(2, 10);
  };

  // ================= SCAN =================
  const handleScan = () => {
    const id = genUserId();

    setForm((prev: any) => ({
      ...prev,
      userId: id,
    }));

    setShowScan(false);
    alert('scan success');
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      let imagePath = '';

      if (file) {
        const res = await uploadProfile(file);
        imagePath = res.data?.url;
      }

      await api('/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          profileImage: imagePath,
          secret: 'super_secret_admin_registration_key',
        }),
      });

      alert('สร้าง admin สำเร็จ');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[350px] text-black">
        <h2 className="text-lg font-bold mb-4">เพิ่ม Admin</h2>

        {/* INPUT */}
        <input
          placeholder="username"
          className="input mb-2"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          placeholder="password"
          type="password"
          className="input mb-2"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <input
          placeholder="name"
          className="input mb-2"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* IMAGE */}
        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mb-3"
        />

        {/* FINGERPRINT */}
        <button
          onClick={() => setShowScan(true)}
          className="bg-blue-600 text-white w-full py-2 rounded mb-2"
        >
          {form.userId
            ? '✅ สแกนแล้ว'
            : '🖐 สแกนนิ้ว'}
        </button>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white w-full py-2 rounded mb-2"
        >
          Create
        </button>

        <button onClick={onClose} className="text-gray-500 w-full">
          ยกเลิก
        </button>
      </div>

      {/* SCAN MODAL */}
      {showScan && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-white p-6 rounded text-center">
            <div className="mb-4">🖐 วางนิ้ว (mock)</div>

            <button
              onClick={handleScan}
              className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
            >
              ยืนยัน
            </button>

            <button onClick={() => setShowScan(false)}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
