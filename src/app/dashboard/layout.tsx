// src/app/dashboard/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[rgb(239,233,221)]">
      <nav className="bg-[rgb(132,149,105)] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Leu Beauty Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/" className="hover:opacity-80">
              Inicio
            </Link>
            <Link href="/scan" className="hover:opacity-80">
              Escanear
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}