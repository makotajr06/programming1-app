import { useState, useEffect } from "react";

const C = {
  bgBase:"#0D0F0F", bgSurface:"#161A1A", bgElevated:"#1E2424",
  amber:"#F5A623", amberDim:"rgba(245,166,35,0.12)",
  critical:"#E53935", criticalDim:"rgba(229,57,53,0.12)",
  warning:"#FB8C00", warningDim:"rgba(251,140,0,0.12)",
  safe:"#43A047", safeDim:"rgba(67,160,71,0.12)",
  info:"#1E88E5", infoDim:"rgba(30,136,229,0.12)",
  textPrimary:"#F0EDE8", textSecondary:"#9EA8A8", textDisabled:"#4A5252",
  borderSubtle:"#272D2D", borderDefault:"#374040",
};

const ZONES = ["Zone 1A","Zone 1B","Zone 2A","Zone 2B","Zone 4B","Zone 5C","Tunnel A","Tunnel B"];

const CHECKLIST = [
  {id:1,text:"Ground stability checked"},
  {id:2,text:"Ventilation operational"},
  {id:3,text:"Equipment pre-shift inspection done"},
  {id:4,text:"PPE compliance verified"},
  {id:5,text:"Emergency exits clear"},
  {id:6,text:"Blast zone markers in place"},
  {id:7,text:"Water drainage clear"},
];

const REPORTS = [
  {id:1,zone:"Zone 4B",date:"Mon 11 May",inspector:"K. Nderura",pass:7,fail:0,photos:3,status:"pass"},
  {id:2,zone:"Zone 2A",date:"Mon 11 May",inspector:"S. Sheefeni",pass:5,fail:2,photos:2,status:"fail"},
  {id:3,zone:"Zone 1C",date:"Sun 10 May",inspector:"J. Kambonde",pass:6,fail:1,photos:1,status:"fail"},
  {id:4,zone:"Zone 1A",date:"Sun 10 May",inspector:"L. Shimutwikeni",pass:7,fail:0,photos:4,status:"pass"},
  {id:5,zone:"Zone 5C",date:"Sat 9 May",inspector:"A. Ebba",pass:7,fail:0,photos:2,status:"pass"},
  {id:6,zone:"Zone 2B",date:"Sat 9 May",inspector:"G. Gerson",pass:4,fail:3,photos:0,status:"fail"},
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.04,zIndex:1}}>
      <filter id="gr">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#gr)"/>
    </svg>
  );
}

function StatusBar() {
  return (
    <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:C.bgBase,flexShrink:0}}>
      <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:13,color:C.textPrimary}}>9:41</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {[3,5,7,9].map((h,i)=><div key={i} style={{width:3,height:h,background:C.textPrimary,borderRadius:1}}/>)}
        <div style={{width:18,height:10,border:`1.5px solid ${C.textPrimary}`,borderRadius:3,marginLeft:4,position:"relative"}}>
          <div style={{position:"absolute",left:2,top:1.5,width:11,height:5,background:C.textPrimary,borderRadius:1}}/>
          <div style={{position:"absolute",right:-4,top:2.5,width:2.5,height:3,background:C.textPrimary,borderRadius:1}}/>
        </div>
      </div>
    </div>
  );
}

function BackHeader({title, subtitle, onBack, rightElement}) {
  return (
    <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.borderSubtle}`,display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary,padding:4,display:"flex",flexShrink:0}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:22,color:C.textPrimary}}>{title}</div>
        {subtitle && <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary}}>{subtitle}</div>}
      </div>
      {rightElement}
    </div>
  );
}

function PrimaryBtn({label, onClick, disabled, color}) {
  const bg = disabled ? C.bgElevated : (color || C.amber);
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%",height:54,background:bg,border:"none",borderRadius:8,
      cursor:disabled?"default":"pointer",fontFamily:"'Barlow',sans-serif",
      fontWeight:700,fontSize:14,letterSpacing:"1px",
      color:disabled?C.textDisabled:"#0D0F0F",textTransform:"uppercase",
      boxShadow:disabled?"none":`0 4px 20px ${bg}44`,transition:"all 0.2s",
    }}>{label}</button>
  );
}

function GhostBtn({label, onClick}) {
  return (
    <button onClick={onClick} style={{
      width:"100%",height:44,background:"transparent",
      border:`1px solid ${C.borderDefault}`,borderRadius:8,cursor:"pointer",
      fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:13,
      letterSpacing:"0.6px",color:C.textSecondary,
    }}>{label}</button>
  );
}

// ─── SCREEN 5A: REPORTS LIST ──────────────────────────────────────────────────

function ReportsList({onNew, onBack}) {
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const filtered = filter==="PASS ONLY" ? REPORTS.filter(r=>r.status==="pass")
    : filter==="ISSUES" ? REPORTS.filter(r=>r.status==="fail")
    : filter==="THIS WEEK" ? REPORTS.slice(0,4)
    : REPORTS;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Header */}
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:24,color:C.textPrimary,lineHeight:1}}>INSPECTION REPORTS</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary,marginTop:3}}>
            {REPORTS.length} total · <span style={{color:C.critical}}>{REPORTS.filter(r=>r.status==="fail").length} with issues</span>
          </div>
        </div>
        {/* New report button */}
        <button onClick={onNew} style={{
          display:"flex",alignItems:"center",gap:6,height:38,padding:"0 14px",
          background:C.amberDim,border:`1.5px solid ${C.amber}44`,borderRadius:8,
          cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600,
          fontSize:11,letterSpacing:"0.5px",color:C.amber,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          NEW
        </button>
      </div>

      {/* Summary strip */}
      <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.borderSubtle}`,display:"flex",gap:10,flexShrink:0}}>
        {[
          {v:REPORTS.length,  l:"TOTAL",   c:C.textPrimary},
          {v:REPORTS.filter(r=>r.status==="pass").length, l:"PASS", c:C.safe},
          {v:REPORTS.filter(r=>r.status==="fail").length, l:"ISSUES", c:C.critical},
          {v:REPORTS.reduce((a,r)=>a+r.photos,0), l:"PHOTOS", c:C.textSecondary},
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:20,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.5px",color:C.textDisabled,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.borderSubtle}`,display:"flex",gap:8,overflowX:"auto",flexShrink:0}}>
        {["ALL","PASS ONLY","ISSUES","THIS WEEK"].map(f=>{
          const active = filter===f;
          return (
            <button key={f} onClick={()=>setFilter(f)} style={{
              height:30,padding:"0 12px",borderRadius:6,flexShrink:0,
              border:`1.5px solid ${active?C.amber:C.borderDefault}`,
              background:active?C.amberDim:"transparent",cursor:"pointer",
              whiteSpace:"nowrap",fontFamily:"'Barlow',sans-serif",
              fontWeight:600,fontSize:10,letterSpacing:"0.5px",
              color:active?C.amber:C.textSecondary,transition:"all 0.18s",
            }}>{f}</button>
          );
        })}
      </div>

      {/* List */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px 20px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map((r,i)=>{
            const open = expanded===r.id;
            const pct = Math.round((r.pass/(r.pass+r.fail))*100);
            const passColor = r.status==="pass" ? C.safe : C.critical;
            return (
              <div key={r.id}
                onClick={()=>setExpanded(open?null:r.id)}
                style={{
                  background:C.bgSurface,
                  border:`1px solid ${open ? `${passColor}44` : C.borderSubtle}`,
                  borderLeft:`4px solid ${passColor}`,
                  borderRadius:12,overflow:"hidden",cursor:"pointer",
                  opacity:mounted?1:0,
                  transform:mounted?"translateY(0)":"translateY(10px)",
                  transition:`opacity 0.35s ease ${i*0.05}s, transform 0.35s ease ${i*0.05}s, border-color 0.2s`,
                }}
              >
                {/* Card header */}
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:20,color:C.textPrimary}}>{r.zone}</span>
                        <span style={{
                          fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.5px",
                          color:passColor,background:`${passColor}18`,
                          padding:"2px 8px",borderRadius:4,
                        }}>{r.status==="pass"?"ALL PASS":"ISSUES FOUND"}</span>
                      </div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary}}>{r.date} · {r.inspector}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      {r.photos>0 && (
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDisabled} strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled}}>{r.photos}</span>
                        </div>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDisabled} strokeWidth="2"
                        style={{transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:5,background:C.bgElevated,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:passColor,borderRadius:3,transition:"width 0.6s ease"}}/>
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled,flexShrink:0}}>{r.pass}/{r.pass+r.fail} items</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{borderTop:`1px solid ${C.borderSubtle}`,padding:"14px 16px",background:C.bgElevated,animation:"slideDown 0.25s ease"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                      {[
                        {l:"PASSED",v:r.pass,c:C.safe},
                        {l:"FAILED",v:r.fail,c:r.fail>0?C.critical:C.textDisabled},
                        {l:"PHOTOS",v:r.photos,c:C.textSecondary},
                      ].map(s=>(
                        <div key={s.l} style={{background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,color:s.c,fontWeight:500,lineHeight:1}}>{s.v}</div>
                          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.5px",color:C.textDisabled,marginTop:5}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Checklist mini preview */}
                    <div style={{marginBottom:12}}>
                      <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.6px",color:C.textDisabled,marginBottom:8}}>CHECKLIST RESULT</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {Array.from({length:r.pass+r.fail},(_,i)=>({status:i<r.pass?"pass":"fail"})).map((item,idx)=>(
                          <div key={idx} style={{width:22,height:22,borderRadius:4,background:item.status==="pass"?C.safeDim:C.criticalDim,border:`1px solid ${item.status==="pass"?C.safe+"44":C.critical+"44"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {item.status==="pass"
                              ?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.critical} strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={{flex:1,height:38,background:"transparent",border:`1px solid ${C.borderDefault}`,borderRadius:6,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:11,color:C.textSecondary,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        EXPORT PDF
                      </button>
                      <button style={{flex:1,height:38,background:C.amberDim,border:`1px solid ${C.amber}33`,borderRadius:6,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:11,color:C.amber,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        VIEW FULL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 5B: CREATE INSPECTION REPORT ──────────────────────────────────────

function CreateReport({onBack, onSubmit}) {
  const [selectedZone, setSelectedZone] = useState("");
  const [checks, setChecks] = useState(CHECKLIST.map(c=>({...c,status:null})));
  const [photos, setPhotos] = useState([]);
  const [findings, setFindings] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),50); },[]);
  const fade=(d=0)=>({opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(12px)",transition:`opacity 0.35s ease ${d}s,transform 0.35s ease ${d}s`});

  const setStatus=(id,s)=>setChecks(cs=>cs.map(c=>c.id===id?{...c,status:c.status===s?null:s}:c));
  const passCount = checks.filter(c=>c.status==="pass").length;
  const failCount = checks.filter(c=>c.status==="fail").length;
  const naCount   = checks.filter(c=>c.status==="na").length;
  const complete  = selectedZone && checks.every(c=>c.status!==null);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader
        title="DAILY INSPECTION"
        subtitle="MON 11 MAY 2026"
        onBack={onBack}
        rightElement={
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
            <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.5px",color:C.textDisabled}}>PROGRESS</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.amber}}>{passCount+failCount+naCount}/{CHECKLIST.length}</span>
          </div>
        }
      />

      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>

        {/* Zone selector */}
        <div style={{...fade(0.04),marginBottom:22}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:10,textTransform:"uppercase"}}>
            Inspection Zone *
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ZONES.map(z=>{
              const sel = selectedZone===z;
              return (
                <div key={z} onClick={()=>setSelectedZone(z)} style={{
                  height:42,borderRadius:8,display:"flex",alignItems:"center",
                  justifyContent:"center",cursor:"pointer",
                  border:`1.5px solid ${sel?C.amber:C.borderDefault}`,
                  background:sel?C.amberDim:"transparent",
                  transition:"all 0.18s",
                  boxShadow:sel?`0 0 10px ${C.amber}22`:"none",
                }}>
                  <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:12,letterSpacing:"0.4px",color:sel?C.amber:C.textSecondary}}>{z}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checklist */}
        <div style={{...fade(0.07),marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,textTransform:"uppercase"}}>Inspection Checklist</div>
            <div style={{display:"flex",gap:10}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.safe}}>{passCount} PASS</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.critical}}>{failCount} FAIL</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled}}>{naCount} N/A</span>
            </div>
          </div>

          {/* Overall progress */}
          <div style={{marginBottom:14}}>
            <div style={{height:4,background:C.bgElevated,borderRadius:2,overflow:"hidden",display:"flex"}}>
              <div style={{height:"100%",width:`${(passCount/CHECKLIST.length)*100}%`,background:C.safe,transition:"width 0.4s ease"}}/>
              <div style={{height:"100%",width:`${(failCount/CHECKLIST.length)*100}%`,background:C.critical,transition:"width 0.4s ease"}}/>
              <div style={{height:"100%",width:`${(naCount/CHECKLIST.length)*100}%`,background:C.borderDefault,transition:"width 0.4s ease"}}/>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {checks.map((c,i)=>{
              const statusBg = c.status==="pass" ? "rgba(67,160,71,0.06)"
                : c.status==="fail" ? "rgba(229,57,53,0.06)"
                : c.status==="na" ? "rgba(48,52,52,0.4)"
                : C.bgSurface;
              const borderColor = c.status==="pass" ? C.safe+"44"
                : c.status==="fail" ? C.critical+"44"
                : C.borderSubtle;
              return (
                <div key={c.id} style={{
                  ...fade(0.07+i*0.03),
                  background:statusBg,
                  border:`1px solid ${borderColor}`,
                  borderLeft:`3px solid ${c.status==="pass"?C.safe:c.status==="fail"?C.critical:c.status==="na"?C.borderDefault:"transparent"}`,
                  borderRadius:10,padding:"12px 14px",transition:"all 0.2s",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:20,height:20,borderRadius:4,flexShrink:0,
                      border:`2px solid ${c.status==="pass"?C.safe:c.status==="fail"?C.critical:C.borderDefault}`,
                      background:c.status==="pass"?C.safeDim:c.status==="fail"?C.criticalDim:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",
                    }}>
                      {c.status==="pass" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      {c.status==="fail" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.critical} strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      {c.status==="na"   && <div style={{width:6,height:2,background:C.textDisabled,borderRadius:1}}/>}
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:c.status==="na"?C.textDisabled:C.textPrimary,flex:1}}>{c.text}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[
                      {s:"pass",label:"PASS",color:C.safe,dim:C.safeDim},
                      {s:"fail",label:"FAIL",color:C.critical,dim:C.criticalDim},
                      {s:"na",label:"N/A",color:C.textSecondary,dim:C.bgElevated},
                    ].map(opt=>{
                      const active = c.status===opt.s;
                      return (
                        <button key={opt.s} onClick={()=>setStatus(c.id,opt.s)} style={{
                          height:28,padding:"0 14px",borderRadius:5,
                          border:`1.5px solid ${active?opt.color:C.borderDefault}`,
                          background:active?opt.dim:"transparent",cursor:"pointer",
                          fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,
                          letterSpacing:"0.5px",color:active?opt.color:C.textDisabled,
                          transition:"all 0.15s",
                          boxShadow:active?`0 0 8px ${opt.color}22`:"none",
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo evidence */}
        <div style={{...fade(0.13),marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,textTransform:"uppercase"}}>
              Photo Evidence <span style={{color:C.textDisabled,textTransform:"none",letterSpacing:0}}>optional</span>
            </div>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled}}>{photos.length}/5</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {photos.map(p=>(
              <div key={p.id} style={{width:82,height:82,borderRadius:10,background:C.bgElevated,border:`1.5px solid ${C.safe}44`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.safe} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <button onClick={()=>setPhotos(ps=>ps.filter(x=>x.id!==p.id))} style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:C.critical,border:`2px solid ${C.bgBase}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={()=>setPhotos(p=>[...p,{id:Date.now()}])} style={{
                width:82,height:82,borderRadius:10,background:"transparent",
                border:`1.5px dashed ${C.borderDefault}`,cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:5,transition:"border-color 0.2s",
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.amber}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderDefault}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.8">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,color:C.textDisabled}}>ADD PHOTO</span>
              </button>
            )}
          </div>
        </div>

        {/* Findings */}
        <div style={{...fade(0.16),marginBottom:20}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Findings & Notes</div>
          <textarea
            value={findings}
            onChange={e=>setFindings(e.target.value)}
            placeholder="Document anomalies, observations, or follow-up actions required..."
            maxLength={500}
            style={{width:"100%",height:88,background:C.bgElevated,border:`1.5px solid ${C.borderSubtle}`,borderRadius:8,padding:14,resize:"none",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textPrimary,outline:"none",boxSizing:"border-box",lineHeight:1.6}}
            onFocus={e=>e.target.style.borderColor=C.info}
            onBlur={e=>e.target.style.borderColor=C.borderSubtle}
          />
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:failCount>0?C.warning:C.textDisabled}}>
              {failCount>0?`⚠ ${failCount} failed item${failCount>1?"s":""} require follow-up`:""}
            </span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.textDisabled}}>{findings.length}/500</span>
          </div>
        </div>

        {/* Inspector */}
        <div style={{...fade(0.19),marginBottom:28}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.8px",color:C.textSecondary,marginBottom:8,textTransform:"uppercase"}}>Inspector</div>
          <div style={{background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.amberDim,border:`2px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:13,color:C.amber}}>KN</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:14,color:C.textPrimary}}>Katare Nderura</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.amber,marginTop:2}}>Site Supervisor</div>
            </div>
            <div style={{background:C.safeDim,border:`1px solid ${C.safe}33`,borderRadius:5,padding:"4px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.safe,animation:"pulse 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.5px",color:C.safe}}>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:"12px 20px 24px",borderTop:`1px solid ${C.borderSubtle}`,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
        {!complete && (
          <div style={{background:"rgba(245,166,35,0.06)",border:`1px solid ${C.amber}22`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textDisabled}}>
              {!selectedZone ? "Select a zone to continue" : `${CHECKLIST.length-(passCount+failCount+naCount)} item${CHECKLIST.length-(passCount+failCount+naCount)!==1?"s":""} remaining`}
            </span>
          </div>
        )}
        <PrimaryBtn
          label={complete ? "SUBMIT INSPECTION REPORT" : "COMPLETE ALL ITEMS TO SUBMIT"}
          onClick={()=>{ if(complete) onSubmit({selectedZone,passCount,failCount,photos:photos.length}); }}
          disabled={!complete}
          color={failCount>0 ? C.critical : C.safe}
        />
        <GhostBtn label="SAVE AS DRAFT" onClick={()=>{}}/>
      </div>
    </div>
  );
}

// ─── SCREEN 5C: SUCCESS STATE ─────────────────────────────────────────────────

function SubmitSuccess({result, onBack}) {
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const hasIssues = result.failCount > 0;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <BackHeader title="REPORT SUBMITTED" subtitle="Saved to Firestore" onBack={onBack}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:24}}>

        {/* Icon */}
        <div style={{
          width:96,height:96,borderRadius:"50%",
          background:hasIssues?C.criticalDim:C.safeDim,
          border:`2px solid ${hasIssues?C.critical:C.safe}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 40px ${hasIssues?C.critical:C.safe}22`,
          animation:"popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={hasIssues?C.critical:C.safe} strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
        </div>

        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:30,color:C.textPrimary,letterSpacing:"-0.5px"}}>REPORT FILED</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.textSecondary,marginTop:6}}>{result.selectedZone} · Mon 11 May 2026 · 09:41</div>
        </div>

        {/* Summary */}
        <div style={{width:"100%",background:C.bgSurface,border:`1px solid ${C.borderSubtle}`,borderRadius:14,padding:18,display:"flex",flexDirection:"column",gap:12}}>
          {[
            {l:"ZONE",              v:result.selectedZone,           c:null},
            {l:"PASSED",           v:`${result.passCount} items`,   c:C.safe},
            {l:"FAILED",           v:`${result.failCount} items`,   c:result.failCount>0?C.critical:C.textPrimary},
            {l:"PHOTOS ATTACHED",  v:`${result.photos}`,            c:null},
            {l:"INSPECTOR",        v:"K. Nderura · Site Supervisor",c:null},
            {l:"FIREBASE REF",     v:"inspections/rpt_20260511_01", c:C.info},
          ].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.5px",color:C.textDisabled}}>{r.l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:r.c||C.textPrimary,textAlign:"right",maxWidth:190}}>{r.v}</span>
            </div>
          ))}
        </div>

        {hasIssues && (
          <div style={{width:"100%",background:C.warningDim,border:`1px solid ${C.warning}33`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.warning} strokeWidth="2" flexShrink="0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSecondary,lineHeight:1.6}}>{result.failCount} failed item{result.failCount!==1?"s":""} flagged for follow-up. Supervisor has been notified.</span>
          </div>
        )}

        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
          <PrimaryBtn label="BACK TO REPORTS" onClick={onBack} color={hasIssues?C.critical:C.safe}/>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Screen5() {
  const [view, setView] = useState("list"); // list | create | success
  const [submitResult, setSubmitResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const handleSubmit = (result) => {
    setSubmitResult(result);
    setView("success");
  };

  return (
    <div style={{minHeight:"100vh",background:"#1A1C1C",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea::placeholder { color:#4A5252; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
        @keyframes popIn { 0%{transform:scale(0) rotate(-10deg);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#374040;border-radius:2px;}
      `}</style>

      <GrainOverlay/>

      {/* Phone frame */}
      <div style={{
        width:390,height:844,background:C.bgBase,
        borderRadius:44,border:`2px solid ${C.borderSubtle}`,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #272D2D",
        position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",
      }}>
        <StatusBar/>

        {view==="list" && (
          <ReportsList
            onNew={()=>setView("create")}
            onBack={()=>{}}
          />
        )}
        {view==="create" && (
          <CreateReport
            onBack={()=>setView("list")}
            onSubmit={handleSubmit}
          />
        )}
        {view==="success" && (
          <SubmitSuccess
            result={submitResult}
            onBack={()=>setView("list")}
          />
        )}
      </div>

      {/* Hint */}
      <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",textAlign:"center"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#4A5252"}}>
          {view==="list" ? "Tap a card to expand · Tap NEW to create a report" : view==="create" ? "Select zone → mark all items → submit" : "Report filed successfully"}
        </span>
      </div>
    </div>
  );
}
