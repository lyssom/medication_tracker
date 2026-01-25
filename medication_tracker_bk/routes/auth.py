from flask import Blueprint, request, jsonify
import uuid

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    name = request.json.get("name", "test")
    return jsonify({
        "userId": str(uuid.uuid4()),
        "name": name
    })
