"use client";

import { useState, useEffect, useMemo } from "react";
import { baldrigeData } from "@/lib/baldrige-data";
import Tabs from "@/components/admin/Tabs";
import ResponsesView from "@/components/admin/ResponsesView";

const ADLI_TOOLTIP = "Approach, Deployment, Learning, Integration";
const LETCI_TOOLTIP = "Levels, Trends, Comparisons, Integration";

const itemWeights: { [key: string]: number } = {
  "1.1": 70, "1.2": 50,
  "2.1": 45, "2.2": 40,
  "3.1": 40, "3.2": 45,
  "4.1": 45, "4.2": 45,
  "5.1": 40, "5.2": 45,
  "6.1": 45, "6.2": 40,
  "7.1": 120, "7.2": 80, "7.3": 80, "7.4": 80, "7.5": 90,
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function AdminAssessmentPage({ params }: PageProps) {
  const { id } = params;
  const [assessment, setAssessment] = useState<any>(null);
  const [scores, setScores] = useState<{ [key: string]: number | null }>({});

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`/api/admin/assessments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
        if (data.scores.length > 0) {
          const initialScores = { ...data.scores[0] };
          delete initialScores.id;
          delete initialScores.assessmentId;
          setScores(initialScores);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    }
  };

  const handleScoreChange = (item: string, value: string) => {
    const percentage = value === '' ? null : Math.max(0, Math.min(100, Number(value)));
    setScores((prev) => ({ ...prev, [`score_${item.replace(".", "_")}`]: percentage }));
  };

  const calculatedTotals = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    let overallTotal = 0;

    baldrigeData.categories.forEach(category => {
      let categoryTotal = 0;
      category.items.forEach(item => {
        const scorePercent = scores[`score_${item.item.replace(".", "_")}`];
        if (scorePercent != null) {
          const itemPoints = Math.round((scorePercent / 100) * itemWeights[item.item]);
          categoryTotal += itemPoints;
        }
      });
      categoryTotals[category.category] = categoryTotal;
      overallTotal += categoryTotal;
    });

    return { categoryTotals, overallTotal };
  }, [scores]);

  const handleSaveScores = async () => {
    try {
      const res = await fetch(`/api/admin/scores/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores, ...calculatedTotals, scoredByUserId: "clx9y22g6000008l3g6j2h3k1", scoredAt: new Date() }), // Hardcoded user id
      });
      if (res.ok) {
        alert('Scores saved successfully!');
      } else {
        alert('Failed to save scores.');
      }
    } catch (error) {
      console.error('Error saving scores:', error);
      alert('An error occurred while saving scores.');
    }
  };

  const handleReopenAssessment = async () => {
    if (!confirm("Are you sure you want to reopen this assessment?")) return;

    try {
      const res = await fetch(`/api/admin/assessments/${id}/reopen`, { method: 'POST' });
      if (res.ok) {
        fetchAssessment(); // Refresh assessment data
      } else {
        alert('Failed to reopen assessment.');
      }
    } catch (error) {
      console.error('Error reopening assessment:', error);
    }
  };

  if (!assessment) {
    return <div>Loading...</div>;
  }

  const scoringContent = (
    <div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 sticky top-4 z-10">
        <h2 className="text-2xl font-bold mb-4">Score Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {baldrigeData.categories.map(cat => (
            <div key={cat.category} className="p-2">
              <h4 className="font-semibold">Category {cat.category}:</h4>
              <span>{calculatedTotals.categoryTotals[cat.category] || 0} / {cat.items.reduce((acc, item) => acc + itemWeights[item.item], 0)}</span>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 text-center mt-4">
            <h3 className="text-xl font-bold">Overall Total: {calculatedTotals.overallTotal} / 1000</h3>
          </div>
        </div>
      </div>

      {baldrigeData.categories.map((category) => (
        <div key={category.category} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Category {category.category}: {category.title}</h2>
          {category.items.map((item) => {
            const scorePercent = scores[`score_${item.item.replace(".", "_")}`];
            const itemPoints = scorePercent != null ? Math.round((scorePercent / 100) * itemWeights[item.item]) : 0;
            return (
              <div key={item.item} className="mb-6 p-4 border rounded-lg">
                <h3 className="text-xl font-semibold">{item.item} {item.title} ({itemPoints} / {itemWeights[item.item]} pts)</h3>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <label className="font-semibold mr-2">Score (%):</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={scorePercent ?? ''}
                      onChange={(e) => handleScoreChange(item.item, e.target.value)}
                      className="w-24 p-1 border rounded"
                    />
                    <div className="relative ml-2 group">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div className="absolute bottom-full mb-2 w-64 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {category.category === '7' ? LETCI_TOOLTIP : ADLI_TOOLTIP}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <button onClick={handleSaveScores} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded fixed bottom-8 right-8">
        Save Scores
      </button>
    </div>
  );

  const tabs = [
    { label: 'Responses', content: <ResponsesView assessment={assessment} /> },
    { label: 'Scoring', content: scoringContent },
    import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ... (rest of the imports)

// ... (rest of the component)

  const handleGeneratePdf = () => {
    const doc = new jsPDF();

    // Header
    doc.text("Tenadam Assessment Report", 14, 20);
    doc.text(`Organization: ${assessment.organizationName}`, 14, 30);
    doc.text(`User: ${assessment.user.fullName}`, 14, 40);
    doc.text(`Submitted: ${new Date(assessment.submittedAt).toLocaleDateString()}`, 14, 50);

    // Responses
    const responsesBody = baldrigeData.categories.flatMap(category => 
      category.items.flatMap(item => 
        item.questions.map(q => {
          const response = assessment.responses.find((r: any) => r.itemCode === q.itemCode);
          return [q.itemCode, q.text, response?.responseText || "No response"];
        })
      )
    );

    (doc as any).autoTable({
      startY: 60,
      head: [['Item Code', 'Question', 'Response']],
      body: responsesBody,
    });

    // Scores Summary
    const scoresBody = baldrigeData.categories.map(cat => {
      const categoryTotal = calculatedTotals.categoryTotals[cat.category] || 0;
      const maxPoints = cat.items.reduce((acc, item) => acc + itemWeights[item.item], 0);
      return [`Category ${cat.category}`, `${categoryTotal} / ${maxPoints}`];
    });
    scoresBody.push(['Overall Total', `${calculatedTotals.overallTotal} / 1000`]);

    (doc as any).autoTable({
      head: [['Category', 'Score']],
      body: scoresBody,
    });

    const today = new Date();
    const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");
    const orgName = assessment.organizationName.replace(/\s+/g, '_');
    const userName = assessment.user.fullName.replace(/\s+/g, '_');
    const fileName = `Tenadam_Baldrige_Assessment_${orgName}_${userName}_${yyyymmdd}.pdf`;

    doc.save(fileName);

    // TODO: Upload PDF and save URL
  };

  const reportContent = (
    <div>
      <button onClick={handleGeneratePdf} disabled={assessment.status !== 'submitted'} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
        Generate PDF Report
      </button>
      {assessment.status !== 'submitted' && <p className="text-sm text-red-500 mt-2">Assessment must be submitted to generate a report.</p>}
    </div>
  );

  const tabs = [
    { label: 'Responses', content: <ResponsesView assessment={assessment} /> },
    { label: 'Scoring', content: scoringContent },
    { label: 'Report', content: reportContent },
  ];

// ... (rest of the component)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assessment: {assessment.organizationName}</h1>
        {assessment.status === 'submitted' && (
          <button onClick={handleReopenAssessment} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Reopen Assessment
          </button>
        )}
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
