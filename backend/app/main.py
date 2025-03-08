# from fastapi import FastAPI
# from pydantic import BaseModel
# import random
# import json
# import redis
# from fastapi.middleware.cors import CORSMiddleware
# from typing import List, Dict
# from .services import generate_problem, submit_answer, track_study_habits, get_leaderboard, analyze_weakness, recommend_study_material

# app = FastAPI()
# redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

# origins = [
#     "http://localhost:5173", 
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins, 
#     allow_credentials=True,
#     allow_methods=["*"], 
#     allow_headers=["*"],  
# )

# class QuizAnswer(BaseModel):
#     question_id: int
#     user_answer: float

# class UserStudyHabit(BaseModel):
#     user_id: int
#     dark_mode_used: bool
#     low_bandwidth_mode_used: bool

# class Weakness(BaseModel):
#     user_id: int
#     weakness: str


# @app.get("/generate_question/{question_id}")
# def get_quiz_question(question_id: int):
#     return generate_problem(question_id)


# @app.post("/submit_answer")
# def submit_answer_route(answer: QuizAnswer):
#     problem_data = redis_client.get(f"question:{answer.question_id}")
#     problem = json.loads(problem_data)
#     result = submit_answer(answer)

#     weakness = analyze_weakness(answer, problem)
#     study_material = recommend_study_material(weakness)

#     return {**result, "weakness": weakness, "study_material": study_material}

# @app.post("/track_study_habits")
# def track_study_habits_route(habit: UserStudyHabit):
#     return track_study_habits(habit)

# @app.get("/leaderboard")
# def get_leaderboard_route():
#     return get_leaderboard()


from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List  # Add this import for better list typing
import json
import redis
import asyncio
from services import generate_problem, submit_answer, track_study_habits, get_leaderboard, get_overall_weaknesses, suggest_study_material_based_on_weakness

app = FastAPI()
redis_client = redis.asyncio.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

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

@app.get("/generate_question/{question_id}")
async def get_quiz_question(question_id: int):
    return await generate_problem(question_id)

@app.post("/submit_answer")
async def submit_answer_route(answer: QuizAnswer, weaknesses_accumulated: List[str]):
    result = await submit_answer(answer.user_id, answer.question_id, answer.user_answer, weaknesses_accumulated)
    return result

@app.post("/track_study_habits")
async def track_study_habits_route(habit: UserStudyHabit):
    return await track_study_habits(habit)

@app.get("/leaderboard")
async def get_leaderboard_route():
    return await get_leaderboard()

@app.websocket("/ws/leaderboard/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    try:
        while True:
            leaderboard = await get_leaderboard()
            user_score = next((entry for entry in leaderboard if entry["user_id"] == user_id), None)

            if user_score:
                await websocket.send_text(json.dumps(user_score))
            
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")

from fastapi import Query

@app.get("/finish_quiz")
async def finish_quiz_route(user_id: int):

    weaknesses_accumulated = await redis_client.lrange(f"weaknesses:{user_id}", 0, -1)

    overall_weakness, weakness_summary = await get_overall_weaknesses(weaknesses_accumulated)
    study_material = await suggest_study_material_based_on_weakness(overall_weakness)

    quiz_score = await redis_client.zscore("quiz_scores", user_id) or 0

    return {
        "quiz_score": int(quiz_score),
        "overall_weakness": overall_weakness,
        "weakness_summary": weakness_summary,
        "study_material": study_material,
    }