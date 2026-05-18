// Main app — role-aware EduScale prototype (coordinator + evaluator only)
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "density": "comfortable"
}/*EDITMODE-END*/;

const App = () => {
  const baseData = window.EDUSCALE_DATA;

  // ====== Login / role state ======
  const [role, setRole] = React.useState(() => {
    const saved = localStorage.getItem("eduscale_role");
    if (saved === "coordinator" || saved === "evaluator") return saved;
    return null;
  });
  const initialRoute = {
    coordinator: "c-overview",
    evaluator:   "e-dashboard",
  };
  const [route, setRoute] = React.useState(() => localStorage.getItem("eduscale_route") || (role ? initialRoute[role] : "c-overview"));

  // Guard route prefix
  React.useEffect(() => {
    if (!role) return;
    const prefix = role[0] + "-";
    if (!route || !route.startsWith(prefix)) setRoute(initialRoute[role]);
  }, [role]);

  React.useEffect(() => { if (role) localStorage.setItem("eduscale_role", role); else localStorage.removeItem("eduscale_role"); }, [role]);
  React.useEffect(() => { localStorage.setItem("eduscale_route", route); }, [route]);

  const login = (r) => {
    setRole(r);
    setRoute(initialRoute[r]);
  };
  const logout = () => {
    setRole(null);
  };

  // ====== Tweaks ======
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

  // ====== Lifted live state — participants, interventions, library docs ======
  const [participants, setParticipants] = React.useState(() => {
    try {
      const saved = localStorage.getItem("eduscale_participants");
      if (saved) return JSON.parse(saved);
    } catch {}
    return baseData.participants;
  });
  React.useEffect(() => { localStorage.setItem("eduscale_participants", JSON.stringify(participants)); }, [participants]);

  const [interventions, setInterventions] = React.useState(() => {
    try {
      const saved = localStorage.getItem("eduscale_interventions");
      if (saved) return JSON.parse(saved);
    } catch {}
    return baseData.interventions;
  });
  React.useEffect(() => { localStorage.setItem("eduscale_interventions", JSON.stringify(interventions)); }, [interventions]);

  const [libraryDocs, setLibraryDocs] = React.useState(() => {
    try {
      const saved = localStorage.getItem("eduscale_library");
      if (saved) return JSON.parse(saved);
    } catch {}
    return window.INITIAL_LIBRARY || [];
  });
  React.useEffect(() => { localStorage.setItem("eduscale_library", JSON.stringify(libraryDocs)); }, [libraryDocs]);

  // ====== Attendance ======
  const [attendance, setAttendance] = React.useState(() => {
    try {
      const saved = localStorage.getItem("eduscale_attendance");
      if (saved) return JSON.parse(saved);
    } catch {}
    return baseData.attendance;
  });
  React.useEffect(() => { localStorage.setItem("eduscale_attendance", JSON.stringify(attendance)); }, [attendance]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ====== Mutators ======
  const addParticipant = (p) => setParticipants(xs => [p, ...xs]);

  const addIntervention = (iv) => {
    setInterventions(xs => [iv, ...xs]);
    // seed attendance for new intervention
    setAttendance(a => {
      const next = { ...a, [iv.id]: {} };
      iv.meetings.forEach(m => { next[iv.id][m.id] = {}; });
      return next;
    });
  };

  const updateIntervention = (id, patch) => {
    setInterventions(xs => xs.map(iv => iv.id === id ? { ...iv, ...patch } : iv));
  };

  const addLibraryDoc = (d) => setLibraryDocs(xs => [d, ...xs]);

  // Drafts kept for backward-compat with coordinator's create flow (it pushes to drafts)
  const [drafts, setDrafts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("eduscale_drafts") || "[]"); } catch { return []; }
  });
  React.useEffect(() => { localStorage.setItem("eduscale_drafts", JSON.stringify(drafts)); }, [drafts]);

  // Live data — coordinator + evaluator read this so changes propagate both ways
  const data = React.useMemo(() => ({
    ...baseData,
    participants,
    interventions: [...interventions, ...drafts],
  }), [baseData, participants, interventions, drafts]);

  // ====== If not logged in, show login screen ======
  if (!role) {
    return <LoginScreen onLogin={login}/>;
  }

  const counts = {
    interventions:   data.interventions.length,
    participants:    participants.length,
    events:          data.interventions.reduce((a, iv) => a + iv.meetings.length, 0),
    libraryDocs:     libraryDocs.length,
  };

  const crumbs = {
    "c-overview":  ["EduScale", "Koordinátor · Kutnohorsko", "Přehled"],
    "c-interventions": ["EduScale", "Koordinátor · Kutnohorsko", "Intervence"],
    "c-create":    ["EduScale", "Koordinátor · Kutnohorsko", "Nová intervence"],
    "c-attendance":["EduScale", "Koordinátor · Kutnohorsko", "Docházka"],
    "c-participants":["EduScale", "Koordinátor · Kutnohorsko", "Účastníci"],
    "e-dashboard": ["EduScale", "Evaluátor", "Dashboard"],
    "e-interventions": ["EduScale", "Evaluátor", "Intervence"],
    "e-people":    ["EduScale", "Evaluátor", "Účastníci"],
    "e-library":   ["EduScale", "Evaluátor", "Knihovna evaluací"],
    "e-assistant": ["EduScale", "Evaluátor", "AI asistent"],
  };

  const heads = {
    "c-overview":  { title: "Přehled",      titleEm: "regionu",      subtitle: "Vaše intervence, nadcházející setkání a postup docházky." },
    "c-interventions": { title: "Intervence", titleEm: "Kutnohorsko", subtitle: "Spravujte intervence — od konceptu po uzavření docházky." },
    "c-create":    { title: "Nová",         titleEm: "intervence",   subtitle: "Většina polí je předvyplněna. Procházejte kroky — vše je výběrem ze seznamu." },
    "c-attendance":{ title: "Docházka",     titleEm: "& setkání",    subtitle: "Po každém setkání odškrtejte přítomné účastníky. Záznam putuje rovnou do databáze." },
    "c-participants":{ title: "Databáze",   titleEm: "účastníků",    subtitle: "Všichni registrovaní v regionu. Identifikováni unikátním ID — žádné duplicity." },
    "e-dashboard": { title: "Evaluační",    titleEm: "dashboard",    subtitle: "Agregované pohledy ze všech intervencí a regionů. AI asistent pro hlubší dotazy." },
    "e-interventions": { title: "Intervence", titleEm: "cross-region", subtitle: "Knihovna všech intervencí — minulých i nadcházejících. Vytvořte novou nebo přiřaďte účastníky ručně." },
    "e-people":    { title: "Knihovna",     titleEm: "účastníků",    subtitle: "Ručně spravovaná databáze. Účastníci se sami neregistrují — vy je zapisujete." },
    "e-library":   { title: "Knihovna",     titleEm: "evaluací",     subtitle: "Evaluační zprávy a přepisy. Nahrávejte se štítky rok a region — slouží jako podklad pro AI asistenta." },
    "e-assistant": { title: "AI",           titleEm: "asistent",     subtitle: "RAG asistent nad knihovnou — interpretuje přepisy a reporty. Citace v odpovědi vedou zpět na zdroj." },
  };

  const topActions = role === "coordinator" ? (
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

  return (
    <div className="app">
      <Sidebar role={role} route={route} setRoute={setRoute} counts={counts} onLogout={logout}/>
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
            {topActions}
            <button className="btn btn-sm btn-ghost" onClick={logout} title="Odhlásit se">
              <Icon name="x" size={12}/> Odhlásit
            </button>
          </div>
        </div>

        <div className="page">
          <PageHead {...(heads[route] || heads[initialRoute[role]])}/>

          {role === "coordinator" && (
            <CoordinatorApp
              data={data} route={route} setRoute={setRoute} showToast={showToast}
              attendance={attendance} setAttendance={setAttendance}
              drafts={drafts} setDrafts={setDrafts}
            />
          )}
          {role === "evaluator" && (
            <EvaluatorApp
              data={data} route={route} setRoute={setRoute} showToast={showToast}
              attendance={attendance}
              participants={participants} addParticipant={addParticipant}
              interventions={data.interventions} addIntervention={addIntervention} updateIntervention={updateIntervention}
              libraryDocs={libraryDocs} addLibraryDoc={addLibraryDoc}
            />
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
