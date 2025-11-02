"""
Seed script to populate trivia questions database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Trivia questions database
TRIVIA_QUESTIONS = [
    # Geography
    {"question": "What is the capital of France", "answer": "Paris", "category": "geography", "difficulty": "easy", "alternative_answers": ["paris"]},
    {"question": "Which country is home to the kangaroo", "answer": "Australia", "category": "geography", "difficulty": "easy", "alternative_answers": ["australia"]},
    {"question": "What is the largest ocean on Earth", "answer": "Pacific", "category": "geography", "difficulty": "easy", "alternative_answers": ["pacific ocean", "the pacific"]},
    {"question": "What is the capital of Japan", "answer": "Tokyo", "category": "geography", "difficulty": "easy", "alternative_answers": ["tokyo"]},
    {"question": "Which continent is the Sahara Desert located in", "answer": "Africa", "category": "geography", "difficulty": "easy", "alternative_answers": ["africa"]},
    
    # Science
    {"question": "What is the chemical symbol for gold", "answer": "Au", "category": "science", "difficulty": "medium", "alternative_answers": ["au"]},
    {"question": "How many planets are in our solar system", "answer": "8", "category": "science", "difficulty": "easy", "alternative_answers": ["eight"]},
    {"question": "What is the speed of light in meters per second", "answer": "299792458", "category": "science", "difficulty": "hard", "alternative_answers": ["300000000", "3x10^8"]},
    {"question": "What gas do plants absorb from the atmosphere", "answer": "Carbon dioxide", "category": "science", "difficulty": "easy", "alternative_answers": ["CO2", "carbon dioxide", "co2"]},
    {"question": "What is the largest mammal in the world", "answer": "Blue whale", "category": "science", "difficulty": "easy", "alternative_answers": ["blue whale", "whale"]},
    
    # History
    {"question": "Who was the first president of the United States", "answer": "George Washington", "category": "history", "difficulty": "easy", "alternative_answers": ["washington", "george washington"]},
    {"question": "In what year did World War II end", "answer": "1945", "category": "history", "difficulty": "medium", "alternative_answers": []},
    {"question": "Who painted the Mona Lisa", "answer": "Leonardo da Vinci", "category": "history", "difficulty": "easy", "alternative_answers": ["da vinci", "leonardo", "davinci"]},
    {"question": "What year did man first land on the moon", "answer": "1969", "category": "history", "difficulty": "medium", "alternative_answers": []},
    {"question": "Who discovered America in 1492", "answer": "Christopher Columbus", "category": "history", "difficulty": "easy", "alternative_answers": ["columbus", "christopher columbus"]},
    
    # General Knowledge
    {"question": "How many days are in a leap year", "answer": "366", "category": "general", "difficulty": "easy", "alternative_answers": []},
    {"question": "What is the largest country by land area", "answer": "Russia", "category": "general", "difficulty": "easy", "alternative_answers": ["russia"]},
    {"question": "How many continents are there on Earth", "answer": "7", "category": "general", "difficulty": "easy", "alternative_answers": ["seven"]},
    {"question": "What is the smallest prime number", "answer": "2", "category": "general", "difficulty": "medium", "alternative_answers": ["two"]},
    {"question": "What is the boiling point of water in Celsius", "answer": "100", "category": "general", "difficulty": "easy", "alternative_answers": ["100 degrees", "100c"]},
    
    # Sports & Entertainment
    {"question": "How many players are on a soccer team on the field", "answer": "11", "category": "sports", "difficulty": "easy", "alternative_answers": ["eleven"]},
    {"question": "Which planet is known as the Red Planet", "answer": "Mars", "category": "science", "difficulty": "easy", "alternative_answers": ["mars"]},
    {"question": "What is the name of the longest river in the world", "answer": "Nile", "category": "geography", "difficulty": "medium", "alternative_answers": ["nile river", "the nile"]},
    {"question": "How many sides does a hexagon have", "answer": "6", "category": "general", "difficulty": "easy", "alternative_answers": ["six"]},
    {"question": "What is the capital of Italy", "answer": "Rome", "category": "geography", "difficulty": "easy", "alternative_answers": ["rome"]},
    
    # More varied questions
    {"question": "What is the smallest country in the world", "answer": "Vatican City", "category": "geography", "difficulty": "medium", "alternative_answers": ["vatican", "vatican city"]},
    {"question": "How many bones are in the human body", "answer": "206", "category": "science", "difficulty": "medium", "alternative_answers": []},
    {"question": "What is the largest desert in the world", "answer": "Antarctic", "category": "geography", "difficulty": "hard", "alternative_answers": ["antarctica", "antarctic desert"]},
    {"question": "What year did the Titanic sink", "answer": "1912", "category": "history", "difficulty": "medium", "alternative_answers": []},
    {"question": "How many letters are in the English alphabet", "answer": "26", "category": "general", "difficulty": "easy", "alternative_answers": ["twenty-six", "twenty six"]},
    
    # Additional questions for variety
    {"question": "What is the capital of Spain", "answer": "Madrid", "category": "geography", "difficulty": "easy", "alternative_answers": ["madrid"]},
    {"question": "Who wrote Romeo and Juliet", "answer": "William Shakespeare", "category": "history", "difficulty": "easy", "alternative_answers": ["shakespeare", "william shakespeare"]},
    {"question": "What is the freezing point of water in Celsius", "answer": "0", "category": "science", "difficulty": "easy", "alternative_answers": ["zero", "0 degrees"]},
    {"question": "How many hours are in a day", "answer": "24", "category": "general", "difficulty": "easy", "alternative_answers": ["twenty-four", "twenty four"]},
    {"question": "What is the currency of the United Kingdom", "answer": "Pound", "category": "general", "difficulty": "easy", "alternative_answers": ["pound sterling", "gbp", "pounds"]},
]


async def seed_trivia_questions():
    """Seed the database with trivia questions"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing questions
    await db.trivia_questions.delete_many({})
    print("Cleared existing trivia questions")
    
    # Insert new questions
    if TRIVIA_QUESTIONS:
        result = await db.trivia_questions.insert_many(TRIVIA_QUESTIONS)
        print(f"Inserted {len(result.inserted_ids)} trivia questions")
    
    # Show sample
    sample = await db.trivia_questions.find_one()
    print(f"\nSample question: {sample['question']}")
    print(f"Answer: {sample['answer']}")
    
    client.close()
    print("\nDatabase seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_trivia_questions())
