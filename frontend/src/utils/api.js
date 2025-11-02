import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// User API
export const registerUser = async (username) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/register`, {
      username
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to register user' 
    };
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/username/${username}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'User not found' 
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'User not found' 
    };
  }
};

// Leaderboard API
export const submitScore = async (scoreData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/leaderboard/submit`, scoreData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to submit score' 
    };
  }
};

export const getLeaderboardRankings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.period) params.append('period', filters.period);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await axios.get(
      `${API_BASE_URL}/api/leaderboard/rankings?${params.toString()}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to fetch leaderboard' 
    };
  }
};

export const getUserScores = async (userId, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/leaderboard/user/${userId}?limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to fetch user scores' 
    };
  }
};

// Trivia API
export const getDailyTrivia = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/trivia/daily`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to fetch trivia questions' 
    };
  }
};

export const getRandomTrivia = async (limit = 5, category = null, difficulty = null) => {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await axios.get(
      `${API_BASE_URL}/api/trivia/questions?${params.toString()}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to fetch trivia questions' 
    };
  }
};
