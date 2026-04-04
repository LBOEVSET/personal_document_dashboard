'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const menus = [
    {
      title: 'ความรู้ทางกฎหมาย',
      description: 'จัดการเอกสารและสื่อความรู้ทางกฎหมาย',
      path: '/LEGAL',
      icon: '⚖️',
      color: 'from-blue-500/20 to-blue-600/5'
    },
    {
      title: 'ข้อมูลผู้ต้องขัง',
      description: 'ระบบจัดการและสืบค้นประวัติผู้ต้องขัง',
      path: '/inmate',
      icon: '👤',
      color: 'from-orange-500/20 to-orange-600/5'
    },
    {
      title: 'งานประชาสัมพันธ์',
      description: 'จัดการสื่อประชาสัมพันธ์และข่าวสาร',
      path: '/PR',
      icon: '📢',
      color: 'from-green-500/20 to-green-600/5'
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-2">เลือกเมนูที่ต้องการเพื่อเริ่มจัดการระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((m, i) => (
          <div
            key={i}
            onClick={() => router.push(m.path)}
            className={`group relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 hover:border-zinc-600 flex flex-col justify-between min-h-[200px] bg-gradient-to-br ${m.color}`}
          >
            <div>
              <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300 transform origin-left">
                {m.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{m.title}</h2>
              <p className="text-sm text-zinc-400 line-clamp-2">{m.description}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                เข้าจัดการ
              </span>
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}