from models import _generate_daily_plans_logic
from extensions import scheduler   # ← 加 scheduler


def generate_daily_medication_plans():
    # ⭐ 关键：手动加 app_context
    with scheduler.app.app_context():
        _generate_daily_plans_logic()