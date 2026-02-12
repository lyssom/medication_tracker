from datetime import date
from models import Medication, DailyMedicationPlan
from app import db, app
import json

def generate_daily_medication_plans():
    today = date.today()
    weekday = today.isoweekday()  # 1~7，周一~周日

    meds = Medication.query.filter(Medication.is_active == True).all()

    for med in meds:
        times = json.loads(med.times_json)  # [{time, days}, ...]
        print(med.name, times)

        for item in times:
            time_str = item['time']
            days = item.get('days', [])

            # ⭐ 核心：今天不在服药日，直接跳过
            if weekday not in days:
                continue

            exists = DailyMedicationPlan.query.filter_by(
                user_id=med.user_id,
                medication_id=med.id,
                plan_date=today,
                scheduled_time=time_str
            ).first()

            if exists:
                continue

            plan = DailyMedicationPlan(
                user_id=med.user_id,
                medication_id=med.id,
                plan_date=today,
                scheduled_time=time_str,
                dose=med.default_dose,
                dose_unit=med.dose_unit,
                is_taken=False
            )

            db.session.add(plan)

    db.session.commit()

if __name__ == '__main__':
    print('Generating daily medication plans...')
    with app.app_context():
        generate_daily_medication_plans()
