from flask import Flask
from flask_cors import CORS
from db import engine, Base
from routes.auth import auth_bp
from routes.medicine import medicine_bp

app = Flask(__name__)
CORS(app)

Base.metadata.create_all(bind=engine)

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(medicine_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
