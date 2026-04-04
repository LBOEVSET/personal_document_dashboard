import './globals.css';
import Header from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-black text-white">
        {/* 🔥 HEADER FIXED */}
        <Header />

        {/* CONTENT */}
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
