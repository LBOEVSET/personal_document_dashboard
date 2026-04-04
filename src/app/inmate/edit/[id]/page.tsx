'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import InmateForm from '@/app/inmate/form';

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api(`/inmate/profile/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert('โหลดข้อมูลไม่สำเร็จ');
      }
    };
    fetchData();
  }, [id]);

  if (!data) return <div className="p-6 text-zinc-400 text-center mt-10">กำลังโหลด...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white flex items-center gap-2 font-medium mb-4">
          <span>←</span> ย้อนกลับ
        </button>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-1 md:p-6 rounded-3xl shadow-2xl">
        <InmateForm defaultValue={data} onClose={() => router.push('/inmate')} />
      </div>
    </div>
  );
}