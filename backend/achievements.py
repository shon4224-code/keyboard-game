# Achievement definitions for the typing game

ACHIEVEMENTS = [
    # Speed Achievements
    {
        "id": "speed_50",
        "name": "Getting Started",
        "description": "Reach 50 WPM",
        "icon": "🚀",
        "category": "speed",
        "requirement": {"wpm": 50}
    },
    {
        "id": "speed_75",
        "name": "Speed Runner",
        "description": "Reach 75 WPM",
        "icon": "⚡",
        "category": "speed",
        "requirement": {"wpm": 75}
    },
    {
        "id": "speed_100",
        "name": "Speed Demon",
        "description": "Reach 100 WPM",
        "icon": "👹",
        "category": "speed",
        "requirement": {"wpm": 100}
    },
    {
        "id": "speed_125",
        "name": "Lightning Fingers",
        "description": "Reach 125 WPM",
        "icon": "⚡",
        "category": "speed",
        "requirement": {"wpm": 125}
    },
    
    # Accuracy Achievements
    {
        "id": "perfect_game",
        "name": "Perfectionist",
        "description": "100% accuracy in any game",
        "icon": "💯",
        "category": "accuracy",
        "requirement": {"accuracy": 100}
    },
    {
        "id": "accurate_fast",
        "name": "Speed AND Accuracy",
        "description": "95%+ accuracy at 80+ WPM",
        "icon": "🎯",
        "category": "accuracy",
        "requirement": {"accuracy": 95, "wpm": 80}
    },
    
    # Streak Achievements
    {
        "id": "streak_3",
        "name": "Three in a Row",
        "description": "3-day streak",
        "icon": "🔥",
        "category": "streak",
        "requirement": {"streak": 3}
    },
    {
        "id": "streak_7",
        "name": "Weekly Warrior",
        "description": "7-day streak",
        "icon": "🔥",
        "category": "streak",
        "requirement": {"streak": 7}
    },
    {
        "id": "streak_30",
        "name": "Dedication",
        "description": "30-day streak",
        "icon": "🏆",
        "category": "streak",
        "requirement": {"streak": 30}
    },
    
    # Completion Achievements
    {
        "id": "games_10",
        "name": "Getting the Hang",
        "description": "Complete 10 games",
        "icon": "🎮",
        "category": "completion",
        "requirement": {"games": 10}
    },
    {
        "id": "games_50",
        "name": "Veteran Player",
        "description": "Complete 50 games",
        "icon": "🎖️",
        "category": "completion",
        "requirement": {"games": 50}
    },
    {
        "id": "games_100",
        "name": "Century",
        "description": "Complete 100 games",
        "icon": "💯",
        "category": "completion",
        "requirement": {"games": 100}
    },
    
    # Special Mode Achievements
    {
        "id": "trivia_master",
        "name": "Trivia Master",
        "description": "5/5 correct in Trivia mode",
        "icon": "🧠",
        "category": "special",
        "requirement": {"trivia_perfect": True}
    },
    {
        "id": "sprint_champion",
        "name": "Sprint Champion",
        "description": "Type 30+ words in Sprint mode",
        "icon": "🏃",
        "category": "special",
        "requirement": {"sprint_words": 30}
    },
    {
        "id": "all_modes",
        "name": "Jack of All Trades",
        "description": "Complete all 4 game modes",
        "icon": "🎭",
        "category": "special",
        "requirement": {"all_modes": True}
    }
]


def check_achievements(user_stats, game_data):
    """
    Check which achievements should be unlocked based on user stats and game data
    
    Args:
        user_stats: dict with total_games, best_wpm, current_streak, etc.
        game_data: dict with wpm, accuracy, mode, score, etc. from current game
    
    Returns:
        list of achievement IDs that should be unlocked
    """
    unlocked = []
    
    for achievement in ACHIEVEMENTS:
        req = achievement["requirement"]
        
        # Speed achievements
        if "wpm" in req and not "accuracy" in req:
            if game_data.get("wpm", 0) >= req["wpm"]:
                unlocked.append(achievement["id"])
        
        # Accuracy achievements
        elif "accuracy" in req:
            if game_data.get("accuracy", 0) >= req["accuracy"]:
                if "wpm" in req:
                    if game_data.get("wpm", 0) >= req["wpm"]:
                        unlocked.append(achievement["id"])
                else:
                    unlocked.append(achievement["id"])
        
        # Streak achievements
        elif "streak" in req:
            if user_stats.get("streak", 0) >= req["streak"]:
                unlocked.append(achievement["id"])
        
        # Completion achievements
        elif "games" in req:
            if user_stats.get("total_games", 0) >= req["games"]:
                unlocked.append(achievement["id"])
        
        # Special achievements
        elif "trivia_perfect" in req:
            if game_data.get("mode") == "trivia" and game_data.get("score", 0) == 5:
                unlocked.append(achievement["id"])
        
        elif "sprint_words" in req:
            if game_data.get("mode") == "sprint" and game_data.get("score", 0) >= req["sprint_words"]:
                unlocked.append(achievement["id"])
        
        elif "all_modes" in req:
            modes_played = user_stats.get("modes_played", [])
            if len(modes_played) >= 4:
                unlocked.append(achievement["id"])
    
    return unlocked
