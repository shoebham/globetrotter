from flask import Blueprint, render_template, send_from_directory
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3
from app.models.db import init_db, update_user_score

main_bp = Blueprint('main', __name__)


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
    user_id = response.get('userId')

    conn = sqlite3.connect("travel_quiz.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cities where id = ?",(questionId,))
    city = dict(cursor.fetchone())

    is_correct = user_answer == city['city']

    # Update user score if user is logged in
    if user_id:
        update_user_score(user_id, is_correct)

    conn.commit()
    conn.close()
    fun_facts = json.loads(city['fun_fact'])
    return jsonify({
            'correct': is_correct,
            'correctAnswer': city['city'],
            'funFact': fun_facts,
            'points': 10 if is_correct else 0
    })
    
    

@main_bp.route('/')
def index():
    return render_template('index.html')