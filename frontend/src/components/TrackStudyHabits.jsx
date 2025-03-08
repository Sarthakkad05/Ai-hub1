import { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const TrackStudyHabits = ({ userId, onDarkModeChange, onSubmit }) => {
  const [darkModeUsed, setDarkModeUsed] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [lowBandwidthModeUsed, setLowBandwidthModeUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkModeUsed);
    localStorage.setItem("darkMode", darkModeUsed);
    onDarkModeChange(darkModeUsed); 
  }, [darkModeUsed, onDarkModeChange]);

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required to save preferences.");
      return;
    }

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
    <div className="p-6 h-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <h2 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">
        Save your preferences before starting the quiz
      </h2>
      <label className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={darkModeUsed}
          onChange={() => setDarkModeUsed(!darkModeUsed)}
          className="form-checkbox h-5 w-5"
        />
        <span>Dark Mode</span>
      </label>
      <label className="flex items-center space-x-2 text-gray-800 dark:text-gray-200 mt-2">
        <input
          type="checkbox"
          checked={lowBandwidthModeUsed}
          onChange={() => setLowBandwidthModeUsed(!lowBandwidthModeUsed)}
          className="form-checkbox h-5 w-5"
        />
        <span>Low Bandwidth Mode</span>
      </label>
      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-[#ef7c8e] text-white rounded-lg shadow-md hover:bg-pink-600 transition-all disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
};

export const trackStudyHabits = async (userId, darkModeUsed, lowBandwidthUsed) => {
  try {
    const response = await fetch(`${API_BASE_URL}/track_study_habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export default TrackStudyHabits;
