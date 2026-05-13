import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bgBase:"#0D0F0F", bgSurface:"#161A1A", bgElevated:"#1E2424",
  amber:"#F5A623", amberDim:"rgba(245,166,35,0.12)",
  critical:"#E53935", criticalDim:"rgba(229,57,53,0.12)",
  warning:"#FB8C00", warningDim:"rgba(251,140,0,0.12)",
  safe:"#43A047", safeDim:"rgba(67,160,71,0.12)",
  info:"#1E88E5", infoDim:"rgba(30,136,229,0.12)",
  offline:"#607D8B",
  textPrimary:"#F0EDE8", textSecondary:"#9EA8A8", textDisabled:"#4A5252",
  borderSubtle:"#272D2D", borderDefault:"#374040",
};

// ─── SHARED DATA ──────────────────────────────────────────────────────────────
const CREW_ALL = [
  {initials:"KN",name:"Katare Nderura",role:"Site Supervisor",status:"active"},
  {initials:"AE",name:"Amwaama Ebba",role:"Project Manager",status:"active"},
  {initials:"SS",name:"Simon Sheefeni",role:"Lead Developer",status:"alert"},
  {initials:"JK",name:"Joseph Kambonde",role:"Lead Developer",status:"active"},
  {initials:"LH",name:"Lavinia Shimutwikeni",role:"Lead Developer",status:"break"},
  {initials:"GG",name:"Hangula Gerson",role:"Lead Developer",status:"active"},
  {initials:"SN",name:"Saara Ndiweda",role:"Firebase Lead",status:"offline"},
  {initials:"NG",name:"Ndapandula Gulikua",role:"Firebase Lead",status:"active"},
  {initials:"GI",name:"Gehas Iimene",role:"Firebase Lead",status:"pending"},
  {initials:"EK",name:"Eliaser Katondoka",role:"UI/UX Lead",status:"active"},
];

const OPEN_HAZARDS = [
  {id:1,type:"BLAST RISK",zone:"Zone 4B",severity:"critical",color:C.critical},
  {id:2,type:"GAS LEAK",zone:"Zone 2A",severity:"high",color:C.warning},
  {id:3,type:"EQUIPMENT",zone:"Zone 1C",severity:"medium",color:C.amber},
];

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────
const PrimaryBtn = ({label, onClick, disabled, color}) => {
  const bg = disabled ? C.bgElevated : (color || C.amber);
  return (
    <button onClick={onClick} disabled={disabled} style={{width:"100%",height:54,background:bg,border:"none",borderRadius:8,cursor:disabled?"default":"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:14,letterSpacing:"1px",color:disabled?C.textDisabled:"#0D0F0F",textTransform:"uppercase",boxShadow:disabled?"none":`0 4px 20px ${bg}44`,transition:"all 0.2s"}}>
      {label}
    </button>
  );
};

const GhostBtn = ({label, onClick}) => (
  <button onClick={onClick} style={{width:"100%",height:44,background:"transparent",border:`1px solid ${C.borderDefault}`,borderRadius:8,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:13,letterSpacing:"0.6px",color:C.textSecondary}}>
    {label}
  </button>
);

const ProgressSteps = ({step, steps}) => (
  <div style={{display:"flex",alignItems:"center",padding:"14px 20px 10px"}}>
    {steps.map((s, i) => {
      const done = i < step, active = i === step;
      return (
        <div key={s} style={{display:"flex",alignItems:"center",flex:i < steps.length - 1 ? 1 : "none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:done?C.safe:active?C.amber:C.bgElevated,border:`2px solid ${done?C.safe:active?C.amber:C.borderDefault}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
              {done
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D0F0F" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                : <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:10,color:active?"#0D0F0F":C.textDisabled}}>{i+1}</span>
              }
            </div>
            <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:8,letterSpacing:"0.5px",color:active?C.amber:done?C.safe:C.textDisabled}}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{flex:1,height:1.5,background:done?C.safe:C.borderSubtle,margin:"0 5px",marginBottom:18,transition:"background 0.3s"}}/>
          )}
        </div>
      );
    })}
  </div>
);

const BackHeader = ({title, subtitle, onBack}) => (
  <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.borderSubtle}`,display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
    <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary,padding:4,display:"flex"}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:22,color:C.textPrimary}}>{title}</div>
      {subtitle && <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary}}>{subtitle}</div>}
    </div>
  </div>
);

// ─── SCREEN 4: SHIFTS (HANDOVER) ─────────────────────────────────────────────
function ShiftsScreen({navigate}) {
  const [view, setView] = useState("home"); // home | create | review
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState(
    ["Ventilation check — Tunnel A","Water pump inspection — Zone 2","Equipment log — Conveyor C"]
      .map((t, i) => ({id:i, text:t, done:false}))
  );
  const [selIncoming, setSelIncoming] = useState([]);
  const [incHazards, setIncHazards] = useState([1, 2, 3]);
  const [submitted, setSubmitted] = useState(false);
  const [ackDone, setAckDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 50);
  }, [view, step]);

  const fade = (d=0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.35s ease ${d}s,transform 0.35s ease ${d}s`,
  });

  const OUTGOING = CREW_ALL.slice(0, 5);
  const INCOMING_POOL = CREW_ALL.slice(5, 10);
  const toggleIncoming = i => setSelIncoming(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const toggleHazard = id => setIncHazards(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleTask = id => setTasks(ts => ts.map(t => t.id === id ? {...t, done:!t.done} : t));

  // ── Home ──────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="SHIFT HANDOVER" subtitle="DAY SHIFT → NIGHT SHIFT · 18:45" onBack={() => navigate("dashboard")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0",display:"flex",flexDirection:"column",gap:12}}>
        {[
          {label:"Create Handover", sub:"Submit outgoing shift report", color:C.amber, action:()=>{setView("create");setStep(0);setSubmitted(false);}},
          {label:"Review Handover", sub:"Incoming leader — acknowledge & brief", color:C.safe, action:()=>{setView("review");setAckDone(false);}},
        ].map((btn, i) => (
          <div key={i} onClick={btn.action} style={{...fade(0.05+i*0.07),background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderLeft:`4px solid ${btn.color}`,borderRadius:12,padding:"18px 18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:20,color:C.textPrimary,marginBottom:4}}>{btn.label}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary}}>{btn.sub}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textDisabled} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Create submitted ──────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <BackHeader title="SHIFT CLOSED" subtitle="Handover submitted" onBack={()=>{setView("home");setSubmitted(false);}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:20}}>
        <div style={{width:88,height:88,borderRadius:"50%",background:C.safeDim,border:`2px solid ${C.safe}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 32px ${C.safe}33`,animation:"popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)"}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:28,color:C.textPrimary}}>SHIFT CLOSED</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textSecondary,marginTop:6}}>Handover locked · 19:02</div>
        </div>
        <div style={{width:"100%",background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {[
            {l:"SHIFT",v:"DAY SHIFT — ZONE 4B"},
            {l:"OUTGOING",v:`${OUTGOING.length} members`},
            {l:"INCOMING",v:`${selIncoming.length || INCOMING_POOL.length} selected`},
            {l:"HAZARDS",v:`${incHazards.length} handed over`},
            {l:"TASKS DONE",v:`${tasks.filter(t=>t.done).length}/${tasks.length}`},
          ].map(r => (
            <div key={r.l} style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.5px",color:C.textDisabled}}>{r.l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary}}>{r.v}</span>
            </div>
          ))}
        </div>
        <PrimaryBtn label="BACK TO DASHBOARD" onClick={() => navigate("dashboard")}/>
      </div>
    </div>
  );

  // ── Review acked ──────────────────────────────────────────────────────────
  if (ackDone) return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <BackHeader title="TEAM BRIEFED" subtitle="Night shift active" onBack={() => navigate("dashboard")}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:20}}>
        <div style={{width:88,height:88,borderRadius:"50%",background:C.safeDim,border:`2px solid ${C.safe}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 32px ${C.safe}33`}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:28,color:C.textPrimary}}>TEAM BRIEFED</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textSecondary,marginTop:6}}>Night shift now active · 19:06</div>
        </div>
        <PrimaryBtn label="OPEN DASHBOARD" onClick={() => navigate("dashboard")}/>
      </div>
    </div>
  );

  // ── Review screen ─────────────────────────────────────────────────────────
  if (view === "review") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="HANDOVER REVIEW" subtitle="Incoming leader — read-only" onBack={() => setView("home")}/>
      <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.borderSubtle}`,background:C.safeDim,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.safe}}>RECEIVED FROM K. Nderura AT 19:02</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
        <div style={{...fade(0.04),background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderLeft:`4px solid ${C.amber}`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.amber,marginBottom:10}}>SHIFT HANDOVER RECORD</div>
          {[
            {l:"SHIFT",v:"DAY SHIFT — ZONE 4B"},
            {l:"PERIOD",v:"07:00 — 19:00 (12 hrs)"},
            {l:"SUPERVISOR",v:"Katare Nderura"},
            {l:"CREW ON SHIFT",v:"5 members"},
          ].map(r => (
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.5px",color:C.textDisabled}}>{r.l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary}}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{...fade(0.07),marginBottom:14}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Handover Notes</div>
          <div style={{background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:10,padding:"12px 14px"}}>
            <p style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary,lineHeight:1.7}}>
              Conveyor belt in Zone 1C shut down pending maintenance. Gas readings in Zone 2A elevated but within safe limits — monitor closely. All blast charges in Zone 4B logged and secured. Incoming team must complete ventilation check before resuming full operations.
            </p>
          </div>
        </div>
        <div style={{...fade(0.1),marginBottom:14}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Hazards Carried Over</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {OPEN_HAZARDS.map(h => (
              <div key={h.id} style={{background:C.bgSurface,border:`1px solid ${h.color}33`,borderLeft:`3px solid ${h.color}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:C.textPrimary,marginBottom:2}}>{h.type}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary}}>{h.zone}</div>
                </div>
                <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,color:h.color,background:`${h.color}18`,padding:"3px 8px",borderRadius:4}}>{h.severity.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{...fade(0.13),marginBottom:24}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Incomplete Tasks</div>
          {tasks.map((t, i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:8,padding:"9px 12px",marginBottom:6}}>
              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${C.borderDefault}`,flexShrink:0}}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textSecondary}}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 20px 24px",borderTop:`1px solid ${C.borderSubtle}`,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
        <PrimaryBtn label="ACKNOWLEDGE & BRIEF TEAM" onClick={() => setAckDone(true)} color={C.safe}/>
        <GhostBtn label="FLAG AN ISSUE" onClick={() => {}}/>
      </div>
    </div>
  );

  // ── Create flow ───────────────────────────────────────────────────────────
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="SHIFT HANDOVER" subtitle="DAY SHIFT → NIGHT SHIFT · 18:45" onBack={() => setView("home")}/>
      <div style={{...fade(0),borderBottom:`1px solid ${C.borderSubtle}`,flexShrink:0}}>
        <ProgressSteps step={step} steps={["SUMMARY","HAZARDS","CONFIRM"]}/>
      </div>

      {/* Step 0: Summary */}
      {step === 0 && <>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
          {/* Outgoing team */}
          <div style={{...fade(0.05),marginBottom:20}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:10,textTransform:"uppercase"}}>Outgoing Team</div>
            <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
              {OUTGOING.map(c => (
                <div key={c.initials} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0,width:52}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:C.amberDim,border:`2px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,color:C.amber}}>{c.initials}</span>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.textDisabled,textAlign:"center"}}>{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Incoming team */}
          <div style={{...fade(0.08),marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,textTransform:"uppercase"}}>
                Incoming Team <span style={{color:C.textDisabled}}>(tap to select)</span>
              </div>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.amber}}>{selIncoming.length}/{INCOMING_POOL.length}</span>
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
              {INCOMING_POOL.map(c => {
                const sel = selIncoming.includes(c.initials);
                return (
                  <div key={c.initials} onClick={() => toggleIncoming(c.initials)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0,width:52,cursor:"pointer"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:sel?C.amberDim:C.bgElevated,border:`2px solid ${sel?C.amber:C.borderDefault}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                      <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,color:sel?C.amber:C.textPrimary}}>{c.initials}</span>
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.textDisabled,textAlign:"center"}}>{c.name.split(" ")[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Handover notes */}
          <div style={{...fade(0.11),marginBottom:20}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Handover Notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Summarise key events, equipment status, and unresolved issues..."
              maxLength={500}
              style={{width:"100%",height:88,background:C.bgElevated,border:`1.5px solid ${C.borderSubtle}`,borderRadius:8,padding:14,resize:"none",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary,outline:"none",boxSizing:"border-box",lineHeight:1.6}}
              onFocus={e => e.target.style.borderColor = C.amber}
              onBlur={e => e.target.style.borderColor = C.borderSubtle}
            />
            <div style={{textAlign:"right",marginTop:4}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled}}>{notes.length}/500</span>
            </div>
          </div>
          {/* Outstanding tasks */}
          <div style={{...fade(0.14),marginBottom:24}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:10,textTransform:"uppercase"}}>Outstanding Tasks</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {tasks.map(t => (
                <div key={t.id} onClick={() => toggleTask(t.id)} style={{display:"flex",alignItems:"center",gap:12,background:C.bgSurface,border:`1px solid ${t.done?C.safe+"33":C.borderSubtle}`,borderRadius:8,padding:"10px 14px",cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${t.done?C.safe:C.borderDefault}`,background:t.done?C.safeDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0}}>
                    {t.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:t.done?C.textDisabled:C.textPrimary,textDecoration:t.done?"line-through":"none",transition:"all 0.2s"}}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:"12px 20px 24px",borderTop:`1px solid ${C.borderSubtle}`,flexShrink:0}}>
          <PrimaryBtn label="NEXT — REVIEW HAZARDS →" onClick={() => setStep(1)}/>
        </div>
      </>}

      {/* Step 1: Hazards */}
      {step === 1 && <>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
          <div style={{...fade(0.04),fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textDisabled,marginBottom:12}}>Toggle which hazards to include in the handover</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {OPEN_HAZARDS.map((h, i) => {
              const inc = incHazards.includes(h.id);
              return (
                <div key={h.id} onClick={() => toggleHazard(h.id)} style={{...fade(0.05+i*0.06),background:inc?`${h.color}0D`:C.bgSurface,border:`1.5px solid ${inc?h.color+"44":C.borderSubtle}`,borderLeft:`4px solid ${h.color}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:h.color}}/>
                        <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,color:h.color}}>{h.severity.toUpperCase()}</span>
                      </div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,color:C.textPrimary}}>{h.type}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary,marginTop:2}}>{h.zone}</div>
                    </div>
                    <div style={{width:26,height:26,borderRadius:6,border:`2px solid ${inc?h.color:C.borderDefault}`,background:inc?`${h.color}22`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                      {inc && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={h.color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                  <div style={{marginTop:10,padding:"6px 10px",background:"rgba(0,0,0,0.2)",borderRadius:6}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:inc?C.textSecondary:C.textDisabled}}>
                      {inc ? "✓ Included in handover" : "○ Not included"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{padding:"12px 20px 24px",borderTop:`1px solid ${C.borderSubtle}`,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
          <PrimaryBtn label="NEXT — CONFIRM & CLOSE →" onClick={() => setStep(2)}/>
          <GhostBtn label="← BACK" onClick={() => setStep(0)}/>
        </div>
      </>}

      {/* Step 2: Confirm */}
      {step === 2 && <>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
          <div style={{...fade(0.04),background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderLeft:`4px solid ${C.amber}`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.amber,marginBottom:10}}>HANDOVER SUMMARY</div>
            {[
              {l:"SHIFT",v:"DAY SHIFT — ZONE 4B"},
              {l:"PERIOD",v:"07:00 — 19:00"},
              {l:"OUTGOING",v:`${OUTGOING.length} members`},
              {l:"INCOMING",v:`${selIncoming.length || INCOMING_POOL.length} selected`},
              {l:"HAZARDS",v:`${incHazards.length} of ${OPEN_HAZARDS.length} included`},
              {l:"TASKS DONE",v:`${tasks.filter(t=>t.done).length}/${tasks.length}`},
            ].map(r => (
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.5px",color:C.textDisabled}}>{r.l}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary}}>{r.v}</span>
              </div>
            ))}
            {notes && (
              <div style={{marginTop:10,padding:"10px 12px",background:C.bgElevated,borderRadius:6}}>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary,lineHeight:1.6}}>"{notes}"</p>
              </div>
            )}
          </div>
          <div style={{...fade(0.08),background:C.criticalDim,border:`1px solid ${C.critical}33`,borderRadius:8,padding:"10px 14px",marginBottom:24}}>
            <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary,lineHeight:1.7}}>
              ⚠ Closing this shift will <span style={{color:C.critical}}>permanently lock</span> the shift record. The incoming team will be immediately notified.
            </p>
          </div>
        </div>
        <div style={{padding:"12px 20px 24px",borderTop:`1px solid ${C.borderSubtle}`,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
          <PrimaryBtn label="CLOSE SHIFT & SUBMIT HANDOVER" onClick={() => setSubmitted(true)} color={C.critical}/>
          <GhostBtn label="← BACK TO EDIT" onClick={() => setStep(1)}/>
        </div>
      </>}
    </div>
  );
}

// ─── STANDALONE WRAPPER (for preview) ─────────────────────────────────────────
const GrainOverlay = () => (
  <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.04,zIndex:1}}>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#gr)"/>
  </svg>
);

const StatusBar = () => (
  <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:C.bgBase,flexShrink:0}}>
    <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:13,color:C.textPrimary}}>9:41</span>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      {[3,5,7,9].map((h,i) => <div key={i} style={{width:3,height:h,background:C.textPrimary,borderRadius:1}}/>)}
      <div style={{width:18,height:10,border:`1.5px solid ${C.textPrimary}`,borderRadius:3,marginLeft:4,position:"relative"}}>
        <div style={{position:"absolute",left:2,top:1.5,width:11,height:5,background:C.textPrimary,borderRadius:1}}/>
        <div style={{position:"absolute",right:-4,top:2.5,width:2.5,height:3,background:C.textPrimary,borderRadius:1}}/>
      </div>
    </div>
  </div>
);

export default function Screen4Preview() {
  return (
    <div style={{minHeight:"100vh",background:C.bgBase,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea::placeholder{color:#4A5252;}
        @keyframes popIn{0%{transform:scale(0) rotate(-10deg);opacity:0;}70%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;}}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#374040;border-radius:2px;}
      `}</style>
      <GrainOverlay/>
      <div style={{width:390,height:844,background:C.bgBase,borderRadius:44,border:`2px solid ${C.borderSubtle}`,boxShadow:"0 32px 80px rgba(0,0,0,0.7),0 0 0 1px #272D2D",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <StatusBar/>
        <ShiftsScreen navigate={(screen) => console.log("Navigate to:", screen)}/>
      </div>
    </div>
  );
}
