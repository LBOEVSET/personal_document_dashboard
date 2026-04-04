'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import DocumentForm from '@/app/documents/form';

export default function Page({ params }: any) {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    const resolved = await params;
    const { department, mainId } = resolved;

    const json = await api(
      `/media/contentListByLayer?department=${department}&mainId=${mainId}`
    );

    const docs = json.data?.[mainId] || [];
    setData(docs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getType = (file: string) => {
    if (!file) return 'unknown';
    if (file.endsWith('.jpg') || file.endsWith('.png'))
      return 'image';
    if (file.endsWith('.mp4')) return 'video';
    if (file.endsWith('.pdf')) return 'pdf';
    return 'file';
  };

  // 🔥 ADD: delete
  const handleDelete = async (item: any) => {
    const confirmDelete = confirm(`ลบ ${item.title} ?`);
    if (!confirmDelete) return;

    await api(`/admin/delete/document/${item.id}`, {
      method: 'DELETE',
    });

    fetchData();
  };

  return (
    <div className="p-6">
      <Header />

      {/* 🔥 ADD: ปุ่มเพิ่ม */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + เพิ่ม
        </button>
      </div>

      <div className="grid gap-4">
        {data.map((item) => {
          const fileName = item.link.split('/').pop();
          const type = getType(item.link);

          return (
            <div
              key={item.id}
              className="border rounded-xl p-4 flex gap-4 items-center"
            >
              {/* COVER IMAGE */}
              <img
                src={`http://localhost:3111/uploads${item.coverImage}`}
                className="w-24 h-24 object-cover rounded-lg"
              />

              {/* INFO */}
              <div className="flex-1">
                <div className="font-bold">
                  {item.title}
                </div>

                <div className="text-sm text-gray-400">
                  {fileName}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {type}
                </div>
              </div>

              {/* 🔥 ADD: ACTION */}
              <div className="flex flex-col items-end gap-2">
                <a
                  href={`http://localhost:3111/uploads/${item.link}`}
                  target="_blank"
                  className="text-blue-500"
                >
                  เปิด
                </a>

                <button
                  onClick={() => handleDelete(item)}
                  className="text-red-500 text-sm"
                >
                  ลบ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 ADD: modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <DocumentForm
              onClose={() => {
                setShowForm(false);
                fetchData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
