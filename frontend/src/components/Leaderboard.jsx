import { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:8000/leaderboard");
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Leaderboard</h2>
    
    <ul className="divide-y divide-gray-200">
      {leaderboard.map((entry, index) => (
        <li 
          key={index} 
          className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg shadow-sm mb-2"
        >
          <span className="text-lg font-medium text-gray-700">User {entry.user_id}</span>
          <span className="text-lg font-semibold text-blue-600">{entry.sustainable_score} pts</span>
        </li>
      ))}
    </ul>
  </div>
  
  );
};

export default Leaderboard;
