from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Medication, MedicationGroup, Schedule, _generate_daily_plans_logic, DailyMedicationPlan
from extensions import db
import json

meds_bp = Blueprint('meds', __name__)


@meds_bp.route('/groups', methods=['GET'])
@jwt_required()
def get_groups():
    """获取服药组列表"""
    current_user_id = get_jwt_identity()
    db_session = db.session
    
    groups = db_session.query(MedicationGroup).filter(
        MedicationGroup.user_id == current_user_id
    ).order_by(MedicationGroup.sort_order).all()
    
    return jsonify({
        'groups': [g.to_dict() for g in groups]
    })


@meds_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    """创建服药组"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': '组名称不能为空'}), 400
    
    db_session = db.session
    
    # 获取最大排序号
    max_order = db_session.query(db.func.max(MedicationGroup.sort_order)).filter(
        MedicationGroup.user_id == current_user_id
    ).scalar() or 0
    
    group = MedicationGroup(
        user_id=current_user_id,
        name=name,
        description=data.get('description', ''),
        sort_order=max_order + 1
    )
    
    db_session.add(group)
    db_session.commit()
    
    return jsonify({
        'message': '创建成功',
        'group': group.to_dict()
    }), 201


@meds_bp.route('/groups/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    """更新服药组"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    db_session = db.session
    group = db_session.query(MedicationGroup).filter(
        MedicationGroup.id == group_id,
        MedicationGroup.user_id == current_user_id
    ).first()
    
    if not group:
        return jsonify({'error': '服药组不存在'}), 404
    
    if 'name' in data:
        group.name = data['name'].strip()
    if 'description' in data:
        group.description = data['description']
    if 'sort_order' in data:
        group.sort_order = data['sort_order']
    
    db_session.commit()
    
    return jsonify({
        'message': '更新成功',
        'group': group.to_dict()
    })


@meds_bp.route('/groups/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    """删除服药组"""
    current_user_id = get_jwt_identity()
    db_session = db.session
    
    group = db_session.query(MedicationGroup).filter(
        MedicationGroup.id == group_id,
        MedicationGroup.user_id == current_user_id
    ).first()
    
    if not group:
        return jsonify({'error': '服药组不存在'}), 404
    
    # 将组内药物的 group_id 设为 null
    for med in group.medications:
        med.group_id = None
    
    db_session.delete(group)
    db_session.commit()
    
    return jsonify({'message': '删除成功'})


@meds_bp.route('', methods=['GET'])
@jwt_required()
def get_medications():
    current_user_id = get_jwt_identity()
    group_id = request.args.get('group_id', type=int)
    keyword = request.args.get('keyword', '').strip()
    
    db_session = db.session
    
    query = db_session.query(Medication).filter(
        Medication.user_id == current_user_id,
        Medication.is_active == True
    )
    
    if group_id:
        query = query.filter(Medication.group_id == group_id)
    
    if keyword:
        query = query.filter(
            (Medication.name.contains(keyword)) | 
            (Medication.alias.contains(keyword))
        )
    
    medications = query.order_by(Medication.created_at.desc()).all()
    print(666666)
    print(medications)
    
    return jsonify({
        'medications': [m.to_dict() for m in medications]
    })


@meds_bp.route('', methods=['POST'])
@jwt_required()
def create_medication():
    """创建药物"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': '药物名称不能为空'}), 400
    
    db_session = db.session
    
    # 创建药物
    medication = Medication(
        user_id=current_user_id,
        group_id=data.get('group_id'),
        name=name,
        alias=data.get('alias'),
        category=data.get('category'),
        form=data.get('form'),
        specification=data.get('specification'),
        stock=data.get('stock', 0),
        unit=data.get('unit', '粒'),
        default_dose=data.get('default_dose', 1.0),
        dose_unit=data.get('dose_unit', '片'),
        frequency=data.get('frequency', 'daily'),
        times_json=json.dumps(data.get('times', []), ensure_ascii=False),
        image_url=data.get('image_url'),
        notes=data.get('notes')
    )
    
    db_session.add(medication)
    db_session.flush()  # 获取 medication.id
    
    # 创建服药计划
    times = data.get('times', [])
    default_dose = data.get('default_dose', 1.0)
    dose_unit = data.get('dose_unit', '片')
    
    for time_str in times:
        print(time_str)
        schedule = Schedule(
            medication_id=medication.id,
            time=time_str.get('time'),
            days=json.dumps(time_str.get('days')),
            dose=default_dose,
            dose_unit=dose_unit,
            require_photo=data.get('require_photo', False)
        )
        db_session.add(schedule)
    
    db_session.commit()

    _generate_daily_plans_logic()
    
    return jsonify({
        'message': '创建成功',
        'medication': medication.to_dict()
    }), 201


@meds_bp.route('/<int:med_id>', methods=['GET'])
@jwt_required()
def get_medication(med_id):
    """获取药物详情"""
    current_user_id = get_jwt_identity()
    db_session = db.session
    
    medication = db_session.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == current_user_id
    ).first()
    
    if not medication:
        return jsonify({'error': '药物不存在'}), 404
    
    return jsonify({
        'medication': medication.to_dict()
    })


@meds_bp.route('/<int:med_id>', methods=['PUT'])
@jwt_required()
def update_medication(med_id):
    """更新药物信息"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    db_session = db.session
    medication = db_session.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == current_user_id
    ).first()
    
    if not medication:
        return jsonify({'error': '药物不存在'}), 404
    
    # 更新药物基本信息
    updatable_fields = [
        'name', 'alias', 'category', 'form', 'specification',
        'stock', 'unit', 'default_dose', 'dose_unit', 'frequency',
        'image_url', 'notes', 'group_id', 'is_active'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(medication, field, data[field])
    
    # 更新时间点
    if 'times' in data:
        medication.times_json = json.dumps(data['times'], ensure_ascii=False)
        
        # 更新服药计划
        # 先删除旧的计划
        db_session.query(Schedule).filter(Schedule.medication_id == med_id).delete()
        
        # 创建新的计划
        for time_str in data['times']:
            schedule = Schedule(
                medication_id=medication.id,
                time=time_str,
                dose=medication.default_dose,
                dose_unit=medication.dose_unit,
                require_photo=data.get('require_photo', False)
            )
            db_session.add(schedule)
    
    db_session.commit()
    
    return jsonify({
        'message': '更新成功',
        'medication': medication.to_dict()
    })


@meds_bp.route('/<int:med_id>', methods=['DELETE'])
@jwt_required()
def delete_medication(med_id):
    """物理删除药物"""
    current_user_id = get_jwt_identity()
    db_session = db.session

    medication = db_session.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == current_user_id
    ).first()

    if not medication:
        return jsonify({'error': '药物不存在'}), 404

    try:
        # 1️⃣ 删除每日计划
        DailyMedicationPlan.query.filter_by(
            medication_id=med_id
        ).delete()

        # 2️⃣ 删除 schedule
        Schedule.query.filter_by(
            medication_id=med_id
        ).delete()

        # 3️⃣ 删除药物本身
        db_session.delete(medication)

        db_session.commit()

        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500

@meds_bp.route('/<int:med_id>/stock', methods=['POST'])
@jwt_required()
def update_stock(med_id):
    """更新药物库存"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    operation = data.get('operation', 'set')  # set/add/subtract
    amount = data.get('amount', 0)
    
    db_session = db.session
    medication = db_session.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == current_user_id
    ).first()
    
    if not medication:
        return jsonify({'error': '药物不存在'}), 404
    
    if operation == 'set':
        medication.stock = amount
    elif operation == 'add':
        medication.stock += amount
    elif operation == 'subtract':
        medication.stock = max(0, medication.stock - amount)
    else:
        return jsonify({'error': '无效操作'}), 400
    
    db_session.commit()
    
    return jsonify({
        'message': '库存更新成功',
        'stock': medication.stock
    })
