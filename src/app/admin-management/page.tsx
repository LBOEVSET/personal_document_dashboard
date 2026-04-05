'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminCreateModal from '@/components/AdminCreateModal';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // ดึงรายชื่อ Admin
  const fetchAdmins = async () => {
    try {
      const res = await api('/admin/list?role=ADMIN'); // สมมติ endpoint นี้มีอยู่
      setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ Admin ท่านนี้?')) return;
    try {
      await api(`/admin/delete/${id}`, { method: 'DELETE' });
      alert('ลบสำเร็จ');
      fetchAdmins();
    } catch (err) { alert('ล้มเหลว'); }
  };

  return (
    <div className="p-8 pt-24 min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">จัดการผู้ดูแลระบบ (Admins)</h1>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold"
          >
            + เพิ่ม Admin ใหม่
          </button>
        </div>

        <div className="grid gap-4">
          {admins.map((adm) => (
            <div key={adm.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden">
                  <img src={`http://localhost:3111${adm.profileImage}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-lg">{adm.name}</div>
                  <div className="text-zinc-500 text-sm">Username: {adm.username}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(adm.id)}
                className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
              >
                ลบออก
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <AdminCreateModal onClose={() => { setShowCreate(false); fetchAdmins(); }} />}
    </div>
  );
}