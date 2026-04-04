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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6 text-red-500">ไม่พบข้อมูล</div>;

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <button onClick={() => router.back()}>
          ← กลับ
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/inmate/edit/${id}`)}
            className="text-blue-400"
          >
            แก้ไข
          </button>

          <button
            onClick={async () => {
              if (!confirm('ลบข้อมูล ?')) return;

              await api(`/admin/delete/inmate/${id}`, {
                method: 'DELETE',
              });

              router.push('/inmate');
            }}
            className="text-red-500"
          >
            ลบ
          </button>
        </div>
      </div>

      {/* PROFILE */}
      <div className="border rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <img
            src={`http://localhost:3111${data.profileImage}`}
            className="w-20 h-20 rounded-full object-cover"
          />

          <div>
            <div className="text-lg font-bold">{data.name}</div>
            <div className="text-gray-400">{data.id}</div>
            <div className="text-sm text-green-400">{data.status}</div>
          </div>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="border rounded-xl p-6 mb-4 text-sm flex flex-col gap-2">
        <div>จำนวนคดี: {data.cases}</div>
        <div>ประเภทคดี: {data.caseType}</div>
        <div>โทษ: {data.sentence}</div>

        <div>
          วันเริ่มโทษ:{' '}
          {new Date(data.startDate).toLocaleDateString('th-TH')}
        </div>

        <div>
          วันปล่อย:{' '}
          {new Date(data.releaseDate).toLocaleDateString('th-TH')}
        </div>

        <div>โอนมาจาก: {data.transferFrom}</div>
      </div>

      {/* PROGRESS */}
      <div className="border rounded-xl p-6 mb-4 text-sm flex flex-col gap-2">
        <div>progress step: {data.progressStep}</div>
        <div>จำนวนวันทั้งหมด: {data.totalDays}</div>
        <div>เหลืออีก: {data.daysLeft} วัน</div>

        {/* progress bar */}
        <div className="w-full bg-gray-700 h-2 rounded">
          <div
            className="bg-green-500 h-2 rounded"
            style={{
              width: `${
                ((data.totalDays - data.daysLeft) / data.totalDays) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* DETAIL (nested) */}
      <div className="border rounded-xl p-6 text-sm flex flex-col gap-2">
        <div className="font-bold mb-2">ข้อมูลเพิ่มเติม</div>

        <div>อายุ: {data.detail?.age}</div>
        <div>สัญชาติ: {data.detail?.nationality}</div>
        <div>ศาสนา: {data.detail?.religion}</div>
        <div>ประเภทการคุมขัง: {data.detail?.holdType}</div>
        <div>หน่วยงานที่จับ: {data.detail?.holdAgency}</div>
      </div>
    </div>
  );
}
