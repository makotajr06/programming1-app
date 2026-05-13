import { useState, useEffect, useRef } from "react";

const C = {
  bgBase: "#0D0F0F", bgSurface: "#161A1A", bgElevated: "#1E2424",
  amber: "#F5A623", amberDim: "rgba(245,166,35,0.12)", amberHover: "#FFB94A",
  critical: "#E53935", criticalDim: "rgba(229,57,53,0.12)",
  warning: "#FB8C00", warningDim: "rgba(251,140,0,0.12)",
  safe: "#43A047", safeDim: "rgba(67,160,71,0.12)",
  info: "#1E88E5",
  offline: "#607D8B",
  textPrimary: "#F0EDE8", textSecondary: "#9EA8A8", textDisabled: "#4A5252",
  borderSubtle: "#272D2D", borderDefault: "#374040",
};

const HAZARD_TYPES = ["GAS LEAK", "STRUCTURAL", "EQUIPMENT", "BLAST RISK", "FALL RISK", "OTHER"];
const SEVERITIES = [
  { id: "low",      label: "LOW",      color: C.safe,     dim: C.safeDim },
  { id: "medium",   label: "MEDIUM",   color: C.amber,    dim: C.amberDim },
  { id: "high",     label: "HIGH",     color: C.warning,  dim: C.warningDim },
  { id: "critical", label: "CRITICAL", color: C.critical, dim: C.criticalDim },
];
const ZONES = ["Zone 1A","Zone 1B","Zone 2A","Zone 2B","Zone 4B","Zone 5C","Tunnel A","Tunnel B"];

const CREW = [
  { initials:"KN", name:"Katare Nderura",      role:"Site Supervisor",  status:"active" },
  { initials:"AE", name:"Amwaama Ebba",         role:"Project Manager",  status:"active" },
  { initials:"SS", name:"Simon Sheefeni",       role:"Lead Developer",   status:"pending" },
  { initials:"JK", name:"Joseph Kambonde",      role:"Lead Developer",   status:"pending" },
  { initials:"LH", name:"Lavinia Shimutwikeni", role:"Lead Developer",   status:"active" },
  { initials:"GG", name:"Hangula Gerson",       role:"Lead Developer",   status:"pending" },
  { initials:"SN", name:"Saara Ndiweda",        role:"Firebase Lead",    status:"active" },
  { initials:"NG", name:"Ndapandula Gulikua",   role:"Firebase Lead",    status:"pending" },
  { initials:"GI", name:"Gehas Iimene",         role:"Firebase Lead",    status:"pending" },
  { initials:"EK", name:"Eliaser Katondoka",    role:"UI/UX Lead",       status:"active" },
  { initials:"NT", name:"Niinkoti Tomas",       role:"UI/UX Lead",       status:"active" },
  { initials:"LS", name:"Linea Shevaanyena",    role:"UI/UX Lead",       status:"pending" },
  { initials:"ST", name:"Shatika Titus",        role:"Documentation",    status:"pending" },
  { initials:"MF", name:"Masaku Fernandu",      role:"Documentation",    status:"active" },
];

function GrainOverlay() {
  return (
    <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.04,zIndex:1 }}>
      <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#gr)"/>
    </svg>
  );
}

function Chip({ label, selected, color, dimColor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height:34, padding:"0 14px", borderRadius:6, cursor:"pointer",
        border:`1.5px solid ${selected ? color : C.borderDefault}`,
        background: selected ? dimColor : "transparent",
        fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:11,
        letterSpacing:"0.6px", color: selected ? color : C.textSecondary,
        transition:"all 0.18s", whiteSpace:"nowrap",
        boxShadow: selected ? `0 0 10px ${color}22` : "none",
      }}
    >{label}</button>
  );
}

function ProgressSteps({ step }) {
  const steps = ["DETAILS","SEVERITY","CONFIRM"];
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"0 20px", gap:0 }}>
      {steps.map((s, i) => {
        const done = i < step, active = i === step;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background: done ? C.safe : active ? C.amber : C.bgElevated,
                border:`2px solid ${done ? C.safe : active ? C.amber : C.borderDefault}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.3s",
                boxShadow: active ? `0 0 12px ${C.amber}44` : done ? `0 0 8px ${C.safe}33` : "none",
              }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D0F0F" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:11, color: active ? "#0D0F0F" : C.textDisabled }}>{i+1}</span>
                }
              </div>
              <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:9, letterSpacing:"0.6px", color: active ? C.amber : done ? C.safe : C.textDisabled }}>
                {s}
              </span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:1.5, background: done ? C.safe : C.borderSubtle, margin:"0 6px", marginBottom:18, transition:"background 0.3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ height:44, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background: C.bgBase, flexShrink:0 }}>
      <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:13, color: C.textPrimary }}>9:41</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {[3,5,7,9].map((h,i) => <div key={i} style={{ width:3, height:h, background: C.textPrimary, borderRadius:1 }}/>)}
        <div style={{ width:18, height:10, border:`1.5px solid ${C.textPrimary}`, borderRadius:3, marginLeft:4, position:"relative" }}>
          <div style={{ position:"absolute", left:2, top:1.5, width:11, height:5, background: C.textPrimary, borderRadius:1 }}/>
          <div style={{ position:"absolute", right:-4, top:2.5, width:2.5, height:3, background: C.textPrimary, borderRadius:1 }}/>
        </div>
      </div>
    </div>
  );
}

// ── STEP 1 ── Hazard details form
function Step1({ form, setForm, onNext, onBack }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);
  const fade = (d=0) => ({ opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(12px)", transition:`opacity 0.35s ease ${d}s, transform 0.35s ease ${d}s` });

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color: C.textSecondary, padding:4, display:"flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: C.textPrimary }}>RAISE HAZARD ALERT</div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>Zone 4B · 14 crew will be notified</div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ ...fade(0), padding:"16px 0 12px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <ProgressSteps step={0} />
      </div>

      {/* Form */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 0" }}>

        {/* Hazard type */}
        <div style={{ ...fade(0.05), marginBottom:20 }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:10, textTransform:"uppercase" }}>Hazard Type *</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {HAZARD_TYPES.map(t => (
              <Chip key={t} label={t} selected={form.type===t} color={C.amber} dimColor={C.amberDim} onClick={() => setForm(f => ({...f, type:t}))} />
            ))}
          </div>
          {!form.type && form.attempted && <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.critical, marginTop:6 }}>⚠ Select a hazard type</div>}
        </div>

        {/* Zone */}
        <div style={{ ...fade(0.09), marginBottom:20 }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:8, textTransform:"uppercase" }}>Zone *</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ZONES.map(z => (
              <Chip key={z} label={z} selected={form.zone===z} color={C.info} dimColor="rgba(30,136,229,0.12)" onClick={() => setForm(f => ({...f, zone:z}))} />
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ ...fade(0.13), marginBottom:20 }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:8, textTransform:"uppercase" }}>Description *</div>
          <textarea
            value={form.desc}
            onChange={e => setForm(f => ({...f, desc:e.target.value}))}
            placeholder="Describe the hazard clearly — what you saw, exact location, immediate risk..."
            maxLength={500}
            style={{
              width:"100%", height:90, background: C.bgElevated,
              border:`1.5px solid ${form.desc ? C.borderDefault : C.borderSubtle}`,
              borderRadius:8, padding:14, resize:"none",
              fontFamily:"'DM Mono', monospace", fontSize:13, color: C.textPrimary,
              outline:"none", boxSizing:"border-box", lineHeight:1.6,
            }}
            onFocus={e => e.target.style.borderColor = C.amber}
            onBlur={e => e.target.style.borderColor = form.desc ? C.borderDefault : C.borderSubtle}
          />
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4 }}>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.textDisabled }}>{form.desc.length}/500</span>
          </div>
        </div>

        {/* Photo attach */}
        <div style={{ ...fade(0.16), marginBottom:20 }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:8, textTransform:"uppercase" }}>Photo Evidence <span style={{ color: C.textDisabled }}>optional</span></div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {form.photo && (
              <div style={{
                width:72, height:72, borderRadius:8, background: C.bgElevated,
                border:`1.5px solid ${C.safe}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <button
                  onClick={() => setForm(f => ({...f, photo:false}))}
                  style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background: C.critical, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
            <button
              onClick={() => setForm(f => ({...f, photo:true}))}
              style={{
                height:72, padding:"0 20px", background:"transparent",
                border:`1.5px dashed ${C.borderDefault}`, borderRadius:8,
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:12,
                color: C.textSecondary, transition:"border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.borderDefault}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {form.photo ? "ADD ANOTHER" : "ADD PHOTO"}
            </button>
          </div>
        </div>

        {/* GPS */}
        <div style={{ ...fade(0.19), marginBottom:24 }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:8, textTransform:"uppercase" }}>GPS Coordinates</div>
          <div style={{
            height:48, background: C.bgElevated, border:`1px solid ${C.borderSubtle}`,
            borderRadius:8, display:"flex", alignItems:"center", padding:"0 14px", gap:10,
          }}>
            <div style={{ animation:"gpsPulse 2s ease-in-out infinite" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:13, color: C.textPrimary, flex:1 }}>−22.4567, 17.0834</span>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: C.safe, animation:"pulse 1.8s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, color: C.safe }}>GPS ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"12px 20px 24px", borderTop:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <button
          onClick={() => { setForm(f=>({...f, attempted:true})); if(form.type && form.zone && form.desc) onNext(); }}
          style={{
            width:"100%", height:54, background: C.amber, border:"none", borderRadius:8,
            cursor:"pointer", fontFamily:"'Barlow', sans-serif", fontWeight:600,
            fontSize:14, letterSpacing:"1px", color:"#0D0F0F", textTransform:"uppercase",
            boxShadow:`0 4px 20px ${C.amber}44`,
          }}
        >
          NEXT — SET SEVERITY →
        </button>
      </div>
    </div>
  );
}

// ── STEP 2 ── Severity selection
function Step2({ form, setForm, onNext, onBack }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);
  const fade = (d=0) => ({ opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(12px)", transition:`opacity 0.35s ease ${d}s, transform 0.35s ease ${d}s` });
  const sel = SEVERITIES.find(s => s.id === form.severity);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color: C.textSecondary, padding:4, display:"flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: C.textPrimary }}>SET SEVERITY LEVEL</div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>{form.type} · {form.zone}</div>
        </div>
      </div>

      <div style={{ ...fade(0), padding:"16px 0 12px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <ProgressSteps step={1} />
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px 0" }}>

        {/* Large severity selector cards */}
        <div style={{ ...fade(0.05), display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
          {SEVERITIES.map((s, i) => {
            const selected = form.severity === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setForm(f => ({...f, severity:s.id}))}
                style={{
                  background: selected ? s.dim : C.bgSurface,
                  border:`1.5px solid ${selected ? s.color : C.borderSubtle}`,
                  borderLeft:`4px solid ${s.color}`,
                  borderRadius:12, padding:"16px 18px",
                  cursor:"pointer", transition:"all 0.2s",
                  boxShadow: selected ? `0 4px 20px ${s.color}22` : "none",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${0.05 + i*0.06}s`,
                }}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background: s.color, boxShadow: selected ? `0 0 10px ${s.color}` : "none" }}/>
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:20, color: selected ? s.color : C.textPrimary }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{
                    width:22, height:22, borderRadius:"50%",
                    border:`2px solid ${selected ? s.color : C.borderDefault}`,
                    background: selected ? s.color : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.2s",
                  }}>
                    {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D0F0F" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
                <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary, marginTop:8, marginLeft:26 }}>
                  {s.id === "low" && "Monitor situation · No immediate action required"}
                  {s.id === "medium" && "Supervisor notified · Controlled response needed"}
                  {s.id === "high" && "Immediate action required · Zone may need evacuation"}
                  {s.id === "critical" && "EMERGENCY — All personnel evacuate zone immediately"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview of what the alert will look like */}
        {form.severity && (
          <div style={{ ...fade(0.1), marginBottom:24 }}>
            <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:10 }}>ALERT PREVIEW</div>
            <div style={{
              background: C.bgElevated, border:`1px solid ${sel.color}33`,
              borderLeft:`4px solid ${sel.color}`, borderRadius:10, padding:"12px 14px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background: sel.color }}/>
                <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.6px", color: sel.color }}>{sel.label}</span>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.textDisabled }}>· just now</span>
              </div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:600, fontSize:17, color: C.textPrimary }}>{form.type || "HAZARD TYPE"}</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary, marginTop:2 }}>{form.zone || "Zone"} · K. Nderura</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:"12px 20px 24px", borderTop:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <button
          onClick={() => { if(form.severity) onNext(); }}
          disabled={!form.severity}
          style={{
            width:"100%", height:54,
            background: form.severity ? (SEVERITIES.find(s=>s.id===form.severity)?.color || C.amber) : C.bgElevated,
            border:"none", borderRadius:8, cursor: form.severity ? "pointer" : "default",
            fontFamily:"'Barlow', sans-serif", fontWeight:600,
            fontSize:14, letterSpacing:"1px",
            color: form.severity ? "#0D0F0F" : C.textDisabled,
            textTransform:"uppercase",
            transition:"background 0.3s, box-shadow 0.3s",
            boxShadow: form.severity ? `0 4px 20px ${SEVERITIES.find(s=>s.id===form.severity)?.color}44` : "none",
          }}
        >
          REVIEW & BROADCAST →
        </button>
      </div>
    </div>
  );
}

// ── STEP 3 ── Confirm + Broadcast
function Step3({ form, onBroadcast, onBack }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);
  const fade = (d=0) => ({ opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(12px)", transition:`opacity 0.35s ease ${d}s, transform 0.35s ease ${d}s` });
  const sel = SEVERITIES.find(s => s.id === form.severity) || SEVERITIES[3];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color: C.textSecondary, padding:4, display:"flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: C.textPrimary }}>REVIEW & CONFIRM</div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>Check details before broadcasting</div>
        </div>
      </div>

      <div style={{ ...fade(0), padding:"16px 0 12px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <ProgressSteps step={2} />
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 0" }}>

        {/* Summary card */}
        <div style={{ ...fade(0.05), marginBottom:16 }}>
          <div style={{
            background: sel.dim, border:`1.5px solid ${sel.color}44`,
            borderLeft:`4px solid ${sel.color}`, borderRadius:12, padding:"18px 18px",
            boxShadow:`0 4px 24px ${sel.color}18`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background: sel.color, boxShadow:`0 0 8px ${sel.color}` }}/>
              <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:11, letterSpacing:"0.8px", color: sel.color }}>{sel.label} HAZARD</span>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:26, color: C.textPrimary, marginBottom:8 }}>
              {form.type}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 0", marginBottom:10 }}>
              {[
                { l:"ZONE", v: form.zone },
                { l:"GPS", v:"−22.4567, 17.0834" },
                { l:"REPORTED BY", v:"K. Nderura" },
                { l:"TIMESTAMP", v:"09:41:22" },
              ].map(row => (
                <div key={row.l}>
                  <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:9, letterSpacing:"0.6px", color: C.textDisabled }}>{row.l}</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textSecondary }}>{row.v}</div>
                </div>
              ))}
            </div>
            {form.desc && (
              <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:6, padding:"10px 12px" }}>
                <p style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textPrimary, lineHeight:1.6 }}>"{form.desc}"</p>
              </div>
            )}
            {form.photo && (
              <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.safe }}>1 photo attached</span>
              </div>
            )}
          </div>
        </div>

        {/* Notify info */}
        <div style={{ ...fade(0.1), marginBottom:16 }}>
          <div style={{
            background: C.bgSurface, border:`1px solid ${C.borderSubtle}`,
            borderRadius:10, padding:"12px 16px",
            display:"flex", alignItems:"center", gap:12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2"><path d="M22 17H2a3 3 0 000-3l-1-4.16a6 6 0 0112-2v4l1 4"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div>
              <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:12, color: C.textPrimary }}>Push notification to 14 crew members</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>DAY SHIFT — ZONE 4B · All personnel</div>
            </div>
          </div>
        </div>

        <div style={{ ...fade(0.13), marginBottom:24 }}>
          <div style={{
            background:"rgba(229,57,53,0.07)", border:`1px solid rgba(229,57,53,0.2)`,
            borderRadius:8, padding:"10px 14px",
          }}>
            <p style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary, lineHeight:1.7 }}>
              ⚠ This alert will be <span style={{ color: C.critical }}>immediately broadcast</span> via Firebase Realtime Database to all active shift members. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 20px 24px", borderTop:`1px solid ${C.borderSubtle}`, flexShrink:0, display:"flex", flexDirection:"column", gap:10 }}>
        <button
          onClick={onBroadcast}
          style={{
            width:"100%", height:56, background: sel.color, border:"none", borderRadius:8,
            cursor:"pointer", fontFamily:"'Barlow', sans-serif", fontWeight:700,
            fontSize:15, letterSpacing:"1.2px", color:"#0D0F0F", textTransform:"uppercase",
            boxShadow:`0 4px 24px ${sel.color}55`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 17H2a3 3 0 000-3l-1-4.16a6 6 0 0112-2v4l1 4"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          BROADCAST ALERT NOW
        </button>
        <button onClick={onBack} style={{
          width:"100%", height:44, background:"transparent",
          border:`1px solid ${C.borderDefault}`, borderRadius:8,
          cursor:"pointer", fontFamily:"'Barlow', sans-serif", fontWeight:600,
          fontSize:13, letterSpacing:"0.6px", color: C.textSecondary,
        }}>
          BACK TO EDIT
        </button>
      </div>
    </div>
  );
}

// ── STEP 4 ── Live Broadcast / Acknowledgements
function Step4({ form, onReset }) {
  const [seconds, setSeconds] = useState(0);
  const [ackList, setAckList] = useState(CREW.map(c => ({...c, acked: false, ackTime: null})));
  const [mounted, setMounted] = useState(false);
  const sel = SEVERITIES.find(s => s.id === form.severity) || SEVERITIES[3];

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const timer = setInterval(() => setSeconds(s => s+1), 1000);
    // Simulate crew acknowledging over time
    let idx = 0;
    const ackInterval = setInterval(() => {
      setAckList(list => {
        const pending = list.filter(c => !c.acked);
        if(pending.length === 0) { clearInterval(ackInterval); return list; }
        const pick = pending[Math.floor(Math.random()*pending.length)];
        return list.map(c => c.initials===pick.initials ? {...c, acked:true, ackTime: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})} : c);
      });
      idx++;
    }, 1400);
    return () => { clearInterval(timer); clearInterval(ackInterval); };
  }, []);

  const ackedCount = ackList.filter(c => c.acked).length;
  const pct = Math.round((ackedCount / ackList.length) * 100);
  const fade = (d=0) => ({ opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(12px)", transition:`opacity 0.4s ease ${d}s, transform 0.4s ease ${d}s` });
  const elapsed = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px 14px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color: sel.color }}>ALERT BROADCAST</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary }}>{form.type} · {form.zone}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background: sel.dim, borderRadius:9999, padding:"6px 12px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background: sel.color, animation:"pulse 1.5s ease-in-out infinite" }}/>
            <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:11, color: sel.color }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>

        {/* Big stats */}
        <div style={{ ...fade(0.05), padding:"20px 20px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[
            { value: String(ackList.length), label:"NOTIFIED", color: C.textPrimary },
            { value: elapsed,                label:"ELAPSED",  color: C.amber },
            { value: String(ackedCount),     label:"ACK'D",    color: sel.color },
          ].map(s => (
            <div key={s.label} style={{ background: C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontFamily:"'DM Mono', monospace", fontWeight:500, fontSize:22, color: s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:9, letterSpacing:"0.6px", color: C.textDisabled, marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress ring area */}
        <div style={{ ...fade(0.08), padding:"20px 20px 0", display:"flex", alignItems:"center", gap:16 }}>
          {/* Progress ring */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke={C.bgElevated} strokeWidth="6"/>
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={sel.color} strokeWidth="6"
                strokeDasharray={`${2*Math.PI*34}`}
                strokeDashoffset={`${2*Math.PI*34*(1-pct/100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition:"stroke-dashoffset 0.8s ease" }}
              />
              <text x="40" y="44" textAnchor="middle" fill={C.textPrimary} fontFamily="DM Mono" fontSize="16" fontWeight="500">{pct}%</text>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:18, color: C.textPrimary }}>
              {ackedCount} of {ackList.length} acknowledged
            </div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary, marginTop:4 }}>
              {ackList.length - ackedCount} crew still pending response
            </div>
            <div style={{ height:4, background: C.bgElevated, borderRadius:2, marginTop:10, width:160 }}>
              <div style={{ height:"100%", width:`${pct}%`, background: sel.color, borderRadius:2, transition:"width 0.8s ease" }}/>
            </div>
          </div>
        </div>

        {/* Severity badge */}
        <div style={{ ...fade(0.1), padding:"14px 20px 0" }}>
          <div style={{ background: sel.dim, border:`1px solid ${sel.color}33`, borderLeft:`3px solid ${sel.color}`, borderRadius:8, padding:"10px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background: sel.color }}/>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:16, color: sel.color }}>{sel.label}</span>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: C.textSecondary }}>— {form.type} · {form.zone}</span>
            </div>
            {form.desc && <p style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textSecondary, marginTop:6, lineHeight:1.6 }}>{form.desc}</p>}
          </div>
        </div>

        {/* Crew list */}
        <div style={{ ...fade(0.13), padding:"16px 20px 0" }}>
          <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.8px", color: C.textSecondary, marginBottom:10 }}>CREW ACKNOWLEDGEMENTS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {ackList.map((c) => (
              <div key={c.initials} style={{
                background: C.bgSurface, border:`1px solid ${c.acked ? `${C.safe}33` : C.borderSubtle}`,
                borderRadius:10, padding:"10px 14px",
                display:"flex", alignItems:"center", gap:12,
                transition:"border-color 0.4s, background 0.4s",
                background: c.acked ? `rgba(67,160,71,0.04)` : C.bgSurface,
              }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background: c.acked ? C.safeDim : C.bgElevated,
                  border:`2px solid ${c.acked ? C.safe : C.borderDefault}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.3s", flexShrink:0,
                }}>
                  <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:11, color: c.acked ? C.safe : C.textPrimary }}>{c.initials}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:13, color: C.textPrimary }}>{c.name}</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.textSecondary }}>{c.role}</div>
                </div>
                <div>
                  {c.acked ? (
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.safe }}>{c.ackTime}</span>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background: C.warning, animation:"pulse 1.8s ease-in-out infinite" }}/>
                      <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color: C.warning }}>PENDING</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height:20 }}/>
      </div>

      <div style={{ padding:"12px 20px 24px", borderTop:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <button onClick={onReset} style={{
          width:"100%", height:48, background:"transparent",
          border:`1.5px solid ${C.borderDefault}`, borderRadius:8,
          cursor:"pointer", fontFamily:"'Barlow', sans-serif",
          fontWeight:600, fontSize:13, letterSpacing:"0.8px", color: C.textPrimary,
        }}>
          ← BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
}

export default function HazardFlow() {
  const [step, setStep] = useState(0); // 0=form, 1=severity, 2=confirm, 3=broadcast
  const [form, setForm] = useState({ type:"", zone:"", desc:"", severity:"", photo:false, attempted:false });

  return (
    <div style={{ minHeight:"100vh", background: C.bgBase, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
        @keyframes gpsPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.2);} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#374040;border-radius:2px;}
        textarea::placeholder { color: #4A5252; }
      `}</style>

      <GrainOverlay />

      <div style={{
        width:390, height:844, background: C.bgBase,
        borderRadius:44, border:`2px solid ${C.borderSubtle}`,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #272D2D",
        position:"relative", overflow:"hidden", display:"flex", flexDirection:"column",
      }}>
        <StatusBar />

        {step === 0 && <Step1 form={form} setForm={setForm} onNext={() => setStep(1)} onBack={() => setStep(0)} />}
        {step === 1 && <Step2 form={form} setForm={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 form={form} onBroadcast={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step4 form={form} onReset={() => { setStep(0); setForm({ type:"", zone:"", desc:"", severity:"", photo:false, attempted:false }); }} />}
      </div>

      <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", textAlign:"center" }}>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color: C.textDisabled }}>
          Step {step+1} of 4 · Fill form → set severity → confirm → watch live acknowledgements
        </span>
      </div>
    </div>
  );
}
