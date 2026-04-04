'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const pathname = usePathname();

  // 🔥 detect department จาก path
  const department = pathname.split('/')[1]; // PR หรือ LEGAL

  const fetchData = async () => {
    try {
      let endpoint = '';

      if (department === 'LEGAL') {
        endpoint = '/menu/legalCategories';
      } else if (department === 'PR') {
        endpoint = '/menu/prDepartments';
      }

      const json = await api(endpoint);

      setData(json.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  useEffect(() => {
    if (!department) return;
    fetchData();
  }, [department]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Header />

      <h1 className="text-xl font-bold text-center mb-6">
        {department === 'PR'
          ? 'งานประชาสัมพันธ์'
          : 'ความรู้ทางกฎหมาย'}
      </h1>

      <div className="flex flex-col gap-3">
        {data.map((item: any, index: number) => (
          <a
            key={item.id}
            href={`/${department}/${item.id}`} // 🔥 dynamic แล้ว
            className="flex items-center border rounded-full p-4"
          >
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mr-4">
              {index + 1}
            </div>

            <div className="flex-1 text-center">
              {item.title}
            </div>
          </a>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          ไม่มีข้อมูล
        </div>
      )}
    </div>
  );
}
