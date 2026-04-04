import './globals.css';
import Header from '@/components/Header';

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
        <main className="pt-20 flex-grow pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}