from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json
from datetime import date

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=True)  # 简化版可为空
    avatar_url = db.Column(db.String(500), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    invite_code = db.Column(db.String(16), unique=True, index=True)
    
    # 关系：一个用户可以监督多个人
    supervising = db.relationship(
        'Supervision',
        foreign_keys='Supervision.supervisor_id',
        back_populates='supervisor',
        lazy='dynamic'
    )
    
    # 关系：一个人可以被多个人监督
    supervised_by = db.relationship(
        'Supervision',
        foreign_keys='Supervision.supervised_id',
        back_populates='supervised',
        lazy='dynamic'
    )
    
    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """验证密码"""
        print(self.password_hash)
        print(password)
        return check_password_hash(self.password_hash, password) if self.password_hash else False


class MedicationGroup(db.Model):
    """服药组模型（如：早餐前、午餐后、睡前等）"""
    __tablename__ = 'medication_groups'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(50), nullable=False)  # 组名称
    description = db.Column(db.String(200), nullable=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    medications = db.relationship('Medication', back_populates='group', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'sort_order': self.sort_order,
            'medication_count': self.medications.count()
        }


class Medication(db.Model):
    """药物模型"""
    __tablename__ = 'medications'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    group_id = db.Column(db.Integer, db.ForeignKey('medication_groups.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    alias = db.Column(db.String(100), nullable=True)  # 别名/品牌名
    category = db.Column(db.String(50), nullable=True)  # 药物类型
    form = db.Column(db.String(50), nullable=True)  # 形态（片剂、胶囊等）
    specification = db.Column(db.String(100), nullable=True)  # 规格
    stock = db.Column(db.Integer, default=0)  # 当前库存
    unit = db.Column(db.String(20), default='粒')  # 库存单位
    default_dose = db.Column(db.Float, default=1.0)  # 默认剂量
    dose_unit = db.Column(db.String(20), default='片')  # 剂量单位
    frequency = db.Column(db.String(50), default='daily')  # 服用频率
    times_json = db.Column(db.Text, nullable=True)  # 服用时间点 JSON
    image_url = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', backref='medications')
    group = db.relationship('MedicationGroup', back_populates='medications')
    schedules = db.relationship('Schedule', back_populates='medication', cascade="all, delete-orphan")
    checkins = db.relationship('Checkin', back_populates='medication', lazy='dynamic')
    
    def get_times(self):
        """获取服用时间点列表"""
        import json
        if self.times_json:
            return [t.get('time') for t in json.loads(self.times_json)]
        return []
    
    def set_times(self, times_list):
        """设置服用时间点"""
        import json
        self.times_json = json.dumps(times_list, ensure_ascii=False)
    
    def to_dict(self, include_schedules=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'name': self.name,
            'alias': self.alias,
            'category': self.category,
            'form': self.form,
            'specification': self.specification,
            'stock': self.stock,
            'unit': self.unit,
            'default_dose': self.default_dose,
            'dose_unit': self.dose_unit,
            'frequency': self.frequency,
            'times': self.get_times(),
            'image_url': self.image_url,
            'notes': self.notes,
            'is_active': self.is_active,
            'group_name': self.group.name if self.group else None
        }
        if include_schedules and self.schedules:
            data['schedules'] = [s.to_dict() for s in self.schedules]
        return data


class Schedule(db.Model):
    """服药计划模型"""
    __tablename__ = 'schedules'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id'), nullable=False, index=True)
    time = db.Column(db.String(5), nullable=False)  # 格式：HH:MM
    days = db.Column(db.String, nullable=False) 
    dose = db.Column(db.Float, default=1.0)  # 本次剂量
    dose_unit = db.Column(db.String(20), default='片')
    require_photo = db.Column(db.Boolean, default=False)  # 是否需要拍照
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    medication = db.relationship('Medication', back_populates='schedules')
    checkins = db.relationship('Checkin', back_populates='schedule', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'medication_id': self.medication_id,
            'days': self.days,
            'time': self.time,
            'dose': self.dose,
            'dose_unit': self.dose_unit,
            'require_photo': self.require_photo,
            'medication_name': self.medication.name if self.medication else None,
            'stock': self.medication.stock if self.medication else 0
        }


class Checkin(db.Model):
    """打卡记录模型"""
    __tablename__ = 'checkins'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id'), nullable=False, index=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedules.id'), nullable=True)
    planned_time = db.Column(db.DateTime, nullable=True)  # 计划服药时间
    actual_time = db.Column(db.DateTime, default=datetime.utcnow)  # 实际服药时间
    dose = db.Column(db.Float, nullable=True)  # 本次服用剂量
    dose_unit = db.Column(db.String(20), nullable=True)
    is_makeup = db.Column(db.Boolean, default=False)  # 是否补打卡
    makeup_reason = db.Column(db.String(200), nullable=True)  # 补打卡原因
    status = db.Column(db.String(20), default='completed')  # completed/skipped/missed
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', backref='checkins')
    medication = db.relationship('Medication', back_populates='checkins')
    schedule = db.relationship('Schedule', back_populates='checkins')
    photos = db.relationship('CheckinPhoto', back_populates='checkin', cascade="all, delete-orphan")
    
    def to_dict(self, include_photos=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'medication_id': self.medication_id,
            'schedule_id': self.schedule_id,
            'planned_time': self.planned_time.isoformat() if self.planned_time else None,
            'actual_time': self.actual_time.isoformat() if self.actual_time else None,
            'dose': self.dose,
            'dose_unit': self.dose_unit,
            'is_makeup': self.is_makeup,
            'makeup_reason': self.makeup_reason,
            'status': self.status,
            'notes': self.notes,
            'medication_name': self.medication.name if self.medication else None
        }
        if include_photos:
            data['photos'] = [p.to_dict() for p in self.photos]
        return data


class CheckinPhoto(db.Model):
    """打卡照片模型"""
    __tablename__ = 'checkin_photos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    checkin_id = db.Column(db.Integer, db.ForeignKey('checkins.id'), nullable=False, index=True)
    photo_url = db.Column(db.String(500), nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    checkin = db.relationship('Checkin', back_populates='photos')
    
    def to_dict(self):
        return {
            'id': self.id,
            'checkin_id': self.checkin_id,
            'photo_url': self.photo_url,
            'sort_order': self.sort_order
        }


class Supervision(db.Model):
    """监督关系模型"""
    __tablename__ = 'supervisions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    supervised_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    relation_type = db.Column(db.String(20), default='friend')  # family/friend/doctor
    status = db.Column(db.String(20), default='active')  # active/blocked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    supervisor = db.relationship('User', foreign_keys=[supervisor_id], back_populates='supervising')
    supervised = db.relationship('User', foreign_keys=[supervised_id], back_populates='supervised_by')
    
    def to_dict(self):
        return {
            'id': self.id,
            'supervisor_id': self.supervisor_id,
            'supervised_id': self.supervised_id,
            'relation_type': self.relation_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'supervisor_name': self.supervisor.username if self.supervisor else None,
            'supervised_name': self.supervised.username if self.supervised else None
        }


class SupervisionRequest(db.Model):
    """监督请求模型"""
    __tablename__ = 'supervision_requests'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    message = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending/accepted/rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    
    # 关系
    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sender_name': self.sender.nickname or self.sender.username if self.sender else None,
            'receiver_name': self.receiver.nickname or self.receiver.username if self.receiver else None
        }


class DailyMedicationPlan(db.Model):
    """每日服药计划"""
    __tablename__ = 'daily_medication_plans'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id'), nullable=False, index=True)
    plan_date = db.Column(db.Date, nullable=False, index=True)  # 哪一天的计划
    scheduled_time = db.Column(db.String(5), nullable=False)  # 时间点 "08:00" 
    dose = db.Column(db.Float, default=1.0)
    dose_unit = db.Column(db.String(20), default='片')
    is_taken = db.Column(db.Boolean, default=False)  # 是否已服药
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user = db.relationship('User', backref='daily_medication_plans')
    medication = db.relationship('Medication', backref='daily_plans')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'medication_id': self.medication_id,
            'medication_name': self.medication.name if self.medication else None,
            'plan_date': self.plan_date.isoformat(),
            'scheduled_time': self.scheduled_time,
            'dose': self.dose,
            'dose_unit': self.dose_unit,
            'is_taken': self.is_taken
        }
    

def _generate_daily_plans_logic():
    today = date.today()
    weekday = today.isoweekday()

    meds = Medication.query.filter(Medication.is_active == True).all()

    for med in meds:
        times = json.loads(med.times_json)

        for item in times:
            time_str = item['time']
            days = item.get('days', [])

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