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
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-xl font-bold">ข้อมูลผู้ต้องขัง</h1>

        <div className="flex gap-2">
          {/* ✅ NEW: XLSX Upload */}
          <label className="bg-gray-700 px-3 py-2 rounded cursor-pointer text-sm">
            {xlsxFile ? xlsxFile.name : 'Import XLSX'}
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setXlsxFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <button
            onClick={handleUploadXlsx}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Upload
          </button>

          {/* ของเดิม */}
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setSelected(null);
              setShowForm(true);
            }}
          >
            + เพิ่มข้อมูล
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-3">
        {data.length === 0 && (
          <div className="text-gray-500">ไม่มีข้อมูล</div>
        )}

        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <img
                src={`http://localhost:3111${
                  item.profileImage || '/uploads/inmate/default.jpg'
                }`}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <div className="font-bold">
                  {item.name || 'ไม่ระบุชื่อ'}
                </div>

                <div className="text-sm text-gray-400">
                  {item.id || '-'} •{' '}
                  {item.status || 'ไม่ระบุสถานะ'}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-end gap-1">
              <button
                className="text-blue-400"
                onClick={() =>
                  router.push(`/inmate/${item.id}`)
                }
              >
                ดูรายละเอียด
              </button>

              <button
                className="text-blue-300"
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px] max-h-[90vh] overflow-y-auto">
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
