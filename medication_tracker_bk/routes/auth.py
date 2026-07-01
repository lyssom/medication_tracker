from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import User
from extensions import db
import uuid
import secrets
import string

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    print('login')

    data = request.get_json(silent=True) or {}
    print(data)

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username:
        return jsonify({'error': '用户名不能为空'}), 400

    if not password:
        return jsonify({'error': '密码不能为空'}), 400

    db_session = db.session
    user = db_session.query(User).filter(User.username == username).first()

    if not user:
        return jsonify({'error': '用户名或密码错误'}), 401

    if not user.check_password(password):
        return jsonify({'error': '用户名或密码错误'}), 401

    access_token = create_access_token(identity=str(user.id))
    print({
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'avatar_url': user.avatar_url,
            'invite_code': user.invite_code,
        },
        'access_token': access_token
    })

    return jsonify({
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'avatar_url': user.avatar_url,
            'invite_code': user.invite_code,
        },
        'access_token': access_token
    }), 200


def generate_invite_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    username = data.get('username', '').strip()
    password = data.get('password', '123456')
    invitation = data.get('invitation', '').strip()

    if not username:
        return jsonify({'error': '用户名不能为空'}), 400

    if not invitation:
        return jsonify({'error': '邀请码不能为空'}), 400

    db_session = db.session

    # 用户名是否存在
    if db_session.query(User).filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 400

    invited_by_user = None

    # ✅ 邀请码校验
    if invitation != 'lyssom':
        invited_by_user = (
            db_session.query(User)
            .filter(User.invite_code == invitation)
            .first()
        )
        if not invited_by_user:
            return jsonify({'error': '邀请码无效'}), 400

    # 创建用户
    user = User(
        username=username,
    )

    if password:
        user.set_password(password)

    while True:
        code = generate_invite_code()
        if not db_session.query(User).filter_by(invite_code=code).first():
            user.invite_code = code
            break

    db_session.add(user)
    db_session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': '注册成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'invite_code': user.invite_code,
        },
        'access_token': access_token
    }), 201
