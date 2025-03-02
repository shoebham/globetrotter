from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3
from pathlib import Path

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
DB_PATH = 'travel_quiz.db'

def get_db_connection():
    """Get database connection based on environment"""
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        # For Railway PostgreSQL
        try:
            import psycopg2
            # Replace postgres:// with postgresql:// for SQLAlchemy
            db_url = DATABASE_URL.replace('postgres://', 'postgresql://')
            conn = psycopg2.connect(db_url)
            conn.autocommit = True
            return conn
        except ImportError:
            print("psycopg2 not installed, falling back to SQLite")
            return sqlite3.connect(DB_PATH)
    else:
        # Local SQLite database
        return sqlite3.connect(DB_PATH)

def init_db():
    """Initialize the database with tables and sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_answers INTEGER DEFAULT 0
    )
    ''')
    
    # Create questions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        fun_facts TEXT
    )
    ''')
    
    # Check if questions table is empty
    cursor.execute('SELECT COUNT(*) FROM questions')
    count = cursor.fetchone()[0]
    
    # Load sample questions if table is empty
    if count == 0:
        try:
            # Try to load from data directory
            data_path = Path('data/questions.json')
            if data_path.exists():
                with open(data_path, 'r') as f:
                    questions = json.load(f)
                
                for q in questions:
                    cursor.execute(
                        'INSERT INTO questions (id, question, options, correct_answer, fun_facts) VALUES (?, ?, ?, ?, ?)',
                        (
                            q['id'],
                            q['question'],
                            json.dumps(q['options']),
                            q['correct_answer'],
                            json.dumps(q.get('fun_facts', []))
                        )
                    )
                print(f"Loaded {len(questions)} questions from data file")
        except Exception as e:
            print(f"Error loading sample questions: {e}")
    
    conn.commit()
    conn.close()

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