from flask import Blueprint, render_template, send_from_directory, jsonify
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3
from app.models.db import init_db, update_user_score, get_db_connection, release_db_connection, question_cache

main_bp = Blueprint('main', __name__)


init_db()

def get_questions():
    # Try to get a random question from cache first
    cached_questions = question_cache.get('all_cities')
    
    if not cached_questions:
        # If not in cache, fetch from database
        conn = get_db_connection()
        cursor = conn.cursor()    
        cursor.execute("SELECT * FROM cities")
        cities = [dict(row) for row in cursor.fetchall()]
        release_db_connection(conn)
        
        # Cache all cities for future use
        if cities:
            question_cache.set('all_cities', cities)
            cached_questions = cities
    
    if cached_questions:
        # Select a random city from the cached list
        city = random.choice(cached_questions)
        
        # Get other cities for options (avoiding same city and country)
        other_cities = [c for c in cached_questions if c['id'] != city['id'] and c['country'] != city['country']]
        if len(other_cities) >= 3:
            other_cities = random.sample(other_cities, 3)
        
        clues = json.loads(city['clues'])
        options = [c['city'] for c in other_cities]
        options.append(city['city'])
        question = {
            'question': clues[int(random.random()*len(clues))],
            'options': options,
            'questionId': city['id']
        }    
        random.shuffle(question['options'])
        return question
    else:
        # Fallback to database if cache is empty
        conn = get_db_connection()
        cursor = conn.cursor()    
        cursor.execute("SELECT * FROM cities ORDER BY RANDOM() LIMIT 1")
        city = dict(cursor.fetchone())
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
        release_db_connection(conn)
        return question



def check_answer(response):    
    user_answer = response['answer']
    questionId = response['questionId']
    user_id = response.get('userId')

    # Try to get city from cache first
    cached_questions = question_cache.get('all_cities')
    city = None
    
    if cached_questions:
        # Find the city in the cached list
        for c in cached_questions:
            if c['id'] == questionId:
                city = c
                break
    
    # If not found in cache, get from database
    if not city:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cities where id = ?",(questionId,))
        city = dict(cursor.fetchone())
        release_db_connection(conn)

    is_correct = user_answer == city['city']

    # Update user score if user is logged in
    if user_id:
        update_user_score(user_id, is_correct)
    
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

@main_bp.route('/health')
def health_check():
    """Health check endpoint for Railway to verify the app is running"""
    return jsonify({
        "status": "ok",
        "message": "GlobeTrotter API is running"
    })