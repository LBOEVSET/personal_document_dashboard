'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
// 📌 1. ต้องมีการ Import ตัวนี้ถึงจะเรียกใช้ <DashboardFingerprint /> ได้
import DashboardFingerprint from '@/components/DashboardFingerprint'; 

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [showProfile, setShowProfile] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const [adminForm, setAdminForm] = useState<any>({
    username: '',
    password: '',
    name: '',
    userId: '',
  });

  const [user, setUser] = useState<any>({
    id: '',
    name: '',
    profileImage: null,
    isVerified: false,
    role: '',
  });

  useEffect(() => {
    const loadUser = () => {
      setUser({
        id: localStorage.getItem('userId') || '',
        name: localStorage.getItem('name') || '',
        profileImage: localStorage.getItem('profileImage') || null,
        isVerified: localStorage.getItem('isVerified') === 'true',
        role: localStorage.getItem('role'),
      });
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  if (pathname === '/login') return null;

  const backButton =
    pathname === '/dashboard' ? null : (
      <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
        <span>←</span> กลับ
      </button>
    );

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api('/admin/upload/profileImage?userType=admin', { method: 'POST', body: formData });
      const imageUrl = res.data.url;
      setUser((prev: any) => ({ ...prev, profileImage: imageUrl }));
      localStorage.setItem('profileImage', imageUrl);
      alert('Upload success');
    } catch (err) {
      console.error(err);
      alert('upload failed');
    }
  };

  // ================= FINGERPRINT SUCCESS (PROFILE) =================
  const handleProfileScanSuccess = async (scannedId: string) => {
    try {
      await api('/auth/login/fingerprint', {
        method: 'POST',
        body: JSON.stringify({ userId: scannedId, username: user.name, name: user.name }),
      });
      setUser((prev: any) => ({ ...prev, isVerified: true }));
      localStorage.setItem('isVerified', 'true');
      alert('ยืนยันลายนิ้วมือสำเร็จ');
    } catch (err) {
      console.error(err);
      alert('ยืนยันลายนิ้วมือไม่สำเร็จ');
    }
  };

  // ================= FINGERPRINT SUCCESS (ADMIN CREATE) =================
  const handleAdminScanSuccess = (scannedId: string) => {
    setAdminForm((prev: any) => ({ ...prev, userId: scannedId }));
    alert('บันทึกลายนิ้วมือ Admin สำเร็จ');
  };

  const handleCreateAdmin = async () => {
    try {
      await api('/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({ ...adminForm, secret: 'super_secret_admin_registration_key' }),
      });
      alert('Admin created');
      setShowCreateAdmin(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'error');
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex justify-between items-center shadow-sm">
        {backButton}
        
        {pathname === '/dashboard' && (
           <div className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
             Dashboard
           </div>
        )}

        <div className="flex items-center gap-4">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
            >
              + เพิ่ม Admin
            </button>
          )}

          <div
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 cursor-pointer overflow-hidden hover:border-blue-500 transition-colors"
          >
            {user.profileImage ? (
              <img src={`http://localhost:3111${user.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">Img</div>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE PANEL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-sm bg-zinc-900 border-l border-zinc-800 text-zinc-100 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <div className="font-bold text-lg">My Profile</div>
              <button onClick={() => setShowProfile(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-24 h-24 bg-zinc-800 rounded-full overflow-hidden border-4 border-zinc-800">
                  {user.profileImage ? (
                    <img src={`http://localhost:3111${user.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : <div className="w-full h-full flex items-center justify-center text-zinc-500">No Image</div>}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
              <div className="font-medium text-lg">{user.name || '-'}</div>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md">{user.role || 'USER'}</span>
            </div>

            <div className="flex flex-col gap-3 mt-4 flex-grow">
              {user.isVerified ? (
                <button disabled className="btn-primary w-full bg-zinc-800 text-green-400 border border-green-900/50 cursor-default">
                  ✅ ยืนยันลายนิ้วมือแล้ว
                </button>
              ) : (
                <div className="flex justify-center w-full">
                  <DashboardFingerprint onScanSuccess={handleProfileScanSuccess} />
                </div>
              )}

              {/* 📌 2. ปุ่มจัดการ Admin สำหรับคนที่เป็น ADMIN เท่านั้น */}
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    router.push('/admin-management');
                    setShowProfile(false);
                  }}
                  className="btn-primary w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 mt-2"
                >
                  👥 จัดการ Admin ทั้งหมด
                </button>
              )}
            </div>

            <button
              onClick={() => { localStorage.clear(); router.push('/login'); setShowProfile(false); }}
              className="btn-primary bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 mt-auto"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}

      {/* 📌 3. ADMIN CREATE MODAL (ที่แก้ไขแล้ว) */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm text-zinc-100 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">เพิ่มผู้ดูแลระบบ (Admin)</h2>
            <div className="flex flex-col gap-4 mb-6">
              <input placeholder="Username" className="input-modern" onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} />
              <input placeholder="Password" type="password" className="input-modern" onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
              <input placeholder="Name" className="input-modern" onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
            </div>

            <div className="mb-4 flex justify-center w-full">
              {adminForm.userId ? (
                <button disabled className="btn-primary w-full bg-green-600/20 text-green-400 border border-green-600/30 cursor-default">
                  ✅ สแกนลายนิ้วมือแล้ว ({adminForm.userId})
                </button>
              ) : (
                <div className="w-full">
                   <DashboardFingerprint onScanSuccess={handleAdminScanSuccess} />
                </div>
              )}
            </div>

            <button onClick={handleCreateAdmin} className="btn-primary bg-blue-600 hover:bg-blue-500 text-white w-full mb-3">
              ยืนยันการสร้าง
            </button>
            <button onClick={() => setShowCreateAdmin(false)} className="text-zinc-500 hover:text-white transition-colors text-sm w-full py-2">
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </>
  );
}