"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import html2canvas from 'html2canvas';
import { baldrigeData } from "@/lib/baldrige-data";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const itemWeights: { [key: string]: number } = {
  "1.1": 70, "1.2": 50,
  "2.1": 45, "2.2": 40,
  "3.1": 40, "3.2": 45,
  "4.1": 45, "4.2": 45,
  "5.1": 40, "5.2": 45,
  "6.1": 45, "6.2": 40,
  "7.1": 120, "7.2": 80, "7.3": 80, "7.4": 80, "7.5": 90,
};

export default function AnalyticsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<any[]>([]);
  const [orgFilter, setOrgFilter] = useState("all");
  const [viewMode, setViewMode] = useState("Individual");
  
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/admin/analytics", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
          }
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setAssessments(result.data.filter((a: any) => a.scores.length > 0));
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = assessments;
    if (orgFilter !== "all") {
      filtered = assessments.filter(a => a.user.organizationName === orgFilter);
    }
    setFilteredAssessments(filtered);
  }, [assessments, orgFilter]);



  const orgNames = useMemo(() => [...new Set(assessments.map(a => a.user.organizationName))], [assessments]);

  const categoryChartData = useMemo(() => {
    if (viewMode === 'Individual') {
      return filteredAssessments.map(a => ({
        name: `${a.user.organizationName} (${a.id.substring(0, 4)})`,
        ...a.scores[0].categoryTotals
      }));
    } else { // Organization Average
      const orgAvgs: { [key: string]: any } = {};
      filteredAssessments.forEach(a => {
        const org = a.user.organizationName;
        if (!orgAvgs[org]) {
          orgAvgs[org] = { name: org, count: 0 };
          Object.keys(a.scores[0].categoryTotals).forEach(cat => orgAvgs[org][cat] = 0);
        }
        orgAvgs[org].count++;
        Object.keys(a.scores[0].categoryTotals).forEach(cat => {
          orgAvgs[org][cat] += a.scores[0].categoryTotals[cat];
        });
      });
      return Object.values(orgAvgs).map(org => {
        Object.keys(org).forEach(key => {
          if (key !== 'name' && key !== 'count') org[key] /= org.count;
        });
        return org;
      });
    }
  }, [filteredAssessments, viewMode]);

  const itemChartData = useMemo(() => {
    const allItems = baldrigeData.categories.flatMap(c => c.items);
    if (viewMode === 'Individual' && filteredAssessments.length === 1) {
      const assessment = filteredAssessments[0];
      return allItems.map(item => ({
        name: item.item,
        score: assessment.scores[0][`score_${item.item.replace(".", "_")}`] || 0,
      }));
    } else { // Organization Average
      const itemAvgs: { [key: string]: { name: string, score: number, count: number } } = {};
      allItems.forEach(item => itemAvgs[item.item] = { name: item.item, score: 0, count: 0 });

      filteredAssessments.forEach(a => {
        allItems.forEach(item => {
          const score = a.scores[0][`score_${item.item.replace(".", "_")}`];
          if (score != null) {
            itemAvgs[item.item].score += score;
            itemAvgs[item.item].count++;
          }
        });
      });

      return Object.values(itemAvgs).map(item => ({
        name: item.name,
        score: item.count > 0 ? item.score / item.count : 0,
      }));
    }
  }, [filteredAssessments, viewMode]);

  const distributionData = useMemo(() => {
    const bucketSize = 100;
    const buckets = Array.from({ length: 1000 / bucketSize }, (_, i) => ({
      name: `${i * bucketSize + 1}-${(i + 1) * bucketSize}`,
      count: 0,
    }));

    filteredAssessments.forEach(a => {
      const total = a.scores[0].overallTotal;
      if (total != null) {
        const bucketIndex = Math.floor(total / bucketSize);
        if (buckets[bucketIndex]) {
          buckets[bucketIndex].count++;
        }
      }
    });

    return buckets;
  }, [filteredAssessments]);

  const downloadChart = (chartRef: any, filename: string) => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="flex space-x-4 mb-6">
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)} className="p-2 border rounded">
          <option value="all">All Organizations</option>
          {orgNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <select value={viewMode} onChange={e => setViewMode(e.target.value)} className="p-2 border rounded">
          <option>Individual</option>
          <option>Organization</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow" ref={chart1Ref}>
          <h2 className="text-xl font-bold mb-4">Category Totals</h2>
          <button onClick={() => downloadChart(chart1Ref, 'category-totals.png')} className="mb-2 bg-gray-200 px-2 py-1 rounded">Download</button>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categoryChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              <Radar name="Cat 1" dataKey="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow" ref={chart2Ref}>
          <h2 className="text-xl font-bold mb-4">Item Scores</h2>
           <button onClick={() => downloadChart(chart2Ref, 'item-scores.png')} className="mb-2 bg-gray-200 px-2 py-1 rounded">Download</button>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2" ref={chart3Ref}>
          <h2 className="text-xl font-bold mb-4">Overall Score Distribution</h2>
           <button onClick={() => downloadChart(chart3Ref, 'score-distribution.png')} className="mb-2 bg-gray-200 px-2 py-1 rounded">Download</button>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


  
