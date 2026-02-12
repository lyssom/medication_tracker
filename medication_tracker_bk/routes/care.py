# routes/care.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Supervision

care_bp = Blueprint('care', __name__, url_prefix='/api/care')


@care_bp.route('/my_cares', methods=['GET'])
@jwt_required()
def get_my_cares():
    """
    获取我关心的人列表
    """
    user_id = get_jwt_identity()
    print (user_id)
    supervisions = (
        db.session.query(Supervision)
        .filter(Supervision.supervisor_id == user_id, Supervision.status == 'active')
        .all()
    )

    result = [s.to_dict() for s in supervisions]
    return jsonify({'success': True, 'my_cares': result})


@care_bp.route('/cares_me', methods=['GET'])
@jwt_required()
def get_cares_me():
    """
    获取关心我的人列表
    """
    print(22222)
    user_id = get_jwt_identity()
    supervisions = (
        db.session.query(Supervision)
        .filter(Supervision.supervised_id == user_id, Supervision.status == 'active')
        .all()
    )
    print(supervisions)

    result = [s.to_dict() for s in supervisions]
    print(result)
    return jsonify({'success': True, 'cares_me': result})


@care_bp.route('/add', methods=['POST'])
@jwt_required()
def add_care():
    """
    添加“我关心的人”
    请求 JSON: { "invite_code": "xxxx", "relation_type": "friend" }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()

    invite_code = data.get('invite_code')
    relation_type = data.get('relation_type', 'friend')

    if not invite_code:
        return jsonify({"msg": "缺少邀请码"}), 400

    # 通过邀请码查找被关心的人
    supervised_user = User.query.filter_by(invite_code=invite_code).first()
    if not supervised_user:
        return jsonify({"msg": "邀请码无效"}), 404

    # 不能关心自己
    if supervised_user.id == current_user_id:
        return jsonify({"msg": "不能添加自己"}), 400

    # 检查是否已经存在关系
    existing = Supervision.query.filter_by(
        supervisor_id=current_user_id,
        supervised_id=supervised_user.id
    ).first()
    if existing:
        return jsonify({"msg": "已经关心该用户"}), 400

    # 创建新的监督关系
    supervision = Supervision(
        supervisor_id=current_user_id,
        supervised_id=supervised_user.id,
        relation_type=relation_type,
        status='active'
    )

    db.session.add(supervision)
    db.session.commit()

    return jsonify({
        "msg": "添加成功",
        "supervision": supervision.to_dict(),
        "user": {
            "id": supervised_user.id,
            "username": supervised_user.username
        }
    }), 201
