// src/panel.tsx
import React4 from "react";

// src/components/DeviceControlContent.tsx
import React2, { useState, useRef } from "react";

// src/components/SvgIcons.tsx
import React from "react";
var SvgHome = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), /* @__PURE__ */ React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" }));
var SvgLight = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M9 18h6" }), /* @__PURE__ */ React.createElement("path", { d: "M10 22h4" }), /* @__PURE__ */ React.createElement("path", { d: "M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.94 1.5 4 .76.76 1.23 1.52 1.41 2.5" }));
var SvgSwitch = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2v10" }), /* @__PURE__ */ React.createElement("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }));
var SvgFan = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9C10 3 6 4 6 7c0 3 4 5 6 2z" }), /* @__PURE__ */ React.createElement("path", { d: "M15 12c6 2 5 6 2 6-3 0-5-4-2-6z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 15c2 6 6 5 6 2 0-3-4-5-6-2z" }), /* @__PURE__ */ React.createElement("path", { d: "M9 12C3 10 4 6 7 6c3 0 5 4 2 6z" }));
var SvgCover = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "9", x2: "21", y2: "9" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "15", x2: "21", y2: "15" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "21" }));
var SvgLock = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }));
var SvgClimate = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" }));
var SvgSensor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "20", x2: "18", y2: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "20", x2: "6", y2: "14" }));
var SvgBinarySensor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M4.93 4.93a10 10 0 0 1 14.14 0" }), /* @__PURE__ */ React.createElement("path", { d: "M7.76 7.76a6 6 0 0 1 8.48 0" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "2", fill: color }), /* @__PURE__ */ React.createElement("path", { d: "M12 14v8" }));
var SvgTv = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "2", y: "7", width: "20", height: "13", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("polyline", { points: "17 2 12 7 7 2" }));
var SvgCamera = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "13", r: "4" }));
var SvgVacuum = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3v3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 18v3" }));
var SvgScene = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }));
var SvgAutomation = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }));
var SvgAlarm = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }));
var SvgSun = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }));
var SvgMoon = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }));
var SvgWeather = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" }));
var SvgRemote = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "6", y: "2", width: "12", height: "20", rx: "4" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "7", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "11", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "15", r: "1.5" }), /* @__PURE__ */ React.createElement("line", { x1: "9", y1: "18", x2: "15", y2: "18" }));
var SvgDrop = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" }));
var SvgBattery = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "1", y: "6", width: "18", height: "12", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "23", y1: "11", x2: "23", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "10", x2: "13", y2: "10" }));
var SvgZap = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }));
var SvgGauge = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2a10 10 0 1 0 10 10H12V2z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 12L2.5 7.5" }));
var SvgMotion = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "5", r: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M14 10l-2-2-4 3 2 4 4-2" }), /* @__PURE__ */ React.createElement("path", { d: "M8 21l3-6 3 2 2 4" }));
var SvgDoor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M3 21h18" }), /* @__PURE__ */ React.createElement("path", { d: "M6 21V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" }), /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "12", r: "1", fill: color }));
var SvgClock = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" }));
var SvgWind = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" }));
var SvgAlert = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17", strokeWidth: "3" }));
var SvgSignal = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M2 20h.01", strokeWidth: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M7 20v-4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 20v-8" }), /* @__PURE__ */ React.createElement("path", { d: "M17 20v-12" }), /* @__PURE__ */ React.createElement("path", { d: "M22 20V4" }));
var SvgSunrise = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2v6" }), /* @__PURE__ */ React.createElement("path", { d: "M4.93 10.93l1.41 1.41" }), /* @__PURE__ */ React.createElement("path", { d: "M17.66 12.34l1.41-1.41" }), /* @__PURE__ */ React.createElement("path", { d: "M2 18h20" }), /* @__PURE__ */ React.createElement("path", { d: "M20 18a8 8 0 1 0-16 0" }));
var SvgSunset = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 10v6" }), /* @__PURE__ */ React.createElement("path", { d: "M12 16l-3-3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 16l3-3" }), /* @__PURE__ */ React.createElement("path", { d: "M2 18h20" }), /* @__PURE__ */ React.createElement("path", { d: "M20 18a8 8 0 1 0-16 0" }));
var SvgPlay = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "5 3 19 12 5 21 5 3" }));
var SvgPause = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React.createElement("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }));
var SvgPrev = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "19 20 9 12 19 4 19 20" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "19", x2: "5", y2: "5", stroke: color, strokeWidth: "3", strokeLinecap: "round" }));
var SvgNext = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "5 4 15 12 5 20 5 4" }), /* @__PURE__ */ React.createElement("line", { x1: "19", y1: "5", x2: "19", y2: "19", stroke: color, strokeWidth: "3", strokeLinecap: "round" }));
var SvgMute = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React.createElement("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }));
var SvgMuteStrikethrough = ({ size = 20, className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#ef4444", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React.createElement("line", { x1: "23", y1: "9", x2: "17", y2: "15" }), /* @__PURE__ */ React.createElement("line", { x1: "17", y1: "9", x2: "23", y2: "15" }), /* @__PURE__ */ React.createElement("line", { x1: "2", y1: "2", x2: "22", y2: "22", stroke: "#ef4444", strokeWidth: "2.5" }));
var SvgVolDown = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React.createElement("line", { x1: "16", y1: "12", x2: "22", y2: "12" }));
var SvgVolUp = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React.createElement("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" }));
var SvgPower = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("path", { d: "M12 2v10" }), /* @__PURE__ */ React.createElement("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }));
var SvgBack = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React.createElement("polyline", { points: "15 18 9 12 15 6" }));
var SvgYoutube = ({ style }) => /* @__PURE__ */ React.createElement("svg", { width: "68", height: "30", viewBox: "0 0 120 60", style: { display: "block", borderRadius: "4px", ...style } }, /* @__PURE__ */ React.createElement("rect", { width: "120", height: "60", rx: "8", fill: "white" }), /* @__PURE__ */ React.createElement("g", { transform: "matrix(.223746 0 0 .223746 4.958506 17.693975)" }, /* @__PURE__ */ React.createElement("path", { d: "M154.3 17.5c-1.8-6.7-7.1-12-13.8-13.8C128.4.4 79.7.4 79.7.4S31 .5 18.9 3.8c-6.7 1.8-12 7.1-13.8 13.8C1.9 29.7 1.9 55 1.9 55s0 25.3 3.3 37.5c1.8 6.7 7.1 12 13.8 13.8 12.1 3.3 60.8 3.3 60.8 3.3s48.7 0 60.8-3.3c6.7-1.8 12-7.1 13.8-13.8 3.3-12.1 3.3-37.5 3.3-37.5s-.1-25.3-3.4-37.5z", fill: "red" }), /* @__PURE__ */ React.createElement("path", { d: "M104.6 55L64.2 31.6v46.8z", fill: "#fff" }), /* @__PURE__ */ React.createElement("g", { fill: "#282828" }, /* @__PURE__ */ React.createElement("path", { d: "M227.9 99.7c-3.1-2.1-5.3-5.3-6.6-9.7s-1.9-10.2-1.9-17.5v-9.9c0-7.3.7-13.3 2.2-17.7 1.5-4.5 3.8-7.7 7-9.7s7.3-3.1 12.4-3.1c5 0 9.1 1 12.1 3.1s5.3 5.3 6.7 9.7 2.1 10.3 2.1 17.6v9.9c0 7.3-.7 13.1-2.1 17.5s-3.6 7.6-6.7 9.7c-3.1 2-7.3 3.1-12.5 3.1-5.4.1-9.6-1-12.7-3zM245.2 89c.9-2.2 1.3-5.9 1.3-10.9V56.8c0-4.9-.4-8.5-1.3-10.7-.9-2.3-2.4-3.4-4.5-3.4s-3.5 1.1-4.4 3.4-1.3 5.8-1.3 10.7v21.3c0 5 .4 8.7 1.2 10.9s2.3 3.3 4.5 3.3c2.1 0 3.6-1.1 4.5-3.3zm219.2-16.3v3.5l.4 9.9c.3 2.2.8 3.8 1.6 4.8s2.1 1.5 3.8 1.5c2.3 0 3.9-.9 4.7-2.7.9-1.8 1.3-4.8 1.4-8.9l13.3.8c.1.6.1 1.4.1 2.4 0 6.3-1.7 11-5.2 14.1s-8.3 4.7-14.6 4.7c-7.6 0-12.9-2.4-15.9-7.1s-4.6-12.1-4.6-22V61.6c0-10.2 1.6-17.7 4.7-22.4 3.2-4.7 8.6-7.1 16.2-7.1 5.3 0 9.3 1 12.1 2.9s4.8 4.9 6 9 1.7 9.7 1.7 16.9v11.7h-25.7zm2-28.8c-.8 1-1.3 2.5-1.6 4.7s-.4 5.5-.4 10v4.9h11.2v-4.9c0-4.4-.1-7.7-.4-10s-.8-3.9-1.6-4.8-2-1.4-3.6-1.4c-1.7.1-2.9.6-3.6 1.5zM190.5 71.4L173 8.2h15.3l6.1 28.6c1.6 7.1 2.7 13.1 3.5 18h.4c.5-3.6 1.7-9.5 3.5-17.9l6.3-28.7h15.3l-17.7 63.1v30.3h-15.1V71.4z" }), /* @__PURE__ */ React.createElement("path", { d: "M311.5 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z" }), /* @__PURE__ */ React.createElement("path", { d: "M390.4 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z" }), /* @__PURE__ */ React.createElement("path", { d: "M353.3 20.6H338v81.1h-15V20.6h-15.3V8.2h45.5v12.4zm87.9 23.7c-.9-4.3-2.4-7.4-4.5-9.4-2.1-1.9-4.9-2.9-8.6-2.9-2.8 0-5.5.8-7.9 2.4-2.5 1.6-4.3 3.7-5.7 6.3h-.1v-36h-14.8v96.9h12.7l1.6-6.5h.3c1.2 2.3 3 4.1 5.3 5.5a16.26 16.26 0 0 0 7.9 2c5.2 0 9-2.4 11.5-7.2 2.4-4.8 3.7-12.3 3.7-22.4V62.2c0-7.6-.5-13.6-1.4-17.9zm-14.1 27.9c0 5-.2 8.9-.6 11.7s-1.1 4.8-2.1 6-2.3 1.8-3.9 1.8c-1.3 0-2.6-.3-3.5-.9s-1.9-1.5-2.6-2.7V49.3c.5-1.9 1.4-3.4 2.7-4.6s2.6-1.8 4.1-1.8c1.6 0 2.8.6 3.6 1.8.9 1.2 1.4 3.3 1.8 6.2.3 2.9.5 7 .5 12.4z" }))));
var SvgColorWheel = ({ size = 22 }) => /* @__PURE__ */ React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)", border: "2px solid rgba(255,255,255,0.8)", boxSizing: "border-box" } });
var SvgTemp = ({ size = 22 }) => /* @__PURE__ */ React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #ff9e3b, #60a5fa)", border: "2px solid rgba(255,255,255,0.8)", boxSizing: "border-box" } });
function getDomainSvgIcon(domain, size = 20, color = "currentColor") {
  switch (domain.toLowerCase()) {
    case "light":
      return /* @__PURE__ */ React.createElement(SvgLight, { size, color });
    case "switch":
      return /* @__PURE__ */ React.createElement(SvgSwitch, { size, color });
    case "fan":
      return /* @__PURE__ */ React.createElement(SvgFan, { size, color });
    case "cover":
      return /* @__PURE__ */ React.createElement(SvgCover, { size, color });
    case "lock":
      return /* @__PURE__ */ React.createElement(SvgLock, { size, color });
    case "climate":
      return /* @__PURE__ */ React.createElement(SvgClimate, { size, color });
    case "sensor":
      return /* @__PURE__ */ React.createElement(SvgSensor, { size, color });
    case "binary_sensor":
      return /* @__PURE__ */ React.createElement(SvgBinarySensor, { size, color });
    case "media_player":
      return /* @__PURE__ */ React.createElement(SvgTv, { size, color });
    case "camera":
      return /* @__PURE__ */ React.createElement(SvgCamera, { size, color });
    case "vacuum":
      return /* @__PURE__ */ React.createElement(SvgVacuum, { size, color });
    case "scene":
      return /* @__PURE__ */ React.createElement(SvgScene, { size, color });
    case "automation":
      return /* @__PURE__ */ React.createElement(SvgAutomation, { size, color });
    case "alarm_control_panel":
      return /* @__PURE__ */ React.createElement(SvgAlarm, { size, color });
    case "sun":
      return /* @__PURE__ */ React.createElement(SvgSun, { size, color });
    case "weather":
      return /* @__PURE__ */ React.createElement(SvgWeather, { size, color });
    case "remote":
      return /* @__PURE__ */ React.createElement(SvgRemote, { size, color });
    default:
      return /* @__PURE__ */ React.createElement(SvgAutomation, { size, color });
  }
}
function getDynamicSvgIcon(device, size = 20, color = "currentColor") {
  const dc = (device.attributes?.deviceClass || device.state?.deviceClass || "").toLowerCase();
  const domain = device.domain.toLowerCase();
  const name = device.name.toLowerCase();
  if (dc === "temperature") return /* @__PURE__ */ React.createElement(SvgClimate, { size, color });
  if (dc === "humidity" || dc === "moisture") return /* @__PURE__ */ React.createElement(SvgDrop, { size, color });
  if (dc === "battery") return /* @__PURE__ */ React.createElement(SvgBattery, { size, color });
  if (dc === "power" || dc === "energy" || dc === "voltage" || dc === "current") return /* @__PURE__ */ React.createElement(SvgZap, { size, color });
  if (dc === "pressure") return /* @__PURE__ */ React.createElement(SvgGauge, { size, color });
  if (dc === "illuminance") return /* @__PURE__ */ React.createElement(SvgSun, { size, color });
  if (dc === "motion" || dc === "occupancy" || dc === "presence") return /* @__PURE__ */ React.createElement(SvgMotion, { size, color });
  if (dc === "door" || dc === "window" || dc === "opening" || dc === "garage_door") return /* @__PURE__ */ React.createElement(SvgDoor, { size, color });
  if (dc === "lock") return /* @__PURE__ */ React.createElement(SvgLock, { size, color });
  if (dc === "timestamp" || dc === "date") return /* @__PURE__ */ React.createElement(SvgClock, { size, color });
  if (dc === "speed" || dc === "wind_speed") return /* @__PURE__ */ React.createElement(SvgWind, { size, color });
  if (dc === "gas" || dc === "co" || dc === "co2" || dc === "smoke") return /* @__PURE__ */ React.createElement(SvgAlert, { size, color });
  if (dc === "signal_strength") return /* @__PURE__ */ React.createElement(SvgSignal, { size, color });
  if (name.includes("amanhecer") || name.includes("dawn") || name.includes("nascer")) return /* @__PURE__ */ React.createElement(SvgSunrise, { size, color });
  if (name.includes("anoitecer") || name.includes("dusk") || name.includes("p\xF4r") || name.includes("por do sol")) return /* @__PURE__ */ React.createElement(SvgSunset, { size, color });
  if (name.includes("meio-dia") || name.includes("noon")) return /* @__PURE__ */ React.createElement(SvgSun, { size, color });
  if (name.includes("meia-noite") || name.includes("midnight")) return /* @__PURE__ */ React.createElement(SvgMoon, { size, color });
  if (name.includes("bateria") || name.includes("battery")) return /* @__PURE__ */ React.createElement(SvgBattery, { size, color });
  if (name.includes("temp")) return /* @__PURE__ */ React.createElement(SvgClimate, { size, color });
  if (name.includes("umidade") || name.includes("humidity")) return /* @__PURE__ */ React.createElement(SvgDrop, { size, color });
  if (name.includes("vento") || name.includes("wind")) return /* @__PURE__ */ React.createElement(SvgWind, { size, color });
  if (name.includes("pressao") || name.includes("press\xE3o")) return /* @__PURE__ */ React.createElement(SvgGauge, { size, color });
  if (name.includes("luz") || name.includes("lamp") || name.includes("light")) return /* @__PURE__ */ React.createElement(SvgLight, { size, color });
  if (name.includes("tv") || name.includes("televisao") || name.includes("television")) return /* @__PURE__ */ React.createElement(SvgTv, { size, color });
  return getDomainSvgIcon(domain, size, color);
}

// src/components/DeviceControlContent.tsx
function volumeToPercent(volume) {
  if (volume === null || volume === void 0 || !Number.isFinite(volume)) return 0;
  return Math.max(0, Math.min(100, Math.round(volume * 100)));
}
var DOMAIN_LABELS = {
  light: "Ilumina\xE7\xE3o",
  switch: "Interruptor",
  fan: "Ventilador",
  cover: "Persiana",
  lock: "Fechadura",
  climate: "Climatiza\xE7\xE3o",
  sensor: "Sensor",
  binary_sensor: "Sensor Bin\xE1rio",
  media_player: "M\xEDdia / TV",
  camera: "C\xE2mera",
  vacuum: "Aspirador",
  scene: "Cena",
  automation: "Automa\xE7\xE3o",
  alarm_control_panel: "Alarme",
  remote: "Controle Remoto",
  sun: "Sol",
  weather: "Clima"
};
var CONTROLLABLE_DOMAINS = [
  "light",
  "switch",
  "fan",
  "cover",
  "lock",
  "climate",
  "media_player",
  "vacuum",
  "alarm_control_panel",
  "camera",
  "automation",
  "scene",
  "remote"
];
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h / 360 + 1 / 3);
    g = hue2rgb(h / 360);
    b = hue2rgb(h / 360 - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function ColorWheelPicker({ selectedHex, onChange }) {
  const wheelRef = useRef(null);
  const [handlePos, setHandlePos] = useState({ x: 170, y: 170 });
  const handlePointer = (e) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const radius = rect.width / 2;
    const dist = Math.min(radius - 12, Math.sqrt(x * x + y * y));
    const angle = Math.atan2(x, -y);
    const posX = centerX + dist * Math.sin(angle);
    const posY = centerY - dist * Math.cos(angle);
    setHandlePos({ x: posX, y: posY });
    let hue = (angle * (180 / Math.PI) + 360) % 360;
    let sat = dist / (radius - 12);
    const rgb = hslToRgb(hue, sat, 0.5);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    onChange(rgb, hex);
  };
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: wheelRef,
      className: "sh-color-wheel",
      style: { WebkitAppRegion: "no-drag" },
      onPointerDown: handlePointer,
      onPointerMove: (e) => {
        if (e.buttons === 1) handlePointer(e);
      }
    },
    /* @__PURE__ */ React2.createElement("div", { className: "sh-color-wheel-handle", style: { left: `${handlePos.x}px`, top: `${handlePos.y}px` } })
  );
}
function DeviceControlCardContent({
  device,
  allDevices = [],
  onClose,
  onToggle,
  callServiceApi,
  isOverlay = false
}) {
  const volumeDevice = device.domain === "media_player" ? device : allDevices.find((candidate) => candidate.domain === "media_player" && candidate.name === device.name) || device;
  const [brightness, setBrightnessState] = useState(device.state?.brightness ?? 94);
  const [tempPct, setTempPctState] = useState(85);
  const [activeTab, setActiveTab] = useState("brightness");
  const [selectedRgbHex, setSelectedRgbHex] = useState("#f97316");
  const [isOn, setIsOn] = useState(Boolean(device.state?.on));
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showInputSelector, setShowInputSelector] = useState(false);
  const initialVolumePercent = volumeToPercent(volumeDevice.state?.volume);
  const [volumePercent, setVolumePercent] = useState(initialVolumePercent);
  const volumePercentRef = useRef(initialVolumePercent);
  const [activeVolumeButton, setActiveVolumeButton] = useState(null);
  const volumeFeedbackTimerRef = useRef(null);
  React2.useEffect(() => {
    if (device.state?.on !== void 0) {
      setIsOn(Boolean(device.state.on));
    }
  }, [device.state?.on]);
  React2.useEffect(() => {
    if (volumeDevice.state?.volume === null || volumeDevice.state?.volume === void 0) return;
    const nextVolumePercent = volumeToPercent(volumeDevice.state.volume);
    volumePercentRef.current = nextVolumePercent;
    setVolumePercent(nextVolumePercent);
  }, [volumeDevice.state?.volume]);
  React2.useEffect(() => {
    return () => {
      if (volumeFeedbackTimerRef.current) {
        clearTimeout(volumeFeedbackTimerRef.current);
      }
    };
  }, []);
  const COLOR_PRESETS = [
    { name: "Laranja Quente", color: "#f97316", rgb: [249, 115, 22] },
    { name: "\xC2mbar Suave", color: "#fed7aa", rgb: [254, 215, 170] },
    { name: "Branco Quente", color: "#fef3c7", rgb: [254, 243, 199] },
    { name: "Branco Puro", color: "#ffffff", rgb: [255, 255, 255] },
    { name: "Azul Gelo", color: "#60a5fa", rgb: [96, 165, 250] },
    { name: "Roxo Suave", color: "#c084fc", rgb: [192, 132, 252] },
    { name: "Rosa Pastel", color: "#f472b6", rgb: [244, 114, 182] },
    { name: "Coral Vermelho", color: "#f87171", rgb: [248, 113, 113] }
  ];
  function getApiBaseUrl() {
    if (typeof window !== "undefined" && window.api?.getApiBaseUrl) {
      return window.api.getApiBaseUrl();
    }
    return "http://127.0.0.1:8050";
  }
  function getSessionToken() {
    if (typeof window !== "undefined" && window.api?.getSessionToken) {
      return window.api.getSessionToken();
    }
    return "";
  }
  async function defaultCallService(domain, service, data = {}, providerType = "homeassistant") {
    const baseUrl = getApiBaseUrl();
    const token = getSessionToken();
    try {
      const res = await fetch(`${baseUrl}/extensions/momaismarthome/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": token
        },
        body: JSON.stringify({
          toolName: "callService",
          args: { domain, service, data, providerType }
        })
      });
      return await res.json();
    } catch (err) {
      console.error("[DeviceControlContent] Erro ao chamar servi\xE7o:", err);
    }
  }
  const executeService = async (domain, service, data) => {
    if (callServiceApi) {
      return callServiceApi(domain, service, data, "homeassistant");
    }
    const winApi = window.api;
    if (typeof winApi?.callService === "function") {
      return winApi.callService(domain, service, data, "homeassistant");
    }
    return defaultCallService(domain, service, data, "homeassistant");
  };
  React2.useEffect(() => {
    if (device.domain !== "remote" && device.domain !== "media_player") return;
    let disposed = false;
    let syncing = false;
    const syncVolumeFromHomeAssistant = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const response = await fetch(`${getApiBaseUrl()}/extensions/momaismarthome/command`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": getSessionToken()
          },
          body: JSON.stringify({
            toolName: "getDeviceState",
            args: { deviceId: volumeDevice.id, providerType: "homeassistant" }
          })
        });
        if (!response.ok) return;
        const result = await response.json();
        const refreshedDevice = result?.device;
        if (disposed || refreshedDevice?.state?.volume == null) return;
        const nextVolumePercent = volumeToPercent(refreshedDevice.state.volume);
        volumePercentRef.current = nextVolumePercent;
        setVolumePercent(nextVolumePercent);
      } catch {
      } finally {
        syncing = false;
      }
    };
    void syncVolumeFromHomeAssistant();
    const intervalId = window.setInterval(syncVolumeFromHomeAssistant, 1e3);
    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, [device.domain, volumeDevice.id, volumeDevice.name]);
  const handleBrightnessChange = async (pct) => {
    setBrightnessState(pct);
    await executeService("light", "turn_on", {
      entity_id: device.id,
      brightness_pct: pct
    });
  };
  const handleTempSliderChange = async (pct) => {
    setTempPctState(pct);
    const kelvinVal = Math.round(6500 - pct / 100 * (6500 - 2e3));
    await executeService("light", "turn_on", {
      entity_id: device.id,
      color_temp_kelvin: kelvinVal
    });
  };
  const handleColorChange = async (rgb, hex) => {
    setSelectedRgbHex(hex);
    await executeService("light", "turn_on", {
      entity_id: device.id,
      rgb_color: rgb
    });
  };
  const handleToggle = () => {
    setIsOn(!isOn);
    if (onToggle) {
      onToggle(device);
    } else {
      executeService("homeassistant", isOn ? "turn_off" : "turn_on", { entity_id: device.id });
    }
  };
  const handleSendRemoteCommand = async (command) => {
    const remoteDev = device.domain === "remote" ? device : allDevices.find((d) => d.domain === "remote") || device;
    await executeService("remote", "send_command", {
      entity_id: remoteDev.id,
      command: [command]
    });
  };
  const handleSelectSource = async (source) => {
    setShowInputSelector(false);
    await executeService("media_player", "select_source", {
      entity_id: device.id,
      source
    });
  };
  const handleVolumeChange = async (direction) => {
    const nextVolumePercent = Math.max(0, Math.min(100, volumePercentRef.current + (direction === "up" ? 10 : -10)));
    volumePercentRef.current = nextVolumePercent;
    setVolumePercent(nextVolumePercent);
    setActiveVolumeButton(direction);
    if (volumeFeedbackTimerRef.current) {
      clearTimeout(volumeFeedbackTimerRef.current);
    }
    volumeFeedbackTimerRef.current = setTimeout(() => setActiveVolumeButton(null), 1200);
    await executeService("media_player", direction === "up" ? "volume_up" : "volume_down", { entity_id: volumeDevice.id });
  };
  const currentDynamicIcon = getDynamicSvgIcon(device, 20, "#ffffff");
  if (device.domain === "remote" || device.domain === "media_player" && device.name.toLowerCase().includes("tv")) {
    const inputSources = device.attributes?.source_list || ["HDMI 1", "HDMI 2", "AV", "TV", "YouTube", "Netflix"];
    return /* @__PURE__ */ React2.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        onClick: (e) => {
          e.stopPropagation();
          if (onClose) onClose();
        },
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
      },
      "\u2715"
    ), /* @__PURE__ */ React2.createElement("div", { className: "sh-modal-remote-content" }, /* @__PURE__ */ React2.createElement("div", { className: "sh-remote-header" }, /* @__PURE__ */ React2.createElement("span", { className: "sh-remote-pill-tag" }, "Smart Remote"), /* @__PURE__ */ React2.createElement("h3", { className: "sh-remote-title" }, device.name), /* @__PURE__ */ React2.createElement("p", { className: "sh-remote-state" }, isOn ? "\u25CF Ligado" : "\u25CB Desligado", " \u2022 ", device.room || "Sala")), /* @__PURE__ */ React2.createElement("div", { className: "sh-dpad-ring", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement("button", { className: "sh-dpad-btn up", onClick: () => handleSendRemoteCommand("UP") }, "\u25B2"), /* @__PURE__ */ React2.createElement("button", { className: "sh-dpad-btn down", onClick: () => handleSendRemoteCommand("DOWN") }, "\u25BC"), /* @__PURE__ */ React2.createElement("button", { className: "sh-dpad-btn left", onClick: () => handleSendRemoteCommand("LEFT") }, "\u25C0"), /* @__PURE__ */ React2.createElement("button", { className: "sh-dpad-btn right", onClick: () => handleSendRemoteCommand("RIGHT") }, "\u25B6"), /* @__PURE__ */ React2.createElement("button", { className: "sh-dpad-center", onClick: () => handleSendRemoteCommand("ENTER") }, "OK")), /* @__PURE__ */ React2.createElement("div", { className: "sh-remote-actions-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-action-btn", onClick: () => handleSendRemoteCommand("BACK") }, /* @__PURE__ */ React2.createElement(SvgBack, { size: 18 })), /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-action-btn", onClick: () => handleSendRemoteCommand("HOME") }, /* @__PURE__ */ React2.createElement(SvgHome, { size: 18 })), /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-action-btn", onClick: () => setShowInputSelector(!showInputSelector) }, /* @__PURE__ */ React2.createElement(SvgTv, { size: 18 })), /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-action-btn youtube-pill", onClick: () => handleSendRemoteCommand("YOUTUBE") }, /* @__PURE__ */ React2.createElement(SvgYoutube, null)), /* @__PURE__ */ React2.createElement("button", { className: `sh-remote-action-btn power ${isOn ? "active" : ""}`, onClick: handleToggle }, /* @__PURE__ */ React2.createElement(SvgPower, { size: 18, color: "#ffffff" }))), showInputSelector && /* @__PURE__ */ React2.createElement("div", { className: "sh-input-selector-popover", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement("div", { className: "sh-input-grid" }, inputSources.map((src) => /* @__PURE__ */ React2.createElement("button", { key: src, className: "sh-input-chip", onClick: () => handleSelectSource(src) }, /* @__PURE__ */ React2.createElement(SvgTv, { size: 14 }), " ", src)))), /* @__PURE__ */ React2.createElement("div", { className: "sh-remote-media-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-icon-btn", onClick: () => executeService("media_player", "media_previous_track", { entity_id: device.id }) }, /* @__PURE__ */ React2.createElement(SvgPrev, { size: 18 })), /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-remote-icon-btn main",
        onClick: () => {
          setIsPlaying(!isPlaying);
          executeService("media_player", isPlaying ? "media_pause" : "media_play", { entity_id: device.id });
        }
      },
      isPlaying ? /* @__PURE__ */ React2.createElement(SvgPause, { size: 18, color: "#ffffff" }) : /* @__PURE__ */ React2.createElement(SvgPlay, { size: 18, color: "#ffffff" })
    ), /* @__PURE__ */ React2.createElement("button", { className: "sh-remote-icon-btn", onClick: () => executeService("media_player", "media_next_track", { entity_id: device.id }) }, /* @__PURE__ */ React2.createElement(SvgNext, { size: 18 }))), /* @__PURE__ */ React2.createElement("div", { className: "sh-remote-vol-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        onClick: () => {
          setIsMuted(!isMuted);
          executeService("media_player", "volume_mute", { entity_id: device.id, is_volume_muted: !isMuted });
        }
      },
      isMuted ? /* @__PURE__ */ React2.createElement(SvgMuteStrikethrough, { size: 18 }) : /* @__PURE__ */ React2.createElement(SvgMute, { size: 18 })
    ), /* @__PURE__ */ React2.createElement("div", { className: "sh-volume-control" }, /* @__PURE__ */ React2.createElement(
      "span",
      {
        className: `sh-volume-feedback ${activeVolumeButton === "down" ? "active" : ""}`,
        "aria-live": "polite"
      },
      volumePercent,
      "%"
    ), /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        "aria-label": "Diminuir volume",
        onClick: () => handleVolumeChange("down")
      },
      /* @__PURE__ */ React2.createElement(SvgVolDown, { size: 18 })
    )), /* @__PURE__ */ React2.createElement("div", { className: "sh-volume-control" }, /* @__PURE__ */ React2.createElement(
      "span",
      {
        className: `sh-volume-feedback ${activeVolumeButton === "up" ? "active" : ""}`,
        "aria-live": "polite"
      },
      volumePercent,
      "%"
    ), /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        "aria-label": "Aumentar volume",
        onClick: () => handleVolumeChange("up")
      },
      /* @__PURE__ */ React2.createElement(SvgVolUp, { size: 18 })
    )))));
  }
  if (device.domain === "light") {
    return /* @__PURE__ */ React2.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React2.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        onClick: (e) => {
          e.stopPropagation();
          if (onClose) onClose();
        },
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
      },
      "\u2715"
    ), /* @__PURE__ */ React2.createElement("div", { style: { textAlign: "center", marginBottom: "16px" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "12px", textTransform: "uppercase", color: "#38bdf8", fontWeight: 700, letterSpacing: "0.5px" } }, device.room || "C\xF4modo"), /* @__PURE__ */ React2.createElement("h2", { style: { fontSize: "20px", fontWeight: 800, color: "#fff", margin: "4px 0 0" } }, device.name)), /* @__PURE__ */ React2.createElement("div", { className: "sh-light-readout" }, isOn ? `${brightness}%` : "Off"), /* @__PURE__ */ React2.createElement("div", { className: "sh-light-subreadout" }, isOn ? "Luz ligada" : "Luz desligada"), activeTab === "brightness" && /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "sh-pill-slider-container",
        style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0,
        onClick: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const pct = Math.max(0, Math.min(100, Math.round((rect.height - clickY) / rect.height * 100)));
          handleBrightnessChange(pct);
        }
      },
      /* @__PURE__ */ React2.createElement(
        "div",
        {
          className: "sh-pill-slider-fill",
          style: {
            height: `${brightness}%`,
            background: isOn ? "linear-gradient(to top, #f59e0b, #fbbf24)" : "#334155"
          }
        },
        /* @__PURE__ */ React2.createElement("div", { className: "sh-pill-handle" })
      )
    ), activeTab === "color" && /* @__PURE__ */ React2.createElement("div", { style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement(ColorWheelPicker, { selectedHex: selectedRgbHex, onChange: handleColorChange }), /* @__PURE__ */ React2.createElement("div", { className: "sh-color-grid" }, COLOR_PRESETS.map((preset) => /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: preset.name,
        className: "sh-color-circle",
        style: { background: preset.color },
        onClick: () => handleColorChange(preset.rgb, preset.color),
        title: preset.name
      }
    )))), activeTab === "temp" && /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "sh-pill-slider-container",
        style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0,
        onClick: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const pct = Math.max(0, Math.min(100, Math.round((rect.height - clickY) / rect.height * 100)));
          handleTempSliderChange(pct);
        }
      },
      /* @__PURE__ */ React2.createElement(
        "div",
        {
          className: "sh-pill-slider-fill",
          style: {
            height: `${tempPct}%`,
            background: "linear-gradient(to top, #ff9e3b, #60a5fa)"
          }
        },
        /* @__PURE__ */ React2.createElement("div", { className: "sh-pill-handle" })
      )
    ), /* @__PURE__ */ React2.createElement("div", { className: "sh-light-ctrl-bar", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React2.createElement("button", { className: `sh-light-ctrl-btn ${activeTab === "brightness" ? "active" : ""}`, onClick: () => setActiveTab("brightness") }, /* @__PURE__ */ React2.createElement(SvgSun, { size: 20 })), /* @__PURE__ */ React2.createElement("button", { className: `sh-light-ctrl-btn ${activeTab === "color" ? "active" : ""}`, onClick: () => setActiveTab("color") }, /* @__PURE__ */ React2.createElement(SvgColorWheel, { size: 22 })), /* @__PURE__ */ React2.createElement("button", { className: `sh-light-ctrl-btn ${activeTab === "temp" ? "active" : ""}`, onClick: () => setActiveTab("temp") }, /* @__PURE__ */ React2.createElement(SvgTemp, { size: 22 })), /* @__PURE__ */ React2.createElement("button", { className: `sh-light-ctrl-btn ${isOn ? "active" : ""}`, onClick: handleToggle, style: isOn ? { background: "#ef4444", color: "#fff" } : void 0 }, /* @__PURE__ */ React2.createElement(SvgPower, { size: 20 }))));
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React2.createElement(
    "button",
    {
      className: "sh-modal-close-btn",
      onClick: (e) => {
        e.stopPropagation();
        if (onClose) onClose();
      },
      style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
    },
    "\u2715"
  ), /* @__PURE__ */ React2.createElement("div", { style: { textAlign: "center", marginBottom: "24px" } }, /* @__PURE__ */ React2.createElement("div", { className: "sh-icon", style: { width: "60px", height: "60px", borderRadius: "18px", margin: "0 auto 12px", fontSize: "28px" } }, currentDynamicIcon), /* @__PURE__ */ React2.createElement("h2", { style: { fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" } }, device.name), /* @__PURE__ */ React2.createElement("p", { style: { fontSize: "13px", color: "#94a3b8", margin: 0 } }, device.room ? `${device.room} \u2022 ` : "", DOMAIN_LABELS[device.domain] || device.domain)), /* @__PURE__ */ React2.createElement("div", { style: { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px", marginBottom: "24px" } }, /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "12px" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "13px", color: "#94a3b8", fontWeight: 500 } }, "Status do Dispositivo"), /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "13px", fontWeight: 700, color: isOn ? "#34d399" : "#f87171" } }, isOn ? "Ativo / Ligado" : "Inativo / Desligado")), device.state?.temperature != null && /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, "Temperatura"), /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#38bdf8" } }, device.state.temperature, "\xB0C")), device.state?.humidity != null && /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, "Umidade"), /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#38bdf8" } }, device.state.humidity, "%")), device.state?.value && /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, "Valor"), /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" } }, device.state.value, " ", device.state.unit || ""))), CONTROLLABLE_DOMAINS.includes(device.domain) && /* @__PURE__ */ React2.createElement(
    "button",
    {
      className: "sh-btn-primary",
      style: { width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: "15px" },
      onClick: handleToggle
    },
    /* @__PURE__ */ React2.createElement(SvgPower, { size: 18, color: "#ffffff" }),
    isOn ? "Desligar Dispositivo" : "Ligar Dispositivo"
  ));
}

// src/styles.ts
import React3 from "react";
var SMART_HOME_CSS = `
  @keyframes shFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shPulseDot {
    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  }

  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    background-color: #090814;
  }

  /* Extension Background: Soft Lavander Glow at Top, Deep MomAI Theme at Bottom */
  .sh-root {
    background:
      radial-gradient(circle at 50% -10%, rgba(167, 139, 250, 0.22) 0%, transparent 60%),
      radial-gradient(circle at 85% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
      linear-gradient(180deg, #1b1733 0%, #120e24 40%, #090814 100%);
    color: #f8fafc;
    height: 100vh; overflow-y: auto; overflow-x: hidden;
    padding: 24px 30px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
    animation: shFadeIn 0.25s ease-out;
  }

  .sh-root::-webkit-scrollbar {
    width: 6px;
  }
  .sh-root::-webkit-scrollbar-track {
    background: transparent;
  }
  .sh-root::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
  }
  .sh-root::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Seamless Header */
  .sh-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; flex-wrap: wrap; gap: 16px;
    padding: 0 2px;
  }

  .sh-header-left {
    display: flex; align-items: center; gap: 14px;
  }

  .sh-logo-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(167, 139, 250, 0.15);
    border: 1px solid rgba(167, 139, 250, 0.25);
    display: flex; align-items: center; justify-content: center;
    color: #a78bfa;
    box-shadow: 0 4px 14px rgba(167, 139, 250, 0.2);
  }

  .sh-title {
    font-size: 20px; font-weight: 700; color: #f8fafc;
    margin: 0; letter-spacing: -0.3px;
  }

  .sh-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

  .sh-btn {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #e2e8f0; padding: 8px 16px; border-radius: 10px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
    backdrop-filter: blur(12px);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .sh-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .sh-btn-primary {
    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
    border: none;
    color: #ffffff; padding: 11px 20px; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;
    box-shadow: 0 6px 20px rgba(167, 139, 250, 0.35);
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  }
  .sh-btn-primary:hover {
    background: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%);
    box-shadow: 0 8px 24px rgba(167, 139, 250, 0.45);
    transform: translateY(-1px);
  }

  .sh-btn-danger {
    background: rgba(239, 68, 68, 0.18);
    border: none;
    color: #fca5a5;
  }
  .sh-btn-danger:hover {
    background: rgba(239, 68, 68, 0.28);
    color: #ffffff;
  }

  .sh-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    padding: 8px 16px; border-radius: 10px;
    font-size: 13px; color: #cbd5e1; font-weight: 500;
  }

  .sh-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    animation: shPulseDot 2s infinite ease-in-out;
  }
  .sh-dot.off {
    background: #ef4444;
    animation: none;
  }

  /* Compact Zero-Scroll Auth / Connection Screen */
  .sh-auth {
    display: flex; justify-content: center; align-items: center;
    min-height: calc(100vh - 48px); padding: 0;
  }

  .sh-auth-card {
    background: #1E1E23 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 26px; padding: 32px 36px; max-width: 780px; width: 100%;
    display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    box-sizing: border-box; text-align: left;
  }

  @media (max-width: 720px) {
    .sh-auth-card {
      grid-template-columns: 1fr; gap: 20px; padding: 24px; max-width: 440px;
    }
  }

  .sh-auth-left {
    display: flex; flex-direction: column; justify-content: center;
  }

  .sh-auth-icon {
    width: 52px; height: 52px; margin: 0 0 16px;
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(124, 58, 237, 0.2));
    border: 1px solid rgba(167, 139, 250, 0.35);
    border-radius: 16px; display: flex; align-items: center; justify-content: center;
    color: #a78bfa; box-shadow: 0 0 26px rgba(167, 139, 250, 0.25);
  }

  .sh-auth-title {
    font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 8px; letter-spacing: -0.4px;
  }

  .sh-auth-sub {
    font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px;
  }

  .sh-auth-feats-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }

  .sh-auth-feat-item {
    display: flex; align-items: center; gap: 8px;
    background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 10px 12px; border-radius: 12px; font-size: 11.5px; color: #cbd5e1; font-weight: 500;
  }

  .sh-auth-feat-icon-box {
    width: 24px; height: 24px; border-radius: 7px;
    background: rgba(167, 139, 250, 0.15);
    display: flex; align-items: center; justify-content: center;
    color: #a78bfa; flex-shrink: 0;
  }

  .sh-auth-form {
    display: flex; flex-direction: column; gap: 14px;
    background: rgba(0, 0, 0, 0.2); padding: 22px; border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sh-auth-input-group {
    display: flex; flex-direction: column; gap: 6px;
  }

  .sh-auth-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; color: #cbd5e1;
  }

  .sh-auth-input {
    width: 100%; background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px; padding: 10px 14px; color: #f8fafc; font-size: 13px;
    box-sizing: border-box; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sh-auth-input:focus {
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
  }

  /* Modals */
  .sh-modal-overlay {
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;
    animation: shFadeIn 0.2s ease-out;
  }
  .sh-modal {
    background: #131026;
    border: none;
    border-radius: 24px; padding: 32px; max-width: 440px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  }
  .sh-input {
    width: 100%; background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px; padding: 12px 16px; color: #f8fafc; font-size: 14px;
    margin-top: 6px; box-sizing: border-box; outline: none;
    transition: border-color 0.15s;
  }
  .sh-input:focus { border-color: #a78bfa; }
  .sh-label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-top: 16px; }

  /* Minimalist Filter Bar */
  .sh-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 20px; scrollbar-width: none; }
  .sh-chip {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    color: #94a3b8; cursor: pointer; white-space: nowrap;
    transition: background 0.15s, color 0.15s;
  }
  .sh-chip:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
  }
  .sh-chip.active {
    background: rgba(167, 139, 250, 0.18);
    color: #a78bfa;
    font-weight: 600;
  }

  /* BORDERLESS Glass Cards Grid */
  .sh-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px; margin-bottom: 28px;
  }

  .sh-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: none !important;
    border-radius: 20px; padding: 18px 20px; position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    min-height: 135px; cursor: pointer; box-sizing: border-box;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .sh-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.09);
  }

  /* Active State with Soft Lavander Accent */
  .sh-card.on {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  }

  .sh-card-header { display: flex; justify-content: space-between; align-items: center; }
  .sh-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: rgba(255, 255, 255, 0.07);
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8; transition: all 0.2s ease;
  }
  .sh-card.on .sh-icon {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
  }

  /* Custom Toggle Switch */
  .sh-toggle { position: relative; display: inline-block; width: 42px; height: 24px; }
  .sh-toggle input { opacity: 0; width: 0; height: 0; }
  .sh-slider {
    position: absolute; cursor: pointer; top:0; left:0; right:0; bottom:0;
    background: rgba(255, 255, 255, 0.12); transition: .2s ease;
    border-radius: 34px;
  }
  .sh-slider:before {
    position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
    background: #94a3b8; transition: .2s ease; border-radius: 50%;
  }
  input:checked + .sh-slider { background: #8b5cf6; }
  input:checked + .sh-slider:before { transform: translateX(18px); background: #ffffff; }

  .sh-body { margin-top: 14px; }
  .sh-name { font-size: 14.5px; font-weight: 600; color: #ffffff; margin: 0 0 3px; letter-spacing: -0.2px; }
  .sh-sub { font-size: 12px; color: #94a3b8; margin: 0; }
  .sh-bar { margin-top: 12px; height: 6px; border-radius: 9999px; background: rgba(255, 255, 255, 0.1); overflow: hidden; cursor: pointer; }
  .sh-fill { height: 100%; background: #a78bfa; border-radius: 9999px; transition: width 0.15s; }
  .sh-temp { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
  .sh-temp-btn {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,0.08); border: none;
    color: white; font-size: 15px; font-weight: bold; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .sh-temp-btn:hover { background: rgba(255,255,255,0.18); }

  /* Subdued Widgets Section at Bottom */
  .sh-widgets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-top: 28px;
    margin-bottom: 20px;
  }

  .sh-clock-card, .sh-sun-widget, .sh-weather-widget {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: none !important;
    border-radius: 20px; padding: 20px 22px;
    display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
  .sh-clock-time { font-size: 34px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1; margin-bottom: 6px; }
  .sh-clock-date { font-size: 13px; font-weight: 500; color: #94a3b8; display: flex; align-items: center; gap: 6px; }

  .sh-sun-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .sh-sun-badge { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #cbd5e1; }
  .sh-sun-elevation { font-size: 11px; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 6px; font-weight: 600; }
  .sh-sun-arc-container { display: flex; justify-content: center; margin: 2px 0; }
  .sh-sun-arc-svg { width: 100%; max-width: 190px; height: 60px; }
  .sh-sun-times { display: flex; justify-around: space-around; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 10px; margin-top: 6px; }
  .sh-sun-time-box { display: flex; flex-direction: column; align-items: center; }
  .sh-sun-time-label { font-size: 10.5px; color: rgba(255,255,255,0.6); margin-bottom: 2px; display: flex; align-items: center; gap: 4px; }
  .sh-sun-time-val { font-size: 13px; font-weight: 700; color: #ffffff; }

  .sh-weather-main { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .sh-weather-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; color: #a78bfa; }
  .sh-weather-name { font-size: 14.5px; font-weight: 600; color: #f8fafc; margin: 0 0 2px; }
  .sh-weather-state { font-size: 10.5px; color: #a78bfa; margin: 0; font-weight: 600; letter-spacing: 0.5px; }
  .sh-weather-temp { margin-left: auto; font-size: 24px; font-weight: 800; color: #a78bfa; }
  .sh-weather-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 10px; }
  .sh-weather-detail { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: #94a3b8; }
  .sh-weather-detail-label { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  .sh-weather-detail strong { color: #f8fafc; font-size: 12px; }

  .sh-empty {
    background: rgba(255, 255, 255, 0.04);
    border: none !important;
    border-radius: 20px; padding: 48px 24px; text-align: center; margin-bottom: 28px;
  }
  .sh-empty-icon {
    width: 52px; height: 52px; border-radius: 14px; background: rgba(255, 255, 255, 0.06);
    display: flex; align-items: center; justify-content: center; color: #94a3b8; margin: 0 auto 14px;
  }

  /* Modal Details & Remote Controls with MomAI Original Dark Grey (Borderless) */
  .sh-modal-detail {
    background: rgba(24, 24, 28, 0.95);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: none !important;
    border-radius: 28px; padding: 32px 28px;
    max-width: 420px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    position: relative; box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  }
  .sh-modal-close-btn {
    position: absolute; top: 18px; right: 18px;
    background: rgba(255,255,255,0.1); border: none;
    color: #cbd5e1; width: 36px; height: 36px; border-radius: 50%;
    cursor: pointer !important; display: flex; align-items: center; justify-content: center;
    -webkit-app-region: no-drag !important;
    z-index: 99999 !important;
    pointer-events: auto !important;
    transition: background 0.15s, color 0.15s, transform 0.15s;
  }
  .sh-modal-close-btn:hover {
    background: rgba(239, 68, 68, 0.8) !important;
    color: #ffffff !important;
    transform: scale(1.08);
  }
  .sh-light-readout { font-size: 44px; font-weight: 800; color: #ffffff; text-align: center; margin-top: 14px; line-height: 1; letter-spacing: -1px; }
  .sh-light-subreadout { font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 22px; font-weight: 500; margin-top: 4px; }

  .sh-pill-slider-container {
    width: 124px; height: 240px; border-radius: 62px; background: rgba(0, 0, 0, 0.4);
    margin: 0 auto 22px; position: relative; overflow: hidden; cursor: pointer;
  }
  .sh-pill-slider-fill {
    position: absolute; bottom: 0; left: 0; right: 0; border-radius: 0 0 62px 62px; transition: height 0.15s ease-out, background 0.2s; display: flex; justify-content: center; align-items: flex-start;
  }
  .sh-pill-handle { width: 34px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 9999px; margin-top: 12px; }

  .sh-light-ctrl-bar {
    display: flex; justify-content: center; align-items: center; gap: 10px;
    background: rgba(0, 0, 0, 0.4); padding: 6px 14px; border-radius: 9999px;
    margin: 0 auto 22px; width: fit-content;
  }
  .sh-light-ctrl-btn {
    width: 42px; height: 42px; border-radius: 50%; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .sh-light-ctrl-btn.active { background: #ffffff; color: #18181c; }

  .sh-color-wheel {
    width: 230px; height: 230px; border-radius: 50%; margin: 8px auto 22px; position: relative;
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
    mask-image: radial-gradient(circle, #fff 100%, transparent 100%);
    cursor: crosshair; touch-action: none;
  }
  .sh-color-wheel::after {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%);
  }
  .sh-color-wheel-handle {
    position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff; transform: translate(-50%, -50%); pointer-events: none; z-index: 10; background: rgba(255,255,255,0.3);
  }
  .sh-color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 250px; margin: 0 auto; justify-items: center; }
  .sh-color-circle { width: 46px; height: 46px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
  .sh-color-circle:hover { transform: scale(1.06); border-color: rgba(255,255,255,0.8); }

  .sh-remote-header { margin-bottom: 18px; }
  .sh-remote-pill-tag { display: inline-block; font-size: 11px; font-weight: 700; color: #a78bfa; background: rgba(167,139,250,0.15); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .sh-remote-title { font-size: 21px; font-weight: 800; color: #fff; margin: 0 0 4px; }
  .sh-remote-state { font-size: 12px; color: #94a3b8; margin: 0; font-weight: 500; }

  .sh-dpad-ring {
    width: 185px; height: 185px; border-radius: 50%; background: rgba(0,0,0,0.35); margin: 0 auto 22px; position: relative; display: flex; align-items: center; justify-content: center;
  }
  .sh-dpad-btn { position: absolute; background: none; border: none; color: #cbd5e1; font-size: 14px; cursor: pointer; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; }
  .sh-dpad-btn:hover { color: #fff; transform: scale(1.1); }
  .sh-dpad-btn.up { top: 4px; }
  .sh-dpad-btn.down { bottom: 4px; }
  .sh-dpad-btn.left { left: 4px; }
  .sh-dpad-btn.right { right: 4px; }
  .sh-dpad-center { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.06); border: none; color: #fff; font-size: 14.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .sh-dpad-center:hover { background: #8b5cf6; }

  .sh-remote-actions-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: nowrap; }
  .sh-remote-action-btn { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.06); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sh-remote-action-btn:hover, .sh-remote-action-btn.active { background: #8b5cf6; color: #fff; }
  .sh-remote-action-btn.youtube-pill { width: auto; height: 42px; padding: 0 10px; border-radius: 10px; background: #ffffff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .sh-remote-action-btn.power { background: #ef4444 !important; color: #ffffff !important; border: none !important; }

  .sh-input-selector-popover { background: rgba(24, 24, 28, 0.95); border: none !important; border-radius: 16px; padding: 12px; margin: 0 auto 18px; max-width: 310px; box-shadow: 0 10px 24px rgba(0,0,0,0.5); animation: shFadeIn 0.2s ease-out; }
  .sh-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .sh-input-chip { background: rgba(255,255,255,0.06); border: none; border-radius: 10px; padding: 10px 8px; color: #e2e8f0; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: center; }
  .sh-input-chip:hover { background: #8b5cf6; color: #fff; }

  .sh-remote-media-row, .sh-remote-vol-row { display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; }
  .sh-volume-control { position: relative; display: flex; align-items: center; justify-content: center; }
  .sh-volume-feedback {
    position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%);
    min-width: 48px; padding: 6px 8px; box-sizing: border-box; border-radius: 9999px;
    background: rgba(24, 24, 28, 0.42); border: 1px solid rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.96); font-size: 12px; font-weight: 800; line-height: 1;
    text-align: center; white-space: nowrap; pointer-events: none; z-index: 5;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    opacity: 0; visibility: hidden; transform: translate(-50%, 4px) scale(0.92);
    transition: opacity 0.16s ease-out, transform 0.16s ease-out, visibility 0.16s;
  }
  .sh-volume-control:hover .sh-volume-feedback, .sh-volume-feedback.active {
    opacity: 1; visibility: visible; transform: translate(-50%, 0) scale(1);
  }
  .sh-remote-icon-btn { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.06); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .sh-remote-icon-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .sh-remote-icon-btn.main { background: #8b5cf6; color: #fff; border: none; }
`;
function SmartHomeStyles() {
  return React3.createElement("style", null, SMART_HOME_CSS);
}

// src/panel.tsx
function SmartHomePanel(props) {
  const data = props?.data || props;
  const device = data?.device;
  const handleClose = () => {
    let closed = false;
    if (typeof props?.onClose === "function") {
      try {
        props.onClose();
        closed = true;
      } catch {
      }
    }
    if (!closed && typeof data?.onClose === "function") {
      try {
        data.onClose();
        closed = true;
      } catch {
      }
    }
    if (typeof window.momaiAPI?.closeOverlay === "function") {
      try {
        ;
        window.momaiAPI.closeOverlay();
      } catch {
      }
    }
    if (typeof window.api?.closeOverlay === "function") {
      try {
        ;
        window.api.closeOverlay();
      } catch {
      }
    }
  };
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(SmartHomeStyles, null), !device ? /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: "sh-modal-detail",
      style: {
        WebkitAppRegion: "drag",
        padding: "24px",
        textAlign: "center",
        color: "#fff",
        position: "relative"
      }
    },
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        style: { WebkitAppRegion: "no-drag", cursor: "pointer", zIndex: 99999 },
        onClick: (e) => {
          e.stopPropagation();
          handleClose();
        }
      },
      "\u2715"
    ),
    /* @__PURE__ */ React4.createElement("p", { style: { fontSize: "14px", color: "#9aa0a6", margin: "20px 0 0" } }, "Nenhum dispositivo selecionado para exibi\xE7\xE3o.")
  ) : /* @__PURE__ */ React4.createElement(
    DeviceControlCardContent,
    {
      device,
      allDevices: data?.allDevices || [],
      onClose: handleClose,
      isOverlay: true
    }
  ));
}
var registerRenderer = (type, component) => {
  if (typeof window !== "undefined" && window.__skillRendererRegistry?.registerRenderer) {
    ;
    window.__skillRendererRegistry.registerRenderer(type, component);
  }
};
registerRenderer("momaismarthome-panel", SmartHomePanel);
var panel_default = SmartHomePanel;
export {
  SmartHomePanel,
  panel_default as default
};
