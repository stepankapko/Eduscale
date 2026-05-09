// Main app — role-aware EduScale prototype
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "density": "comfortable",
  "showRoleHints": true
}/*EDITMODE-END*/;

const App = () => {
  const data = window.EDUSCALE_DATA;

  const [role, setRole] = React.useState(() => localStorage.getItem("eduscale_role") || "participant");
  const initialRoute = {
    participant: "p-events",
    coordinator: "c-overview",
    evaluator:   "e-dashboard",
  };
  const [route, setRoute] = React.useState(() => localStorage.getItem("eduscale_route") || initialRoute[role]);

  // Guard: if persisted route doesn't match the current role's pages, reset.
  // (Roles are prefixed: p-, c-, e-.)
  React.useEffect(() => {
    const prefix = role[0] + "-";
    if (!route || !route.startsWith(prefix)) setRoute(initialRoute[role]);
  }, [role]);

  // Reset route on role switch
  const switchRole = (r) => {
    setRole(r);
    setRoute(initialRoute[r]);
  };
  React.useEffect(() => { localStorage.setItem("eduscale_role", role); }, [role]);
  React.useEffect(() => { localStorage.setItem("eduscale_route", route); }, [route]);

  // Tweaks
  const [tweaks, setTweaks] = React.useState(DEFAULTS);
  const [editMode, setEditMode] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setEditMode(true);
      if (e.data?.type === "__deactivate_edit_mode") setEditMode(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  React.useEffect(() => {
    const map = {
      blue:   { main: "oklch(0.52 0.14 250)", soft: "oklch(0.94 0.04 250)" },
      teal:   { main: "oklch(0.55 0.10 200)", soft: "oklch(0.94 0.03 200)" },
      indigo: { main: "oklch(0.45 0.15 270)", soft: "oklch(0.93 0.04 270)" },
    };
    const c = map[tweaks.accent] || map.blue;
    document.documentElement.style.setProperty("--terra", c.main);
    document.documentElement.style.setProperty("--terra-soft", c.soft);
  }, [tweaks.accent]);

  React.useEffect(() => {
    const sheet = document.getElementById("density-overrides") || Object.assign(document.createElement("style"), { id: "density-overrides" });
    sheet.textContent = tweaks.density === "compact"
      ? `table.data td { padding: 6px 10px !important; } table.data th { padding: 7px 10px !important; }`
      : "";
    if (!sheet.parentElement) document.head.appendChild(sheet);
  }, [tweaks.density]);

  // === Participant profile (live state, persisted). null = not yet registered. ===
  const [profile, setProfile] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("eduscale_p_profile") || "null"); } catch { return null; }
  });
  React.useEffect(() => { localStorage.setItem("eduscale_p_profile", JSON.stringify(profile)); }, [profile]);

  const [mySignups, setMySignups] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("eduscale_p_signups") || '["INT-2026-014"]'); }
    catch { return ["INT-2026-014"]; }
  });
  React.useEffect(() => { localStorage.setItem("eduscale_p_signups", JSON.stringify(mySignups)); }, [mySignups]);

  const signUp = (ivId) => {
    setMySignups(s => s.includes(ivId) ? s : [...s, ivId]);
    // Mirror into data so coordinator/evaluator see it
    const iv = data.interventions.find(i => i.id === ivId);
    if (iv && !iv.signups.includes(ROLES.participant.id)) {
      iv.signups = [...iv.signups, ROLES.participant.id];
      iv.paid    = [...iv.paid,    ROLES.participant.id];
    }
    showToast("Přihláška potvrzena · platba prošla · email odeslán");
  };

  // === Attendance (live state) ===
  const [attendance, setAttendance] = React.useState(() => {
    try {
      const saved = localStorage.getItem("eduscale_attendance");
      if (saved) return JSON.parse(saved);
    } catch {}
    return data.attendance;
  });
  React.useEffect(() => {
    localStorage.setItem("eduscale_attendance", JSON.stringify(attendance));
  }, [attendance]);

  // === Drafts (newly created interventions) ===
  const [drafts, setDrafts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("eduscale_drafts") || "[]"); } catch { return []; }
  });
  React.useEffect(() => { localStorage.setItem("eduscale_drafts", JSON.stringify(drafts)); }, [drafts]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const counts = {
    myInterventions: mySignups.length,
    interventions:   data.interventions.filter(iv => iv.coordinator === ROLES.coordinator.name).length + drafts.length,
    participants:    data.participants.length,
    events:          data.interventions.reduce((a, iv) => a + iv.meetings.length, 0),
  };

  const crumbs = {
    "p-events":    ["EduScale", "Účastník", "Nabídka akcí"],
    "p-mine":      ["EduScale", "Účastník", "Moje intervence"],
    "c-overview":  ["EduScale", "Koordinátor · Kutnohorsko", "Přehled"],
    "c-interventions": ["EduScale", "Koordinátor · Kutnohorsko", "Intervence"],
    "c-create":    ["EduScale", "Koordinátor · Kutnohorsko", "Nová intervence"],
    "c-attendance":["EduScale", "Koordinátor · Kutnohorsko", "Docházka"],
    "c-participants":["EduScale", "Koordinátor · Kutnohorsko", "Účastníci"],
    "e-dashboard": ["EduScale", "Evaluátor", "Dashboard"],
    "e-data":      ["EduScale", "Evaluátor", "Data"],
    "e-people":    ["EduScale", "Evaluátor", "Účastníci"],
    "e-library":   ["EduScale", "Evaluátor", "Knihovna evaluací"],
    "e-assistant": ["EduScale", "Evaluátor", "AI asistent"],
  };

  const heads = {
    "p-events":    { title: "Nabídka",      titleEm: "akcí",         subtitle: "Regionální workshopy, mentoring a setkání. Přihlaste se a po platbě obdržíte potvrzení." },
    "p-mine":      { title: "Moje",         titleEm: "intervence",   subtitle: "Vaše přihlášené série setkání s postupem." },
    "c-overview":  { title: "Přehled",      titleEm: "regionu",      subtitle: "Vaše intervence, nadcházející setkání a postup docházky." },
    "c-interventions": { title: "Intervence", titleEm: "Kutnohorsko", subtitle: "Spravujte intervence — od konceptu po uzavření docházky." },
    "c-create":    { title: "Nová",         titleEm: "intervence",   subtitle: "Většina polí je předvyplněna. Procházejte kroky — vše je výběrem ze seznamu." },
    "c-attendance":{ title: "Docházka",     titleEm: "& setkání",    subtitle: "Po každém setkání odškrtejte přítomné účastníky. Záznam putuje rovnou do databáze." },
    "c-participants":{ title: "Databáze",   titleEm: "účastníků",    subtitle: "Všichni registrovaní v regionu. Identifikováni unikátním ID — žádné duplicity." },
    "e-dashboard": { title: "Evaluační",    titleEm: "dashboard",    subtitle: "Agregované pohledy ze všech intervencí a regionů. Filtrujte dle CPV / tématu / cílové skupiny / školního roku." },
    "e-data":      { title: "Data",         titleEm: "& záznamy",    subtitle: "Surová data — matice docházky pro každou intervenci, export." },
    "e-people":    { title: "Účastníci",    titleEm: "cross-region", subtitle: "Unikátní osoby napříč intervencemi · deduplikováno přes ID." },
    "e-library":   { title: "Knihovna",     titleEm: "evaluací",     subtitle: "Reporty, přepisy, metodiky — všechny zdroje pro evaluační tým." },
    "e-assistant": { title: "AI",            titleEm: "asistent",     subtitle: "RAG asistent nad knihovnou — interpretuje přepisy, reporty a metodiky. Citace v odpovědi vedou zpět na zdroj." },
  };

  const topActions = role === "participant" ? (
    <>
      <Chip tone="moss" dot>{profile?.id || "P-2031"}</Chip>
      <button className="btn btn-sm" onClick={() => setRoute("p-events")}><Icon name="calendar" size={12}/> Najít akci</button>
    </>
  ) : role === "coordinator" ? (
    <>
      <Chip tone="terra" dot>Region KUT</Chip>
      <button className="btn btn-sm btn-terra" onClick={() => setRoute("c-create")}><Icon name="plus" size={12}/> Nová intervence</button>
    </>
  ) : (
    <>
      <Chip>Školní rok 2025/26</Chip>
      <button className="btn btn-sm"><Icon name="download" size={12}/> Export</button>
    </>
  );

  // === Participant onboarding gate: show standalone screen until profile saved ===
  if (role === "participant" && !profile) {
    return (
      <div className="app onboarding">
        <ParticipantOnboarding data={data} setProfile={setProfile} showToast={showToast}/>
        <div className="onboarding-rolebar">
          <span className="muted" style={{ fontSize: 11 }}>demo:</span>
          <RoleSwitcher role={role} setRole={switchRole}/>
        </div>
        {toast && <div className="toast"><Icon name="check" size={14}/> {toast}</div>}
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar role={role} route={route} setRoute={setRoute} counts={counts} profile={profile}/>
      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            {(crumbs[route] || crumbs[initialRoute[role]]).map((c, i, arr) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>}
                {i === arr.length - 1 ? <strong>{c}</strong> : c}
              </React.Fragment>
            ))}
          </div>
          <div className="topbar-actions">
            <RoleSwitcher role={role} setRole={switchRole}/>
            {topActions}
          </div>
        </div>

        <div className="page">
          <PageHead {...(heads[route] || heads[initialRoute[role]])}/>

          {role === "participant" && (
            <ParticipantApp
              data={data} route={route} setRoute={setRoute} showToast={showToast}
              profile={profile} setProfile={setProfile}
              mySignups={mySignups} signUp={signUp}
            />
          )}
          {role === "coordinator" && (
            <CoordinatorApp
              data={data} route={route} setRoute={setRoute} showToast={showToast}
              attendance={attendance} setAttendance={setAttendance}
              drafts={drafts} setDrafts={setDrafts}
            />
          )}
          {role === "evaluator" && (
            <EvaluatorApp data={data} route={route} attendance={attendance}/>
          )}
        </div>
      </div>

      {editMode && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setEditMode(false)}/>}

      {toast && (
        <div className="toast">
          <Icon name="check" size={14}/> {toast}
        </div>
      )}
    </div>
  );
};

const TweaksPanel = ({ tweaks, setTweaks, onClose }) => {
  const update = (k, v) => {
    setTweaks(t => ({ ...t, [k]: v }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
  };
  return (
    <div className="tweaks-panel">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <h4>Tweaks</h4>
        <button onClick={() => { onClose(); window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*"); }} style={{ background: "none", border: "none", color: "var(--ink-300)", cursor: "pointer" }}><Icon name="x" size={14}/></button>
      </div>
      <div className="tweak-row">
        <label>Akcent</label>
        <div className="tweak-seg">
          {["blue","teal","indigo"].map(c => <button key={c} className={tweaks.accent === c ? "on" : ""} onClick={() => update("accent", c)}>{c}</button>)}
        </div>
      </div>
      <div className="tweak-row">
        <label>Hustota</label>
        <div className="tweak-seg">
          {["comfortable","compact"].map(c => <button key={c} className={tweaks.density === c ? "on" : ""} onClick={() => update("density", c)}>{c}</button>)}
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
