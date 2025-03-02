from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
import sqlite3
import json

# Load environment variables from .env file if it exists
load_dotenv()

def create_app():
    # Create Flask app with proper configuration
    app = Flask(__name__)
    
    # Configure app based on environment
    if os.environ.get('RAILWAY_ENVIRONMENT') == 'production':
        app.config['ENV'] = 'production'
        app.config['DEBUG'] = False
        app.config['TESTING'] = False
    else:
        app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')
        app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    from app.routes.main import main_bp
    from app.routes.api import api_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Initialize database
    from app.models.db import init_db, question_cache, get_db_connection, release_db_connection
    init_db()
    
    # Preload data into cache for better performance
    preload_cache()
    
    return app

def preload_cache():
    """Preload frequently accessed data into cache"""
    from app.models.db import question_cache, get_db_connection, release_db_connection
    
    # Preload cities data
    try:
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Load all cities into cache
        cursor.execute("SELECT * FROM cities")
        cities = [dict(row) for row in cursor.fetchall()]
        if cities:
            question_cache.set('all_cities', cities)
            print(f"Preloaded {len(cities)} cities into cache")
        
        release_db_connection(conn)
    except Exception as e:
        print(f"Error preloading cache: {e}")