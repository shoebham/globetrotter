from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3

from app import create_app
# Load environment variables
load_dotenv()

app = create_app()

if __name__ == '__main__':
    # Use threaded=True for better performance
    app.run(debug=True, threaded=True)


