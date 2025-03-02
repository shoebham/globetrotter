from flask import Flask, request, g
from flask_cors import CORS
import os
from dotenv import load_dotenv
import sqlite3
import json
import time

# Load environment variables from .env file if it exists
load_dotenv()

class ProfilingMiddleware:
    def __init__(self, app):
        self.app = app
        
    def __call__(self, environ, start_response):
        start_time = time.time()
        
        def custom_start_response(status, headers, exc_info=None):
            # Add timing header
            headers.append(('X-Response-Time', str(time.time() - start_time)))
            return start_response(status, headers, exc_info)
        
        return self.app(environ, custom_start_response)

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
    
    # Add profiling middleware
    app.wsgi_app = ProfilingMiddleware(app.wsgi_app)
    
    # Add request timing
    @app.before_request
    def before_request():
        g.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        diff = time.time() - g.start_time
        response.headers['X-Processing-Time'] = str(diff)
        if diff > 0.5:  # Log slow requests
            app.logger.warning(f"Slow request: {request.path} took {diff:.2f}s")
        return response
    
    # Register blueprints
    from app.routes.main import main_bp
    from app.routes.api import api_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Initialize database
    from app.models.db import init_db, question_cache, get_db_connection, release_db_connection, city_lookup_cache, preprocess_city_data
    init_db()
    
    # Preload data into cache for better performance
    preload_cache()
    
    # Add a route to check performance
    @app.route('/performance')
    def performance():
        """Endpoint to check performance metrics"""
        from app.models.db import memory_connection, USE_MEMORY_DB, USE_OPTIMIZATIONS
        
        metrics = {
            'optimizations_enabled': USE_OPTIMIZATIONS,
            'memory_db_enabled': USE_MEMORY_DB,
            'memory_db_initialized': memory_connection is not None,
            'cache_stats': {
                'cities_cached': question_cache.get('all_cities') is not None,
                'city_lookup_cached': city_lookup_cache.get('cities_by_id') is not None
            }
        }
        
        return json.dumps(metrics)
    
    return app

def preload_cache():
    """Preload frequently accessed data into cache"""
    from app.models.db import question_cache, get_db_connection, release_db_connection, city_lookup_cache, preprocess_city_data
    
    # Preload cities data
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Load all cities into cache
        cursor.execute("SELECT * FROM cities")
        cities = [preprocess_city_data(dict(row)) for row in cursor.fetchall()]
        
        if cities:
            # Cache the list of cities
            question_cache.set('all_cities', cities)
            
            # Also build and cache a lookup dictionary for faster access by ID
            city_dict = {city['id']: city for city in cities}
            city_lookup_cache.set('cities_by_id', city_dict)
            
            print(f"Preloaded {len(cities)} cities into cache with preprocessing")
        
        release_db_connection(conn)
    except Exception as e:
        print(f"Error preloading cache: {e}")