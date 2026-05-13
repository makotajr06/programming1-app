import { useState, useEffect } from "react";

const COLORS = {
  bgBase: "#0D0F0F",
  bgSurface: "#161A1A",
  bgElevated: "#1E2424",
  amber: "#F5A623",
  amberDim: "rgba(245,166,35,0.12)",
  amberHover: "#FFB94A",
  critical: "#E53935",
  safe: "#43A047",
  textPrimary: "#F0EDE8",
  textSecondary: "#9EA8A8",
  textDisabled: "#4A5252",
  borderSubtle: "#272D2D",
  borderDefault: "#374040",
};

const roles = [
  "Mine Worker / Contractor",
  "Shift Leader",
  "Site Supervisor",
  "Fleet Manager",
  "Compliance Officer",
  "Firebase Lead",
];

const sites = [
  "Skorpion Mine — Site A",
  "Skorpion Mine — Site B",
  "Rosh Pinah — Zone 1",
  "Rosh Pinah — Zone 2",
  "Navachab Gold Mine",
];

function GrainOverlay() {
  return (
    <svg
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", opacity: 0.045, zIndex: 1,
      }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

function DiagonalGrid() {
  return (
    <svg
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", opacity: 0.06,
      }}
    >
      <defs>
        <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="#F5A623" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diag)" />
    </svg>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, rightElement, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Barlow', sans-serif", fontWeight: 600,
        fontSize: 10, letterSpacing: "0.8px", color: focused ? COLORS.amber : COLORS.textSecondary,
        textTransform: "uppercase", transition: "color 0.2s",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", height: 52, background: COLORS.bgElevated,
            border: `1.5px solid ${error ? COLORS.critical : focused ? COLORS.amber : COLORS.borderDefault}`,
            borderRadius: 8, padding: "0 16px",
            paddingRight: rightElement ? 48 : 16,
            fontFamily: "'DM Mono', monospace", fontSize: 14, color: COLORS.textPrimary,
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? `0 0 0 3px ${COLORS.amberDim}` : error ? `0 0 0 3px rgba(229,57,53,0.12)` : "none",
          }}
        />
        {rightElement && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            cursor: "pointer", color: COLORS.textSecondary,
          }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: COLORS.critical, letterSpacing: "0.2px",
        }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Barlow', sans-serif", fontWeight: 600,
        fontSize: 10, letterSpacing: "0.8px", color: focused ? COLORS.amber : COLORS.textSecondary,
        textTransform: "uppercase", transition: "color 0.2s",
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 52, background: COLORS.bgElevated,
          border: `1.5px solid ${focused ? COLORS.amber : COLORS.borderDefault}`,
          borderRadius: 8, padding: "0 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 13, color: value ? COLORS.textPrimary : COLORS.textSecondary,
          outline: "none", boxSizing: "border-box", width: "100%",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? `0 0 0 3px ${COLORS.amberDim}` : "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239EA8A8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 16px center",
        }}
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: `2px solid rgba(13,15,15,0.3)`,
      borderTop: `2px solid #0D0F0F`, borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

export default function MineOpsAuth() {
  const [screen, setScreen] = useState("login"); // login | register | success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  const [regForm, setRegForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "", site: ""
  });
  const [regErrors, setRegErrors] = useState({});

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [screen]);

  const validateLogin = () => {
    const errs = {};
    if (!loginForm.email) errs.email = "Work email is required";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = "Enter a valid email address";
    if (!loginForm.password) errs.password = "Password is required";
    return errs;
  };

  const validateReg = () => {
    const errs = {};
    if (!regForm.name) errs.name = "Full name is required";
    if (!regForm.email) errs.email = "Work email is required";
    if (!regForm.password) errs.password = "Password is required";
    else if (regForm.password.length < 8) errs.password = "Minimum 8 characters";
    if (regForm.confirm !== regForm.password) errs.confirm = "Passwords do not match";
    if (!regForm.role) errs.role = "Select your role";
    if (!regForm.site) errs.site = "Select your site";
    return errs;
  };

  const handleLogin = () => {
    const errs = validateLogin();
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setScreen("success"); }, 1800);
  };

  const handleRegister = () => {
    const errs = validateReg();
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setScreen("success"); }, 1800);
  };

  const fadeIn = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: "opacity 0.45s ease, transform 0.45s ease",
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bgBase,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono', monospace", padding: "24px 0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, select option[disabled] { color: #4A5252; }
        select option { background: #1E2424; color: #F0EDE8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes checkPop { 0% { transform: scale(0) rotate(-10deg); opacity:0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity:1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374040; border-radius: 2px; }
      `}</style>

      <GrainOverlay />

      {/* Phone frame */}
      <div style={{
        width: 390, minHeight: 844, background: COLORS.bgBase,
        borderRadius: 44, border: `2px solid ${COLORS.borderSubtle}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #272D2D",
        position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        {/* Status bar */}
        <div style={{
          height: 44, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 28px",
          background: COLORS.bgBase, flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.textPrimary }}>
            9:41
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* Signal bars */}
            {[3,5,7,9].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, background: COLORS.textPrimary, borderRadius: 1 }} />
            ))}
            <div style={{ width: 18, height: 10, border: `1.5px solid ${COLORS.textPrimary}`, borderRadius: 3, marginLeft: 4, position: "relative" }}>
              <div style={{ position: "absolute", left: 2, top: 1.5, width: 11, height: 5, background: COLORS.textPrimary, borderRadius: 1 }} />
              <div style={{ position: "absolute", right: -4, top: 2.5, width: 2.5, height: 3, background: COLORS.textPrimary, borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* ── SCREENS ── */}

        {screen === "login" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Hero zone */}
            <div style={{
              position: "relative", padding: "40px 32px 36px",
              borderBottom: `1px solid ${COLORS.borderSubtle}`,
              overflow: "hidden",
            }}>
              <DiagonalGrid />
              <div style={{ ...fadeIn, position: "relative", zIndex: 2, textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 52, letterSpacing: "-1px", color: COLORS.amber,
                  lineHeight: 1, marginBottom: 8,
                  textShadow: `0 0 40px rgba(245,166,35,0.35)`,
                }}>
                  MINEOPS
                </div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600,
                  fontSize: 10, letterSpacing: "2px", color: COLORS.textSecondary,
                  textTransform: "uppercase",
                }}>
                  PRECISION IN THE PIT · SAFETY IN THE CLOUD
                </div>
                {/* Amber line separator */}
                <div style={{
                  width: 48, height: 2, background: COLORS.amber,
                  margin: "20px auto 0", borderRadius: 1,
                  boxShadow: `0 0 8px ${COLORS.amber}`,
                }} />
              </div>
            </div>

            {/* Form */}
            <div style={{ ...fadeIn, padding: "28px 24px 24px", display: "flex", flexDirection: "column", gap: 16, transitionDelay: "0.1s" }}>
              <InputField
                label="Work Email"
                type="email"
                value={loginForm.email}
                onChange={e => { setLoginForm(f => ({...f, email: e.target.value})); setLoginErrors(e => ({...e, email: ""})); }}
                placeholder="you@miningco.com"
                error={loginErrors.email}
              />
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={loginForm.password}
                onChange={e => { setLoginForm(f => ({...f, password: e.target.value})); setLoginErrors(e => ({...e, password: ""})); }}
                placeholder="••••••••"
                error={loginErrors.password}
                rightElement={
                  <span onClick={() => setShowPassword(s => !s)} style={{ color: COLORS.textSecondary }}>
                    <EyeIcon open={showPassword} />
                  </span>
                }
              />

              <div style={{ textAlign: "right", marginTop: -8 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  color: COLORS.amber, cursor: "pointer",
                }}>
                  Forgot password?
                </span>
              </div>
            </div>

            <div style={{ ...fadeIn, padding: "0 24px 16px", transitionDelay: "0.18s" }}>
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: "100%", height: 56, background: loading ? COLORS.amberDim : COLORS.amber,
                  border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer",
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 14,
                  letterSpacing: "1.2px", color: "#0D0F0F", textTransform: "uppercase",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "background 0.2s, box-shadow 0.2s",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(245,166,35,0.3)",
                }}
              >
                {loading ? <Spinner /> : "SIGN IN"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ ...fadeIn, padding: "0 24px", display: "flex", alignItems: "center", gap: 12, transitionDelay: "0.22s" }}>
              <div style={{ flex: 1, height: 1, background: COLORS.borderSubtle }} />
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: COLORS.textDisabled, letterSpacing: "0.4px" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: COLORS.borderSubtle }} />
            </div>

            <div style={{ ...fadeIn, padding: "16px 24px 0", transitionDelay: "0.26s" }}>
              <button
                onClick={() => setScreen("register")}
                style={{
                  width: "100%", height: 52, background: "transparent",
                  border: `1.5px solid ${COLORS.borderDefault}`, borderRadius: 8,
                  cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600, fontSize: 14, letterSpacing: "1.2px",
                  color: COLORS.textPrimary, textTransform: "uppercase",
                  transition: "border-color 0.2s",
                }}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Footer */}
            <div style={{ padding: "24px 24px 34px", textAlign: "center" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: COLORS.textDisabled, letterSpacing: "0.4px" }}>
                MineOps v1.0.0 · Jose Eduardo dos Santos Campus
              </span>
            </div>
          </div>
        )}

        {screen === "register" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Header */}
            <div style={{
              padding: "16px 24px 16px",
              borderBottom: `1px solid ${COLORS.borderSubtle}`,
              display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
            }}>
              <button
                onClick={() => setScreen("login")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: COLORS.textSecondary, padding: 4, display: "flex",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.textPrimary }}>
                  CREATE ACCOUNT
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.textSecondary }}>
                  Register for MineOps access
                </div>
              </div>
            </div>

            <div style={{ ...fadeIn, padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: 14 }}>
              <InputField
                label="Full Name"
                value={regForm.name}
                onChange={e => { setRegForm(f => ({...f, name: e.target.value})); setRegErrors(e => ({...e, name: ""})); }}
                placeholder="Your full name"
                error={regErrors.name}
              />
              <InputField
                label="Work Email"
                type="email"
                value={regForm.email}
                onChange={e => { setRegForm(f => ({...f, email: e.target.value})); setRegErrors(e => ({...e, email: ""})); }}
                placeholder="you@miningco.com"
                error={regErrors.email}
              />
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={regForm.password}
                onChange={e => { setRegForm(f => ({...f, password: e.target.value})); setRegErrors(e => ({...e, password: ""})); }}
                placeholder="Min. 8 characters"
                error={regErrors.password}
                rightElement={
                  <span onClick={() => setShowPassword(s => !s)}>
                    <EyeIcon open={showPassword} />
                  </span>
                }
              />
              <InputField
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={regForm.confirm}
                onChange={e => { setRegForm(f => ({...f, confirm: e.target.value})); setRegErrors(e => ({...e, confirm: ""})); }}
                placeholder="Re-enter password"
                error={regErrors.confirm}
                rightElement={
                  <span onClick={() => setShowConfirm(s => !s)}>
                    <EyeIcon open={showConfirm} />
                  </span>
                }
              />
              <SelectField
                label="Your Role"
                value={regForm.role}
                onChange={e => { setRegForm(f => ({...f, role: e.target.value})); setRegErrors(e => ({...e, role: ""})); }}
                options={roles}
              />
              {regErrors.role && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.critical }}>⚠ {regErrors.role}</span>}
              <SelectField
                label="Site Assignment"
                value={regForm.site}
                onChange={e => { setRegForm(f => ({...f, site: e.target.value})); setRegErrors(e => ({...e, site: ""})); }}
                options={sites}
              />
              {regErrors.site && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.critical }}>⚠ {regErrors.site}</span>}
            </div>

            <div style={{ ...fadeIn, padding: "20px 24px", transitionDelay: "0.1s" }}>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  width: "100%", height: 56, background: loading ? COLORS.amberDim : COLORS.amber,
                  border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer",
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 14,
                  letterSpacing: "1.2px", color: "#0D0F0F", textTransform: "uppercase",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(245,166,35,0.3)",
                }}
              >
                {loading ? <Spinner /> : "CREATE ACCOUNT"}
              </button>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: COLORS.textSecondary }}>
                  Already have an account?{" "}
                  <span
                    onClick={() => setScreen("login")}
                    style={{ color: COLORS.amber, cursor: "pointer" }}
                  >
                    Sign In
                  </span>
                </span>
              </div>
            </div>

            <div style={{ height: 34 }} />
          </div>
        )}

        {screen === "success" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 32, gap: 20,
          }}>
            <div style={{ animation: "checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>
              <div style={{
                width: 96, height: 96, borderRadius: "50%",
                background: "rgba(67,160,71,0.15)", border: `2px solid ${COLORS.safe}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 32px rgba(67,160,71,0.25)",
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={COLORS.safe} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 28, color: COLORS.textPrimary, letterSpacing: "-0.3px" }}>
                ACCESS GRANTED
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.textSecondary, marginTop: 8 }}>
                Welcome to MineOps
              </div>
            </div>
            <div style={{
              background: COLORS.bgSurface, border: `1px solid ${COLORS.borderSubtle}`,
              borderRadius: 10, padding: "14px 20px", width: "100%",
            }}>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 11, color: COLORS.textSecondary, letterSpacing: "0.6px", marginBottom: 6 }}>
                AUTHENTICATED AS
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.textPrimary }}>
                {regForm.name || "operator@miningco.com"}
              </div>
              {regForm.role && (
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: COLORS.amber, marginTop: 4 }}>
                  {regForm.role}
                </div>
              )}
            </div>
            <button
              onClick={() => { setScreen("login"); setRegForm({ name:"",email:"",password:"",confirm:"",role:"",site:"" }); setLoginForm({email:"",password:""}); }}
              style={{
                width: "100%", height: 52, background: COLORS.amber,
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif", fontWeight: 600,
                fontSize: 14, letterSpacing: "1.2px", color: "#0D0F0F",
                textTransform: "uppercase",
              }}
            >
              GO TO DASHBOARD →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
