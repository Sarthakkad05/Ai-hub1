import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';  

export const getQuizQuestion = async (questionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/generate_question/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz question:", error);
    throw error;
  }
};

export const submitAnswer = async (questionId, userAnswer) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/submit_answer`, {
      question_id: questionId,
      user_answer: userAnswer,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
};

export const trackStudyHabits = async (userId, darkModeUsed, lowBandwidthUsed) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/track_study_habits`, {
      user_id: userId,
      dark_mode_used: darkModeUsed,
      low_bandwidth_mode_used: lowBandwidthUsed,
    });
    return response.data;
  } catch (error) {
    console.error("Error tracking study habits:", error);
    throw error;
  }
};

export const getLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};
