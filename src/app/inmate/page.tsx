'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import InmateForm from './form';

export default function InmatePage() {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);

  const router = useRouter();

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await api('/inmate/profile');
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  const handleUploadXlsx = async () => {
    if (!xlsxFile) return alert('เลือกไฟล์ก่อน');

    const formData = new FormData();
    formData.append('file', xlsxFile);

    try {
      await api('/auth/register/inmate-xlsx', {
        method: 'POST',
        body: formData,
      });

      alert('Import สำเร็จ');
      setXlsxFile(null);
      fetchData(); // refresh list
    } catch (err) {
      console.error(err);
      alert('Import fail');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= UI =================
  return (
    <div className="p-6 max-w-6xl mx-auto text-zinc-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-8 items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ข้อมูลผู้ต้องขัง</h1>
          <p className="text-sm text-zinc-400 mt-1">จัดการและสืบค้นข้อมูลผู้ต้องขังทั้งหมดในระบบ</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer text-sm py-2 px-4 rounded-xl flex items-center justify-center transition-colors font-medium">
            <span className="mr-2">📄</span>
            {xlsxFile ? xlsxFile.name : 'เลือกไฟล์ Excel'}
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setXlsxFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {xlsxFile && (
            <button
              onClick={handleUploadXlsx}
              className="bg-green-600 hover:bg-green-500 text-sm py-2 px-4 rounded-xl flex items-center justify-center transition-colors text-white font-medium"
            >
              อัปโหลด
            </button>
          )}

          <button
            className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 text-sm py-2 px-4 rounded-xl flex items-center justify-center transition-colors text-white font-medium"
            onClick={() => {
              setSelected(null);
              setShowForm(true);
            }}
          >
            + เพิ่มข้อมูลใหม่
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-3">
        {data.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-zinc-400">ยังไม่มีข้อมูลผู้ต้องขังในระบบ</div>
          </div>
        )}

        {data.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center transition-all group"
          >
            {/* LEFT: Info */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <img
                  src={`http://localhost:3111${
                    item.profileImage || '/uploads/inmate/default.jpg'
                  }`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
              </div>

              <div>
                <div className="font-bold text-lg text-white">
                  {item.name || 'ไม่ระบุชื่อ'}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-0.5">
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-300 font-mono">
                    {item.id || 'NO-ID'}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300">
                    {item.status || 'ไม่ระบุสถานะ'}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                onClick={() => router.push(`/inmate/${item.id}`)}
              >
                รายละเอียด
              </button>

              <button
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                onClick={() => {
                  setSelected(item); // edit mode
                  setShowForm(true);
                }}
              >
                แก้ไข
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto">
            <InmateForm
              defaultValue={selected}
              onClose={() => {
                setShowForm(false);
                fetchData(); // refresh list หลัง save
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}