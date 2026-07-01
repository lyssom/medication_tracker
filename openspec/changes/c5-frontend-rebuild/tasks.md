# C5: frontend-rebuild Tasks

> Phase 3 build checklist

## T1. 装依赖
- [x] npm install --legacy-peer-deps nativewind@4 react-native-css-interop
- [x] npm install --legacy-peer-deps tailwindcss@^3.4
- [x] npm install --legacy-peer-deps react-native-reanimated
- [x] npm install --legacy-peer-deps react-native-worklets

## T2. 配置
- [x] babel.config.js: ['babel-preset-expo', { jsxImportSource: 'nativewind' }] + 'nativewind/babel'
- [x] metro.config.js: withNativeWind(config, { input: './global.css' })
- [x] tailwind.config.js: content paths + brand colors
- [x] global.css: @tailwind base/components/utilities
- [x] index.js: import './global.css' + 'expo-router/entry'

## T3. 9 屏 NativeWind 化
- [x] app/auth/login.tsx
- [x] app/(tabs)/index.tsx
- [x] app/(tabs)/meds.tsx
- [x] app/(tabs)/care.tsx
- [x] app/(tabs)/settings.tsx
- [x] app/meds/add.tsx
- [x] app/care/index.tsx
- [x] app/care/me.tsx
- [x] app/care/[userId].tsx

## T4. 验证
- [x] bundle 200 OK · 11.3MB
- [x] css 解析：backgroundColor: "#10b981" 出现在 bundle
- [x] 0 业务 error
- [ ] 手机实测（用户确认）

## Out of Scope (defer)
- i18n
- 完整 design token 体系
- dark mode toggle
- 自动化 e2e test