import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Leaderboard from "./Leaderboard";

const Quiz = ({ userId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:8000/generate_question/${currentIndex + 1}`);
        const data = await response.json();
        setQuestions([...questions, data]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestions();
  }, [currentIndex]);

  const handleAnswerSubmit = async () => {
    if (userAnswers[currentIndex] === undefined) return;

    try {
      const response = await fetch("http://localhost:8000/submit_answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questions[currentIndex].question_id,
          user_answer: userAnswers[currentIndex],
        }),
      });

      const data = await response.json();
      console.log("Answer submitted:", data);

      if (currentIndex < 9) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        navigate("/results", { state: { userId, userAnswers } });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#45B08C] to-white">
    <div className="flex-1 flex items-center justify-center">
      <div className="w-1/2 p-8 bg-white shadow-2xl rounded-xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Question {currentIndex + 1}</h2>
        <p className="text-xl text-gray-700 mt-3 text-center">{questions[currentIndex]?.expression}</p>
  
        <input
          type="number"
          value={userAnswers[currentIndex] || ""}
          onChange={(e) =>
            setUserAnswers({ ...userAnswers, [currentIndex]: parseFloat(e.target.value) })
          }
          className="border border-gray-300 rounded-lg p-3 mt-4 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your answer"
        />
  
        <div className="flex justify-center">
          <button 
            onClick={handleAnswerSubmit} 
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 ease-in-out"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  
    <div className="w-1/4 h-screen p-6 bg-gray-100 shadow-lg flex flex-col items-center">
      <Leaderboard />
    </div>
  </div>
  
  );
};

export default Quiz;
