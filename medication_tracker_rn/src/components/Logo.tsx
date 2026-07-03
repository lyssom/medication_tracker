import React from 'react'
import Svg, { Rect, G, Line } from 'react-native-svg'

interface LogoProps {
  size?: number
  tilt?: number
}

/**
 * Logo — 药伴 药丸胶囊 SVG.
 * inline SVG, 0 文件 bundle (避开 res/Wn.png 跟 JS asset registry 冲突).
 * 跟 adaptive icon / 桌面图标 一致品牌.
 */
export function Logo({ size = 96, tilt = -18 }: LogoProps) {
  // 100x100 viewBox
  const PW = 60
  const PH = 22
  const R = PH / 2 // 胶囊半径
  const Y = (100 - PH) / 2
  const X = (100 - PW) / 2
  const X_MID = 50
  const SEAM_W = 0.7

  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      <G rotation={tilt} origin="50, 50">
        {/* 完整白胶囊 */}
        <Rect
          x={X}
          y={Y}
          width={PW}
          height={PH}
          rx={R}
          ry={R}
          fill="#FFFFFF"
        />
        {/* 右半 (灰色盖) — 全圆角, 用白色 rect 覆盖左半让左边缘变直 */}
        <Rect
          x={X_MID}
          y={Y}
          width={PW / 2}
          height={PH}
          rx={R}
          ry={R}
          fill="#E5E7EB"
        />
        <Rect
          x={X_MID}
          y={Y}
          width={R}
          height={PH}
          fill="#FFFFFF"
        />
        {/* 分缝线 (emerald) */}
        <Line
          x1={X_MID}
          y1={Y + 0.8}
          x2={X_MID}
          y2={Y + PH - 0.8}
          stroke="#10B981"
          strokeWidth={SEAM_W}
          strokeLinecap="round"
        />
        {/* 左半高光 */}
        <Rect
          x={X + 5}
          y={Y + 3.5}
          width={12}
          height={1.6}
          rx={0.8}
          fill="rgba(255,255,255,0.55)"
        />
        {/* 右半高光 (更淡) */}
        <Rect
          x={X_MID + 5}
          y={Y + 3.5}
          width={12}
          height={1.6}
          rx={0.8}
          fill="rgba(255,255,255,0.3)"
        />
      </G>
    </Svg>
  )
}

export default Logo