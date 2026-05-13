import { useState, useEffect, useRef } from "react";

const C = {
  bgBase: "#0D0F0F",
  bgSurface: "#161A1A",
  bgElevated: "#1E2424",
  amber: "#F5A623",
  amberDim: "rgba(245,166,35,0.12)",
  critical: "#E53935",
  criticalDim: "rgba(229,57,53,0.12)",
  warning: "#FB8C00",
  warningDim: "rgba(251,140,0,0.12)",
  safe: "#43A047",
  safeDim: "rgba(67,160,71,0.12)",
  info: "#1E88E5",
  offline: "#607D8B",
  textPrimary: "#F0EDE8",
  textSecondary: "#9EA8A8",
  textDisabled: "#4A5252",
  borderSubtle: "#272D2D",
  borderDefault: "#374040",
};

const HAZARDS = [
  { id: 1, severity: "critical", type: "BLAST RISK", zone: "Zone 4B", time: "08:14", reporter: "K. Nderura", ack: 11, total: 14, desc: "Unexploded charge detected near drill site" },
  { id: 2, severity: "high", type: "GAS LEAK", zone: "Zone 2A", time: "09:32", reporter: "S. Sheefeni", ack: 8, total: 14, desc: "Methane levels elevated in tunnel section C" },
  { id: 3, severity: "medium", type: "EQUIPMENT", zone: "Zone 1C", time: "10:05", reporter: "J. Kambonde", ack: 14, total: 14, desc: "Conveyor belt misalignment — ops paused" },
];

const CREW = [
  { initials: "KN", name: "K. Nderura", status: "active" },
  { initials: "AE", name: "A. Ebba", status: "active" },
  { initials: "SS", name: "S. Sheefeni", status: "alert" },
  { initials: "JK", name: "J. Kambonde", status: "active" },
  { initials: "LH", name: "L. Shimutwikeni", status: "break" },
  { initials: "GG", name: "G. Gerson", status: "active" },
  { initials: "SN", name: "S. Ndiweda", status: "offline" },
];

const NAV = [
  { id: "dashboard", label: "DASH", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "shifts", label: "SHIFTS", icon: "M12 2a10 10 0 110 20A10 10 0 0112 2zm0 5v5l3 3" },
  { id: "hazards", label: "HAZARDS", icon: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" },
  { id: "reports", label: "REPORTS", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
  { id: "profile", label: "PROFILE", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
];

const SEVERITY_CONFIG = {
  critical: { bg: C.criticalDim, color: C.critical, label: "CRITICAL", border: C.critical },
  high:     { bg: C.warningDim,  color: C.warning,  label: "HIGH",     border: C.warning },
  medium:   { bg: C.amberDim,    color: C.amber,    label: "MEDIUM",   border: C.amber },
  low:      { bg: C.safeDim,     color: C.safe,     label: "LOW",      border: C.safe },
};

const STATUS_CONFIG = {
  active:  { bg: C.safeDim,     color: C.safe,    label: "ACTIVE" },
  alert:   { bg: C.criticalDim, color: C.critical, label: "ALERT" },
  break:   { bg: C.warningDim,  color: C.warning,  label: "BREAK" },
  offline: { bg: "rgba(96,125,139,0.12)", color: C.offline, label: "OFFLINE" },
};

function GrainOverlay() {
  return (
    <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.04,zIndex:1 }}>
      <filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#g2)"/>
    </svg>
  );
}

function Icon({ path, size = 20, color = C.textSecondary, fill = "none", strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background: cfg.bg, border:`1px solid ${cfg.color}22`,
      borderRadius:4, padding:"3px 8px",
    }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background: cfg.color, flexShrink:0 }} />
      <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.7px", color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

function HazardCard({ hazard, onClick, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100 + index * 80); return () => clearTimeout(t); }, []);
  const pct = Math.round((hazard.ack / hazard.total) * 100);
  const ackColor = pct === 100 ? C.safe : pct >= 50 ? C.warning : C.critical;

  return (
    <div
      onClick={() => onClick(hazard)}
      style={{
        background: C.bgSurface, border:`1px solid ${C.borderSubtle}`,
        borderLeft:`3px solid ${SEVERITY_CONFIG[hazard.severity].color}`,
        borderRadius:12, padding:"14px 14px", cursor:"pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition:"opacity 0.35s ease, transform 0.35s ease, box-shadow 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.35)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <SeverityBadge severity={hazard.severity} />
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textDisabled }}>{hazard.time}</span>
      </div>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:600, fontSize:18, color: C.textPrimary, marginBottom:4 }}>
        {hazard.type}
      </div>
      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textSecondary, marginBottom:10 }}>
        {hazard.zone} · {hazard.reporter}
      </div>
      {/* Ack bar */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:3, background: C.bgElevated, borderRadius:2 }}>
          <div style={{ width:`${pct}%`, height:"100%", background: ackColor, borderRadius:2, transition:"width 1s ease" }} />
        </div>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: ackColor, flexShrink:0 }}>
          {hazard.ack}/{hazard.total} ACK
        </span>
      </div>
    </div>
  );
}

function HazardModal({ hazard, onClose }) {
  const cfg = SEVERITY_CONFIG[hazard.severity];
  return (
    <div style={{
      position:"absolute", inset:0, background:"rgba(13,15,15,0.85)",
      zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bgSurface, borderRadius:"16px 16px 0 0",
          border:`1px solid ${C.borderSubtle}`, padding:"20px 20px 34px",
          animation:"slideUp 0.3s cubic-bezier(0.33,1,0.68,1)",
        }}
      >
        <div style={{ width:40, height:4, background: C.borderDefault, borderRadius:2, margin:"0 auto 20px" }} />
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
          <SeverityBadge severity={hazard.severity} />
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color: C.textSecondary, padding:4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:24, color: C.textPrimary, marginBottom:6 }}>
          {hazard.type}
        </div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textSecondary, marginBottom:12 }}>
          {hazard.zone} · Reported {hazard.time} by {hazard.reporter}
        </div>
        <div style={{ background: C.bgElevated, borderRadius:8, padding:"12px 14px", marginBottom:16, borderLeft:`3px solid ${cfg.color}` }}>
          <p style={{ fontFamily:"'DM Mono', monospace", fontSize:13, color: C.textPrimary, lineHeight:1.6 }}>
            {hazard.desc}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{
            flex:1, height:48, background: C.amberDim, border:`1.5px solid ${C.amber}`,
            borderRadius:8, cursor:"pointer", fontFamily:"'Barlow', sans-serif",
            fontWeight:600, fontSize:12, letterSpacing:"0.8px", color: C.amber,
          }}>ACKNOWLEDGE</button>
          <button style={{
            flex:1, height:48, background: C.amber, border:"none",
            borderRadius:8, cursor:"pointer", fontFamily:"'Barlow', sans-serif",
            fontWeight:600, fontSize:12, letterSpacing:"0.8px", color:"#0D0F0F",
          }}>VIEW FULL REPORT</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [offline, setOffline] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [fabPressed, setFabPressed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  // Shift time simulation
  const shiftStart = 7 * 60, shiftEnd = 19 * 60;
  const currentMins = 9 * 60 + 41; // 09:41
  const shiftPct = Math.round(((currentMins - shiftStart) / (shiftEnd - shiftStart)) * 100);
  const elapsed = `${Math.floor((currentMins - shiftStart) / 60)}h ${(currentMins - shiftStart) % 60}m elapsed`;

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  });

  return (
    <div style={{ minHeight:"100vh", background: C.bgBase, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes slideUp { from{transform:translateY(100%);} to{transform:translateY(0);} }
        @keyframes fabPop { 0%{transform:scale(1);} 40%{transform:scale(0.88);} 100%{transform:scale(1);} }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(245,166,35,0.4);} 50%{box-shadow:0 0 24px rgba(245,166,35,0.7);} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#374040;border-radius:2px;}
      `}</style>

      <GrainOverlay />

      {/* Phone */}
      <div style={{
        width:390, height:844, background: C.bgBase,
        borderRadius:44, border:`2px solid ${C.borderSubtle}`,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #272D2D",
        position:"relative", overflow:"hidden", display:"flex", flexDirection:"column",
      }}>

        {/* Status bar */}
        <div style={{ height:44, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background: C.bgBase, flexShrink:0, zIndex:10 }}>
          <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:13, color: C.textPrimary }}>9:41</span>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {offline
              ? <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.offline }}>NO SIGNAL</span>
              : [3,5,7,9].map((h,i) => <div key={i} style={{ width:3, height:h, background: C.textPrimary, borderRadius:1 }}/>)
            }
            <div style={{ width:18, height:10, border:`1.5px solid ${C.textPrimary}`, borderRadius:3, marginLeft:4, position:"relative" }}>
              <div style={{ position:"absolute", left:2, top:1.5, width:11, height:5, background: C.textPrimary, borderRadius:1 }}/>
              <div style={{ position:"absolute", right:-4, top:2.5, width:2.5, height:3, background: C.textPrimary, borderRadius:1 }}/>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div style={{
          ...fadeIn(0), height:56, display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 20px",
          background: C.bgBase, borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0, zIndex:10,
        }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: C.amber, letterSpacing:"-0.5px" }}>
            MINEOPS
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div
              onClick={() => setOffline(o => !o)}
              style={{ cursor:"pointer", position:"relative" }}
              title="Toggle offline mode"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={offline ? C.offline : C.textSecondary} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
              </svg>
              {!offline && <div style={{ position:"absolute", top:-1, right:-1, width:7, height:7, background: C.critical, borderRadius:"50%", border:`1.5px solid ${C.bgBase}` }}/>}
            </div>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background: C.amber, display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12, color:"#0D0F0F" }}>KN</span>
            </div>
          </div>
        </div>

        {/* Offline banner */}
        {offline && (
          <div style={{
            background:"rgba(96,125,139,0.1)", borderBottom:`1px solid rgba(96,125,139,0.3)`,
            padding:"7px 20px", display:"flex", alignItems:"center", gap:8, flexShrink:0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.offline} strokeWidth="2"><path d="M8.56 2.9A7 7 0 0118.54 13M10.59 10.59L3 3m7 10.5A3.5 3.5 0 0117 17M6.35 6.35A7 7 0 003.06 14M1 1l22 22"/></svg>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.offline, letterSpacing:"0.4px" }}>
              OFFLINE — DATA CACHED LOCALLY
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:"auto", paddingBottom:98 }}>

          {/* Site label */}
          <div style={{ ...fadeIn(0.05), padding:"14px 20px 0" }}>
            <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"1.4px", color: C.textDisabled, textTransform:"uppercase" }}>
              ACTIVE SITE
            </div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:20, color: C.textPrimary, marginTop:2 }}>
              SKORPION MINE — SITE A
            </div>
          </div>

          {/* Active shift card */}
          <div style={{ ...fadeIn(0.1), padding:"12px 20px 0" }}>
            <div style={{
              background: C.bgSurface, border:`1px solid ${C.borderSubtle}`,
              borderLeft:`4px solid ${C.safe}`, borderRadius:12, padding:16,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.safe }}>
                  ACTIVE SHIFT
                </span>
                <div style={{ display:"flex", alignItems:"center", gap:5, background: C.safeDim, borderRadius:9999, padding:"3px 8px" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background: C.safe, animation:"pulse 1.8s ease-in-out infinite" }}/>
                  <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, color: C.safe }}>LIVE</span>
                </div>
              </div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: C.textPrimary, marginBottom:4 }}>
                DAY SHIFT — ZONE 4B
              </div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textSecondary, marginBottom:12 }}>
                07:00 — 19:00 · {elapsed} · 14 crew
              </div>
              {/* Progress bar */}
              <div style={{ height:5, background: C.bgElevated, borderRadius:3, overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${shiftPct}%`, borderRadius:3,
                  background:`linear-gradient(90deg, ${C.safe}, #66BB6A)`,
                  transition:"width 1s ease",
                }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.textDisabled }}>07:00</span>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.safe }}>{shiftPct}% complete</span>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.textDisabled }}>19:00</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ ...fadeIn(0.15), padding:"12px 20px 0", display:"flex", gap:10 }}>
            {[
              { value:"14", label:"ON SITE",  color: C.textPrimary },
              { value:"3",  label:"HAZARDS",  color: C.warning },
              { value:"2",  label:"PENDING",  color: C.amber },
            ].map((s,i) => (
              <div key={i} style={{
                flex:1, background: C.bgSurface, border:`1px solid ${C.borderSubtle}`,
                borderRadius:10, padding:"12px 10px",
              }}>
                <div style={{ fontFamily:"'DM Mono', monospace", fontWeight:500, fontSize:26, color: s.color, letterSpacing:"-0.5px", lineHeight:1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.6px", color: C.textDisabled, marginTop:5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Crew strip */}
          <div style={{ ...fadeIn(0.18), padding:"16px 20px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:600, fontSize:16, color: C.textPrimary }}>CREW ON SHIFT</span>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.amber, cursor:"pointer" }}>VIEW ALL</span>
            </div>
            <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4 }}>
              {CREW.map((c) => {
                const st = STATUS_CONFIG[c.status];
                return (
                  <div key={c.initials} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flexShrink:0, width:48 }}>
                    <div style={{ position:"relative" }}>
                      <div style={{
                        width:40, height:40, borderRadius:"50%",
                        background: C.bgElevated, border:`2px solid ${st.color}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12, color: C.textPrimary }}>{c.initials}</span>
                      </div>
                      <div style={{
                        position:"absolute", bottom:0, right:0,
                        width:10, height:10, borderRadius:"50%",
                        background: st.color, border:`1.5px solid ${C.bgBase}`,
                        animation: c.status === "active" ? "pulse 2s ease-in-out infinite" : "none",
                      }}/>
                    </div>
                    <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9, color: C.textDisabled, textAlign:"center", lineHeight:1.2 }}>
                      {c.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hazards section */}
          <div style={{ padding:"20px 20px 0" }}>
            <div style={{ ...fadeIn(0.2), display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:18, color: C.textPrimary }}>ACTIVE HAZARDS</span>
                <div style={{ background: C.criticalDim, border:`1px solid ${C.critical}33`, borderRadius:9999, padding:"2px 8px" }}>
                  <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:11, color: C.critical }}>{HAZARDS.length}</span>
                </div>
              </div>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.amber, cursor:"pointer" }}>VIEW ALL</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {HAZARDS.map((h, i) => (
                <HazardCard key={h.id} hazard={h} index={i} onClick={setSelectedHazard} />
              ))}
            </div>
          </div>

          {/* Inspection quick link */}
          <div style={{ ...fadeIn(0.28), padding:"16px 20px 0" }}>
            <div style={{
              background: C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:12, padding:"14px 16px",
              display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, background: C.amberDim, border:`1px solid ${C.amber}33`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:13, color: C.textPrimary }}>Daily Inspection Report</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>2 pending · Due 18:00</div>
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textDisabled} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          <div style={{ height:16 }} />
        </div>

        {/* FAB */}
        <div
          onMouseDown={() => setFabPressed(true)}
          onMouseUp={() => setFabPressed(false)}
          onMouseLeave={() => setFabPressed(false)}
          onClick={() => setSelectedHazard({ id:0, severity:"critical", type:"NEW HAZARD", zone:"", time:"", reporter:"", ack:0, total:14, desc:"" })}
          style={{
            position:"absolute", right:20, bottom:112,
            width:56, height:56, borderRadius:"50%",
            background: C.amber, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transform: fabPressed ? "scale(0.9)" : "scale(1)",
            transition:"transform 0.15s",
            animation: "glow 2.5s ease-in-out infinite",
            zIndex:20,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D0F0F" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Bottom nav */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          height:98, background: C.bgSurface,
          borderTop:`1px solid ${C.borderSubtle}`,
          display:"flex", alignItems:"flex-start", paddingTop:8, paddingBottom:34,
          zIndex:20,
        }}>
          {NAV.map(item => {
            const active = activeNav === item.id;
            const hasAlert = item.id === "hazards";
            return (
              <div
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                  gap:4, cursor:"pointer", position:"relative", paddingTop:4,
                }}
              >
                {active && (
                  <div style={{
                    position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)",
                    width:28, height:2, background: C.amber, borderRadius:1,
                  }}/>
                )}
                <div style={{ position:"relative" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.amber : C.textDisabled} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                  {hasAlert && (
                    <div style={{ position:"absolute", top:-2, right:-2, width:7, height:7, background: C.critical, borderRadius:"50%", border:`1.5px solid ${C.bgSurface}` }}/>
                  )}
                </div>
                <span style={{
                  fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:9,
                  letterSpacing:"0.6px", color: active ? C.amber : C.textDisabled,
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hazard modal */}
        {selectedHazard && <HazardModal hazard={selectedHazard} onClose={() => setSelectedHazard(null)} />}
      </div>

      {/* Hint */}
      <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", textAlign:"center" }}>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textDisabled }}>
          Tap a hazard card · Toggle the bell for offline mode · Tap ⚠ FAB to raise alert
        </span>
      </div>
    </div>
  );
}
