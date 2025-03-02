from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3

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
    
    cursor.execute('''
                   CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY, 
                    username TEXT NOT NULL UNIQUE, 
                    password TEXT NOT NULL,
                    score INTEGER DEFAULT 0, 
                    correct_answers INTEGER DEFAULT 0, 
                    total_answers INTEGER DEFAULT 0
                   )''')

    # If empty, populate with data from JSON file
    if count == 0:
        with open('./data/enriched_cities.json', 'r') as f:
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

def get_db_connection():
    return sqlite3.connect("travel_quiz.db")

def register_user(username, password):
    """Register a new user with a unique username"""
    user_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO users (id, username, password, score, correct_answers, total_answers)
        VALUES (?, ?, ?, 0, 0, 0)
        ''', (user_id, username, password))
        conn.commit()
        return {'userId': user_id, 'username': username, 'score': 0, 'correctAnswers': 0, 'totalAnswers': 0, 'success': True}
    except sqlite3.IntegrityError:
        # Username already exists
        return {'error': 'Username already taken', 'success': False}
    finally:
        conn.close()

def login_user(username, password):
    """Login a user by username and password"""
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return {'error': 'User not found', 'success': False}
    
    if user['password'] != password:
        return {'error': 'Incorrect password', 'success': False}
    
    return {
        'userId': user['id'],
        'username': user['username'],
        'score': user['score'],
        'correctAnswers': user['correct_answers'],
        'totalAnswers': user['total_answers'],
        'success': True
    }

def get_user_profile(user_id):
    """Get user profile by user ID"""
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return {'error': 'User not found', 'success': False}
    
    return {
        'userId': user['id'],
        'username': user['username'],
        'score': user['score'],
        'correctAnswers': user['correct_answers'],
        'totalAnswers': user['total_answers'],
        'success': True
    }

def update_user_score(user_id, is_correct):
    """Update user score after answering a question"""
    if not user_id:
        return
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE users SET total_answers = total_answers + 1 WHERE id = ?", (user_id,))
    if is_correct:
        cursor.execute("""
        UPDATE users 
        SET correct_answers = correct_answers + 1, 
            score = score + 10 
        WHERE id = ?
        """, (user_id,))
    
    conn.commit()
    conn.close()