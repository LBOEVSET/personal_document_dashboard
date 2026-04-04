'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api(`/inmate/profile/${id}`);
        setData(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 text-zinc-400 flex justify-center items-center h-40">กำลังโหลดข้อมูล...</div>;
  if (!data) return <div className="p-6 text-red-500 text-center">ไม่พบข้อมูลผู้ต้องขัง</div>;

  const progressPercent = data.totalDays > 0 ? Math.min(100, Math.max(0, ((data.totalDays - data.daysLeft) / data.totalDays) * 100)) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto text-zinc-100">
      {/* HEADER */}
      <div className="flex justify-between mb-8 items-center border-b border-zinc-800 pb-4">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white flex items-center gap-2 font-medium">
          <span>←</span> ย้อนกลับ
        </button>

        <div className="flex gap-3">
          <button onClick={() => router.push(`/inmate/edit/${id}`)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-zinc-700">
            แก้ไขข้อมูล
          </button>
          <button
            onClick={async () => {
              if (!confirm('ยืนยันการลบข้อมูลผู้ต้องขังรายนี้?')) return;
              await api(`/admin/delete/inmate/${id}`, { method: 'DELETE' });
              router.push('/inmate');
            }}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-9xl">👤</div>
        <img src={`http://localhost:3111${data.profileImage || '/uploads/inmate/default.jpg'}`} className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800 shadow-xl z-10" />
        <div className="text-center md:text-left z-10">
          <div className="text-3xl font-bold text-white mb-1">{data.name}</div>
          <div className="text-zinc-400 font-mono text-lg mb-2">{data.id}</div>
          <div className="inline-block bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-sm font-medium">
            {data.status || 'Active'}
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex justify-between text-sm mb-3 text-zinc-400">
           <span>ความคืบหน้า (Step {data.progressStep})</span>
           <span>เหลืออีก <span className="text-white font-bold">{data.daysLeft}</span> จาก {data.totalDays} วัน</span>
        </div>
        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BASIC INFO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm flex flex-col gap-4">
          <div className="font-bold text-white text-lg border-b border-zinc-800 pb-2">ข้อมูลคดี</div>
          <div className="grid grid-cols-2 gap-y-3">
             <div className="text-zinc-500">จำนวนคดี</div><div className="text-right text-white">{data.cases}</div>
             <div className="text-zinc-500">ประเภทคดี</div><div className="text-right text-white">{data.caseType || '-'}</div>
             <div className="text-zinc-500">กำหนดโทษ</div><div className="text-right text-white">{data.sentence || '-'}</div>
             <div className="text-zinc-500">วันเริ่มโทษ</div><div className="text-right text-white">{data.startDate ? new Date(data.startDate).toLocaleDateString('th-TH') : '-'}</div>
             <div className="text-zinc-500">วันปล่อยตัว</div><div className="text-right text-white">{data.releaseDate ? new Date(data.releaseDate).toLocaleDateString('th-TH') : '-'}</div>
             <div className="text-zinc-500">โอนย้ายจาก</div><div className="text-right text-white">{data.transferFrom || '-'}</div>
          </div>
        </div>

        {/* DETAIL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm flex flex-col gap-4">
          <div className="font-bold text-white text-lg border-b border-zinc-800 pb-2">ข้อมูลส่วนตัว</div>
          <div className="grid grid-cols-2 gap-y-3">
             <div className="text-zinc-500">อายุ</div><div className="text-right text-white">{data.detail?.age || '-'} ปี</div>
             <div className="text-zinc-500">สัญชาติ</div><div className="text-right text-white">{data.detail?.nationality || '-'}</div>
             <div className="text-zinc-500">ศาสนา</div><div className="text-right text-white">{data.detail?.religion || '-'}</div>
             <div className="text-zinc-500">ประเภทการคุมขัง</div><div className="text-right text-white">{data.detail?.holdType || '-'}</div>
             <div className="text-zinc-500">หน่วยงานที่จับ</div><div className="text-right text-white">{data.detail?.holdAgency || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}