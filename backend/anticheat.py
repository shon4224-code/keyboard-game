"""
Anti-cheat validation for leaderboard submissions
"""
import statistics
from typing import List, Dict, Any


def validate_submission(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates a leaderboard submission for suspicious activity
    Returns: {
        "is_valid": bool,
        "is_suspicious": bool,
        "flags": List[str]
    }
    """
    flags = []
    is_suspicious = False
    
    wpm = data.get('wpm', 0)
    time_seconds = data.get('time_seconds', 0)
    accuracy = data.get('accuracy', 0)
    keystroke_data = data.get('keystroke_data', [])
    total_keystrokes = data.get('total_keystrokes', 0)
    mode = data.get('mode', '')
    
    # 1. WPM Validation - Max human typing speed
    MAX_WPM = 200
    if wpm > MAX_WPM:
        flags.append(f"WPM too high: {wpm} > {MAX_WPM}")
        is_suspicious = True
    
    # 2. Minimum time validation
    # A 5-word challenge should take at least 2 seconds even for the fastest typists
    min_time = 2.0
    if mode == 'words':
        min_time = 3.0  # 5 words minimum
    elif mode == 'quote':
        min_time = 5.0  # Longer text minimum
    elif mode == 'trivia':
        min_time = 10.0  # Reading + typing minimum
    
    if time_seconds < min_time:
        flags.append(f"Time too fast: {time_seconds}s < {min_time}s minimum")
        is_suspicious = True
    
    # 3. Accuracy validation - 100% accuracy at very high speeds is suspicious
    if accuracy == 100 and wpm > 150:
        flags.append("Perfect accuracy at extremely high speed")
        is_suspicious = True
    
    # 4. Keystroke pattern analysis
    if keystroke_data and len(keystroke_data) > 5:
        # Check for impossibly consistent timing (bot behavior)
        try:
            std_dev = statistics.stdev(keystroke_data)
            mean = statistics.mean(keystroke_data)
            
            # If standard deviation is too low, typing is too consistent (bot-like)
            if std_dev < 10 and len(keystroke_data) > 20:  # Less than 10ms variation
                flags.append(f"Keystroke timing too consistent: std_dev={std_dev:.2f}ms")
                is_suspicious = True
            
            # Check for impossibly fast keystrokes
            min_keystroke_time = min(keystroke_data)
            if min_keystroke_time < 30:  # Less than 30ms between keystrokes
                flags.append(f"Impossibly fast keystrokes: {min_keystroke_time}ms")
                is_suspicious = True
            
            # Check if most keystrokes are identical (copy-paste detection)
            if mean > 0:
                identical_count = sum(1 for x in keystroke_data if abs(x - mean) < 5)
                if identical_count / len(keystroke_data) > 0.8:  # 80% identical
                    flags.append("Keystroke pattern suggests automation")
                    is_suspicious = True
        except (statistics.StatisticsError, ValueError):
            pass
    
    # 5. WPM calculation verification
    if time_seconds > 0:
        # Rough WPM calculation: (total_chars / 5) / (time_seconds / 60)
        # Allow 20% margin of error
        expected_chars = (wpm * 5) * (time_seconds / 60)
        if total_keystrokes > 0:
            char_ratio = total_keystrokes / expected_chars if expected_chars > 0 else 0
            if char_ratio < 0.5 or char_ratio > 2.0:
                flags.append(f"Keystroke count mismatch: ratio={char_ratio:.2f}")
                is_suspicious = True
    
    # 6. Check for impossible mistake count
    if total_keystrokes > 0 and accuracy < 100:
        mistakes = data.get('mistakes', 0)
        expected_mistakes = int(total_keystrokes * (1 - accuracy / 100))
        if mistakes == 0 and accuracy < 95:
            flags.append("Mistake count inconsistent with accuracy")
            is_suspicious = True
    
    return {
        "is_valid": not is_suspicious or len(flags) < 2,  # Allow 1 flag
        "is_suspicious": is_suspicious,
        "flags": flags
    }
