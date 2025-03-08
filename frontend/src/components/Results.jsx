import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";

const Results = () => {
  const location = useLocation();
  const { userId, userAnswers } = location.state || {};
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch("http://localhost:8000/analyze_results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userAnswers }),
        });

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
  }, [userId, userAnswers]);

  if (!results) return <p>Loading results...</p>;

  return (
<div className="flex h-screen">
  <div className="w-3/4 p-8 bg-gradient-to-r from-[#45B08C] to-white shadow-md rounded-lg flex flex-col items-center justify-center">
    <div className="bg-white p-10 rounded-lg shadow-lg text-center w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-800">Quiz Results</h2>
      <p className="text-2xl text-gray-700 mt-4">
        🎯 Your Score: <span className="font-bold text-blue-700">{results.score}/10</span>
      </p>
      <p className="text-lg text-gray-600 mt-3">
        Weakness: <span className="font-semibold text-red-500">{results.weakness || "None"}</span>
      </p>
      <p className="mt-4 p-4 bg-gray-100 rounded-lg text-gray-700 shadow-sm">
        📘 Study Material: {results.study_material}
      </p>
    </div>
  </div>
  <div className="w-1/4 h-full p-6 bg-gradient-to-t from-gray-100 to-white shadow-xl flex flex-col items-center">
    <Leaderboard />
  </div>
</div>


  );
};

export default Results;