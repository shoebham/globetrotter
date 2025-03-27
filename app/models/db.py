from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3
from pathlib import Path
import threading
import time

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
DB_PATH = 'travel_quiz.db'
USE_MEMORY_DB = os.environ.get('USE_MEMORY_DB', 'true').lower() == 'true'
USE_OPTIMIZATIONS = os.environ.get('USE_OPTIMIZATIONS', 'true').lower() == 'true'

# Simple cache implementation
class Cache:
    def __init__(self, max_size=100, ttl=3600):  # TTL in seconds (increased to 1 hour)
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
        self.lock = threading.Lock()
    
    def get(self, key):
        if not USE_OPTIMIZATIONS:
            return None
            
        with self.lock:
            if key in self.cache:
                value, timestamp = self.cache[key]
                # Check if the cache entry is still valid
                if time.time() - timestamp < self.ttl:
                    return value
                else:
                    # Remove expired entry
                    del self.cache[key]
            return None
    
    def set(self, key, value):
        if not USE_OPTIMIZATIONS:
            return
            
        with self.lock:
            # If cache is full, remove oldest entry
            if len(self.cache) >= self.max_size:
                oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k][1])
                del self.cache[oldest_key]
            
            # Add new entry with current timestamp
            self.cache[key] = (value, time.time())
    
    def invalidate(self, key=None):
        if not USE_OPTIMIZATIONS:
            return
            
        with self.lock:
            if key is None:
                # Clear entire cache
                self.cache.clear()
            elif key in self.cache:
                # Remove specific key
                del self.cache[key]

# Create global cache
user_cache = Cache()
question_cache = Cache()
# Add a city lookup cache for faster access by ID
city_lookup_cache = Cache()

# In-memory database for faster access
memory_connection = None
def init_memory_db():
    """Initialize in-memory database by copying from file database"""
    global memory_connection
    
    if not USE_MEMORY_DB or not USE_OPTIMIZATIONS:
        return
        
    try:
        # Create in-memory database
        memory_connection = sqlite3.connect(':memory:', check_same_thread=False)
        memory_connection.row_factory = sqlite3.Row
        
        # Copy data from file database
        file_conn = sqlite3.connect(DB_PATH)
        file_conn.backup(memory_connection)
        file_conn.close()
        
        print("Initialized in-memory database for faster access")
        return memory_connection
    except Exception as e:
        print(f"Error initializing in-memory database: {e}")
        memory_connection = None
        return None

# Connection pool for SQLite
class ConnectionPool:
    def __init__(self, max_connections=20):  # Increased max connections
        self.max_connections = max_connections if USE_OPTIMIZATIONS else 5
        self.connections = []
        self.lock = threading.Lock()
        
    def get_connection(self):
        global memory_connection
        
        # If using in-memory database and it's initialized, return it
        if USE_OPTIMIZATIONS and USE_MEMORY_DB and memory_connection:
            return memory_connection
            
        with self.lock:
            if not self.connections:
                # Create a new connection if none available
                conn = sqlite3.connect(DB_PATH, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                return conn
            else:
                # Reuse an existing connection
                return self.connections.pop()
    
    def release_connection(self, conn):
        global memory_connection
        
        # Don't release in-memory connection
        if USE_OPTIMIZATIONS and USE_MEMORY_DB and conn == memory_connection:
            return
            
        with self.lock:
            if len(self.connections) < self.max_connections:
                self.connections.append(conn)
            else:
                conn.close()

# Create a global connection pool
connection_pool = ConnectionPool()

# Pre-parse JSON data to avoid repeated parsing
def preprocess_city_data(city):
    """Pre-process city data to avoid repeated JSON parsing"""
    if not USE_OPTIMIZATIONS:
        return city
        
    if isinstance(city, dict):
        result = dict(city)
        if 'clues' in result and isinstance(result['clues'], str):
            try:
                result['clues_parsed'] = json.loads(result['clues'])
            except:
                result['clues_parsed'] = []
        
        if 'fun_fact' in result and isinstance(result['fun_fact'], str):
            try:
                result['fun_fact_parsed'] = json.loads(result['fun_fact'])
            except:
                result['fun_fact_parsed'] = []
                
        return result
    return city

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
            return connection_pool.get_connection()
    else:
        # Local SQLite database
        return connection_pool.get_connection()

def release_db_connection(conn):
    """Release a connection back to the pool"""
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        conn.close()
    else:
        connection_pool.release_connection(conn)

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
    
    # Create cities table if it doesn't exist
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

    cursor.execute('''
                   CREATE TABLE IF NOT EXISTS attempts(
                    aid INTEGER PRIMARY KEY,
                    uid TEXT,
                   cid TEXT,
                   selected_city TEXT,
                   date_answered INTEGER ,
                   time_taken INTEGER,
                   FOREIGN KEY(uid) REFERENCES users(id),
                   FOREIGN KEY(cid) REFERENCES cities(id)
                   )
                   ''')
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_username ON users(username)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_id ON users(id)')
    
    # Add index on cities table
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_city_id ON cities(id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_city_country ON cities(country)')
    
    # Check if cities table is empty
    cursor.execute('SELECT COUNT(*) FROM cities')
    count = cursor.fetchone()[0]
    
    # Load sample cities if table is empty
    if count == 0:
        try:
            # Try to load from data directory
            data_path = Path('data/cities.json')
            if data_path.exists():
                with open(data_path, 'r') as f:
                    cities = json.load(f)
                
                for city in cities:
                    cursor.execute(
                        'INSERT INTO cities (id, city, country, clues, fun_fact, trivia) VALUES (?, ?, ?, ?, ?, ?)',
                        (
                            city.get('id', str(uuid.uuid4())),
                            city['city'],
                            city.get('country', ''),
                            json.dumps(city.get('clues', [])),
                            json.dumps(city.get('fun_fact', [])),
                            json.dumps(city.get('trivia', []))
                        )
                    )
                print(f"Loaded {len(cities)} cities from data file")
        except Exception as e:
            print(f"Error loading sample cities: {e}")
    
    conn.commit()
    release_db_connection(conn)
    
    # Initialize in-memory database after file database is set up
    init_memory_db()

def register_user(username, password):
    """Register a new user with a unique username"""
    user_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO users (id, username, password, score, correct_answers, total_answers)
        VALUES (?, ?, ?, 0, 0, 0)
        ''', (user_id, username, password))
        conn.commit()
        result = {'userId': user_id, 'username': username, 'score': 0, 'correctAnswers': 0, 'totalAnswers': 0, 'success': True}
        # Cache the new user
        user_cache.set(user_id, result)
        return result
    except sqlite3.IntegrityError:
        # Username already exists
        return {'error': 'Username already taken', 'success': False}
    finally:
        release_db_connection(conn)

def login_user(username, password):
    """Login a user by username and password"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    result = None
    
    if not user:
        result = {'error': 'User not found', 'success': False}
    elif user['password'] != password:
        result = {'error': 'Incorrect password', 'success': False}
    else:
        result = {
            'userId': user['id'],
            'username': user['username'],
            'score': user['score'],
            'correctAnswers': user['correct_answers'],
            'totalAnswers': user['total_answers'],
            'success': True
        }
        # Cache the user data
        user_cache.set(user['id'], result)
    
    release_db_connection(conn)
    return result

def get_user_profile(user_id):
    """Get user profile by user ID"""
    # Try to get from cache first
    cached_user = user_cache.get(user_id)
    if cached_user:
        return cached_user
    
    # If not in cache, get from database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    result = None
    
    if not user:
        result = {'error': 'User not found', 'success': False}
    else:
        result = {
            'userId': user['id'],
            'username': user['username'],
            'score': user['score'],
            'correctAnswers': user['correct_answers'],
            'totalAnswers': user['total_answers'],
            'success': True
        }
        # Cache the result
        user_cache.set(user_id, result)
    
    release_db_connection(conn)
    return result

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
    release_db_connection(conn)
    
    # Invalidate the user cache entry since the data has changed
    user_cache.invalidate(user_id)

def store_attempt(attempt):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        print(f"{attempt['user_id'],attempt['city_id'],attempt['selected_answer'],attempt['time_taken'],attempt['date']}")
         
        cursor.execute(
            '''    
            INSERT INTO attempts (id, username, password, score, correct_answers, total_answered) 
            VALUES (?, ?, ?, ?,?)''',
            (attempt['user_id'],attempt['city_id'],attempt['selected_answer'],attempt['time_taken'],attempt['date'])
            )
            
        conn.commit()
        release_db_connection(conn=conn)
    except Exception as e:
        print(e)



