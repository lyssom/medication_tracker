from flask import Flask, send_from_directory
from flask_cors import CORS
from extensions import db, init_extensions, scheduler
from config import DATABASE_URL, JWT_SECRET_KEY, UPLOAD_FOLDER, JWT_ACCESS_TOKEN_EXPIRES
import os

# 导入蓝图
# from routes import auth_bp, users_bp, meds_bp, checkin_bp, social_bp
from routes.auth import auth_bp
from routes.medicine import meds_bp
from routes.care import care_bp
from routes.plans import plan_bp
from schedule import generate_daily_medication_plans

# 创建应用
app = Flask(__name__)
CORS(app)

# 配置
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_URL}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = JWT_ACCESS_TOKEN_EXPIRES 

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 初始化扩展
init_extensions(app)

# 注册蓝图
app.register_blueprint(auth_bp, url_prefix='/api/auth')
# app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(meds_bp, url_prefix='/api/meds')
app.register_blueprint(care_bp, url_prefix='/api/care')
app.register_blueprint(plan_bp, url_prefix='/api/plan')
# app.register_blueprint(checkin_bp, url_prefix='/api')
# app.register_blueprint(social_bp, url_prefix='/api')

# 提供上传文件的静态访问
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """提供上传文件的访问"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# 创建数据库表
with app.app_context():
    db.create_all()
    # 防止重复注册（Flask reload / 多次 init）
    if not scheduler.get_job('generate_daily_medication_plans'):
        scheduler.add_job(
            id='generate_daily_medication_plans',
            func=generate_daily_medication_plans,
            trigger='cron',
            hour=0,
            minute=1,
            replace_existing=True,
        )


print("JWT过期时间:", app.config["JWT_ACCESS_TOKEN_EXPIRES"])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
