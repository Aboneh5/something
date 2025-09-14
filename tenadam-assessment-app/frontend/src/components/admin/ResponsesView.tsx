import { baldrigeData } from "@/lib/baldrige-data";

export default function ResponsesView({ assessment }: { assessment: any }) {
  return (
    <div>
      {baldrigeData["organizational-profile"].map((item) => (
        <div key={item.item} className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold">{item.item} {item.title}</h3>
          <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded">
            {item.questions.map((q) => {
              const response = assessment.responses.find((r: any) => r.itemCode === q.itemCode);
              return (
                <div key={q.itemCode}>
                  <p className="font-semibold">{q.itemCode}: {q.text}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{response?.responseText || "No response"}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {baldrigeData.categories.map((category) => (
        <div key={category.category} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Category {category.category}: {category.title}</h2>
          {category.items.map((item) => (
            <div key={item.item} className="mb-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold">{item.item} {item.title}</h3>
              <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded">
                {item.questions.map((q) => {
                  const response = assessment.responses.find((r: any) => r.itemCode === q.itemCode);
                  return (
                    <div key={q.itemCode}>
                      <p className="font-semibold">{q.itemCode}: {q.text}</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{response?.responseText || "No response"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
