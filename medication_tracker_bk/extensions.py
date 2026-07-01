from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask import jsonify
from flask_apscheduler import APScheduler

db = SQLAlchemy()
jwt = JWTManager()
scheduler = APScheduler()


@jwt.unauthorized_loader
def unauthorized_callback(reason):
    print('Missing or invalid token:', reason)
    return jsonify({'msg': reason}), 401


def init_extensions(app):
    db.init_app(app)
    jwt.init_app(app)
    app.config['SCHEDULER_API_ENABLED'] = False
    scheduler.init_app(app)
    scheduler.start()
