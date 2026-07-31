import React from 'react'

export interface IconProps {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export const SvgHome: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export const SvgSmartHomeLogo: React.FC<IconProps> = ({ size = 28, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
    <path d="M6.5 12a7.8 7.8 0 0 1 11 0" />
    <path d="M9 15a3.6 3.6 0 0 1 6 0" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
  </svg>
)

export const SvgWifi: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
  </svg>
)

export const SvgLight: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.94 1.5 4 .76.76 1.23 1.52 1.41 2.5" />
  </svg>
)

export const SvgSwitch: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2v10" />
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  </svg>
)

export const SvgFan: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9C10 3 6 4 6 7c0 3 4 5 6 2z" />
    <path d="M15 12c6 2 5 6 2 6-3 0-5-4-2-6z" />
    <path d="M12 15c2 6 6 5 6 2 0-3-4-5-6-2z" />
    <path d="M9 12C3 10 4 6 7 6c3 0 5 4 2 6z" />
  </svg>
)

export const SvgCover: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="12" y1="9" x2="12" y2="21" />
  </svg>
)

export const SvgLock: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export const SvgUnlock: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

export const SvgClimate: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
)

export const SvgSensor: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

export const SvgBinarySensor: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
    <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M12 14v8" />
  </svg>
)

export const SvgTv: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="2" y="7" width="20" height="13" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
)

export const SvgCamera: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

export const SvgVacuum: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
  </svg>
)

export const SvgScene: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

export const SvgAutomation: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export const SvgAlarm: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const SvgSun: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

export const SvgMoon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export const SvgWeather: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
  </svg>
)

export const SvgCloudRain: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="16" y1="13" x2="14" y2="21" />
    <line x1="8" y1="13" x2="6" y2="21" />
    <line x1="12" y1="15" x2="10" y2="23" />
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
  </svg>
)

export const SvgCloudSnow: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="3" />
    <line x1="8" y1="20" x2="8.01" y2="20" strokeWidth="3" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
    <line x1="12" y1="22" x2="12.01" y2="22" strokeWidth="3" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="3" />
    <line x1="16" y1="20" x2="16.01" y2="20" strokeWidth="3" />
  </svg>
)

export const SvgCloudLightning: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
    <polyline points="13 11 9 17 15 17 11 23" />
  </svg>
)

export const SvgFog: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="4" y1="14" x2="20" y2="14" />
    <line x1="6" y1="18" x2="18" y2="18" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="6" x2="16" y2="6" />
  </svg>
)

export const SvgRemote: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="6" y="2" width="12" height="20" rx="4" />
    <circle cx="12" cy="7" r="1.5" />
    <circle cx="12" cy="11" r="1.5" />
    <circle cx="12" cy="15" r="1.5" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
)

export const SvgDrop: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
)

export const SvgBattery: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
    <line x1="23" y1="11" x2="23" y2="13" />
    <line x1="5" y1="10" x2="13" y2="10" />
  </svg>
)

export const SvgZap: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export const SvgGauge: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
    <path d="M12 12L2.5 7.5" />
  </svg>
)

export const SvgMotion: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="5" r="2" />
    <path d="M14 10l-2-2-4 3 2 4 4-2" />
    <path d="M8 21l3-6 3 2 2 4" />
  </svg>
)

export const SvgDoor: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M3 21h18" />
    <path d="M6 21V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
    <circle cx="14" cy="12" r="1" fill={color} />
  </svg>
)

export const SvgClock: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const SvgWind: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
)

export const SvgAlert: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
  </svg>
)

export const SvgSignal: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M2 20h.01" strokeWidth="3" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20v-12" />
    <path d="M22 20V4" />
  </svg>
)

export const SvgSunrise: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2v6" />
    <path d="M4.93 10.93l1.41 1.41" />
    <path d="M17.66 12.34l1.41-1.41" />
    <path d="M2 18h20" />
    <path d="M20 18a8 8 0 1 0-16 0" />
  </svg>
)

export const SvgSunset: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 10v6" />
    <path d="M12 16l-3-3" />
    <path d="M12 16l3-3" />
    <path d="M2 18h20" />
    <path d="M20 18a8 8 0 1 0-16 0" />
  </svg>
)

export const SvgPlus: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const SvgCheck: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const SvgClose: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const SvgRefresh: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

export const SvgLogout: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export const SvgPlay: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export const SvgPause: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

export const SvgPrev: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const SvgNext: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const SvgMute: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)

export const SvgMuteStrikethrough: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
    <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
  </svg>
)

export const SvgVolDown: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="16" y1="12" x2="22" y2="12" />
  </svg>
)

export const SvgVolUp: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)

export const SvgPower: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2v10" />
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  </svg>
)

export const SvgBack: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

export const SvgYoutube: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="68" height="30" viewBox="0 0 120 60" style={{ display: 'block', borderRadius: '4px', ...style }}>
    <rect width="120" height="60" rx="8" fill="white"/>
    <g transform="matrix(.223746 0 0 .223746 4.958506 17.693975)">
      <path d="M154.3 17.5c-1.8-6.7-7.1-12-13.8-13.8C128.4.4 79.7.4 79.7.4S31 .5 18.9 3.8c-6.7 1.8-12 7.1-13.8 13.8C1.9 29.7 1.9 55 1.9 55s0 25.3 3.3 37.5c1.8 6.7 7.1 12 13.8 13.8 12.1 3.3 60.8 3.3 60.8 3.3s48.7 0 60.8-3.3c6.7-1.8 12-7.1 13.8-13.8 3.3-12.1 3.3-37.5 3.3-37.5s-.1-25.3-3.4-37.5z" fill="red"/>
      <path d="M104.6 55L64.2 31.6v46.8z" fill="#fff"/>
      <g fill="#282828">
        <path d="M227.9 99.7c-3.1-2.1-5.3-5.3-6.6-9.7s-1.9-10.2-1.9-17.5v-9.9c0-7.3.7-13.3 2.2-17.7 1.5-4.5 3.8-7.7 7-9.7s7.3-3.1 12.4-3.1c5 0 9.1 1 12.1 3.1s5.3 5.3 6.7 9.7 2.1 10.3 2.1 17.6v9.9c0 7.3-.7 13.1-2.1 17.5s-3.6 7.6-6.7 9.7c-3.1 2-7.3 3.1-12.5 3.1-5.4.1-9.6-1-12.7-3zM245.2 89c.9-2.2 1.3-5.9 1.3-10.9V56.8c0-4.9-.4-8.5-1.3-10.7-.9-2.3-2.4-3.4-4.5-3.4s-3.5 1.1-4.4 3.4-1.3 5.8-1.3 10.7v21.3c0 5 .4 8.7 1.2 10.9s2.3 3.3 4.5 3.3c2.1 0 3.6-1.1 4.5-3.3zm219.2-16.3v3.5l.4 9.9c.3 2.2.8 3.8 1.6 4.8s2.1 1.5 3.8 1.5c2.3 0 3.9-.9 4.7-2.7.9-1.8 1.3-4.8 1.4-8.9l13.3.8c.1.6.1 1.4.1 2.4 0 6.3-1.7 11-5.2 14.1s-8.3 4.7-14.6 4.7c-7.6 0-12.9-2.4-15.9-7.1s-4.6-12.1-4.6-22V61.6c0-10.2 1.6-17.7 4.7-22.4 3.2-4.7 8.6-7.1 16.2-7.1 5.3 0 9.3 1 12.1 2.9s4.8 4.9 6 9 1.7 9.7 1.7 16.9v11.7h-25.7zm2-28.8c-.8 1-1.3 2.5-1.6 4.7s-.4 5.5-.4 10v4.9h11.2v-4.9c0-4.4-.1-7.7-.4-10s-.8-3.9-1.6-4.8-2-1.4-3.6-1.4c-1.7.1-2.9.6-3.6 1.5zM190.5 71.4L173 8.2h15.3l6.1 28.6c1.6 7.1 2.7 13.1 3.5 18h.4c.5-3.6 1.7-9.5 3.5-17.9l6.3-28.7h15.3l-17.7 63.1v30.3h-15.1V71.4z"/>
        <path d="M311.5 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z"/>
        <path d="M390.4 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z"/>
        <path d="M353.3 20.6H338v81.1h-15V20.6h-15.3V8.2h45.5v12.4zm87.9 23.7c-.9-4.3-2.4-7.4-4.5-9.4-2.1-1.9-4.9-2.9-8.6-2.9-2.8 0-5.5.8-7.9 2.4-2.5 1.6-4.3 3.7-5.7 6.3h-.1v-36h-14.8v96.9h12.7l1.6-6.5h.3c1.2 2.3 3 4.1 5.3 5.5a16.26 16.26 0 0 0 7.9 2c5.2 0 9-2.4 11.5-7.2 2.4-4.8 3.7-12.3 3.7-22.4V62.2c0-7.6-.5-13.6-1.4-17.9zm-14.1 27.9c0 5-.2 8.9-.6 11.7s-1.1 4.8-2.1 6-2.3 1.8-3.9 1.8c-1.3 0-2.6-.3-3.5-.9s-1.9-1.5-2.6-2.7V49.3c.5-1.9 1.4-3.4 2.7-4.6s2.6-1.8 4.1-1.8c1.6 0 2.8.6 3.6 1.8.9 1.2 1.4 3.3 1.8 6.2.3 2.9.5 7 .5 12.4z"/>
      </g>
    </g>
  </svg>
)

export const SvgColorWheel: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', border: '2px solid rgba(255,255,255,0.8)', boxSizing: 'border-box' }} />
)

export const SvgTemp: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #ff9e3b, #60a5fa)', border: '2px solid rgba(255,255,255,0.8)', boxSizing: 'border-box' }} />
)

export function getDomainSvgIcon(domain: string, size = 20, color = 'currentColor'): React.ReactElement {
  switch (domain.toLowerCase()) {
    case 'light': return <SvgLight size={size} color={color} />
    case 'switch': return <SvgSwitch size={size} color={color} />
    case 'fan': return <SvgFan size={size} color={color} />
    case 'cover': return <SvgCover size={size} color={color} />
    case 'lock': return <SvgLock size={size} color={color} />
    case 'climate': return <SvgClimate size={size} color={color} />
    case 'sensor': return <SvgSensor size={size} color={color} />
    case 'binary_sensor': return <SvgBinarySensor size={size} color={color} />
    case 'media_player': return <SvgTv size={size} color={color} />
    case 'camera': return <SvgCamera size={size} color={color} />
    case 'vacuum': return <SvgVacuum size={size} color={color} />
    case 'scene': return <SvgScene size={size} color={color} />
    case 'automation': return <SvgAutomation size={size} color={color} />
    case 'alarm_control_panel': return <SvgAlarm size={size} color={color} />
    case 'sun': return <SvgSun size={size} color={color} />
    case 'weather': return <SvgWeather size={size} color={color} />
    case 'remote': return <SvgRemote size={size} color={color} />
    default: return <SvgAutomation size={size} color={color} />
  }
}

export function getDynamicSvgIcon(device: { domain: string; name: string; attributes?: Record<string, any>; state?: Record<string, any> }, size = 20, color = 'currentColor'): React.ReactElement {
  const dc = (device.attributes?.deviceClass as string || device.state?.deviceClass as string || '').toLowerCase()
  const domain = device.domain.toLowerCase()
  const name = device.name.toLowerCase()

  if (dc === 'temperature') return <SvgClimate size={size} color={color} />
  if (dc === 'humidity' || dc === 'moisture') return <SvgDrop size={size} color={color} />
  if (dc === 'battery') return <SvgBattery size={size} color={color} />
  if (dc === 'power' || dc === 'energy' || dc === 'voltage' || dc === 'current') return <SvgZap size={size} color={color} />
  if (dc === 'pressure') return <SvgGauge size={size} color={color} />
  if (dc === 'illuminance') return <SvgSun size={size} color={color} />
  if (dc === 'motion' || dc === 'occupancy' || dc === 'presence') return <SvgMotion size={size} color={color} />
  if (dc === 'door' || dc === 'window' || dc === 'opening' || dc === 'garage_door') return <SvgDoor size={size} color={color} />
  if (dc === 'lock') return <SvgLock size={size} color={color} />
  if (dc === 'timestamp' || dc === 'date') return <SvgClock size={size} color={color} />
  if (dc === 'speed' || dc === 'wind_speed') return <SvgWind size={size} color={color} />
  if (dc === 'gas' || dc === 'co' || dc === 'co2' || dc === 'smoke') return <SvgAlert size={size} color={color} />
  if (dc === 'signal_strength') return <SvgSignal size={size} color={color} />

  if (name.includes('amanhecer') || name.includes('dawn') || name.includes('nascer')) return <SvgSunrise size={size} color={color} />
  if (name.includes('anoitecer') || name.includes('dusk') || name.includes('pôr') || name.includes('por do sol')) return <SvgSunset size={size} color={color} />
  if (name.includes('meio-dia') || name.includes('noon')) return <SvgSun size={size} color={color} />
  if (name.includes('meia-noite') || name.includes('midnight')) return <SvgMoon size={size} color={color} />
  if (name.includes('bateria') || name.includes('battery')) return <SvgBattery size={size} color={color} />
  if (name.includes('temp')) return <SvgClimate size={size} color={color} />
  if (name.includes('umidade') || name.includes('humidity')) return <SvgDrop size={size} color={color} />
  if (name.includes('vento') || name.includes('wind')) return <SvgWind size={size} color={color} />
  if (name.includes('pressao') || name.includes('pressão')) return <SvgGauge size={size} color={color} />
  if (name.includes('luz') || name.includes('lamp') || name.includes('light')) return <SvgLight size={size} color={color} />
  if (name.includes('tv') || name.includes('televisao') || name.includes('television')) return <SvgTv size={size} color={color} />

  return getDomainSvgIcon(domain, size, color)
}

export function getWeatherSvgIcon(state: string, size = 28, color = 'currentColor'): React.ReactElement {
  switch (state.toLowerCase()) {
    case 'clear-night': return <SvgMoon size={size} color={color} />
    case 'sunny': return <SvgSun size={size} color={color} />
    case 'partlycloudy': return <SvgWeather size={size} color={color} />
    case 'cloudy': return <SvgWeather size={size} color={color} />
    case 'rainy':
    case 'pouring': return <SvgCloudRain size={size} color={color} />
    case 'lightening': return <SvgCloudLightning size={size} color={color} />
    case 'snowy': return <SvgCloudSnow size={size} color={color} />
    case 'fog': return <SvgFog size={size} color={color} />
    default: return <SvgWeather size={size} color={color} />
  }
}
