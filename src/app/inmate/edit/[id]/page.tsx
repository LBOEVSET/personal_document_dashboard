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

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <button onClick={() => router.back()}>
          ← กลับ
        </button>

        <h1 className="text-xl font-bold">แก้ไขข้อมูล</h1>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl max-w-xl mx-auto">
        <InmateForm
          defaultValue={data}
          onClose={() => router.push('/inmate')}
        />
      </div>
    </div>
  );
}
