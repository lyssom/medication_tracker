from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask import jsonify
from flask_apscheduler import APScheduler

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
scheduler = APScheduler()

@jwt.unauthorized_loader
def unauthorized_callback(reason):
    print("缺少或无效 token:", reason)
    return jsonify({"msg": reason}), 401



def init_extensions(app):
    """初始化 Flask 扩展"""
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)


    # ===== 定时任务配置 =====
    app.config['SCHEDULER_API_ENABLED'] = False

    scheduler.init_app(app)
    scheduler.start()