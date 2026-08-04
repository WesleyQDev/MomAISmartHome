import React from 'react'

export const SMART_HOME_CSS = `
  @keyframes shFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shPulseDot {
    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  }

  @keyframes shSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .sh-spin {
    animation: shSpin 0.8s linear infinite;
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
  .sh-dpad-btn { position: absolute; background: none; border: none; color: #cbd5e1; font-size: 14px; cursor: pointer; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), color 0.1s ease, filter 0.1s ease; border-radius: 50%; user-select: none; }
  .sh-dpad-btn:hover { color: #fff; transform: scale(1.18); }
  .sh-dpad-btn:active { color: #a78bfa; transform: scale(0.88); filter: brightness(0.8); }
  .sh-dpad-btn.up { top: 4px; }
  .sh-dpad-btn.down { bottom: 4px; }
  .sh-dpad-btn.left { left: 4px; }
  .sh-dpad-btn.right { right: 4px; }
  .sh-dpad-center { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 14.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-dpad-center:hover { background: #8b5cf6; transform: scale(1.05); box-shadow: 0 4px 14px rgba(139,92,246,0.4); }
  .sh-dpad-center:active { transform: scale(0.90) translateY(2px); background: #7c3aed; box-shadow: inset 0 3px 6px rgba(0,0,0,0.5); filter: brightness(0.85); }

  .sh-remote-actions-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: nowrap; }
  .sh-remote-action-btn { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-remote-action-btn:hover { transform: scale(1.08); background: rgba(255,255,255,0.12); color: #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.3); }
  .sh-remote-action-btn:hover, .sh-remote-action-btn.active { background: #8b5cf6; color: #fff; }
  .sh-remote-action-btn:active { transform: scale(0.88) translateY(2px); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); filter: brightness(0.85); }
  .sh-remote-action-btn.youtube-pill { width: auto; height: 42px; padding: 0 10px; border-radius: 10px; background: #ffffff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-remote-action-btn.youtube-pill:hover { transform: scale(1.06); box-shadow: 0 3px 10px rgba(255,255,255,0.3); }
  .sh-remote-action-btn.youtube-pill:active { transform: scale(0.90) translateY(2px) !important; filter: brightness(0.9) !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important; }
  .sh-remote-action-btn.power { background: #ef4444 !important; color: #ffffff !important; border: none !important; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-remote-action-btn.power:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
  .sh-remote-action-btn.power:active { transform: scale(0.88) translateY(2px) !important; filter: brightness(0.85) !important; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5) !important; }

  .sh-input-selector-popover { background: rgba(24, 24, 28, 0.95); border: none !important; border-radius: 16px; padding: 12px; margin: 0 auto 18px; max-width: 310px; box-shadow: 0 10px 24px rgba(0,0,0,0.5); animation: shFadeIn 0.2s ease-out; }
  .sh-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .sh-input-chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 8px; color: #e2e8f0; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-input-chip:hover { background: #8b5cf6; color: #fff; transform: scale(1.03); box-shadow: 0 3px 8px rgba(139,92,246,0.3); }
  .sh-input-chip:active { transform: scale(0.93) translateY(1px); box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); filter: brightness(0.85); }

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
  .sh-remote-icon-btn { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; }
  .sh-remote-icon-btn:hover { background: rgba(255,255,255,0.15); color: #fff; transform: scale(1.08); box-shadow: 0 3px 8px rgba(0,0,0,0.3); }
  .sh-remote-icon-btn:active { transform: scale(0.88) translateY(2px); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); filter: brightness(0.85); }
  .sh-remote-icon-btn.main { background: #8b5cf6; color: #fff; border: none; }
  .sh-remote-icon-btn.main:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
  .sh-remote-icon-btn.main:active { transform: scale(0.88) translateY(2px); background: #7c3aed; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); filter: brightness(0.85); }

  /* Offline Badge & Reconnecting Card */
  .sh-badge-offline {
    background: rgba(239, 68, 68, 0.15) !important;
    color: #fca5a5 !important;
    border: 1px solid rgba(239, 68, 68, 0.3) !important;
  }
  .sh-badge-offline .sh-dot {
    background: #ef4444 !important;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6) !important;
    animation: none !important;
  }

  .sh-reconnect-container {
    max-width: 580px;
    margin: 32px auto 40px;
    padding: 0 16px;
    animation: shFadeIn 0.3s ease-out;
  }

  .sh-reconnect-card {
    background: #1E1E23 !important;
    border: none !important;
    border-radius: 24px;
    padding: 36px 28px;
    text-align: center;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
  }

  .sh-reconnect-icon-box {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f87171;
    margin: 0 auto 20px;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
  }

  .sh-reconnect-title {
    font-size: 19px;
    font-weight: 700;
    color: #f8fafc;
    margin: 0 0 8px;
    letter-spacing: -0.3px;
  }

  .sh-reconnect-sub {
    font-size: 13.5px;
    color: #cbd5e1;
    line-height: 1.5;
    margin: 0 0 18px;
  }

  .sh-reconnect-url-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    color: #a78bfa;
    font-family: monospace;
    margin-bottom: 24px;
  }

  .sh-reconnect-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
`

export function SmartHomeStyles() {
  return React.createElement('style', null, SMART_HOME_CSS)
}
