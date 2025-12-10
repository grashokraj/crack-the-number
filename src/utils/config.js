/*
  Game Configuration Constants
  Centralized difficulty and threshold settings
*/

export const DIFFICULTY_CONFIG = {
  easy: {
    key: 'easy',
    length: 3,
    label: 'Level: Easy',
  },
  medium: {
    key: 'medium',
    length: 4,
    label: 'Level: Medium',
  },
  hard: {
    key: 'hard',
    length: 5,
    label: 'Level: Hard',
  },
};

export const HINT_THRESHOLDS = {
  firstHint: 6,      // Reveal 1st digit after 6 attempts
  secondHint: 10,    // Reveal position info after 10 attempts
  unlimitedHints: 15, // Unlimited hints after 15 attempts
};

export const LEADERBOARD_LIMIT = 20; // Show top 20 scores

export const GAME_MODES = {
  single: 'single',
  vsComputer: 'vsComputer',
  online: 'online',
};

export const GAME_STATE_KEY = 'ctn_gamestate_v5';
export const QUICKEST_KEY = 'ctn_quickest_overall';
export const LEADERBOARD_KEY_PREFIX = 'ctn_leaderboard_';

// Difficulty-based leaderboard keys
export const getLeaderboardKey = (difficulty) => {
  return `${LEADERBOARD_KEY_PREFIX}${difficulty}`;
};
