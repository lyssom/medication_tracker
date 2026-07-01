# C3: frontend-ux-overhaul Tasks

> Phase 3 build checklist

## T1. 装依赖
- [x] `npx expo install expo-router tamagui @tamagui/config @tamagui/themes`
- [x] `npx expo install @tamagui/lucide-icons`
- [x] app.json 加 `expo-router` plugin（自动）

## T2. 主题与 Provider
- [x] 新建 `src/theme/tamagui.config.ts`（light/dark 主题 + token）
- [x] `_layout.tsx` 包 `<TamaguiProvider config={...} defaultTheme="light">`

## T3. 路由 layout
- [x] `app/_layout.tsx` — Stack + auth guard + UpdateModal 整合
- [x] `app/(tabs)/_layout.tsx` — Tabs (今日/药物/关心/设置)

## T4. 9 屏迁移
- [x] `app/auth/login.tsx` — Tamagui YStack/Input/Button
- [x] `app/(tabs)/index.tsx` — 今日
- [x] `app/(tabs)/meds.tsx` — 药物列表
- [x] `app/(tabs)/care.tsx` — 关心 Tab 入口
- [x] `app/(tabs)/settings.tsx` — 设置 (含登出)
- [x] `app/meds/add.tsx` — 添加/编辑药物
- [x] `app/care/index.tsx` — 我关心的人
- [x] `app/care/me.tsx` — 关心我的人
- [x] `app/care/[userId].tsx` — 关心详情（动态路由）

## T5. 入口
- [x] `index.js` 改为 `import 'expo-router/entry'`
- [x] 旧的 `App.tsx` 已由 `_layout.tsx` 取代

## T6. TypeScript 验证
- [x] `npx tsc --noEmit`：
  - app/** 通过
  - 3 个 pre-existing (C1 记录在案)
  - 1 个 Tamagui 内部类型（与本 change 无关）
- [ ] 删除 `src/screens/` 与 `App.tsx` (后续手动清理，确认全 OK 后再删)

## T7. 实机构建
- [ ] `npx expo prebuild --clean`（用户实机前先跑）
- [ ] `npx expo run:android`（Android 设备/模拟器）

## T8. 双主题
- [ ] dark 模式 token 测试
- [ ] 切换暗色应只改 Theme，不需重启

## T9. 深链
- [ ] `medicationtracker://care/<id>` 在系统中可唤起
- [ ] 关心详情接收 dynamic userId

## Out of Scope (defer)

- react-native-paper 解耦（C5 之后）
- 国际化
- 完整 dark theme 视觉调优
