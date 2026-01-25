from flask import Blueprint, request, jsonify
from db import SessionLocal
from models import Medicine
import uuid

medicine_bp = Blueprint("medicine", __name__)

@medicine_bp.route("/medicines", methods=["GET"])
def list_medicines():
    user_id = request.args.get("userId")
    db = SessionLocal()
    meds = db.query(Medicine).filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": m.id,
            "name": m.name,
            "dose": m.dose,
            "times": m.times.split(",")
        } for m in meds
    ])

@medicine_bp.route("/medicines", methods=["POST"])
def create_medicine():
    data = request.json
    db = SessionLocal()
    med = Medicine(
        id=str(uuid.uuid4()),
        user_id=data["userId"],
        name=data["name"],
        dose=data["dose"],
        times=",".join(data["times"])
    )
    db.add(med)
    db.commit()
    return jsonify({"ok": True})
