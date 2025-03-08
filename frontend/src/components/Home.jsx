import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TrackStudyHabits from "./TrackStudyHabits";

const Home = () => {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    if (!userId) {
      alert("Please enter a User ID.");
      return;
    }
    navigate("/quiz", { state: { userId } });
  };

  const handleTrackStudyHabitsSubmit = (data) => {
    console.log("Study habits saved:", data);
  };

  return (

    <div className="p-8 flex bg-gradient-to-b from-[#45B08C] to-white min-h-screen">
      <TrackStudyHabits userId={userId} onSubmit={handleTrackStudyHabitsSubmit} />
    <div className="flex mt-[210px] flex-col items-center">
    <h1 className="text-5xl font-bold text-white mt-6 mb-6">Are You Ready For A Quiz</h1>
    <input
      type="text"
      placeholder="Enter User ID"
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className="w-64 border font-bold text-white mb-6 rounded-lg p-3 text-lg"
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

