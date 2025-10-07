"use client";

import { useState, useEffect } from "react";
import { baldrigeData } from "@/lib/baldrige-data";
import { useRouter, useSearchParams, useParams } from "next/navigation";

export default function AssessmentItemPage() {
  const params = useParams();
  const item = params.item as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const devMode = searchParams.get("devMode") === "true";

  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState("in_progress");
  const [saveStatus, setSaveStatus] = useState("");
  const assessmentId = "clx9y22g6000008l3g6j2h3k1"; // Hardcoded for now

  const allItems = [
    ...baldrigeData["organizational-profile"],
    ...baldrigeData.categories.flatMap((c) => c.items),
  ];
  const currentItemIndex = allItems.findIndex((i) => i.item === item);

  const itemData = allItems[currentItemIndex];

  useEffect(() => {
    if (!itemData) return;
    const fetchAssessmentData = async () => {
      try {
        const res = await fetch(`/api/admin/assessments/${assessmentId}`);
        if (res.ok) {
          const data = await res.json();
          setAssessmentStatus(data.status);
          const formattedResponses = data.responses.reduce((acc: any, curr: any) => {
            acc[curr.itemCode] = curr.responseText;
            return acc;
          }, {});
          setResponses(formattedResponses);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };

    fetchAssessmentData();
  }, [assessmentId, itemData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  if (!itemData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Item Not Found</h1>
          <p className="text-gray-600 mb-6">The requested assessment item could not be found.</p>
          <button 
            onClick={() => router.push('/assessment')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Assessment
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = assessmentStatus === 'submitted';

  const handleResponseChange = (itemCode: string, value: string) => {
    if (isSubmitted) return;
    setResponses((prev) => ({ ...prev, [itemCode]: value }));
    setIsDirty(true);
    setSaveStatus("Saving...");
  };

  const handleSave = async () => {
    if (!isDirty || isSubmitted) return;
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/assessment/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, responses }),
      });

      if (res.ok) {
        setIsDirty(false);
        setSaveStatus("All changes saved");
        window.dispatchEvent(new CustomEvent('response-saved'));
      } else {
        setSaveStatus("Failed to save");
        alert("Failed to save responses.");
      }
    } catch (error) {
      console.error("Error saving responses:", error);
      setSaveStatus("Failed to save");
      alert("An error occurred while saving responses.");
    }
  };

  const handleBlur = async (itemCode: string, value: string) => {
    if (isSubmitted) return;
    setSaveStatus("Saving...");
    try {
      await fetch("/api/assessment/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, responses: { [itemCode]: value } }),
      });
      setIsDirty(false);
      setSaveStatus("All changes saved");
      window.dispatchEvent(new CustomEvent('response-saved'));
    } catch (error) {
      console.error("Error saving response:", error);
      setSaveStatus("Failed to save");
    }
  };

  const updateCurrentSection = async (newItem: string) => {
    if (isSubmitted) return;
    try {
      await fetch("/api/assessment/current-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, currentSectionKey: newItem }),
      });
    } catch (error) {
      console.error("Error updating current section:", error);
    }
  };

  const handleBack = async () => {
    await handleSave();
    if (currentItemIndex > 0) {
      const prevItem = allItems[currentItemIndex - 1].item;
      await updateCurrentSection(prevItem);
      router.push(`/assessment/${prevItem}`);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    if (currentItemIndex < allItems.length - 1) {
      const nextItem = allItems[currentItemIndex + 1].item;
      await updateCurrentSection(nextItem);
      router.push(`/assessment/${nextItem}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isSubmitted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">This assessment has been submitted and is read-only.</p>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2">{itemData.title}</h1>
      {'points' in itemData && (itemData as any).points && <p className="text-xl text-gray-500 mb-6">({(itemData as any).points} points)</p>}
      
      <div className="space-y-8">
        {itemData.questions.map((q) => (
          <div key={q.itemCode}>
            <h2 className="text-xl font-semibold">{q.itemCode}</h2>
            <p className={`text-gray-600 my-2 ${devMode && q.text.startsWith("(Dummy text)") ? "border-2 border-red-500" : ""}`}>{q.text}</p>
            <textarea
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 disabled:cursor-not-allowed"
              value={responses[q.itemCode] || ""}
              onChange={(e) => handleResponseChange(q.itemCode, e.target.value)}
              onBlur={(e) => handleBlur(q.itemCode, e.target.value)}
              disabled={isSubmitted}
            ></textarea>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button onClick={handleBack} disabled={currentItemIndex === 0 || isSubmitted} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50">
          Back
        </button>
        <span className="text-sm text-gray-500">{saveStatus}</span>
        <div>
          <button onClick={handleSave} disabled={isSubmitted || !isDirty} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50">
            Save
          </button>
          <button onClick={handleSaveAndNext} disabled={currentItemIndex === allItems.length - 1 || isSubmitted} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
}
