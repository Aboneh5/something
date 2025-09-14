"use client";

import { useState, useEffect } from "react";
import { baldrigeData } from "@/lib/baldrige-data";

export default function AssessmentSubmitPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [missingResponses, setMissingResponses] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const assessmentId = "clx9y22g6000008l3g6j2h3k1"; // Hardcoded for now

  const allQuestions = [
    ...baldrigeData["organizational-profile"].flatMap((i) => i.questions),
    ...baldrigeData.categories.flatMap((c) => c.items.flatMap((i) => i.questions)),
  ];

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/admin/assessments/${assessmentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'submitted') {
            setIsSubmitted(true);
          }
          setResponses(data.responses);

          const missing = allQuestions
            .filter((q) => {
              const response = data.responses.find((r: any) => r.itemCode === q.itemCode);
              return !response || response.responseText.trim() === "";
            })
            .map((q) => q.itemCode);
          setMissingResponses(missing);
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      }
    };

    fetchAssessment();
  }, [assessmentId, allQuestions]);

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        if (data.missingItems) {
          setMissingResponses(data.missingItems);
        }
        alert("Failed to submit assessment. Please check for missing responses.");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("An error occurred while submitting the assessment.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Assessment Submitted</h1>
        <p className="text-lg">Your assessment is complete. The Tenadam team will review your responses and communicate your results.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit Assessment</h1>
      
      {missingResponses.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h2 className="text-xl font-semibold mb-2">Missing Responses</h2>
          <p>The following items have not been answered:</p>
          <ul className="list-disc list-inside mt-2">
            {missingResponses.map((itemCode) => (
              <li key={itemCode}>{itemCode}</li>
            ))}
          </ul>
          
        </div>
      )}

      {missingResponses.length === 0 && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="text-xl font-semibold">All questions answered!</h2>
          <p>You can now submit your assessment.</p>
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={missingResponses.length > 0} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Assessment
      </button>
    </div>
  );
}
