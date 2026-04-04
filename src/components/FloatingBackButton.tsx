'use client';

export default function FloatingBackButton() {
  return (
    <a
      href="http://localhost:3000/main-menu"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999, // ดันให้อยู่หน้าสุดเสมอ
        backgroundColor: '#801e1d', // สีแดงทัณฑสถาน
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: 'bold',
        fontSize: '18px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      // ถ้าระบบ Dashboard มี Tailwind CSS ให้ใช้คลาสข้างล่างนี้แทน style ด้านบนได้เลย
      className="hover:scale-105 hover:bg-[#6b1817]"
    >
      <span style={{ fontSize: '24px', lineHeight: '1' }}>&larr;</span> 
      กลับสู่หน้า Kiosk
    </a>
  );
}