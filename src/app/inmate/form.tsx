'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardFingerprint from '@/components/DashboardFingerprint'; // 📌 นำเข้า Component สแกนนิ้วมือจริง

export default function InmateForm({ defaultValue, onClose }: any) {
  const isEdit = !!defaultValue;

  const [form, setForm] = useState<any>({
    id: '', name: '', status: '', cases: 0, caseType: '', category: '', sentence: '',
    startDate: '', releaseDate: '', imprisonDate: '', endDate: '', lastDate: '',
    transferFrom: '', progressStep: 1, isVerified: false,
    detail: { age: '', nationality: '', religion: '', holdType: '', holdAgency: '' },
  });

  const [file, setFile] = useState<File | null>(null);

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

  const handleChange = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));
  const handleDetailChange = (key: string, value: any) => setForm((prev: any) => ({ ...prev, detail: { ...prev.detail, [key]: value } }));

  const genMockId = () => 'mock-' + Math.random().toString(36).substring(2, 10);

  const handleSubmit = async () => {
    try {
      let imagePath = form.profileImage;
      if (file) {
        const formData = new FormData(); formData.append('file', file);
        const res = await api('/admin/upload/profileImage?userType=inmate', { method: 'POST', body: formData });
        imagePath = res.data?.url;
      }
      const payload = { ...form, id: form.id || genMockId(), userId: form.id || genMockId(), profileImage: imagePath, secret: 'super_secret_admin_registration_key' };

      if (isEdit) await api(`/admin/update/inmate/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      else await api('/auth/register/inmate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      alert('สำเร็จ'); onClose();
    } catch (err) { console.error(err); alert('error'); }
  };

  // ================= FINGERPRINT SUCCESS =================
  const handleScanSuccess = async (scannedId: string) => {
    try {
      await api('/auth/verify-register/inmate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userId: scannedId, id: form.id, name: form.name }) 
      });
      setForm((prev: any) => ({ ...prev, isVerified: true }));
      alert(form.isVerified ? 'แก้ไขลายนิ้วมือสำเร็จ' : 'ผูกลายนิ้วมือสำเร็จ');
    } catch (err) { 
      console.error(err); 
      alert('ผูกลายนิ้วมือล้มเหลว'); 
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 p-2">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white">{isEdit ? 'แก้ไขข้อมูลผู้ต้องขัง' : 'เพิ่มผู้ต้องขังใหม่'}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">✕ ปิด</button>
      </div>

      <div className="flex justify-end">
         {/* 📌 เรียกใช้ Component เครื่องสแกนนิ้วมือ */}
         <DashboardFingerprint onScanSuccess={handleScanSuccess} />
      </div>

      {/* BASIC */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="font-bold text-lg border-b border-zinc-800 pb-2 mb-2">ข้อมูลพื้นฐาน</div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">ชื่อ - สกุล</label>
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-modern" />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">รหัสผู้ต้องขัง</label>
          <input value={form.id} onChange={(e) => handleChange('id', e.target.value)} readOnly={isEdit || form.isVerified} className="input-modern bg-zinc-800/50 text-zinc-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">ประเภท</label>
          <input value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="input-modern" />
        </div>
      </div>

      {/* CASE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="font-bold text-lg border-b border-zinc-800 pb-2 mb-2">ข้อมูลคดี</div>
        <div>
           <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">สถานะ</label>
           <input value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input-modern" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">จำนวนคดี</label>
              <input type="number" value={form.cases} onChange={(e) => handleChange('cases', +e.target.value)} className="input-modern" />
           </div>
           <div>
              <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">ประเภทคดี</label>
              <input value={form.caseType} onChange={(e) => handleChange('caseType', e.target.value)} className="input-modern" />
           </div>
        </div>
        <div>
           <label className="text-xs text-zinc-400 mb-1 block uppercase tracking-wide">กำหนดโทษ</label>
           <input value={form.sentence} onChange={(e) => handleChange('sentence', e.target.value)} className="input-modern" />
        </div>
      </div>

      {/* DATES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="font-bold text-lg border-b border-zinc-800 pb-2 mb-2">ข้อมูลวันที่</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs text-zinc-400 mb-1 block">วันที่รับตัว</label><input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="input-modern" /></div>
          <div><label className="text-xs text-zinc-400 mb-1 block">พ้นโทษกักขัง</label><input type="date" value={form.releaseDate} onChange={(e) => handleChange('releaseDate', e.target.value)} className="input-modern" /></div>
          <div><label className="text-xs text-zinc-400 mb-1 block">กักขังนับแต่</label><input type="date" value={form.imprisonDate} onChange={(e) => handleChange('imprisonDate', e.target.value)} className="input-modern" /></div>
          <div><label className="text-xs text-zinc-400 mb-1 block">วันพ้นโทษคดีสุดท้าย</label><input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="input-modern" /></div>
        </div>
        <div><label className="text-xs text-zinc-400 mb-1 block">วันที่(คดีถึงที่สุด)เด็ดขาดคดีแรก</label><input type="date" value={form.lastDate} onChange={(e) => handleChange('lastDate', e.target.value)} className="input-modern" /></div>
      </div>

      {/* DETAIL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="font-bold text-lg border-b border-zinc-800 pb-2 mb-2">ข้อมูลส่วนบุคคล</div>
        <div className="grid grid-cols-2 gap-4">
           <div><label className="text-xs text-zinc-400 mb-1 block">อายุ</label><input value={form.detail?.age} onChange={(e) => handleDetailChange('age', e.target.value)} className="input-modern" /></div>
           <div><label className="text-xs text-zinc-400 mb-1 block">สัญชาติ</label><input value={form.detail?.nationality} onChange={(e) => handleDetailChange('nationality', e.target.value)} className="input-modern" /></div>
        </div>
        <div><label className="text-xs text-zinc-400 mb-1 block">ศาสนา</label><input value={form.detail?.religion} onChange={(e) => handleDetailChange('religion', e.target.value)} className="input-modern" /></div>
        <div><label className="text-xs text-zinc-400 mb-1 block">ประเภทอายัด</label><input value={form.detail?.holdType} onChange={(e) => handleDetailChange('holdType', e.target.value)} className="input-modern" /></div>
        <div><label className="text-xs text-zinc-400 mb-1 block">หน่วยงานที่อายัด</label><input value={form.detail?.holdAgency} onChange={(e) => handleDetailChange('holdAgency', e.target.value)} className="input-modern" /></div>
      </div>

      {/* IMAGE */}
      <label className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-center cursor-pointer hover:bg-zinc-700 transition-colors">
        {file ? file.name : '📸 อัปโหลดรูปภาพผู้ต้องขัง'}
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
      </label>

      <div className="flex gap-4 mt-4">
        <button onClick={onClose} className="btn-primary bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex-1">ยกเลิก</button>
        <button onClick={handleSubmit} className="btn-primary bg-blue-600 hover:bg-blue-500 text-white flex-1">บันทึกข้อมูล</button>
      </div>
    </div>
  );
}