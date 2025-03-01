from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)


# Initialize SQLite database and load city data
def init_db():
    conn = sqlite3.connect('travel_quiz.db')
    cursor = conn.cursor()
    
    # Create cities table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        country TEXT,
        clues TEXT,
        fun_fact TEXT,
        trivia TEXT,
        times_shown INTEGER DEFAULT 0,
        times_correct INTEGER DEFAULT 0,
        times_incorrect INTEGER DEFAULT 0
    )
    ''')
    
   
    # Check if cities table is empty
    cursor.execute("SELECT COUNT(*) FROM cities")
    count = cursor.fetchone()[0]
    
    # If empty, populate with data from JSON file
    if count == 0:
        with open('../data/enriched_cities.json', 'r') as f:
            cities_data = json.load(f)
            
        for city in cities_data:
            city_id = city.get('id', str(uuid.uuid4()))
            name = city.get('city', 'Unknown')
            country = city.get('country', '')
            
            fun_facts = json.dumps(city.get('fun_fact', []))
            clues = json.dumps(city.get("clues",[]))
            trivia = json.dumps(city.get("trivia",[]))
            
            cursor.execute('''
            INSERT INTO cities (id, city, country, clues, fun_fact, trivia)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (city_id, name, country, clues, fun_facts, trivia))
    
    conn.commit()
    conn.close()

init_db()

def get_questions():
    conn = sqlite3.connect("travel_quiz.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()    
    cursor.execute("SELECT * FROM cities ORDER BY RANDOM() LIMIT 1")
    city = dict(cursor.fetchone())
    print(city)
    cursor.execute("SELECT id, city FROM cities WHERE id != ? and country!=?  ORDER BY RANDOM() LIMIT 3", (city['id'],city['country']))
    other_cities = [dict(row) for row in cursor.fetchall()]
    clues = json.loads(city['clues'])
    options = [c['city'] for c in other_cities]
    options.append(city['city'])
    question = {
        'question':clues[int(random.random()*len(clues))],
        'options':options,
        'questionId':city['id']
    }    
    random.shuffle(question['options'])
    conn.close()
    return question



def check_answer(response):    
    user_answer = response['answer']
    questionId = response['questionId']

    conn = sqlite3.connect("travel_quiz.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cities where id = ?",(questionId,))
    city = dict(cursor.fetchone())

    is_correct = user_answer == city['city']


    conn.commit()
    conn.close()
    fun_facts = json.loads(city['fun_fact'])
    return jsonify({
            'correct': is_correct,
            'correctAnswer': city['city'],
            'funFact': fun_facts,
            'points': 10 if is_correct else 0
    })
    
    

@app.route("/getQuestion")
def get_question():
    return get_questions();

@app.route("/")
def index():
    return send_from_directory('static', 'index.html')

@app.route("/checkAnswer", methods=["POST"])
def check_answers():
    return check_answer(request.json)

if __name__ == '__main__':
    app.run(debug=True)


