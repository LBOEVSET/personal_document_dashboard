'use client';

import { useEffect, useState } from 'react';
import DocumentForm from './form';
import { api } from '@/lib/api';

export default function DocumentsClient({
  department,
}: {
  department: string;
}) {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const json = await api(
        `/media/contentList?department=${department}`
      );

      const raw = json.data || {};

      // ✅ flatten ทุก main
      const documents = Object.values(raw).flatMap(
        (main: any) => main.document || []
      );

      setData(documents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!department) return; // ✅ กัน undefined
    fetchData();
  }, [department]);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">
          {department === 'PR'
            ? 'งานประชาสัมพันธ์'
            : 'ความรู้ทางกฎหมาย'}
        </h1>

        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          + เพิ่มเอกสาร
        </button>
      </div>

      {/* STATE */}
      {loading && <div>Loading...</div>}

      {error && (
        <div className="text-red-500 mb-3">
          ❌ {error}
        </div>
      )}

      {/* LIST */}
      {!loading && !error && (
        <div className="grid gap-3">
          {data.length === 0 && (
            <div className="text-gray-500">ไม่มีข้อมูล</div>
          )}

          {data.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-bold">{item.title}</div>
                <div className="text-sm text-gray-500">
                  {item.type}
                </div>
              </div>

              <a
                href={`http://localhost:3111/uploads${item.file}`}
                target="_blank"
                className="text-blue-600"
              >
                เปิด
              </a>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[420px]">
            <DocumentForm
              department={department}
              onClose={() => {
                setShowForm(false);
                fetchData(); // ✅ refresh หลังเพิ่ม
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
