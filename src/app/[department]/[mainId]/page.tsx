'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DocumentForm from '@/app/documents/form';

export default function Page({ params }: any) {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [departmentName, setDepartmentName] = useState('');

  const fetchData = async () => {
    const resolved = await params;
    const { department, mainId } = resolved;
    setDepartmentName(department);
    const json = await api(`/media/contentListByLayer?department=${department}&mainId=${mainId}`);
    setData(json.data?.[mainId] || []);
  };

  useEffect(() => { fetchData(); }, []);

  const getType = (file: string) => {
    if (!file) return 'unknown';
    if (file.endsWith('.jpg') || file.endsWith('.png')) return '🖼️ Image';
    if (file.endsWith('.mp4')) return '🎥 Video';
    if (file.endsWith('.pdf')) return '📄 PDF';
    return '📁 File';
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`ลบเอกสาร "${item.title}" หรือไม่?`)) return;
    await api(`/admin/delete/document/${item.id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">รายการเอกสาร</h1>
            <p className="text-sm text-zinc-400 mt-1">จัดการไฟล์ในหมวดหมู่นี้</p>
         </div>
         <button onClick={() => setShowForm(true)} className="btn-primary bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-4 shadow-lg shadow-blue-900/20">
            + เพิ่มเอกสาร
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.length === 0 && (
           <div className="col-span-full text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed text-zinc-500">
             ไม่มีเอกสารในหมวดหมู่นี้
           </div>
        )}

        {data.map((item) => {
          const fileName = item.link.split('/').pop();
          const type = getType(item.link);

          return (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-4 flex gap-4 items-center group">
              <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-700">
                {item.coverImage ? (
                  <img src={`http://localhost:3111/uploads${item.coverImage}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{type.split(' ')[0]}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate text-lg">{item.title}</div>
                <div className="text-xs text-zinc-500 truncate mt-0.5">{fileName}</div>
                <div className="inline-block bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md mt-2 font-medium">
                  {type}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <a href={`http://localhost:3111/uploads/${item.link}`} target="_blank" className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors border border-zinc-700">
                  เปิดดู
                </a>
                <button onClick={() => handleDelete(item)} className="text-zinc-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                  ลบไฟล์
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <DocumentForm onClose={() => { setShowForm(false); fetchData(); }} />
          </div>
        </div>
      )}
    </div>
  );
}