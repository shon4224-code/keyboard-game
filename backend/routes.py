from fastapi import APIRouter, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from models import (
    User, UserCreate, 
    LeaderboardEntry, LeaderboardSubmit,
    TriviaQuestion, TriviaQuestionCreate,
    Achievement, UserAchievement,
    Challenge, ChallengeCreate
)
from anticheat import validate_submission
from achievements import ACHIEVEMENTS, check_achievements
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


def setup_routes(db: AsyncIOMotorDatabase):
    """Setup all API routes with database connection"""
    
    # ==================== USER ROUTES ====================
    
    @router.post("/user/register", response_model=User)
    async def register_user(input: UserCreate):
        """Register a new user with username"""
        # Check if username already exists
        existing = await db.users.find_one({"username": input.username})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        user = User(username=input.username)
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        logger.info(f"New user registered: {input.username}")
        return user
    
    @router.get("/user/{user_id}", response_model=User)
    async def get_user(user_id: str):
        """Get user by ID"""
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return user
    
    @router.get("/user/username/{username}", response_model=User)
    async def get_user_by_username(username: str):
        """Get user by username"""
        user = await db.users.find_one({"username": username}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return user
    
    # ==================== LEADERBOARD ROUTES ====================
    
    @router.post("/leaderboard/submit", response_model=LeaderboardEntry)
    async def submit_score(input: LeaderboardSubmit):
        """Submit a score to the leaderboard with anti-cheat validation"""
        
        # Validate submission
        validation = validate_submission(input.model_dump())
        
        if not validation['is_valid']:
            logger.warning(f"Suspicious submission from {input.username}: {validation['flags']}")
            raise HTTPException(
                status_code=400, 
                detail=f"Submission rejected: {', '.join(validation['flags'])}"
            )
        
        # Create leaderboard entry
        entry = LeaderboardEntry(
            **input.model_dump(),
            is_suspicious=validation['is_suspicious']
        )
        
        doc = entry.model_dump()
        doc['submitted_at'] = doc['submitted_at'].isoformat()
        
        await db.leaderboard.insert_one(doc)
        
        # Update user stats
        await db.users.update_one(
            {"id": input.user_id},
            {
                "$inc": {"total_games": 1},
                "$max": {"best_wpm": input.wpm},
                "$min": {"best_time": input.time_seconds}
            }
        )
        
        logger.info(f"Score submitted: {input.username} - {input.wpm} WPM")
        return entry
    
    @router.get("/leaderboard/rankings", response_model=List[LeaderboardEntry])
    async def get_rankings(
        mode: Optional[str] = Query(None, description="Filter by mode"),
        difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
        period: str = Query("all-time", description="all-time, daily, weekly, monthly"),
        limit: int = Query(100, le=100, description="Number of results")
    ):
        """Get leaderboard rankings with filters"""
        
        query = {"is_suspicious": False}  # Exclude suspicious entries
        
        # Add filters
        if mode:
            query["mode"] = mode
        if difficulty:
            query["difficulty"] = difficulty
        
        # Add time period filter
        if period != "all-time":
            now = datetime.now(timezone.utc)
            if period == "daily":
                cutoff = now - timedelta(days=1)
            elif period == "weekly":
                cutoff = now - timedelta(weeks=1)
            elif period == "monthly":
                cutoff = now - timedelta(days=30)
            else:
                cutoff = None
            
            if cutoff:
                query["submitted_at"] = {"$gte": cutoff.isoformat()}
        
        # Get rankings sorted by WPM (descending)
        entries = await db.leaderboard.find(
            query, 
            {"_id": 0}
        ).sort("wpm", -1).limit(limit).to_list(limit)
        
        # Convert timestamps
        for entry in entries:
            if isinstance(entry['submitted_at'], str):
                entry['submitted_at'] = datetime.fromisoformat(entry['submitted_at'])
        
        return entries
    
    @router.get("/leaderboard/user/{user_id}", response_model=List[LeaderboardEntry])
    async def get_user_scores(user_id: str, limit: int = Query(10, le=50)):
        """Get a user's score history"""
        entries = await db.leaderboard.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("submitted_at", -1).limit(limit).to_list(limit)
        
        for entry in entries:
            if isinstance(entry['submitted_at'], str):
                entry['submitted_at'] = datetime.fromisoformat(entry['submitted_at'])
        
        return entries
    
    # ==================== TRIVIA ROUTES ====================
    
    @router.post("/trivia/questions", response_model=TriviaQuestion)
    async def create_trivia_question(input: TriviaQuestionCreate):
        """Create a new trivia question (admin only in production)"""
        question = TriviaQuestion(**input.model_dump())
        doc = question.model_dump()
        
        await db.trivia_questions.insert_one(doc)
        logger.info(f"New trivia question created: {input.question[:50]}")
        return question
    
    @router.get("/trivia/questions", response_model=List[TriviaQuestion])
    async def get_trivia_questions(
        category: Optional[str] = Query(None, description="Filter by category"),
        difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
        limit: int = Query(5, le=20, description="Number of questions")
    ):
        """Get random trivia questions"""
        query = {}
        if category:
            query["category"] = category
        if difficulty:
            query["difficulty"] = difficulty
        
        # Get random questions using aggregation pipeline
        pipeline = [
            {"$match": query},
            {"$sample": {"size": limit}},
            {"$project": {"_id": 0}}
        ]
        
        questions = await db.trivia_questions.aggregate(pipeline).to_list(limit)
        return questions
    
    @router.get("/trivia/daily", response_model=List[TriviaQuestion])
    async def get_daily_trivia():
        """Get daily trivia questions (5 random questions that change each session)"""
        
        # Get all questions
        all_questions = await db.trivia_questions.find({}, {"_id": 0}).to_list(1000)
        
        if len(all_questions) < 5:
            raise HTTPException(status_code=404, detail="Not enough trivia questions in database")
        
        # Use MongoDB's random sampling for true randomization each time
        pipeline = [
            {"$sample": {"size": 5}},
            {"$project": {"_id": 0}}
        ]
        
        daily_questions = await db.trivia_questions.aggregate(pipeline).to_list(5)
        
        return daily_questions
    
    # ==================== ACHIEVEMENT ROUTES ====================
    
    @router.get("/achievements", response_model=List[Achievement])
    async def get_all_achievements():
        """Get all available achievements"""
        return [Achievement(**a) for a in ACHIEVEMENTS]
    
    @router.get("/achievements/user/{user_id}", response_model=List[UserAchievement])
    async def get_user_achievements(user_id: str):
        """Get achievements unlocked by a user"""
        achievements = await db.user_achievements.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        
        for achievement in achievements:
            if isinstance(achievement['unlocked_at'], str):
                achievement['unlocked_at'] = datetime.fromisoformat(achievement['unlocked_at'])
        
        return achievements
    
    @router.post("/achievements/check")
    async def check_user_achievements(user_id: str, game_data: dict):
        """Check and unlock new achievements after a game"""
        # Get user stats
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get existing achievements
        existing = await db.user_achievements.find(
            {"user_id": user_id}
        ).to_list(100)
        existing_ids = {a["achievement_id"] for a in existing}
        
        # Check which achievements to unlock
        user_stats = {
            "total_games": user.get("total_games", 0),
            "best_wpm": user.get("best_wpm", 0),
            "streak": user.get("streak", 0),
            "modes_played": user.get("modes_played", [])
        }
        
        new_achievement_ids = check_achievements(user_stats, game_data)
        
        # Filter out already unlocked
        truly_new = [aid for aid in new_achievement_ids if aid not in existing_ids]
        
        # Save new achievements
        new_achievements = []
        for achievement_id in truly_new:
            achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement_id
            )
            doc = achievement.model_dump()
            doc['unlocked_at'] = doc['unlocked_at'].isoformat()
            await db.user_achievements.insert_one(doc)
            new_achievements.append(achievement)
        
        return {"new_achievements": [a.achievement_id for a in new_achievements]}
    
    # ==================== CHALLENGE ROUTES ====================
    
    @router.post("/challenges/create", response_model=Challenge)
    async def create_challenge(challenge: ChallengeCreate):
        """Create a friend challenge"""
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        challenge_obj = Challenge(
            **challenge.model_dump(),
            expires_at=expires_at
        )
        
        doc = challenge_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['expires_at'] = doc['expires_at'].isoformat()
        
        await db.challenges.insert_one(doc)
        logger.info(f"Challenge created by {challenge.challenger_username}")
        
        return challenge_obj
    
    @router.get("/challenges/{challenge_id}", response_model=Challenge)
    async def get_challenge(challenge_id: str):
        """Get a challenge by ID"""
        challenge = await db.challenges.find_one({"id": challenge_id}, {"_id": 0})
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if isinstance(challenge['created_at'], str):
            challenge['created_at'] = datetime.fromisoformat(challenge['created_at'])
        if isinstance(challenge['expires_at'], str):
            challenge['expires_at'] = datetime.fromisoformat(challenge['expires_at'])
        
        # Check if expired
        if challenge['expires_at'] < datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Challenge expired")
        
        return challenge
    
    return router

