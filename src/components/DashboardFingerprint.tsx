'use client';
import { useState, useRef, useEffect } from 'react';

// 📌 กำหนด Port เป็น 3010 ตามที่คุณแจ้งไว้
const FINGERPRINT_API = 'http://localhost:3010';

export default function DashboardFingerprint({ onScanSuccess }: { onScanSuccess?: (inmateId: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanStatusText, setScanStatusText] = useState('กำลังเชื่อมต่ออุปกรณ์...');
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleStartIdentify = async () => {
    setIsModalOpen(true);
    setScanState('scanning');
    setScanStatusText('กำลังเตรียมเครื่องสแกน...');

    try {
      // 1. สั่งเริ่มทำงานสแกน
      const res = await fetch(`${FINGERPRINT_API}/stg-lib/identify`);
      if (!res.ok) throw new Error('ไม่สามารถเชื่อมต่อฮาร์ดแวร์ได้');

      // 2. รับ Stream สถานะแบบ Real-time
      const es = new EventSource(`${FINGERPRINT_API}/status-lib/stream`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (Object.keys(data).length > 0) {
            if (data.message_code === "PUTON") {
              const scanTime = data.message_text;
              setScanStatusText(scanTime == 1 ? 'กรุณาวางนิ้วลงที่เครื่องสแกน' : 'ไม่สามารถยืนยันได้ กรุณาวางนิ้วอีกครั้ง');
            } 
            else if (data.message_code === "TAKEOFF") {
              setScanStatusText('กรุณายกนิ้วขึ้น');
            } 
            else if (data.message_code === "FAIL") {
              const scanTime = data.message_text;
              if (scanTime >= 3) {
                setScanState('error');
                setScanStatusText('ตรวจสอบล้มเหลวเกินกำหนด กรุณาลองใหม่');
                es.close();
              }
            } 
            else if (data.message_code === "SUCCESS") {
              const usercode = data.message_text;
              setScanState('success');
              setScanStatusText(`ตรวจสอบเสร็จสิ้น! รหัส: ${usercode}`);
              es.close();
              
              // 3. ปิด Modal อัตโนมัติและส่งรหัสกลับไปให้ Component แม่ทำงานต่อ
              setTimeout(() => {
                setIsModalOpen(false);
                setScanState('idle');
                if (onScanSuccess) onScanSuccess(usercode);
              }, 1500);
            } 
            else if (data.message_code === "NOT_FOUND") {
              setScanState('error');
              setScanStatusText('ไม่พบข้อมูลลายนิ้วมือนี้ในระบบ');
              es.close();
            } 
            else if (data.message_code === "EXCEPTION" || data.message_code === "DEVICE_ERROR") {
              setScanState('error');
              setScanStatusText('พบปัญหาจากอุปกรณ์สแกนนิ้ว กรุณาลองใหม่');
              es.close();
            }
          }
        } catch (error) {
          console.error('Parse error:', error);
        }
      };

      es.onerror = (error) => {
        console.error('SSE Error:', error);
        setScanState('error');
        setScanStatusText('ขาดการเชื่อมต่อกับอุปกรณ์สแกนลายนิ้วมือ');
        es.close();
      };

    } catch (error) {
      setScanState('error');
      setScanStatusText('ไม่สามารถเชื่อมต่อโปรแกรมสแกนลายนิ้วมือได้');
    }
  };

  const handleCancel = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    try {
      await fetch(`${FINGERPRINT_API}/stg-lib/cc-process`);
    } catch (e) {
      console.error("Cancel failed", e);
    }
    setIsModalOpen(false);
    setScanState('idle');
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return (
    <>
      {/* ปุ่มกดสำหรับเรียก Modal สแกนนิ้ว (ปรับแต่ง CSS ได้ตามดีไซน์ Dashboard ของคุณ) */}
      <button 
        onClick={handleStartIdentify}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
        สแกนลายนิ้วมือ
      </button>

      {/* Modal Popup แสดงสถานะ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 flex flex-col items-center shadow-2xl relative">
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              ตรวจสอบลายนิ้วมือ
            </h3>

            {/* อนิเมชั่นสแกนนิ้ว หรือ ไอคอนสถานะ */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-[4px] transition-colors duration-300 ${
              scanState === 'success' ? 'border-green-500 bg-green-50' : 
              scanState === 'error' ? 'border-red-500 bg-red-50' : 
              'border-blue-500 bg-blue-50 animate-pulse'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${
                scanState === 'success' ? 'text-green-500' : 
                scanState === 'error' ? 'text-red-500' : 
                'text-blue-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>

            {/* ข้อความแจ้งสถานะ */}
            <p className={`text-lg font-medium text-center mb-8 min-h-[50px] flex items-center justify-center ${
              scanState === 'success' ? 'text-green-600' : 
              scanState === 'error' ? 'text-red-600' : 
              'text-gray-700'
            }`}>
              {scanStatusText}
            </p>

            {/* ปุ่มยกเลิก / ปิด */}
            <button 
              onClick={handleCancel}
              className={`w-full py-3 rounded-xl text-lg font-bold transition shadow-sm ${
                scanState === 'success' ? 'hidden' : 
                'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {scanState === 'error' ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}