'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const menus = [
    {
      title: 'ความรู้ทางกฎหมาย',
      path: '/LEGAL',
    },
    {
      title: 'ข้อมูลผู้ต้องขัง',
      path: '/inmate',
    },
    {
      title: 'งานประชาสัมพันธ์',
      path: '/PR',
    },
  ];

  return (
    <div className="p-6 grid gap-4">
      {menus.map((m, i) => (
        <div
          key={i}
          className="shadow-lg rounded-xl p-6 cursor-pointer"
          onClick={() => router.push(m.path)}
        >
          <h2 className="text-lg font-bold mb-3">{m.title}</h2>
          <button className="bg-red-600 text-white px-4 py-2 rounded">
            เข้าใช้ →
          </button>
        </div>
      ))}
    </div>
  );
}
