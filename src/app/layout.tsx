import './globals.css';
import Header from '@/components/Header';
import FloatingBackButton from '@/components/FloatingBackButton'; // ปรับ path ให้ตรงกับที่เซฟไว้

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  
  return (
    <html lang="th">
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        {/* 🔥 HEADER FIXED */}
        <Header />

        {/* CONTENT */}
          <FloatingBackButton />
        <main className="pt-20 flex-grow pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}

