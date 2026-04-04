'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; // 🔥 1. Import Link ของ Next.js

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // 🔥 2. เพิ่ม Loading State
  const pathname = usePathname();
  const department = pathname.split('/')[1];

  useEffect(() => {
    if (!department) return;
    
    const fetchData = async () => {
      setLoading(true); // เริ่มโหลด
      try {
        let endpoint = department === 'LEGAL' ? '/menu/legalCategories' : '/menu/prDepartments';
        
        // 🔥 3. ใส่ Timestamp ตรงนี้แทน เพื่อป้องกัน Next.js/Browser จำ Cache โดยไม่ติด CORS
        const json = await api(`${endpoint}?t=${Date.now()}`);
        
        setData(json.data || []);
      } catch (err) { 
        console.error(err); 
        setData([]); 
      } finally {
        setLoading(false); // โหลดเสร็จแล้ว
      }
    };
    
    fetchData();
  }, [department]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-10 mt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 text-3xl mb-4">
          {department === 'PR' ? '📢' : '⚖️'}
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {department === 'PR' ? 'งานประชาสัมพันธ์' : 'ความรู้ทางกฎหมาย'}
        </h1>
        <p className="text-zinc-400 mt-2">เลือกหมวดหมู่ที่ต้องการจัดการ</p>
      </div>

      {/* 🔥 4. ครอบด้วย Condition Loading */}
      {loading ? (
        <div className="text-center py-16 text-zinc-400 text-lg">
          ⏳ กำลังโหลดข้อมูล...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((item: any, index: number) => (
              <Link // 🔥 5. เปลี่ยนจาก <a> เป็น <Link> 
                key={item.id}
                href={`/${department}/${item.id}`}
                className="group flex items-center bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 rounded-2xl p-4 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-blue-600 text-zinc-400 group-hover:text-white flex items-center justify-center mr-4 transition-colors font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 font-medium text-lg text-zinc-200 group-hover:text-white transition-colors">
                  {item.title}
                </div>
                <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</div>
              </Link>
            ))}
          </div>

          {data.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed mt-8">
              <div className="text-zinc-500 text-xl">ยังไม่มีหมวดหมู่</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}