# import random
# import redis
# import json
# from fastapi import HTTPException
# from .models import LeaderboardEntry, UserStudyHabit

# MIN_OPERAND = 1
# MAX_OPERAND = 10
# OPERATORS = ['+', '-', '*', '/']

# redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)


# leaderboard = []
# user_habits = {}


# def generate_problem(question_id: int):
#     operator = random.choice(OPERATORS)

#     if operator == "/":
#         right = random.randint(MIN_OPERAND, MAX_OPERAND)
#         left = right * random.randint(1, 10)  
#     else:
#         left = random.randint(MIN_OPERAND, MAX_OPERAND)
#         right = random.randint(MIN_OPERAND, MAX_OPERAND)

#     expression = f"{left} {operator} {right}"
#     answer = round(eval(expression), 2) if operator == "/" else eval(expression)

#     problem = {
#         "question_id": question_id,
#         "expression": expression,
#         "answer": answer
#     }

#     redis_client.set(f"question:{question_id}", json.dumps(problem), ex=600)

#     return problem


# def submit_answer(answer):

#     question_data = redis_client.get(f"question:{answer.question_id}")
    
#     if not question_data:
#         raise HTTPException(status_code=404, detail="Question not found or expired.")

#     question = json.loads(question_data)
#     correct_answer = question["answer"]
    
#     is_correct = float(answer.user_answer) == float(correct_answer)

#     return {
#         "is_correct": is_correct,
#         "correct_answer": correct_answer,
#         "user_answer": answer.user_answer
#     }

# def track_study_habits(habit: UserStudyHabit):
#     user_habits[habit.user_id] = habit
#     sustainable_score = sum([habit.dark_mode_used, habit.low_bandwidth_mode_used])

#     # Store the user's sustainable score in Redis
#     redis_client.zadd("leaderboard", {habit.user_id: sustainable_score})

#     return {"message": "Study habits tracked successfully", "sustainable_score": sustainable_score}


# def get_leaderboard():
#     leaderboard_data = redis_client.zrevrange("leaderboard", 0, -1, withscores=True)
    
#     leaderboard = [LeaderboardEntry(user_id=int(user_id), sustainable_score=int(score)) for user_id, score in leaderboard_data]
#     return leaderboard

# def clear_leaderboard():
#     redis_client.delete("leaderboard")
#     return {"message": "Leaderboard cleared successfully"}

# def analyze_weakness(answer, problem):
#     question_data = redis_client.get(f"question:{answer.question_id}")
    
#     if not question_data:
#         raise HTTPException(status_code=404, detail="Question not found or expired.")

#     question = json.loads(question_data)
#     correct_answer = question["answer"]
#     is_correct = float(answer.user_answer) == float(correct_answer)

#     if not is_correct:
#         weakness = problem["operator"]
#     else:
#         weakness = None

#     return weakness

# def recommend_study_material(weakness):

#     if weakness == "+":
#         return "Recommended Study Material: Learn addition."
#     elif weakness == "-":
#         return "Recommended Study Material: Learn subtraction."
#     elif weakness == "*":
#         return "Recommended Study Material: Learn multiplication."
#     elif weakness == "/":
#         return "Recommended Study Material: Learn division."
#     else:
#         return "You're doing great! Keep it up!"
    

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
    answer = eval(expression)
    problem = {"question_id": question_id, "expression": expression, "answer": answer, "operator": operator}

    await redis_client.set(f"question:{question_id}", json.dumps(problem), ex=600)
    return problem

async def submit_answer(user_id, question_id, user_answer):
    question_data = await redis_client.get(f"question:{question_id}")
    if not question_data:
        raise HTTPException(status_code=404, detail="Question not found or expired.")
    
    question = json.loads(question_data)
    correct_answer = question["answer"]
    is_correct = float(user_answer) == float(correct_answer)
    quiz_score = 0

    if is_correct:
        quiz_score += 5
    else:
        quiz_score = quiz_score
    
    await update_quiz_score(user_id, quiz_score)

    weakness = None
    study_material = None
    if not is_correct:
        weakness = await analyze_weakness(user_answer, question)
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
    if weakness == "+": 
        return "Recommended Study Material: Learn addition."
    elif weakness == "-": 
        return "Recommended Study Material: Learn subtraction."
    elif weakness == "*": 
        return "Recommended Study Material: Learn multiplication."
    elif weakness == "/": 
        return "Recommended Study Material: Learn division."
    else: 
        return "You're doing great! Keep it up!"

async def update_quiz_score(user_id, score):
    quiz_score = await redis_client.zscore("quiz_scores", user_id) or 0
    quiz_score += score
    await redis_client.zadd("quiz_scores", {user_id: quiz_score})

async def update_leaderboard(user_id, total_score):

    await redis_client.zadd("leaderboard", {user_id: total_score})

async def get_user_habits(user_id):
    habit = UserStudyHabit(user_id=user_id, dark_mode_used=1, low_bandwidth_mode_used=1)
    return habit