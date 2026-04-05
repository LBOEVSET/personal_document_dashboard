'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import DashboardFingerprint from '@/components/DashboardFingerprint';

export default function AdminCreateModal({ onClose }: any) {
  const [form, setForm] = useState({ username: '', password: '', name: '', userId: '', profileImage: '' });
  const [file, setFile] = useState<File | null>(null);

  const handleScanSuccess = (scannedId: string) => {
    setForm(prev => ({ ...prev, userId: scannedId }));
    alert('บันทึกลายนิ้วมือแล้ว');
  };

  const handleSubmit = async () => {
    if (!form.userId) return alert('กรุณาสแกนลายนิ้วมือก่อน');
    try {
      let imagePath = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api('/admin/upload/profileImage?userType=admin', { method: 'POST', body: formData });
        imagePath = res.data.url;
      }

      await api('/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({ ...form, profileImage: imagePath, secret: 'super_secret_admin_registration_key' }),
      });

      alert('สร้าง Admin สำเร็จ');
      onClose();
    } catch (err: any) { alert(err.message || 'เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[100] p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">เพิ่ม Admin ใหม่</h2>
        <div className="flex flex-col gap-4 mb-6">
          <input placeholder="Username" className="input-modern" onChange={e => setForm({...form, username: e.target.value})} />
          <input placeholder="Password" type="password" className="input-modern" onChange={e => setForm({...form, password: e.target.value})} />
          <input placeholder="Display Name" className="input-modern" onChange={e => setForm({...form, name: e.target.value})} />
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm text-zinc-500" />
        </div>

        <div className="mb-6 flex justify-center">
          {form.userId ? (
            <div className="text-green-400 font-bold">✅ สแกนนิ้วมือเรียบร้อย ({form.userId})</div>
          ) : (
            <DashboardFingerprint onScanSuccess={handleScanSuccess} />
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-zinc-400">ยกเลิก</button>
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">สร้าง</button>
        </div>
      </div>
    </div>
  );
}