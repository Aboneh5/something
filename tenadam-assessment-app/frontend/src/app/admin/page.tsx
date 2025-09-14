"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<any>({});
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchKpis = async () => {
      const res = await fetch("/api/admin/kpis");
      if (res.ok) setKpis(await res.json());
    };

    const fetchRecentSubmissions = async () => {
      const res = await fetch("/api/admin/recent-submissions");
      if (res.ok) setRecentSubmissions(await res.json());
    };

    fetchKpis();
    fetchRecentSubmissions();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Organizations</h3>
          <p className="text-3xl font-bold">{kpis.totalOrgs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Assessments</h3>
          <p className="text-3xl font-bold">{kpis.totalAssessments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Submitted</h3>
          <p className="text-3xl font-bold">{kpis.submittedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">In Progress</h3>
          <p className="text-3xl font-bold">{kpis.inProgressCount}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Organization</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Submitted At</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((assessment) => (
                <tr key={assessment.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{assessment.user.organizationName}</td>
                  <td className="py-2">{assessment.user.fullName}</td>
                  <td className="py-2">{new Date(assessment.submittedAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    <Link href={`/admin/assessments/${assessment.id}/scoring`} className="text-blue-500 hover:underline">Score</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
