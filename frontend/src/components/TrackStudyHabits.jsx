import { useState } from "react";
const API_BASE_URL = 'http://127.0.0.1:8000';  

const TrackStudyHabits = ({ userId, onSubmit }) => {
  const [darkModeUsed, setDarkModeUsed] = useState(false);
  const [lowBandwidthModeUsed, setLowBandwidthModeUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackStudyHabits(userId, darkModeUsed, lowBandwidthModeUsed);
      onSubmit(data);
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-10 h-1/4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <h2 className="text-grey-100 mb-1">Save your preferences before starting quiz</h2>
        <label className="text-white mr-3 text-grey-100 ">
          <input className="mr-1" type="checkbox" checked={darkModeUsed} onChange={() => setDarkModeUsed(!darkModeUsed)} />
          Dark Mode
        </label>
        <label className="text-white mr-3 text-grey-100 ">
          <input className="mr-1" type="checkbox" checked={lowBandwidthModeUsed} onChange={() => setLowBandwidthModeUsed(!lowBandwidthModeUsed)} />
          Low Bandwidth Mode
        </label>
      </div>
      <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-[#ef7c8e] text-white rounded-lg disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
    </div>
  );
};

export const trackStudyHabits = async (userId, darkModeUsed, lowBandwidthUsed) => {
  try {
    const response = await fetch(`${API_BASE_URL}/track_study_habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        dark_mode_used: darkModeUsed,
        low_bandwidth_mode_used: lowBandwidthUsed,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error tracking study habits:", error);
    throw error;
  }
};


export default TrackStudyHabits
