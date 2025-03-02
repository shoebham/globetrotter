import os
import sys
import platform

def debug_info():
    """Print debug information about the environment"""
    print("=== GlobeTrotter Debug Information ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print("\n=== Environment Variables ===")
    for key, value in os.environ.items():
        # Hide sensitive values
        if 'key' in key.lower() or 'secret' in key.lower() or 'password' in key.lower() or 'token' in key.lower():
            print(f"{key}: [REDACTED]")
        else:
            print(f"{key}: {value}")
    
    print("\n=== Checking Database Connection ===")
    try:
        from app.models.db import get_db_connection
        conn = get_db_connection()
        print("Database connection successful!")
        conn.close()
    except Exception as e:
        print(f"Database connection error: {e}")
    
    print("\n=== Checking Flask App ===")
    try:
        from app import create_app
        app = create_app()
        print("Flask app created successfully!")
        print(f"Flask app config: {app.config}")
    except Exception as e:
        print(f"Flask app creation error: {e}")

if __name__ == "__main__":
    debug_info() 