'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function DocumentForm({ onClose }: any) {
  const params = useParams();
  const pathname = usePathname();

  // ✅ ดึงจาก params ก่อน
  let department = params?.department as string;
  let mainId = params?.mainId as string;

  // 🔥 fallback กรณี params ไม่มี (เช่น /PR)
  if (!department) {
    const segments = pathname.split('/').filter(Boolean);

    department = segments[0]; // PR / LEGAL
    mainId = segments[1];     // 1-main (ถ้ามี)
  }

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<any>(null);
  const [type, setType] = useState('IMAGE');

  const handleSubmit = async () => {
    console.log('CTX', { department, mainId });

    if (!title || !file || !type) {
      alert('กรอกข้อมูลไม่ครบ');
      return;
    }

    if (!department || !mainId) {
      alert('path ไม่ถูกต้อง (missing department/mainId)');
      return;
    }

    try {
      // STEP 1: upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api('/admin/upload/document', {
        method: 'POST',
        body: formData,
      });

      const fileUrl = uploadRes.data?.url;

      if (!fileUrl) {
        alert('upload failed');
        return;
      }

      // STEP 2: add document
      await api('/admin/add/document', {
        method: 'POST',
        body: JSON.stringify({
          title,
          type,
          department,
          mainId,
          file: fileUrl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('error');
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      <h2 className="text-lg font-bold">เพิ่มเอกสาร</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title"
        className="p-3 rounded bg-black border border-gray-600"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="p-3 rounded bg-black border border-gray-600"
      >
        <option value="IMAGE">IMAGE</option>
        <option value="PDF">PDF</option>
        <option value="VIDEO">VIDEO</option>
      </select>

      <label className="bg-gray-800 p-3 rounded cursor-pointer text-center">
        {file ? file.name : 'เลือกไฟล์'}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="hidden"
        />
      </label>

      <button
        onClick={handleSubmit}
        className="bg-red-600 py-3 rounded font-bold"
      >
        Save
      </button>

      <button onClick={onClose} className="text-gray-400">
        ยกเลิก
      </button>
    </div>
  );
}
