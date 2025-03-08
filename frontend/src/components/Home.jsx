import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TrackStudyHabits from "./TrackStudyHabits";

const Home = () => {
  const [userId, setUserId] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

    const handleTrackStudyHabitsSubmit = (data) => {
    console.log("Study habits saved:", data);
  };

  const handleStartQuiz = () => {
    if (!userId) {
      alert("Please enter a User ID.");
      return;
    }
    navigate("/quiz", { state: { userId, darkMode } });
  };

  return (
    <div
      className={`p-8 flex min-h-screen transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-b from-[#45B08C] to-white"
      }`}
    >
      <TrackStudyHabits 
        userId={userId} 
        onSubmit={handleTrackStudyHabitsSubmit} 
        onDarkModeChange={setDarkMode}  
      />

      
      <div className="flex mt-[210px] flex-col items-center w-full">
        <h1 className="text-5xl font-bold mt-6 mb-6">Are You Ready For A Quiz?</h1>

        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={`w-64 border font-bold mb-6 rounded-lg p-3 text-lg ${
            darkMode ? "bg-gray-800 text-white border-gray-600" : "text-black"
          }`}
        />

        <button
          onClick={handleStartQuiz}
          className="mt-6 mb-10 px-8 py-3 bg-[#ef7c8e] text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default Home;
