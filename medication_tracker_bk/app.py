from flask import Flask, send_from_directory, jsonify, request
from extensions import db, init_extensions, scheduler
from config import DATABASE_URL, JWT_SECRET_KEY, UPLOAD_FOLDER, JWT_ACCESS_TOKEN_EXPIRES, CORS_ORIGINS
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from routes.auth import auth_bp
from routes.medicine import meds_bp
from routes.care import care_bp
from routes.plans import plan_bp
from routes.version import version_bp
from schedule import generate_daily_medication_plans

app = Flask(__name__)


# ===== CORS: manual handler (flask-cors 5/6 both have wildcard-origin bug) =====
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin and origin in CORS_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin')
        if origin and origin in CORS_ORIGINS:
            resp = jsonify({})
            resp.headers['Access-Control-Allow-Origin'] = origin
            resp.headers['Vary'] = 'Origin'
            resp.headers['Access-Control-Allow-Credentials'] = 'true'
            resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            resp.headers['Access-Control-Max-Age'] = '86400'
            return resp, 204
        return jsonify({'error': 'origin not allowed'}), 403


app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_URL}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = JWT_ACCESS_TOKEN_EXPIRES

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
init_extensions(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(meds_bp, url_prefix='/api/meds')
app.register_blueprint(care_bp, url_prefix='/api/care')
app.register_blueprint(plan_bp, url_prefix='/api/plan')
app.register_blueprint(version_bp, url_prefix='/api')


@app.route('/uploads/filename')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/health')
def health():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'ok', 'db': 'ok', 'service': 'medication_tracker'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'db': str(e)}), 503


with app.app_context():
    db.create_all()
    if not scheduler.get_job('generate_daily_medication_plans'):
        scheduler.add_job(
            id='generate_daily_medication_plans',
            func=generate_daily_medication_plans,
            trigger='cron',
            hour=0, minute=1,
            replace_existing=True,
        )


print('JWT:', app.config['JWT_ACCESS_TOKEN_EXPIRES'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
