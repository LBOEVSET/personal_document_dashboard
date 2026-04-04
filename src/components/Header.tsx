'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [showProfile, setShowProfile] = useState(false);
  const [showScan, setShowScan] = useState(false);

  const [user, setUser] = useState<any>({
    id: '',
    name: '',
    profileImage: null,
    isVerified: false,
  });

  // ================= LOAD USER =================
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const profileImage = localStorage.getItem('profileImage');
    const isVerified = localStorage.getItem('isVerified') === 'true';

    setUser({
      id: userId || 'admin-mock-id',
      name: name || 'Admin',
      profileImage: profileImage || null,
      isVerified,
    });
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

      // ✅ update state
      setUser((prev: any) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      // ✅ persist
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
      if (!user.id) {
        alert('no userId');
        return;
      }

      await api('/auth/login/fingerprint', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          username: user.id,
          name: user.name,
        }),
      });

      // ✅ update state
      setUser((prev: any) => ({
        ...prev,
        isVerified: true,
      }));

      // ✅ persist
      localStorage.setItem('isVerified', 'true');

      alert('verified');
      setShowScan(false);
    } catch (err) {
      console.error(err);
      alert('scan failed');
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        {backButton}

        <div className="flex items-center gap-4">
          {/* PROFILE ICON */}
          <div
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-gray-600 cursor-pointer overflow-hidden"
          >
            {user.profileImage && (
              <img
                src={`http://localhost:3111${user.profileImage}`}
                className="w-full h-full object-cover"
              />
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
                {user.profileImage && (
                  <img
                    src={`http://localhost:3111${user.profileImage}`}
                    className="w-full h-full object-cover"
                  />
                )}
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
              {/* ❌ เอา ID ออก */}
              <div>Name: {user.name}</div>
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
              {user.isVerified
                ? 'Verified ✅'
                : 'Verify Fingerprint'}
            </button>
          </div>
        </div>
      )}

      {/* SCAN MODAL */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <div className="font-bold mb-4">
              Scan Fingerprint
            </div>

            <div className="border p-6 mb-4">
              🖐 วางนิ้ว (mock)
            </div>

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
    </>
  );
}
