import random
import redis
import json
import uuid
from fastapi import HTTPException
from .models import LeaderboardEntry, UserStudyHabit
import asyncio

MIN_OPERAND = 1
MAX_OPERAND = 10
OPERATORS = ['+', '-', '*', '/']

redis_client = redis.asyncio.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

async def generate_user_id():
    return str(uuid.uuid4())

async def generate_problem(question_id: int):
    operator = random.choice(OPERATORS)
    left = random.randint(MIN_OPERAND, MAX_OPERAND)
    right = random.randint(MIN_OPERAND, MAX_OPERAND)

    if operator == "/":
        left = right * random.randint(1, 10)

    expression = f"{left} {operator} {right}"
    
    try:
        answer = safe_eval(expression)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating answer: {str(e)}")
    
    problem = {"question_id": question_id, "expression": expression, "answer": answer, "operator": operator}

    await redis_client.set(f"question:{question_id}", json.dumps(problem), ex=600)
    return problem

def safe_eval(expression: str):
    """A safer evaluation method for math expressions."""
    allowed_operators = ['+', '-', '*', '/']
    for operator in allowed_operators:
        if operator in expression:
            return eval(expression)
    raise ValueError("Invalid operator in expression.")

async def submit_answer(user_id, question_id, user_answer, weaknesses_accumulated):
    question_data = await redis_client.get(f"question:{question_id}")
    if not question_data:
        raise HTTPException(status_code=404, detail="Question not found or expired.")
    
    question = json.loads(question_data)
    correct_answer = question["answer"]
    is_correct = float(user_answer) == float(correct_answer)
    quiz_score = 0

    if is_correct:
        quiz_score += 5

    await update_quiz_score(user_id, quiz_score)

    weakness = None
    study_material = None
    if not is_correct:
        weakness = await analyze_weakness(user_answer, question)
        if weakness:
            accumulated_weaknesses = await redis_client.lrange(f"weaknesses:{user_id}", 0, -1)
            accumulated_weaknesses.append(weakness["message"])
            await redis_client.delete(f"weaknesses:{user_id}") 
            await redis_client.rpush(f"weaknesses:{user_id}", *accumulated_weaknesses)
        study_material = await recommend_study_material(weakness)
    
    habit = await get_user_habits(user_id)
    sustainable_score = await track_study_habits(habit)

    total_score = quiz_score + sustainable_score
    await update_leaderboard(user_id, total_score)

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "user_answer": user_answer,
        "weakness": weakness,
        "study_material": study_material,
        "quiz_score": quiz_score, 
    }

async def track_study_habits(habit: UserStudyHabit):
    sustainable_score = (habit.dark_mode_used * 5) + (habit.low_bandwidth_mode_used * 5)
    await redis_client.zadd("sustainable_scores", {habit.user_id: sustainable_score})
    return sustainable_score

async def get_leaderboard():
    leaderboard_data = await redis_client.zrevrange("leaderboard", 0, -1, withscores=True)
    leaderboard = []
    for user_id, total_score in leaderboard_data:
        quiz_score = await redis_client.zscore("quiz_scores", user_id) or 0
        sustainable_score = await redis_client.zscore("sustainable_scores", user_id) or 0
        leaderboard.append({
            "user_id": user_id,
            "quiz_score": int(quiz_score),
            "sustainable_score": int(sustainable_score),
            "total_score": int(total_score),
        })
    return leaderboard

async def analyze_weakness(answer, problem):
    correct_answer = problem["answer"]
    is_correct = float(answer) == float(correct_answer)

    if not is_correct:
        weakness = problem.get("operator")

        if weakness == "+":
            return {"message": "addition"}
        elif weakness == "-":
            return {"message": "subtraction"}
        elif weakness == "*":
            return {"message": "multiplication"}
        elif weakness == "/":
            return {"message": "division"}
    else:
        return None

async def recommend_study_material(weakness):
    if weakness == "addition": 
        return "Recommended Study Material: Learn addition."
    elif weakness == "subtraction": 
        return "Recommended Study Material: Learn subtraction."
    elif weakness == "multiplication": 
        return "Recommended Study Material: Learn multiplication."
    elif weakness == "division": 
        return "Recommended Study Material: Learn division."
    else: 
        return "You're doing great! Keep it up!"

async def update_quiz_score(user_id, score):
    quiz_score = await redis_client.zscore("quiz_scores", user_id) or 0
    quiz_score += score
    await redis_client.zadd("quiz_scores", {user_id: quiz_score})

async def update_leaderboard(user_id, total_score):
    await redis_client.zadd("leaderboard", {user_id: total_score})
    await redis_client.zremrangebyrank("leaderboard", 100, -1)

async def get_user_habits(user_id):
    habit = UserStudyHabit(user_id=user_id, dark_mode_used=1, low_bandwidth_mode_used=1)
    return habit

async def get_overall_weaknesses(weaknesses_accumulated):
    weakness_summary = {
        "addition": weaknesses_accumulated.count("addition"),
        "subtraction": weaknesses_accumulated.count("subtraction"),
        "multiplication": weaknesses_accumulated.count("multiplication"),
        "division": weaknesses_accumulated.count("division"),
    }

    overall_weakness = max(weakness_summary, key=weakness_summary.get)
    return overall_weakness, weakness_summary

async def suggest_study_material_based_on_weakness(overall_weakness):
    if overall_weakness == "addition":
        return "Recommended Study Material: Learn addition."
    elif overall_weakness == "subtraction":
        return "Recommended Study Material: Learn subtraction."
    elif overall_weakness == "multiplication":
        return "Recommended Study Material: Learn multiplication."
    elif overall_weakness == "division":
        return "Recommended Study Material: Learn division."
    else:
        return "You're doing great! Keep it up!"