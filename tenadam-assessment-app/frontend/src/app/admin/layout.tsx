"use client";

import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Tenadam Admin</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/admin" className="hover:text-gray-300">Dashboard</Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/orgs" className="hover:text-gray-300">Organizations</Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/analytics" className="hover:text-gray-300">Analytics</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
