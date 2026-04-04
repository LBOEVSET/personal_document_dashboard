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

  const genUserId = () => 'admin-' + Math.random().toString(36).substring(2, 10);

  const handleScan = () => {
    setForm((prev: any) => ({ ...prev, userId: genUserId() }));
    setShowScan(false);
    alert('scan success');
  };

  const handleSubmit = async () => {
    try {
      let imagePath = '';
      if (file) {
        const res = await uploadProfile(file);
        imagePath = res.data?.url;
      }

      await api('/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({ ...form, profileImage: imagePath, secret: 'super_secret_admin_registration_key' }),
      });

      alert('สร้าง admin สำเร็จ');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm text-zinc-100 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-white">เพิ่ม Admin ใหม่</h2>

        <div className="flex flex-col gap-4 mb-6">
          <input placeholder="Username" className="input-modern" onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Password" type="password" className="input-modern" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Name" className="input-modern" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          
          <label className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl cursor-pointer text-center hover:bg-zinc-700 transition-colors text-sm">
             {file ? file.name : '📸 อัปโหลดรูปโปรไฟล์'}
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>

        <button onClick={() => setShowScan(true)} className={`btn-primary w-full mb-4 ${form.userId ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
          {form.userId ? '✅ สแกนแล้ว' : '🖐 สแกนนิ้วมือ'}
        </button>

        <button onClick={handleSubmit} className="btn-primary bg-blue-600 hover:bg-blue-500 text-white w-full mb-3">
          สร้าง Admin
        </button>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-sm w-full py-2">
          ยกเลิก
        </button>
      </div>

      {/* SCAN MODAL */}
      {showScan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🖐</span></div>
            <div className="font-bold text-white text-xl mb-2">Scan Fingerprint</div>
            <div className="text-zinc-400 text-sm mb-6">กรุณาวางนิ้ว (mock)</div>
            <button onClick={handleScan} className="btn-primary bg-blue-600 hover:bg-blue-500 text-white w-full mb-3">ยืนยัน</button>
            <button onClick={() => setShowScan(false)} className="text-zinc-500 hover:text-white transition-colors text-sm w-full py-2">ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
}