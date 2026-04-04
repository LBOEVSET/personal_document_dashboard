'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function InmateForm({ defaultValue, onClose }: any) {
  const isEdit = !!defaultValue;

  const [form, setForm] = useState<any>({
    id: '',
    name: '',
    status: '',
    cases: 0,
    caseType: '',
    category: '',
    sentence: '',
    startDate: '',
    releaseDate: '',
    imprisonDate: '',
    endDate: '',
    lastDate: '',
    sequestrationType: '',
    department: '',
    transferFrom: '',
    progressStep: 1,
    isVerified: false,
    detail: {
      age: '',
      nationality: '',
      religion: '',
      holdType: '',
      holdAgency: '',
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    if (defaultValue) {
      setForm({
        ...defaultValue,
        startDate: defaultValue.startDate?.slice(0, 10),
        releaseDate: defaultValue.releaseDate?.slice(0, 10),
        imprisonDate: defaultValue.imprisonDate?.slice(0, 10) || '',
        endDate: defaultValue.endDate?.slice(0, 10) || '',
        lastDate: defaultValue.lastDate?.slice(0, 10) || '',
      });
    }
  }, [defaultValue]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleDetailChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      detail: { ...prev.detail, [key]: value },
    }));
  };

  const genMockId = () => {
    return 'mock-' + Math.random().toString(36).substring(2, 10);
  };

  const handleSubmit = async () => {
    try {
      let imagePath = form.profileImage;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api('/admin/upload/profileImage?userType=inmate', {
          method: 'POST',
          body: formData,
        });

        imagePath = res.data?.url;
      }

      const payload = {
        ...form,
        id: form.id || genMockId(),
        userId: form.id || genMockId(),
        profileImage: imagePath,
        secret: 'super_secret_admin_registration_key',
      };

      if (isEdit) {
        await api(`/admin/update/inmate/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await api('/auth/register/inmate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      alert('สำเร็จ');
      onClose();
    } catch (err) {
      console.error(err);
      alert('error');
    }
  };

  const genUserId = () => {
    return 'finger-' + Math.random().toString(36).substring(2, 10);
  };

  const handleScanSubmit = async () => {
    try {
      //!MOCK FINGERPRINT REGISTER
      const userId = genUserId();

      await api('/auth/verify-register/inmate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          id: form.id,
          name: form.name,
        }),
      });

      // 🔥 update UI ทันที
      setForm((prev: any) => ({
        ...prev,
        isVerified: true,
      }));

      alert('ผูกลายนิ้วมือสำเร็จ');
      setShowScan(false);
    } catch (err) {
      console.error(err);
      alert('scan failed');
    }
  };

  return (
    <div className="flex flex-col gap-5 text-black">
      <h2 className="text-lg font-bold">
        {isEdit ? 'แก้ไขข้อมูลผู้ต้องขัง' : 'เพิ่มผู้ต้องขัง'}
      </h2>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onClose} className="text-gray-500">
          ← กลับ
        </button>

        <button
          disabled={form.isVerified}
          onClick={() => {
            if (form.isVerified) return;
            setShowScan(true);
          }}
          className={`px-3 py-1 rounded ${
            form.isVerified
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white'
          }`}
        >
          {form.isVerified ? 'ยืนยันแล้ว' : '🖐 สแกนนิ้ว'}
        </button>
      </div>

      {/* BASIC */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold">ข้อมูลพื้นฐาน</div>

        <input
          placeholder="ชื่อ"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input"
        />

        <input
          placeholder="รหัสผู้ต้องขัง"
          value={form.id}
          onChange={(e) => handleChange('id', e.target.value)}
          readOnly={isEdit || form.isVerified}
          className="input bg-gray-100"
        />

        <input
          placeholder="ประเภทผู้ต้องขัง"
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="input"
        />
      </div>

      {/* CASE */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold">ข้อมูลคดี</div>

        <input
          placeholder="สถานะ"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="input"
        />

        <div className="field">
          <label className="label">จำนวนคดี</label>
          <input
            type="number"
            value={form.cases}
            onChange={(e) => handleChange('cases', +e.target.value)}
            className="input"
          />
        </div>

        <input
          placeholder="ประเภทคดี"
          value={form.caseType}
          onChange={(e) => handleChange('caseType', e.target.value)}
          className="input"
        />

        <input
          placeholder="โทษ"
          value={form.sentence}
          onChange={(e) => handleChange('sentence', e.target.value)}
          className="input"
        />
      </div>

      {/* DATE */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold">วันที่</div>

        <input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="input" />
        <input type="date" value={form.releaseDate} onChange={(e) => handleChange('releaseDate', e.target.value)} className="input" />
        <input type="date" value={form.imprisonDate} onChange={(e) => handleChange('imprisonDate', e.target.value)} className="input" />
        <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="input" />
        <input type="date" value={form.lastDate} onChange={(e) => handleChange('lastDate', e.target.value)} className="input" />
      </div>

      {/* DETAIL */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold">ข้อมูลเพิ่มเติม (บุคคล)</div>

        <input placeholder="อายุ" value={form.detail?.age} onChange={(e) => handleDetailChange('age', e.target.value)} className="input" />
        <input placeholder="สัญชาติ" value={form.detail?.nationality} onChange={(e) => handleDetailChange('nationality', e.target.value)} className="input" />
        <input placeholder="ศาสนา" value={form.detail?.religion} onChange={(e) => handleDetailChange('religion', e.target.value)} className="input" />
        <input placeholder="ประเภทอายัด" value={form.detail?.holdType} onChange={(e) => handleDetailChange('holdType', e.target.value)} className="input" />
        <input placeholder="หน่วยงานที่อายัด" value={form.detail?.holdAgency} onChange={(e) => handleDetailChange('holdAgency', e.target.value)} className="input" />
      </div>

      {/* IMAGE */}
      <label className="bg-gray-200 p-3 rounded text-center cursor-pointer">
        {file ? file.name : 'เลือกภาพ'}
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
      </label>

      <button onClick={handleSubmit} className="bg-red-600 text-white py-3 rounded font-bold">
        Save
      </button>

      <button onClick={onClose} className="text-gray-500">
        ยกเลิก
      </button>

      {/* SCAN MODAL */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[320px] text-center">
            <div className="text-lg font-bold mb-4">
              สแกนลายนิ้วมือ
            </div>

            <div className="border rounded-lg p-6 mb-4">
              🖐 กรุณาวางนิ้ว (mock)
            </div>

            <button
              onClick={handleScanSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
            >
              ยืนยันสแกน
            </button>

            <button
              onClick={() => setShowScan(false)}
              className="text-gray-500"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
