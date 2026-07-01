from flask import Blueprint, request, jsonify
from datetime import date
from models import DailyMedicationPlan
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

plan_bp = Blueprint("daily_plan", __name__, url_prefix="/plan")


@plan_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_plans():
    # TODO: 换成真正的登录用户
    user_id = get_jwt_identity()  

    today = date.today()

    plans = (
        DailyMedicationPlan.query
        .filter_by(user_id=user_id, plan_date=today)
        .order_by(DailyMedicationPlan.scheduled_time)
        .all()
    )

    # 用模型自带的 to_dict 方法
    print([p.to_dict() for p in plans])
    return jsonify([p.to_dict() for p in plans])



@plan_bp.route("/take", methods=["POST"])
@jwt_required()
def mark_plan_as_taken():
    """
    请求 JSON:
    {
      "plan_id": 123
    }
    返回 JSON:
    {
      "success": true/false,
      "message": "...",
      "data": {...}
    }
    """
    json_data = request.get_json()
    print(json_data)

    user_id = get_jwt_identity()

    if not json_data or "plan_id" not in json_data:
        return jsonify({"success": False, "message": "缺少 plan_id", "data": None}), 400

    plan_id = json_data["plan_id"]

    plan = DailyMedicationPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({"success": False, "message": "计划不存在", "data": None}), 404

    if plan.is_taken:
        return jsonify({"success": True, "message": "计划已服药", "data": plan.to_dict()})

    plan.is_taken = True
    db.session.commit()

    return jsonify({"success": True, "message": "标记已服药成功", "data": plan.to_dict()})


@plan_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_plans():
    """
    查询当前用户的全部服药计划（历史 + 今天 + 未来）
    """
    user_id = get_jwt_identity()

    plans = (
        DailyMedicationPlan.query
        .filter_by(user_id=user_id)
        .order_by(
            DailyMedicationPlan.plan_date.desc(),
            DailyMedicationPlan.scheduled_time.asc()
        )
        .all()
    )

    return jsonify([p.to_dict() for p in plans])


@plan_bp.route("/care/<int:user_id>", methods=["GET"])
@jwt_required()
def get_care_user_today_plans(user_id):
    """
    查询我关心的某个用户，今天的服药情况
    """
    current_user_id = get_jwt_identity()
    today = date.today()

    # 1️⃣ 校验关心关系
    # relation = CareRelation.query.filter_by(
    #     carer_id=current_user_id,
    #     supervised_id=user_id
    # ).first()

    # if not relation:
    #     return jsonify({
    #         "success": False,
    #         "message": "无权限查看该用户的服药信息",
    #         "data": None
    #     }), 403

    # 2️⃣ 查询今天的服药计划
    plans = (
        DailyMedicationPlan.query
        .filter_by(user_id=user_id, plan_date=today)
        .order_by(DailyMedicationPlan.scheduled_time)
        .all()
    )

    return jsonify({
        "success": True,
        "message": "ok",
        "data": [p.to_dict() for p in plans]
    })