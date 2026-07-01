# C4: migrate-expo Tasks

> Phase 3 build checklist

## T1. 分支与备份
- [ ] git checkout -b feat/migrate-expo
- [ ] git tag pre-expo-migration

## T2. 依赖迁移
- [ ] npm install expo@latest
- [ ] npm install --save-dev babel-preset-expo
- [ ] npm install expo-modules-core
- [ ] npm install @expo/vector-icons
- [ ] npm install expo-secure-store expo-application expo-linking expo-constants expo-status-bar
- [ ] npm uninstall react-native-vector-icons（若不需）
- [ ] npm uninstall @react-native-community/cli@20（保留如要）

## T3. 配置
- [ ] 写 `app.json` expo 块：name, slug, scheme, version, ios, android, plugins
- [ ] `babel.config.js`: presets: ['babel-preset-expo']
- [ ] `index.js`: import { registerRootComponent } from 'expo'

## T4. 原生同步
- [ ] npx expo prebuild --clean
- [ ] git diff android/ ios/ 检查关键文件
- [ ] 如有定制：手工 patch 回 MainActivity/MainApplication
- [ ] AndroidManifest.xml 加 QUERY_ALL_PACKAGES permission（for C2 准备）

## T5. 业务代码适配
- [ ] grep "from 'react-native-vector-icons" → 改 `@expo/vector-icons`
- [ ] Verify all screens import 不报错
- [ ] Verify 3 store 不报错

## T6. 本地构建
- [ ] npx expo run:android（或 expo start 触发）
- [ ] 生成 .apk

## T7. 回归
- [ ] npm run lint
- [ ] npm run test
- [ ] 手测：login → 主页 → 列出 med → 加 med → care tab

## T8. verify 阶段要求
- [ ] app 启动并能跳到 LoginScreen
- [ ] 后端 API 访问（即使无 token）
- [ ] build/verify phase 必须白盒 verify 后由 owner 签字
