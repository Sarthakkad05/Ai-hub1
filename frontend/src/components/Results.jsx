import React, { useEffect, useState } from "react";

const Result = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/finish_quiz")
      .then((response) => response.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
        console.log(data)
      })
      .catch((error) => console.error("Error fetching results:", error));
  }, []);

  if (loading) return <p>Loading results...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Quiz Results{result.quiz_score}</h2>
      <p>Difficulty Level: {result.overall_weakness}</p>
      <p>Feedback: {result.study_material}</p>
    </div>
  );
};

export default Result;

