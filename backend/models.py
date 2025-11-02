from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid


# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_games: int = 0
    best_wpm: float = 0.0
    best_time: Optional[float] = None


class UserCreate(BaseModel):
    username: str


# Leaderboard Models
class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    mode: str  # 'words', 'quote', 'trivia'
    difficulty: str  # 'easy', 'normal', 'hard', 'insane'
    wpm: float
    accuracy: float
    time_seconds: float
    score: int  # For trivia mode
    mistakes: int
    streak: int
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Anti-cheat data
    keystroke_data: Optional[List[float]] = None  # Time between keystrokes
    total_keystrokes: int = 0
    is_suspicious: bool = False


class LeaderboardSubmit(BaseModel):
    user_id: str
    username: str
    mode: str
    difficulty: str
    wpm: float
    accuracy: float
    time_seconds: float
    score: int = 0
    mistakes: int
    streak: int
    keystroke_data: Optional[List[float]] = None
    total_keystrokes: int


# Trivia Models
class TriviaQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str  # 'general', 'science', 'history', 'geography', etc.
    difficulty: str  # 'easy', 'medium', 'hard'
    alternative_answers: List[str] = []  # Accept multiple correct answers


class TriviaQuestionCreate(BaseModel):
    question: str
    answer: str
    category: str
    difficulty: str
    alternative_answers: List[str] = []
