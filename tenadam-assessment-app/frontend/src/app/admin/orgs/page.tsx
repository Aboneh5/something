"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrgs = async () => {
      const res = await fetch("/api/admin/orgs");
      if (res.ok) setOrgs(await res.json());
    };

    fetchOrgs();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organizations</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Organization</th>
              <th className="text-left py-2">Users</th>
              <th className="text-left py-2">Submitted Assessments</th>
              <th className="text-left py-2">Average Score</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.organizationName} className="border-b hover:bg-gray-50">
                <td className="py-2">{org.organizationName}</td>
                <td className="py-2">{org.userCount}</td>
                <td className="py-2">{org.submittedCount}</td>
                <td className="py-2">{org.averageScore > 0 ? org.averageScore : "N/A"}</td>
                <td className="py-2">
                  <Link href={`/admin/assessments?org=${encodeURIComponent(org.organizationName)}`} className="text-blue-500 hover:underline">
                    View Assessments
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
