// src/page.tsx
import React, { useState, useEffect } from "react";
var OFFICIAL_GOOGLE_CLIENT_ID = "204049970754-gtadrgcj0eragg8u2skl3o9501s1rhc9.apps.googleusercontent.com";
function SmartHomePage() {
  const [house, setHouse] = useState("Minha Casa");
  const [activeTab, setActiveTab] = useState("todos");
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [customClientId, setCustomClientId] = useState("");
  const [customClientSecret, setCustomClientSecret] = useState("");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDevName, setNewDevName] = useState("");
  const [newDevType, setNewDevType] = useState("light");
  const [newDevRoom, setNewDevRoom] = useState("Sala de Estar");
  const [newDevProvider, setNewDevProvider] = useState("Home Assistant");
  const [newDevIp, setNewDevIp] = useState("");
  const [devices, setDevices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const normalizeGoogleDeviceType = (typeStr = "") => {
    const upper = typeStr.toUpperCase();
    if (upper.includes("LIGHT")) return "light";
    if (upper.includes("THERMOSTAT") || upper.includes("AC")) return "thermostat";
    if (upper.includes("LOCK")) return "lock";
    if (upper.includes("CAMERA")) return "camera";
    if (upper.includes("TV") || upper.includes("SPEAKER")) return "tv";
    return "plug";
  };
  const fetchGoogleHomeDevices = async (token) => {
    if (!token) return;
    try {
      const res = await fetch("https://homegraph.googleapis.com/v1/devices:sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ agentUserId: "momai_user" })
      });
      if (res.ok) {
        const data = await res.json();
        const rawDevices = data.payload?.devices || [];
        if (Array.isArray(rawDevices) && rawDevices.length > 0) {
          const mappedDevices = rawDevices.map((dev) => ({
            id: dev.id,
            name: dev.name?.name || dev.name?.defaultNames?.[0] || "Dispositivo Google Home",
            type: normalizeGoogleDeviceType(dev.type),
            room: dev.roomHint || "Google Home",
            state: Boolean(dev.attributes?.on || dev.states?.on),
            brightness: dev.attributes?.brightness || dev.states?.brightness || 80,
            temperature: dev.attributes?.thermostatTemperatureSetpoint || 22,
            provider: "Google Home Graph",
            isReal: true
          }));
          setDevices(mappedDevices);
          localStorage.setItem("momaismarthome_custom_devices", JSON.stringify(mappedDevices));
        }
      }
    } catch (err) {
      console.warn("[SmartHome] Erro ao buscar dispositivos reais via HomeGraph:", err);
    }
  };
  const handleCompleteLogin = (emailReceived, tokenReceived) => {
    if (!emailReceived || emailReceived === "usuario@gmail.com") return;
    setIsConnected(true);
    setUserEmail(emailReceived);
    setIsLoggingIn(false);
    if (tokenReceived) {
      setGoogleAccessToken(tokenReceived);
      localStorage.setItem("momaismarthome_access_token", tokenReceived);
      fetchGoogleHomeDevices(tokenReceived);
    }
    const savedCustomDevices = localStorage.getItem("momaismarthome_custom_devices");
    if (savedCustomDevices) {
      try {
        const parsed = JSON.parse(savedCustomDevices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDevices(parsed);
        }
      } catch {
      }
    }
    localStorage.setItem(
      "momaismarthome_session",
      JSON.stringify({ connected: true, email: emailReceived, timestamp: Date.now() })
    );
  };
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("momaismarthome_session");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.connected && parsed.email && parsed.email !== "usuario@gmail.com") {
          setIsConnected(true);
          setUserEmail(parsed.email);
        }
      }
      const savedToken = localStorage.getItem("momaismarthome_access_token");
      if (savedToken) {
        setGoogleAccessToken(savedToken);
        fetchGoogleHomeDevices(savedToken);
      }
      const savedCustomClientId = localStorage.getItem("momaismarthome_client_id");
      let activeId = "";
      if (savedCustomClientId) {
        activeId = savedCustomClientId;
        setCustomClientId(savedCustomClientId);
      } else if (typeof process !== "undefined" && "") {
        activeId = "";
        setCustomClientId(activeId);
        localStorage.setItem("momaismarthome_client_id", activeId);
      }
      if (activeId && typeof window !== "undefined") {
        ;
        window.momaismarthome_client_id = activeId;
      }
      const savedCustomClientSecret = localStorage.getItem("momaismarthome_client_secret");
      let activeSecret = "";
      if (savedCustomClientSecret) {
        activeSecret = savedCustomClientSecret;
        setCustomClientSecret(savedCustomClientSecret);
      } else if (typeof process !== "undefined" && "") {
        activeSecret = "";
        setCustomClientSecret(activeSecret);
        localStorage.setItem("momaismarthome_client_secret", activeSecret);
      }
      if (activeSecret && typeof window !== "undefined") {
        ;
        window.momaismarthome_client_secret = activeSecret;
      }
      const savedDevices = localStorage.getItem("momaismarthome_custom_devices");
      if (savedDevices) {
        const parsedDevs = JSON.parse(savedDevices);
        if (Array.isArray(parsedDevs) && parsedDevs.length > 0) {
          setDevices(parsedDevs);
        }
      }
    } catch {
    }
  }, []);
  useEffect(() => {
    const handleGoogleAuthSuccess = (data) => {
      if (data && data.email) {
        const token = data.access_token || data.tokens?.access_token;
        handleCompleteLogin(data.email, token);
      }
    };
    const handleGoogleAuthError = (data) => {
      setIsLoggingIn(false);
      setAuthError(data?.error || "Falha ao autenticar com a conta Google. Tente novamente.");
    };
    const handleWindowMessage = (event) => {
      if (event.data?.type === "google-oauth-success" || typeof event.data?.url === "string" && event.data.url.includes("127.0.0.1:3333/callback")) {
        handleGoogleAuthSuccess(event.data);
      } else if (event.data?.type === "google-oauth-error") {
        handleGoogleAuthError(event.data);
      }
    };
    window.addEventListener("message", handleWindowMessage);
    let removeIpcListener;
    let removeIpcErrorListener;
    if (typeof window !== "undefined" && window.api?.on) {
      try {
        removeIpcListener = window.api.on("google-oauth-success", (payload) => {
          handleGoogleAuthSuccess(payload);
        });
        removeIpcErrorListener = window.api.on("google-oauth-error", (payload) => {
          handleGoogleAuthError(payload);
        });
      } catch {
      }
    }
    return () => {
      window.removeEventListener("message", handleWindowMessage);
      if (removeIpcListener) removeIpcListener();
      if (removeIpcErrorListener) removeIpcErrorListener();
    };
  }, []);
  const generatePkcePair = async () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return { verifier, challenge };
  };
  const handleStartGoogleOAuthWindow = async () => {
    setAuthError(null);
    const activeClientId = customClientId.trim() || OFFICIAL_GOOGLE_CLIENT_ID;
    const activeClientSecret = customClientSecret.trim();
    if (!activeClientSecret) {
      setIsLoggingIn(false);
      setAuthError(
        'Erro: Chave secreta (Client Secret) n\xE3o configurada. Para conectar ao Google Home, acesse as "Op\xE7\xF5es Avan\xE7adas" abaixo e insira as credenciais do seu projeto no Google Cloud, ou configure o arquivo .env na raiz da extens\xE3o e execute o build.'
      );
      return;
    }
    setIsLoggingIn(true);
    const redirectUri = "http://127.0.0.1:3333/callback";
    let pkceQuery = "";
    try {
      const { verifier, challenge } = await generatePkcePair();
      localStorage.setItem("momaismarthome_code_verifier", verifier);
      if (typeof window !== "undefined") {
        ;
        window.momaismarthome_code_verifier = verifier;
      }
      pkceQuery = `&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=S256`;
    } catch (e) {
      console.warn("[SmartHome] PKCE generation skipped:", e);
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      activeClientId
    )}&response_type=code&scope=openid%20email%20profile%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}${pkceQuery}&prompt=consent&color_scheme=light&hl=pt-BR`;
    window.open(googleAuthUrl, "GoogleOAuthPopup", "width=540,height=680,resizable=yes");
  };
  const handleLogout = () => {
    setIsConnected(false);
    setUserEmail(null);
    setIsLoggingIn(false);
    localStorage.removeItem("momaismarthome_session");
  };
  const handleSaveCustomClientId = (e) => {
    e.preventDefault();
    if (customClientId.trim()) {
      localStorage.setItem("momaismarthome_client_id", customClientId.trim());
      if (typeof window !== "undefined") window.momaismarthome_client_id = customClientId.trim();
    } else {
      localStorage.removeItem("momaismarthome_client_id");
      if (typeof window !== "undefined") delete window.momaismarthome_client_id;
    }
    if (customClientSecret.trim()) {
      localStorage.setItem("momaismarthome_client_secret", customClientSecret.trim());
      if (typeof window !== "undefined") window.momaismarthome_client_secret = customClientSecret.trim();
    } else {
      localStorage.removeItem("momaismarthome_client_secret");
      if (typeof window !== "undefined") delete window.momaismarthome_client_secret;
    }
    setShowAdvancedConfig(false);
  };
  const handleAddRealDevice = (e) => {
    e.preventDefault();
    if (!newDevName.trim()) return;
    const newDevice = {
      id: `real_${Date.now()}`,
      name: newDevName.trim(),
      type: newDevType,
      room: newDevRoom,
      state: true,
      provider: newDevProvider,
      ipAddress: newDevIp.trim() || void 0,
      isReal: true,
      value: newDevIp ? `IP: ${newDevIp}` : `Integra\xE7\xE3o: ${newDevProvider}`
    };
    const updated = [newDevice, ...devices];
    setDevices(updated);
    localStorage.setItem("momaismarthome_custom_devices", JSON.stringify(updated));
    setNewDevName("");
    setNewDevIp("");
    setShowAddDeviceModal(false);
  };
  const toggleDevice = (id, e) => {
    e?.stopPropagation();
    const updated = devices.map((d) => d.id === id ? { ...d, state: !d.state } : d);
    setDevices(updated);
    localStorage.setItem("momaismarthome_custom_devices", JSON.stringify(updated));
  };
  const setBrightness = (id, brightness, e) => {
    e.stopPropagation();
    const updated = devices.map((d) => d.id === id ? { ...d, brightness } : d);
    setDevices(updated);
    localStorage.setItem("momaismarthome_custom_devices", JSON.stringify(updated));
  };
  const adjustTemp = (id, delta, e) => {
    e.stopPropagation();
    const updated = devices.map(
      (d) => d.id === id ? { ...d, temperature: Math.min(30, Math.max(16, (d.temperature || 22) + delta)) } : d
    );
    setDevices(updated);
    localStorage.setItem("momaismarthome_custom_devices", JSON.stringify(updated));
  };
  const filteredDevices = devices.filter((d) => {
    if (activeCategoryFilter === "light") return d.type === "light";
    if (activeCategoryFilter === "thermostat") return d.type === "thermostat";
    if (activeCategoryFilter === "camera") return d.type === "camera";
    if (activeCategoryFilter === "lock") return d.type === "lock";
    if (activeCategoryFilter === "tv") return d.type === "tv" || d.type === "speaker";
    if (activeTab === "todos") return true;
    if (activeTab === "sala") return d.room === "Sala de Estar";
    if (activeTab === "quarto") return d.room === "Quarto Principal";
    if (activeTab === "entrada") return d.room === "Entrada";
    if (activeTab === "cozinha") return d.room === "Cozinha";
    return true;
  });
  const activeLightsCount = devices.filter((d) => d.type === "light" && d.state).length;
  const totalLightsCount = devices.filter((d) => d.type === "light").length;
  const currentTemp = devices.find((d) => d.type === "thermostat")?.temperature || 22;
  return /* @__PURE__ */ React.createElement("div", { className: "gh-root" }, /* @__PURE__ */ React.createElement("style", null, `
        .gh-root {
          background-color: #141519;
          color: #e2e2e6;
          min-height: 100vh;
          padding: 36px 40px;
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        /* Header */
        .gh-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gh-house-title {
          font-size: 28px;
          font-weight: 700;
          color: #f1f0f4;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .gh-actions-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gh-btn-secondary {
          background: #1f2128;
          border: none;
          color: #a8c7fa;
          padding: 10px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gh-btn-secondary:hover {
          background: #2b2d37;
          color: #ffffff;
        }

        .gh-btn-primary {
          background: #a8c7fa;
          color: #042e6f;
          border: none;
          padding: 10px 20px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gh-btn-primary:hover {
          background: #c2e7ff;
        }

        .gh-oauth-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1f2128;
          padding: 10px 20px;
          border-radius: 9999px;
          font-size: 13px;
          color: #c4c6d0;
          font-weight: 500;
        }

        .gh-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #34a853;
          box-shadow: 0 0 12px rgba(52, 168, 83, 0.7);
        }

        .gh-status-dot.disconnected {
          background-color: #ea4335;
          box-shadow: 0 0 12px rgba(234, 67, 53, 0.7);
        }

        /* Login Screen Card */
        .gh-auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 160px);
        }

        .gh-auth-card {
          background: #1f2128;
          border-radius: 32px;
          padding: 44px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .gh-auth-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px auto;
          background: linear-gradient(135deg, #4285f4, #34a853);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3);
        }

        .gh-auth-title {
          font-size: 24px;
          font-weight: 700;
          color: #f1f0f4;
          margin: 0 0 10px 0;
        }

        .gh-auth-sub {
          font-size: 14px;
          color: #9aa0a6;
          line-height: 1.6;
          margin: 0 0 28px 0;
        }

        .gh-auth-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
          margin-bottom: 32px;
          background: #18191e;
          padding: 20px;
          border-radius: 20px;
        }

        .gh-auth-feat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #c4c6d0;
        }

        .gh-google-btn {
          width: 100%;
          background: #ffffff;
          color: #1f1f1f;
          border: none;
          padding: 15px 24px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .gh-google-btn:hover {
          background: #f1f3f4;
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .gh-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .gh-modal {
          background: #1f2128;
          border-radius: 28px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
        }

        .gh-input {
          width: 100%;
          background: #141519;
          border: 1px solid #2d313b;
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          margin-top: 6px;
          box-sizing: border-box;
          outline: none;
        }

        .gh-input:focus {
          border-color: #4285f4;
        }

        .gh-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #c4c6d0;
          margin-top: 14px;
        }

        /* Category Chips Bar */
        .gh-chips-bar {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 32px;
          scrollbar-width: none;
        }

        .gh-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1f2128;
          border: none;
          padding: 12px 22px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          color: #c4c6d0;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
          white-space: nowrap;
        }

        .gh-chip:hover {
          background: #2b2d37;
          color: #ffffff;
        }

        .gh-chip.active {
          background: #2a3a54;
          color: #a8c7fa;
        }

        .gh-chip-icon {
          width: 20px;
          height: 20px;
          opacity: 0.9;
        }

        /* Room Tabs */
        .gh-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 36px;
          overflow-x: auto;
        }

        .gh-tab {
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          color: #8e9099;
          background: #191b20;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .gh-tab:hover {
          color: #e2e2e6;
          background: #23252c;
        }

        .gh-tab.active {
          background: #e2e2e6;
          color: #141519;
        }

        /* Section Title */
        .gh-section-title {
          font-size: 19px;
          font-weight: 600;
          color: #f1f0f4;
          margin-bottom: 20px;
          letter-spacing: -0.2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Grid & Cards */
        .gh-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 18px;
          margin-bottom: 44px;
        }

        .gh-card {
          background: #1f2128;
          border: none;
          border-radius: 28px;
          padding: 22px;
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 175px;
          cursor: pointer;
          box-sizing: border-box;
        }

        .gh-card:hover {
          transform: translateY(-2px);
          background: #262932;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
        }

        .gh-card.on.light { background: #332d1e; }
        .gh-card.on.light:hover { background: #3d3624; }

        .gh-card.on.thermostat { background: #1e2a3a; }
        .gh-card.on.thermostat:hover { background: #243347; }

        .gh-card.on.lock { background: #1d2e24; }
        .gh-card.on.lock:hover { background: #23392c; }

        .gh-card.on.camera { background: #332022; }
        .gh-card.on.tv, .gh-card.on.speaker, .gh-card.on.plug { background: #292036; }

        .gh-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gh-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9aa0a6;
          transition: all 0.25s ease;
        }

        .gh-card.on.light .gh-icon-box { background: #ffe082; color: #3e2723; }
        .gh-card.on.thermostat .gh-icon-box { background: #a8c7fa; color: #042e6f; }
        .gh-card.on.lock .gh-icon-box { background: #a8dab5; color: #0a3818; }
        .gh-card.on.camera .gh-icon-box { background: #f28b82; color: #49120d; }
        .gh-card.on.tv .gh-icon-box, .gh-card.on.speaker .gh-icon-box, .gh-card.on.plug .gh-icon-box { background: #d7aefb; color: #32004b; }

        .gh-real-badge {
          font-size: 10px;
          font-weight: 700;
          background: #0369a1;
          color: #e0f2fe;
          padding: 2px 7px;
          border-radius: 6px;
          margin-left: 6px;
          text-transform: uppercase;
        }

        .gh-toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 28px;
        }

        .gh-toggle input { opacity: 0; width: 0; height: 0; }

        .gh-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255, 255, 255, 0.12);
          transition: .3s cubic-bezier(0.2, 0, 0, 1);
          border-radius: 34px;
        }

        .gh-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: #e2e2e6;
          transition: .3s cubic-bezier(0.2, 0, 0, 1);
          border-radius: 50%;
        }

        input:checked + .gh-slider { background-color: #a8c7fa; }
        .gh-card.on.light input:checked + .gh-slider { background-color: #ffe082; }

        input:checked + .gh-slider:before {
          transform: translateX(20px);
          background-color: #141519;
        }

        .gh-card-body { margin-top: 18px; }

        .gh-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px 0;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
        }

        .gh-card-sub {
          font-size: 13px;
          color: #9aa0a6;
          margin: 0;
        }

        .gh-brightness-bar {
          margin-top: 14px;
          position: relative;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
          cursor: pointer;
        }

        .gh-brightness-fill {
          height: 100%;
          background: #ffe082;
          border-radius: 9999px;
          transition: width 0.15s ease;
        }

        .gh-temp-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
        }

        .gh-temp-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .gh-temp-btn:hover { background: rgba(255, 255, 255, 0.25); }

        .gh-cam-preview {
          width: 100%;
          height: 100px;
          border-radius: 18px;
          background: #14171d;
          margin-top: 14px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gh-cam-tag {
          position: absolute;
          top: 8px;
          left: 10px;
          background: #ea4335;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .gh-routines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 16px;
        }

        .gh-routine-card {
          background: #1f2128;
          border: none;
          border-radius: 24px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
        }

        .gh-routine-card:hover {
          background: #282b35;
          transform: translateY(-2px);
        }

        .gh-routine-icon { font-size: 26px; }

        .gh-empty-state {
          background: #1f2128;
          border-radius: 28px;
          padding: 48px 32px;
          text-align: center;
          margin-bottom: 44px;
        }

        .gh-empty-icon {
          font-size: 44px;
          margin-bottom: 12px;
        }
      `), /* @__PURE__ */ React.createElement("div", { className: "gh-header" }, /* @__PURE__ */ React.createElement("div", { className: "gh-house-selector" }, /* @__PURE__ */ React.createElement("h1", { className: "gh-house-title" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3E1}"), /* @__PURE__ */ React.createElement("span", null, house), isConnected && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "14px", color: "#9aa0a6" } }, "\u25BE"))), /* @__PURE__ */ React.createElement("div", { className: "gh-actions-group" }, isConnected && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "gh-btn-primary",
      onClick: () => setShowAddDeviceModal(true)
    },
    /* @__PURE__ */ React.createElement("span", null, "+ Adicionar Dispositivo Real")
  ), /* @__PURE__ */ React.createElement("div", { className: "gh-oauth-badge" }, /* @__PURE__ */ React.createElement("span", { className: `gh-status-dot ${!isConnected ? "disconnected" : ""}` }), /* @__PURE__ */ React.createElement("span", null, isConnected ? `Google Home \u2022 ${userEmail}` : "Desconectado"), isConnected && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleLogout,
      style: {
        background: "none",
        border: "none",
        color: "#f28b82",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "12px",
        marginLeft: "4px"
      }
    },
    "Sair"
  )))), showAdvancedConfig && /* @__PURE__ */ React.createElement("div", { className: "gh-modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "gh-modal" }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0", color: "white" } }, "Client ID Customizado (Desenvolvedores)"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 20px 0", lineHeight: 1.5 } }, "O MomAI j\xE1 inclui a chave nativa para aplicativo Desktop. Use esta tela apenas se quiser testar seu pr\xF3prio projeto no Google Cloud Console."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveCustomClientId }, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "GOOGLE_CLIENT_ID CUSTOMIZADO"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "gh-input",
      type: "text",
      placeholder: "ex: seu_projeto.apps.googleusercontent.com",
      value: customClientId,
      onChange: (e) => setCustomClientId(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "GOOGLE_CLIENT_SECRET CUSTOMIZADO"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "gh-input",
      type: "password",
      placeholder: "ex: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx",
      value: customClientSecret,
      onChange: (e) => setCustomClientSecret(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "gh-btn-secondary",
      onClick: () => setShowAdvancedConfig(false)
    },
    "Usar Padr\xE3o do App"
  ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "gh-btn-primary" }, "Salvar"))))), showAddDeviceModal && /* @__PURE__ */ React.createElement("div", { className: "gh-modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "gh-modal" }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0", color: "white" } }, "Adicionar Dispositivo Real"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 20px 0" } }, "Conecte l\xE2mpadas, termostatos, c\xE2meras ou inversores via Home Assistant, Tuya ou IP local."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddRealDevice }, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "Nome do Dispositivo"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "gh-input",
      type: "text",
      required: true,
      placeholder: "ex: Luz da Cozinha ou C\xE2mera Garagem",
      value: newDevName,
      onChange: (e) => setNewDevName(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "Tipo de Dispositivo"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "gh-input",
      value: newDevType,
      onChange: (e) => setNewDevType(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "light" }, "\u{1F4A1} Ilumina\xE7\xE3o"),
    /* @__PURE__ */ React.createElement("option", { value: "thermostat" }, "\u2744\uFE0F Termostato"),
    /* @__PURE__ */ React.createElement("option", { value: "camera" }, "\u{1F4F9} C\xE2mera"),
    /* @__PURE__ */ React.createElement("option", { value: "lock" }, "\u{1F512} Fechadura"),
    /* @__PURE__ */ React.createElement("option", { value: "tv" }, "\u{1F4FA} TV & M\xEDdia"),
    /* @__PURE__ */ React.createElement("option", { value: "plug" }, "\u{1F50C} Tomada Inteligente")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "C\xF4modo"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "gh-input",
      value: newDevRoom,
      onChange: (e) => setNewDevRoom(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "Sala de Estar" }, "Sala de Estar"),
    /* @__PURE__ */ React.createElement("option", { value: "Quarto Principal" }, "Quarto Principal"),
    /* @__PURE__ */ React.createElement("option", { value: "Cozinha" }, "Cozinha"),
    /* @__PURE__ */ React.createElement("option", { value: "Entrada" }, "Entrada & Jardim"),
    /* @__PURE__ */ React.createElement("option", { value: "Escrit\xF3rio" }, "Escrit\xF3rio")
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "Ecossistema / Provedor"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "gh-input",
      value: newDevProvider,
      onChange: (e) => setNewDevProvider(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "Google Nest Graph" }, "Google Nest Graph"),
    /* @__PURE__ */ React.createElement("option", { value: "Home Assistant" }, "Home Assistant"),
    /* @__PURE__ */ React.createElement("option", { value: "Tuya / Smart Life" }, "Tuya / Smart Life"),
    /* @__PURE__ */ React.createElement("option", { value: "Matter / Wi-Fi IP" }, "Matter / IP Local"),
    /* @__PURE__ */ React.createElement("option", { value: "Shelly / Tasmota" }, "Shelly / Tasmota")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "gh-label" }, "IP ou Host Endpoint (Opcional)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "gh-input",
      type: "text",
      placeholder: "192.168.1.150",
      value: newDevIp,
      onChange: (e) => setNewDevIp(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "gh-btn-secondary",
      onClick: () => setShowAddDeviceModal(false)
    },
    "Cancelar"
  ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "gh-btn-primary" }, "Cadastrar Dispositivo"))))), !isConnected ? (
    /* STATE 1: DISCONNECTED LANDING CARD & OAUTH WINDOW LAUNCHER */
    /* @__PURE__ */ React.createElement("div", { className: "gh-auth-container" }, /* @__PURE__ */ React.createElement("div", { className: "gh-auth-card" }, /* @__PURE__ */ React.createElement("div", { className: "gh-auth-icon" }, /* @__PURE__ */ React.createElement("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" }), /* @__PURE__ */ React.createElement("path", { d: "M6.5 12a7.8 7.8 0 0 1 11 0" }), /* @__PURE__ */ React.createElement("path", { d: "M9 15a3.6 3.6 0 0 1 6 0" }), /* @__PURE__ */ React.createElement("path", { d: "M12 18h.01" }))), /* @__PURE__ */ React.createElement("h2", { className: "gh-auth-title" }, "Conectar ao Google Home"), /* @__PURE__ */ React.createElement("p", { className: "gh-auth-sub" }, isLoggingIn ? "Conectando \xE0 sua conta do Google... A janela de login do Electron foi aberta." : "Sincronize suas l\xE2mpadas, termostatos, fechaduras e c\xE2meras inteligentes reais com o MomAI."), /* @__PURE__ */ React.createElement("div", { className: "gh-auth-features" }, /* @__PURE__ */ React.createElement("div", { className: "gh-auth-feat-item" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4A1}"), /* @__PURE__ */ React.createElement("span", null, "Sincroniza\xE7\xE3o de luzes e cores")), /* @__PURE__ */ React.createElement("div", { className: "gh-auth-feat-item" }, /* @__PURE__ */ React.createElement("span", null, "\u2744\uFE0F"), /* @__PURE__ */ React.createElement("span", null, "Climatiza\xE7\xE3o e Nest Thermostat")), /* @__PURE__ */ React.createElement("div", { className: "gh-auth-feat-item" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F512}"), /* @__PURE__ */ React.createElement("span", null, "Fechaduras e c\xE2meras ao vivo"))), authError && /* @__PURE__ */ React.createElement("p", { style: { color: "#f28b82", fontSize: "13px", marginBottom: "16px" } }, authError), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "gh-google-btn",
        onClick: handleStartGoogleOAuthWindow
      },
      /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), /* @__PURE__ */ React.createElement("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), /* @__PURE__ */ React.createElement("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" }), /* @__PURE__ */ React.createElement("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })),
      /* @__PURE__ */ React.createElement("span", null, isLoggingIn ? "Reabrir Janela do Google" : "Conectar com o Google")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        style: {
          background: "none",
          border: "none",
          color: "#9aa0a6",
          fontSize: "12px",
          cursor: "pointer",
          marginTop: "8px"
        },
        onClick: () => setShowAdvancedConfig(true)
      },
      "Op\xE7\xF5es Avan\xE7adas (Client ID de Desenvolvedor)"
    ))))
  ) : (
    /* STATE 2: CONNECTED REAL DASHBOARD */
    /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "gh-chips-bar" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `gh-chip ${activeCategoryFilter === "light" ? "active" : ""}`,
        onClick: () => setActiveCategoryFilter(activeCategoryFilter === "light" ? null : "light")
      },
      /* @__PURE__ */ React.createElement("svg", { className: "gh-chip-icon", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" })),
      /* @__PURE__ */ React.createElement("span", null, "Ilumina\xE7\xE3o (", activeLightsCount, "/", totalLightsCount, " acesas)")
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `gh-chip ${activeCategoryFilter === "thermostat" ? "active" : ""}`,
        onClick: () => setActiveCategoryFilter(activeCategoryFilter === "thermostat" ? null : "thermostat")
      },
      /* @__PURE__ */ React.createElement("svg", { className: "gh-chip-icon", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" })),
      /* @__PURE__ */ React.createElement("span", null, "Climatiza\xE7\xE3o (", currentTemp, "\xB0C)")
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `gh-chip ${activeCategoryFilter === "camera" ? "active" : ""}`,
        onClick: () => setActiveCategoryFilter(activeCategoryFilter === "camera" ? null : "camera")
      },
      /* @__PURE__ */ React.createElement("svg", { className: "gh-chip-icon", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" })),
      /* @__PURE__ */ React.createElement("span", null, "C\xE2meras (1 Ao Vivo)")
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `gh-chip ${activeCategoryFilter === "lock" ? "active" : ""}`,
        onClick: () => setActiveCategoryFilter(activeCategoryFilter === "lock" ? null : "lock")
      },
      /* @__PURE__ */ React.createElement("svg", { className: "gh-chip-icon", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" })),
      /* @__PURE__ */ React.createElement("span", null, "Seguran\xE7a (Trancado)")
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `gh-chip ${activeCategoryFilter === "tv" ? "active" : ""}`,
        onClick: () => setActiveCategoryFilter(activeCategoryFilter === "tv" ? null : "tv")
      },
      /* @__PURE__ */ React.createElement("svg", { className: "gh-chip-icon", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })),
      /* @__PURE__ */ React.createElement("span", null, "M\xEDdia & TV")
    )), /* @__PURE__ */ React.createElement("div", { className: "gh-tabs" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `gh-tab ${activeTab === "todos" && !activeCategoryFilter ? "active" : ""}`,
        onClick: () => {
          setActiveTab("todos");
          setActiveCategoryFilter(null);
        }
      },
      "Todos os Dispositivos Sincronizados"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `gh-tab ${activeTab === "sala" ? "active" : ""}`,
        onClick: () => {
          setActiveTab("sala");
          setActiveCategoryFilter(null);
        }
      },
      "Sala de Estar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `gh-tab ${activeTab === "quarto" ? "active" : ""}`,
        onClick: () => {
          setActiveTab("quarto");
          setActiveCategoryFilter(null);
        }
      },
      "Quarto Principal"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `gh-tab ${activeTab === "entrada" ? "active" : ""}`,
        onClick: () => {
          setActiveTab("entrada");
          setActiveCategoryFilter(null);
        }
      },
      "Entrada & Jardim"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `gh-tab ${activeTab === "cozinha" ? "active" : ""}`,
        onClick: () => {
          setActiveTab("cozinha");
          setActiveCategoryFilter(null);
        }
      },
      "Cozinha"
    )), /* @__PURE__ */ React.createElement("div", { className: "gh-section-title" }, /* @__PURE__ */ React.createElement("span", null, activeCategoryFilter ? `Filtro: ${activeCategoryFilter.toUpperCase()}` : "Dispositivos Sincronizados")), filteredDevices.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "gh-empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "gh-empty-icon" }, "\u{1F3E0}"), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: 600, color: "#f1f0f4", margin: "0 0 8px 0" } }, "Nenhum dispositivo encontrado na sua conta Google Home"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "14px", color: "#9aa0a6", maxWidth: "460px", margin: "0 auto 20px auto", lineHeight: 1.5 } }, 'Vincule suas l\xE2mpadas, termostatos e eletr\xF4nicos no aplicativo oficial do Google Home ou clique em "+ Adicionar Dispositivo Real" acima para cadastrar um endpoint manual.')) : /* @__PURE__ */ React.createElement("div", { className: "gh-grid" }, filteredDevices.map((device) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: device.id,
        onClick: (e) => toggleDevice(device.id, e),
        className: `gh-card ${device.state ? "on" : ""} ${device.type}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "gh-card-header" }, /* @__PURE__ */ React.createElement("div", { className: "gh-icon-box" }, device.type === "light" && /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" })), device.type === "thermostat" && /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" })), device.type === "lock" && /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" })), device.type === "camera" && /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" })), (device.type === "tv" || device.type === "speaker" || device.type === "plug") && /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }))), /* @__PURE__ */ React.createElement("label", { className: "gh-toggle", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: device.state,
          onChange: () => toggleDevice(device.id)
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "gh-slider" }))),
      /* @__PURE__ */ React.createElement("div", { className: "gh-card-body" }, /* @__PURE__ */ React.createElement("h3", { className: "gh-card-title" }, /* @__PURE__ */ React.createElement("span", null, device.name), /* @__PURE__ */ React.createElement("span", { className: "gh-real-badge" }, "REAL")), /* @__PURE__ */ React.createElement("p", { className: "gh-card-sub" }, device.room, " ", device.provider ? `\u2022 ${device.provider}` : ""), device.type === "light" && device.state && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#ffe082", fontWeight: 600, marginBottom: "6px" } }, /* @__PURE__ */ React.createElement("span", null, "Brilho"), /* @__PURE__ */ React.createElement("span", null, device.brightness || 80, "%")), /* @__PURE__ */ React.createElement("div", { className: "gh-brightness-bar", onClick: (e) => setBrightness(device.id, 50, e) }, /* @__PURE__ */ React.createElement("div", { className: "gh-brightness-fill", style: { width: `${device.brightness || 80}%` } }))), device.type === "thermostat" && device.state && /* @__PURE__ */ React.createElement("div", { className: "gh-temp-controls" }, /* @__PURE__ */ React.createElement("button", { className: "gh-temp-btn", onClick: (e) => adjustTemp(device.id, -1, e) }, "-"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "19px", fontWeight: 700, color: "#a8c7fa" } }, device.temperature, "\xB0C"), /* @__PURE__ */ React.createElement("button", { className: "gh-temp-btn", onClick: (e) => adjustTemp(device.id, 1, e) }, "+")), device.type === "camera" && /* @__PURE__ */ React.createElement("div", { className: "gh-cam-preview" }, /* @__PURE__ */ React.createElement("div", { className: "gh-cam-tag" }, "REC AO VIVO"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#9aa0a6" } }, "\u{1F3A5} Vis\xE3o em Tempo Real")), device.value && device.type !== "camera" && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#a8c7fa", marginTop: "10px", fontWeight: 500 } }, device.value), device.mediaApp && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#d7aefb", marginTop: "10px", fontWeight: 500 } }, "\u25B6 ", device.mediaApp))
    ))), routines.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "gh-section-title" }, "Rotinas e Automa\xE7\xF5es Sincronizadas"), /* @__PURE__ */ React.createElement("div", { className: "gh-routines-grid" }, routines.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.id, className: "gh-routine-card" }, /* @__PURE__ */ React.createElement("span", { className: "gh-routine-icon" }, r.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: "15px", color: "#f1f0f4" } }, r.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "#9aa0a6", marginTop: "2px" } }, r.time)))))))
  ));
}
export {
  SmartHomePage as default
};
