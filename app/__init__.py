from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

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
    from app.models.db import init_db
    init_db()
    
    return app