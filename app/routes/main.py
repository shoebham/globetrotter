from flask import Blueprint, render_template, send_from_directory, jsonify
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3
from app.models.db import init_db, update_user_score, get_db_connection, release_db_connection, question_cache, city_lookup_cache, preprocess_city_data

main_bp = Blueprint('main', __name__)


init_db()

# Pre-compute question options for faster response
question_options_cache = {}

def get_questions():
    """Get a random question with options"""
    global question_options_cache
    
    # Try to get a random question from cache first
    cached_questions = question_cache.get('all_cities')
    
    if not cached_questions:
        # If not in cache, fetch from database
        conn = get_db_connection()
        cursor = conn.cursor()    
        cursor.execute("SELECT * FROM cities")
        cities = [preprocess_city_data(dict(row)) for row in cursor.fetchall()]
        release_db_connection(conn)
        
        # Cache all cities for future use
        if cities:
            question_cache.set('all_cities', cities)
            
            # Also build and cache a lookup dictionary for faster access by ID
            city_dict = {city['id']: city for city in cities}
            city_lookup_cache.set('cities_by_id', city_dict)
            
            # Pre-compute question options for each city
            for city in cities:
                city_id = city['id']
                country = city['country']
                # Get other cities (avoiding same city and country)
                other_cities = [c for c in cities if c['id'] != city_id and c['country'] != country]
                if len(other_cities) >= 3:
                    other_cities = random.sample(other_cities, 3)
                options = [c['city'] for c in other_cities]
                options.append(city['city'])
                random.shuffle(options)
                question_options_cache[city_id] = options
            
            cached_questions = cities
    
    if cached_questions:
        # Select a random city from the cached list
        city = random.choice(cached_questions)
        city_id = city['id']
        
        # Use pre-parsed clues if available
        if 'clues_parsed' in city:
            clues = city['clues_parsed']
        else:
            clues = json.loads(city['clues'])
        
        # Use pre-computed options if available
        if city_id in question_options_cache:
            options = question_options_cache[city_id].copy()  # Make a copy to avoid modifying the cache
        else:
            # Fallback to computing options on the fly
            other_cities = [c for c in cached_questions if c['id'] != city_id and c['country'] != city['country']]
            if len(other_cities) >= 3:
                other_cities = random.sample(other_cities, 3)
            options = [c['city'] for c in other_cities]
            options.append(city['city'])
            random.shuffle(options)
            # Cache for next time
            question_options_cache[city_id] = options.copy()
            
        question = {
            'question': clues[int(random.random()*len(clues))],
            'options': options,
            'questionId': city_id
        }
        return question
    else:
        # Fallback to database if cache is empty
        conn = get_db_connection()
        cursor = conn.cursor()    
        cursor.execute("SELECT * FROM cities ORDER BY RANDOM() LIMIT 1")
        city = preprocess_city_data(dict(cursor.fetchone()))
        cursor.execute("SELECT id, city FROM cities WHERE id != ? and country!=?  ORDER BY RANDOM() LIMIT 3", (city['id'],city['country']))
        other_cities = [dict(row) for row in cursor.fetchall()]
        
        # Use pre-parsed clues if available
        if 'clues_parsed' in city:
            clues = city['clues_parsed']
        else:
            clues = json.loads(city['clues'])
            
        options = [c['city'] for c in other_cities]
        options.append(city['city'])
        random.shuffle(options)
        
        question = {
            'question': clues[int(random.random()*len(clues))],
            'options': options,
            'questionId': city['id']
        }
        release_db_connection(conn)
        return question



def check_answer(response):    
    user_answer = response['answer']
    questionId = response['questionId']
    user_id = response.get('userId')

    # Try to get city from the lookup cache first (fastest)
    city_dict = city_lookup_cache.get('cities_by_id')
    city = None
    
    if city_dict and questionId in city_dict:
        # Direct dictionary lookup - O(1) operation
        city = city_dict[questionId]
    else:
        # Try to get from the cities list cache
        cached_questions = question_cache.get('all_cities')
        if cached_questions:
            # Create a temporary lookup dictionary for faster access
            temp_dict = {c['id']: c for c in cached_questions}
            if questionId in temp_dict:
                city = temp_dict[questionId]
                # Also update the lookup cache for next time
                if not city_dict:
                    city_dict = {}
                city_dict[questionId] = city
                city_lookup_cache.set('cities_by_id', city_dict)
    
    # If not found in cache, get from database
    if not city:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cities where id = ?",(questionId,))
        city_row = cursor.fetchone()
        if city_row:
            city = preprocess_city_data(dict(city_row))
            # Update caches
            if not city_dict:
                city_dict = {}
            city_dict[questionId] = city
            city_lookup_cache.set('cities_by_id', city_dict)
        release_db_connection(conn)

    if not city:
        return jsonify({
            'error': 'City not found',
            'correct': False,
            'points': 0
        }), 404

    is_correct = user_answer == city['city']

    # Update user score if user is logged in
    if user_id:
        # Do this in a separate thread to avoid blocking the response
        import threading
        threading.Thread(target=update_user_score, args=(user_id, is_correct)).start()
    
    # Use pre-parsed fun facts if available
    if 'fun_fact_parsed' in city:
        fun_facts = city['fun_fact_parsed']
    else:
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