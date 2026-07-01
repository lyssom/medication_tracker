# routes/version.py
import json
import os
from flask import Blueprint, jsonify

version_bp = Blueprint('version', __name__, url_prefix='/version')

# 配置文件路径
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
LATEST_JSON = os.path.join(PROJECT_ROOT, 'uploads', 'latest.json')

# 默认 fallback
DEFAULT_VERSION = {
    "version": "0.0.1",
    "build": 1,
    "released_at": "1970-01-01T00:00:00Z",
    "mandatory": False,
    "download_url": "",
    "notes": "当前已是最新版本"
}


@version_bp.route('/latest', methods=['GET'])
def get_latest_version():
    """获取最新版本信息"""
    try:
        if os.path.exists(LATEST_JSON):
            with open(LATEST_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 验证必要字段
            required = ['version', 'build']
            if not all(k in data for k in required):
                return jsonify({"error": "latest.json 缺少必要字段", "data": DEFAULT_VERSION}), 200

            return jsonify({
                "success": True,
                "data": data
            }), 200
        else:
            return jsonify({
                "success": True,
                "data": DEFAULT_VERSION,
                "note": "latest.json 不存在，返回默认"
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": DEFAULT_VERSION
        }), 200
