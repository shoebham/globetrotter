
from flask import Blueprint, request, jsonify
from flask import request, jsonify, send_from_directory
from app.routes.main import check_answer,get_questions
from app.models.db import register_user, get_user_profile
api_bp = Blueprint('api', __name__)

@api_bp.route("/getQuestion")
def get_question():
    return get_questions();

@api_bp.route("/")
def index():
    return send_from_directory('static', 'index.html')

@api_bp.route("/checkAnswer", methods=["POST"])
def check_answers():
    return check_answer(request.json)

@api_bp.route("/register", methods=["POST"])
def register_user_route():
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required', 'success': False}), 400
    
    result = register_user(username)
    
    if not result.get('success'):
        return jsonify(result), 409
    
    return jsonify(result)

@api_bp.route("/user/<user_id>")
def get_user_route(user_id):
    result = get_user_profile(user_id)
    
    if not result.get('success'):
        return jsonify(result), 404
    
    return jsonify(result)