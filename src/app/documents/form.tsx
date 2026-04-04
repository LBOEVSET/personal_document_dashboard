'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { uploadDocument, createDocument } from '@/lib/api';

export default function DocumentForm({ onClose }: any) {
  const params = useParams();
  const pathname = usePathname();

  let department = params?.department as string;
  let mainId = params?.mainId as string;

  if (!department) {
    const segments = pathname.split('/').filter(Boolean);
    department = segments[0];
    mainId = segments[1];
  }

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<any>(null);
  const [type, setType] = useState<'IMAGE' | 'PDF' | 'VIDEO'>('IMAGE');

  const handleSubmit = async () => {
    if (!title || !file || !type) return alert('กรอกข้อมูลไม่ครบ');
    if (!department || !mainId) return alert('path ไม่ถูกต้อง (missing department/mainId)');

    try {
      // ✅ ใช้ helper ที่ถูกต้อง (ส่ง field ครบ)
      const uploadRes = await uploadDocument(file, {
        department,
        mainId,
      });

      const fileUrl = uploadRes.data?.url;

      if (!fileUrl) return alert('upload failed');

      // ✅ create document
      await createDocument({
        title,
        type,
        department: department as any,
        mainId,
        file: fileUrl,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('error');
    }
  };

  return (
    <div className="flex flex-col gap-5 text-zinc-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white">เพิ่มเอกสารใหม่</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">ชื่อเอกสาร</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ระบุชื่อเอกสาร"
          className="input-modern"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">ประเภทไฟล์</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="input-modern appearance-none"
        >
          <option value="IMAGE">🖼️ รูปภาพ (IMAGE)</option>
          <option value="PDF">📄 เอกสาร (PDF)</option>
          <option value="VIDEO">🎥 วิดีโอ (VIDEO)</option>
        </select>
      </div>

      <label className="bg-zinc-800 border border-zinc-700 border-dashed p-6 mt-2 rounded-xl cursor-pointer text-center hover:bg-zinc-700 transition-colors flex flex-col items-center justify-center gap-2">
        <span className="text-2xl">📤</span>
        <span className="text-sm font-medium text-zinc-300">
          {file ? file.name : 'คลิกเพื่อเลือกไฟล์'}
        </span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="hidden"
        />
      </label>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onClose}
          className="btn-primary flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          ยกเลิก
        </button>

        <button
          onClick={handleSubmit}
          className="btn-primary flex-1 bg-blue-600 hover:bg-blue-500 text-white"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}
