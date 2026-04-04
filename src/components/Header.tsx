'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [showProfile, setShowProfile] = useState(false);
  const [showScan, setShowScan] = useState(false);

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showScanAdmin, setShowScanAdmin] = useState(false);

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

  // ================= LOAD USER =================
  useEffect(() => {
    //! MOCK FINGER ID
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

    window.addEventListener('storage', loadUser); // 🔥 sync tab
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  if (pathname === '/login') return null;

  const backButton =
    pathname === '/dashboard' ? null : (
      <button onClick={() => router.back()} className="text-blue-400">
        ← กลับ
      </button>
    );

  // ================= UPLOAD =================
  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api(
        '/admin/upload/profileImage?userType=admin',
        {
          method: 'POST',
          body: formData,
        }
      );

      const imageUrl = res.data.url;

      setUser((prev: any) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      localStorage.setItem('profileImage', imageUrl);

      alert('Upload success');
    } catch (err) {
      console.error(err);
      alert('upload failed');
    }
  };

  // ================= VERIFY =================
  const handleScanSubmit = async () => {
    try {
      await api('/auth/login/fingerprint', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          username: user.name,
          name: user.name,
        }),
      });

      setUser((prev: any) => ({
        ...prev,
        isVerified: true,
      }));

      localStorage.setItem('isVerified', 'true');

      alert('verified');
      setShowScan(false);
    } catch (err) {
      console.error(err);
      alert('scan failed');
    }
  };

  // ================= ADMIN CREATE =================
  const genUserId = () => {
    return 'admin-' + Math.random().toString(36).substring(2, 10);
  };

  const handleScanAdmin = () => {
    const id = genUserId();

    setAdminForm((prev: any) => ({
      ...prev,
      userId: id,
    }));

    setShowScanAdmin(false);
    alert('scan success');
  };

  const handleCreateAdmin = async () => {
    try {
      await api('/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({
          ...adminForm,
          secret: 'super_secret_admin_registration_key',
        }),
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
      <div className="fixed top-0 left-0 w-full z-50 bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        {backButton}

        <div className="flex items-center gap-4">
          {/* ✅ แสดงเฉพาะ ADMIN */}
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="bg-green-600 px-3 py-1 rounded text-white"
            >
              + Admin
            </button>
          )}

          {/* PROFILE ICON */}
          <div
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-gray-600 cursor-pointer overflow-hidden"
          >
            {user.profileImage ? (
              <img
                src={`http://localhost:3111${user.profileImage}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No Image
              </div>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="text-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* PROFILE PANEL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="w-[350px] bg-white text-black p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="font-bold">Profile</div>
              <button onClick={() => setShowProfile(false)}>✕</button>
            </div>

            {/* IMAGE */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={`http://localhost:3111${user.profileImage}`}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              <label className="text-blue-500 cursor-pointer text-sm">
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleUpload(e.target.files[0])
                  }
                />
              </label>
            </div>

            {/* INFO */}
            <div className="text-sm flex flex-col gap-1">
              <div>Name: {user.name || '-'}</div>
            </div>

            {/* VERIFY */}
            <button
              disabled={user.isVerified}
              onClick={() => setShowScan(true)}
              className={`py-2 rounded ${
                user.isVerified
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white'
              }`}
            >
              {user.isVerified ? 'Verified ✅' : 'Verify Fingerprint'}
            </button>
          </div>
        </div>
      )}

      {/* SCAN USER */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <div className="font-bold mb-4">Scan Fingerprint</div>

            <div className="border p-6 mb-4">🖐 วางนิ้ว (mock)</div>

            <button
              onClick={handleScanSubmit}
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

      {/* ADMIN CREATE */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] text-black">
            <h2 className="font-bold mb-4">Create Admin</h2>

            <input
              placeholder="username"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setAdminForm({
                  ...adminForm,
                  username: e.target.value,
                })
              }
            />

            <input
              placeholder="password"
              type="password"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setAdminForm({
                  ...adminForm,
                  password: e.target.value,
                })
              }
            />

            <input
              placeholder="name"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setAdminForm({
                  ...adminForm,
                  name: e.target.value,
                })
              }
            />

            <button
              onClick={() => setShowScanAdmin(true)}
              className="bg-blue-600 text-white w-full py-2 rounded mb-2"
            >
              {adminForm.userId ? '✅ Scanned' : 'Scan Fingerprint'}
            </button>

            <button
              onClick={handleCreateAdmin}
              className="bg-green-600 text-white w-full py-2 rounded mb-2"
            >
              Create
            </button>

            <button onClick={() => setShowCreateAdmin(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SCAN ADMIN */}
      {showScanAdmin && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <div className="font-bold mb-4">Scan Fingerprint</div>

            <div className="border p-6 mb-4">🖐 วางนิ้ว (mock)</div>

            <button
              onClick={handleScanAdmin}
              className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
            >
              Confirm
            </button>

            <button
              onClick={() => setShowScanAdmin(false)}
              className="text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
