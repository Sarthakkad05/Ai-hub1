import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Leaderboard from "./Leaderboard";

const API_BASE_URL = "http://127.0.0.1:8000";

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/generate_question/${currentIndex + 1}`);
        const data = await response.json();
        setQuestions((prevQuestions) => [...prevQuestions, data]);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [currentIndex]);

  const handleAnswerSubmit = async () => {
    if (userAnswers[currentIndex] === undefined) return;
    try {
      const response = await fetch(`${API_BASE_URL}/submit_answer`, {
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
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleEndQuiz = () => {
    navigate("/results", { state: { userId, userAnswers } });
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-r from-[#45B08C] to-white"
      }`}
    >
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`w-1/2 p-8 rounded-xl shadow-2xl transition-all duration-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white"
          }`}
        >
          <h2 className="text-3xl font-bold text-center">Question {currentIndex + 1}</h2>
          <p className="text-xl mt-3 text-center">{questions[currentIndex]?.expression}</p>
          <input
            type="number"
            value={userAnswers[currentIndex] || ""}
            onChange={(e) =>
              setUserAnswers({ ...userAnswers, [currentIndex]: parseFloat(e.target.value) })
            }
            className={`border rounded-lg p-3 mt-4 w-full text-lg focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Enter your answer"
          />
          <div className="flex justify-center">
            {currentIndex < 9 ? (
              <button
                onClick={handleAnswerSubmit}
                className={`mt-6 px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  darkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleEndQuiz}
                className="mt-6 px-6 py-3 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
              >
                End Quiz
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className={`w-1/4 h-screen p-6 shadow-lg flex flex-col items-center transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-100"
        }`}
      >
        <Leaderboard />
      </div>
    </div>
  );
};

export default Quiz;
