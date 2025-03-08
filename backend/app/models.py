from pydantic import BaseModel

class QuizAnswer(BaseModel):
    user_id: int
    question_id: int
    user_answer: float

class UserStudyHabit(BaseModel):
    user_id: int
    dark_mode_used: bool
    low_bandwidth_mode_used: bool

class LeaderboardEntry(BaseModel):
    user_id: int
    sustainable_score: int

class Weakness(BaseModel):
    user_id: int
    weakness: str