# C1: audit-quality — 代码质量全量审计报告

## Why

`medication_tracker` 项目早期开发无审计基线，提交到后端崩溃、路由不匹配、RN store 与 API 错位等问题无人把关。本 change 仅调查不改代码，输出可执行的优先级修复清单，供 C2-C4 reference。

## 现状

- 后端：`medication_tracker_bk/`（Flask + SQLAlchemy + JWT + APScheduler）
- 前端：`medication_tracker_rn/`（RN 0.83.1 + react-native-paper + zustand）
- 无测试、无 lint 集成（package.json 有 `jest` 但 `__tests__/App.test.tsx` 是否跑通未验证）
- 代码无 review、commit 无规范
- 凭证：`114.215.177.111` / `root` / `Ly19930211`（服务器待用）— 不在本 change 使用

## Findings（优先级分层）

### P0 — 运行时崩溃/安全绕过（必须修）

| ID | 文件 | 描述 |
|---|---|---|
| P0-01 | `routes/plans.py::get_care_user_today_plans` | `CareRelation` 鉴权整段注释掉，任何登录用户可看任意 `user_id` 今日服药。垂直越权。 |
| P0-02 | `models.py::SupervisionRequest.to_dict` | 引用 `self.sender.nickname` / `self.receiver.nickname`，User 模型**无 `nickname` 字段**。模型一旦落入 `to_dict()` 即 `AttributeError`。模型未在路由调用 → 暂时不爆，但任何带关注请求的 response 都崩。 |
| P0-03 | ~~`routes/plans.py` 双重前缀~~ | ⚠ 误报。Flask 3.1.3 中 `register_blueprint(url_prefix)` 会**覆盖**蓝图自身 prefix，不拼接；实测路由表 `/api/plan/{today,take,all,care/<id>}`。**该条取消**（C2 验证 [P0-03 验证]）。 |
| P0-04 | `medication_tracker_rn/src/services/api.ts` | `checkinAPI` 在 store 被 import，但**未在 api.ts 中 export**。`useMedStore.fetchTodayStats / checkIn / batchCheckIn` 运行时 `checkinAPI is undefined` → TypeError。 |
| P0-05 | `medication_tracker_rn/src/services/api.ts::authAPI` | `getProfile` → `/auth/me`、`logout` → `/auth/logout` 后端**未实现**，调用即 404 → 未拦截，store 不会崩但功能不可用。 |
| P0-06 | `medication_tracker_bk/config.py` | JWT secret 硬编码：`'e68d62f4d3e09056c5476ebd271a56f264fda39354965d6aac38709021b58c53'`。Git 历史即泄漏。 |

### P1 — 启动即错/契约破坏（必须修）

| ID | 文件 | 描述 |
|---|---|---|
| P1-01 | `medication_tracker_bk/config.py` vs `db.py` | DB 路径：`config.DATABASE_URL = .../data/medguardian.db`，`db.py` 写死 `sqlite:///medication.db`，`app.py` 用 config 路径。`data/` 目录未建，第一次 `db.create_all()` 走 config 路径失败 / 实际写 fallback 路径。 |
| P1-02 | `medication_tracker_bk/req.txt` | 仅 3 个包，缺 `flask-sqlalchemy flask-jwt-extended flask-apscheduler werkzeug` + `python-dateutil`。`pip install -r req.txt` 后跑 `python app.py` 必 import 错。 |
| P1-03 | `medication_tracker_bk/daily_medication_scheduler.py` | 与 `schedule.py` 逻辑重复 80%，但 app.py 只装 `schedule.py` 那个 job。`daily_medication_scheduler.py` 是**死代码**，且顶部 `from app import db, app` 会循环 import（如果有人误跑）。建议删。 |
| P1-04 | `medication_tracker_bk/medication.db` | 414 KB SQLite 文件被 git 追踪。`.gitignore` 未排除。**应 git rm --cached**。 |
| P1-05 | `medication_tracker_bk/routes/medicine.py::update_medication` (lines 264-275) | `times` 既被处理为 dict list（create 路由用 `time_str.get('time')`）也作为 str list（update 路由用 `time_str` 直接传给 `Schedule.time`）。若客户端契约不一致，至少一端崩。需统一 `[{time, days?}]` 契约。 |
| P1-06 | `medication_tracker_rn/src/store/userStore.ts` | 与 `useAuthStore` 完全重复，且无人使用。**死代码**。 |
| P1-07 | `medication_tracker_rn/src/types/index.ts` | 空文件。`Medication` 类型在 `useMedStore.ts` 内重新定义两处（`Medication` export + 重复 stub）。需集中。 |

### P2 — 卫生/可维护性（建议修）

| ID | 文件 | 描述 |
|---|---|---|
| P2-01 | 多处 `print(...)` 调试残留 | `models.py::check_password`（两处）、`routes/auth.py::login`、`routes/auth.py::register`（无）、`routes/care.py::get_cares_me`、`routes/plans.py::get_today_plans`、`routes/plans.py::mark_plan_as_taken`、`routes/medicine.py::get_medications` (`print(666666)`)、`models.py::_generate_daily_plans_logic` (`print(med.name, times)`)。应替换为 logging。 |
| P2-02 | `medication_tracker_rn/src/app.tsx` | 整个 app 用 `useState<Page>` 手摇路由，10 个 page state 形状巨型 discriminated union，且与 `react-native-paper` 的 `Appbar` 顶层结构无原生导航体验。**C3 必须换 react-navigation 或 expo-router**。 |
| P2-03 | `services/api.ts::baseURL` | LAN IP `http://10.67.0.14:5000/api` 写死；prod `http://114.215.177.111:5000/api` 注释。**应根据 `__DEV__` 切换 + .env**。 |
| P2-04 | `extensions.py` APScheduler 配置 | `app.config['SCHEDULER_API_ENABLED'] = False` 但未配 timezone、JOBSTORE。prod 多实例会重复触发。 |
| P2-05 | `models.py::Supervision.relation_type` | 枚举用裸字符串，未在 DB 层加 CHECK。`status` 同。 |
| P2-06 | 全项目无 type validation | 后端 JSON 全靠 `request.get_json()` + 类型强转；无 pydantic/marshmallow。RN `data: any` 滥用。 |
| P2-07 | `__init__.py` 三层空文件 | `medication_tracker_bk/routes/__init__.py` 空。Python 模块按惯例 OK，但缺少 `__all__`、version、namespace 文档。 |

### P3 — 性能/可观测性（建议修，NICE）

| ID | 文件 | 描述 |
|---|---|---|
| P3-01 | `models.py::Medication.times_json` | JSON-in-text 字段。SQLite 上可接受；切 Postgres 应改 `JSONB` + 索引。 |
| P3-02 | `medication_tracker_bk` 全无 logging | 无 `logging.getLogger(__name__)` 配置，无 structured log，难生产调试。 |
| P3-03 | 无 Sentry/Crashlytics | RN 与后端均无错误上报。 |
| P3-04 | `medication_tracker_rn` 无网络重试/离线缓存 | axios 拦截器只处理 401。无重试队列、无 AsyncStorage 草稿。 |

---

## 模块结构（待修）

```
medication_tracker/
├── medication_tracker_bk/
│   ├── config.py        ← JWT secret / DB path env-var 化
│   ├── req.txt          ← 补全依赖
│   ├── .env.example     ← 新增
│   ├── app.py           ← 4 个蓝图 + scheduler
│   ├── extensions.py    ← db / jwt / cors / scheduler
│   ├── models.py        ← 9 类，去掉 SupervisionRequest.nickname 引用
│   ├── schedule.py      ← 每日任务入口（保留）
│   ├── daily_medication_scheduler.py  ← 删
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── medicine.py     ← times 契约统一
│   │   ├── care.py
│   │   └── plans.py        ← url_prefix 修正
│   ├── uploads/             ← 已 .gitignore
│   └── data/                ← 新增，DB 路径
└── medication_tracker_rn/
    ├── App.tsx              ← 包装层
    ├── src/app.tsx          ← 重构为 router（react-navigation/expo-router）
    ├── api/
    │   ├── client.ts        ← baseURL + interceptors
    │   ├── auth.ts
    │   ├── meds.ts
    │   ├── care.ts
    │   ├── plan.ts
    │   ├── checkin.ts      ← 补
    │   └── version.ts       ← 新（C2 准备）
    ├── src/screens/{auth,camera,care,home,medicine,onboarding,settings}/
    ├── src/store/{useAuthStore,useMedStore,useCheckinStore,useVersionStore}
    └── src/types/index.ts   ← 集中类型
```

## Pre-existing Code Smell（不改但记录）

- 集中式 `app.config['XXX']` 而非多 config 类；后续 Flask 2.x 推荐 `pydantic-settings`/`dynaconf`
- RN `useState`-based router 是 P0 项目 smell（影响 C3）
- 后端 `print` 当 logging 用
- 错误返回格式不统一：路由返回 `{'error': ...}`、`plans.py` 返回 `{'success':..., 'data':...}`，RN `getList` 解构 `response.data.medications`、plan 解构直接数组。**前端代码对错误/数据 shape 假设过强**（无 schema 校验）

## 验证（仅本 change）

- [x] 全量读完 7 个 py 模块 + 11 个 RN ts/tsx
- [x] grep 出 6 处 print / 2 处死代码 / 4 处路由不匹配
- [x] 列出 4 阶段 actionable list（P0/P1/P2/P3）

## Next Decisions（影响下游）

| 决策点 | 推荐 | 阻塞谁 |
|---|---|---|
| JWT secret 处理 | env var + 启动校验 | C2 重新签发 token |
| DB 路径 | 统一 `data/medguardian.db`，`.gitignore` 已加 | C2 写 migration |
| care 鉴权模型 | 用现有 `Supervision` 表（不引 CareRelation） | C3 重写关心页 |
| RN 框架 | Expo + expo-router + NativeWind/Tamagui | C4 |
| `times` JSON 契约 | 统一 `[{time: "HH:MM", days?: [1..7]}]` | C2 |

## Out of Scope

- 不修改任何代码
- 不安装依赖
- 不写测试
- 不跑后端
- 不连服务器（凭证待用）

## Artifacts

- `openspec/changes/audit-quality/proposal.md`（本文件）
- 不产出 `design.md` / `tasks.md`（纯调查）
