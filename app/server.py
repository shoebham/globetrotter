from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import os
from dotenv import load_dotenv
import json
import random
import sqlite3

from db import init_db
# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)


if __name__ == '__main__':
    app.run(debug=True)


