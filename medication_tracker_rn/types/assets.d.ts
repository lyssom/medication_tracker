// assets.d.ts — 让 TypeScript 认 RN 的本地图片 require
declare module '*.png' {
  const value: number;
  export default value;
}
declare module '*.jpg' {
  const value: number;
  export default value;
}
declare module '*.jpeg' {
  const value: number;
  export default value;
}
declare module '*.webp' {
  const value: number;
  export default value;
}
declare module '*.gif' {
  const value: number;
  export default value;
}
declare module '*.svg' {
  const value: number;
  export default value;
}