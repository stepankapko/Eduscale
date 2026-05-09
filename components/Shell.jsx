// Icons + small shared components
const Icon = ({ name, size = 16 }) => {
  const paths = {
    upload: <><path d="M12 15V3M12 3L7 8M12 3L17 8" /><path d="M3 15V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V15" /></>,
    records: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9H21M9 4V20" /></>,
    reports: <><path d="M3 3V21H21" /><path d="M7 15L11 11L14 14L19 8" /></>,
    library: <><path d="M4 4H10V20H4ZM10 4H16L18 20H12Z" /><path d="M18 4L22 4L20 20" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21L16 16" /></>,
    filter: <><path d="M4 6H20M7 12H17M10 18H14" /></>,
    check: <><path d="M4 12L9 17L20 6" /></>,
    plus: <><path d="M12 5V19M5 12H19" /></>,
    x: <><path d="M18 6L6 18M6 6L18 18" /></>,
    chevron: <><path d="M9 6L15 12L9 18" /></>,
    down: <><path d="M6 9L12 15L18 9" /></>,
    arrow: <><path d="M5 12H19M19 12L13 6M19 12L13 18" /></>,
    download: <><path d="M12 3V15M12 15L7 10M12 15L17 10" /><path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" /></>,
    file: <><path d="M13 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V9L13 2Z" /><path d="M13 2V9H20" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M3 20C3 16.7 5.7 14 9 14S15 16.7 15 20" /><circle cx="17" cy="9" r="3" /><path d="M21 20C21 17.2 19.2 15 17 15" /></>,
    school: <><path d="M3 10L12 4L21 10" /><path d="M5 10V20H19V10" /><rect x="9" y="13" width="6" height="7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10H21M8 3V7M16 3V7" /></>,
    sparkle: <><path d="M12 3L13.5 9L20 10.5L13.5 12L12 18L10.5 12L4 10.5L10.5 9Z" /></>,
    dot: <><circle cx="12" cy="12" r="4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15A1.6 1.6 0 0020 13.5L21.4 12.4A1 1 0 0021.6 11.1L19.7 7.9A1 1 0 0018.4 7.5L16.7 8.1A1.6 1.6 0 0115.1 7.8" /></>,
    ticket: <><path d="M2 9V7C2 6 3 5 4 5H20C21 5 22 6 22 7V9" /><path d="M2 15V17C2 18 3 19 4 19H20C21 19 22 18 22 17V15" /><path d="M2 9C3.5 9 4.5 10 4.5 12S3.5 15 2 15" /><path d="M22 9C20.5 9 19.5 10 19.5 12S20.5 15 22 15" /></>,
    clipboard: <><rect x="6" y="4" width="12" height="18" rx="1" /><path d="M9 4V2H15V4" /><path d="M9 12L11 14L15 10" /></>,
    badge: <><path d="M12 2L4 6V12C4 17 7 21 12 22C17 21 20 17 20 12V6Z" /></>,
    pin: <><path d="M12 2C8 2 6 4 6 7L7 11L4 13V15H10L11 22H13L14 15H20V13L17 11L18 7C18 4 16 2 12 2Z" /></>,
    money: <><circle cx="12" cy="12" r="9" /><path d="M9 9C9 7.9 9.9 7 11 7H13C14.1 7 15 7.9 15 9C15 10.1 14.1 11 13 11H11C9.9 11 9 11.9 9 13C9 14.1 9.9 15 11 15H13C14.1 15 15 14.1 15 13" /><path d="M12 5V7M12 15V17" /></>,
    drag: <><circle cx="9" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="15" cy="18" r="1.2" /></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>);

};

const Logo = () =>
<div className="logo">
    <div>
      <div className="logo-mark">Edu<em style={{ fontWeight: "600" }}>Scale</em></div>
      <div className="logo-sub">ENGINE</div>
    </div>
  </div>;


const ROLES = {
  participant: { name: "Jana Nováková", subtitle: "Účastník · ZŠ Palacha", initials: "JN", id: "P-2031" },
  coordinator: { name: "Lucie Horáková", subtitle: "Regionální koordinátor · KUT", initials: "LH" },
  evaluator: { name: "Štěpán Marek", subtitle: "Evaluační tým · Eduzměna", initials: "ŠM" }
};

const RoleSwitcher = ({ role, setRole }) => {
  const labels = {
    participant: "Účastník",
    coordinator: "Reg. koordinátor",
    evaluator: "Evaluátor"
  };
  return (
    <div className="role-switcher" title="Demo: přepnout roli">
      {Object.keys(labels).map((k) =>
      <button key={k} className={role === k ? "on" : ""} onClick={() => setRole(k)}>
          {labels[k]}
        </button>
      )}
    </div>);

};

const UserCard = ({ role, profile }) => {
  const r = ROLES[role];
  const isParticipant = role === "participant";
  const name = isParticipant && profile ? `${profile.firstName} ${profile.lastName}` : r.name;
  const initials = isParticipant && profile ? (profile.firstName[0] + profile.lastName[0]).toUpperCase() : r.initials;
  const subtitle = isParticipant && profile ? `Účastník · ${profile.id}` : r.subtitle;
  return (
    <div className="user-card">
      <div className="avatar">{initials}</div>
      <div style={{ minWidth: 0 }}>
        <div className="user-name">{name}</div>
        <div className="user-role">{subtitle}</div>
      </div>
    </div>);

};

const Sidebar = ({ role, route, setRoute, counts, profile }) => {
  const nav = {
    participant: [
    { key: "p-events", label: "Nabídka akcí", icon: "calendar" },
    { key: "p-mine", label: "Moje intervence", icon: "ticket", count: counts.myInterventions }],

    coordinator: [
    { key: "c-overview", label: "Přehled", icon: "reports" },
    { key: "c-interventions", label: "Intervence", icon: "clipboard", count: counts.interventions },
    { key: "c-create", label: "Nová intervence", icon: "plus" },
    { key: "c-attendance", label: "Docházka & setkání", icon: "users" },
    { key: "c-participants", label: "Databáze účastníků", icon: "school", count: counts.participants }],

    evaluator: [
    { key: "e-dashboard", label: "Dashboard", icon: "reports" },
    { key: "e-data", label: "Data & záznamy", icon: "records", count: counts.events },
    { key: "e-people", label: "Účastníci", icon: "users", count: counts.participants },
    { key: "e-library", label: "Knihovna evaluací", icon: "library" },
    { key: "e-assistant", label: "AI asistent", icon: "sparkle" }]

  };
  const items = nav[role];
  return (
    <aside className="sidebar">
      <Logo />
      <div className="nav-section-label">{role === "participant" ? "Účastnický portál" : role === "coordinator" ? "Pracovní plocha" : "Evaluace"}</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) =>
        <div key={it.key}
        className={`nav-item ${route === it.key ? 'active' : ''}`}
        onClick={() => setRoute(it.key)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
            {it.count != null && <span className="nav-count">{it.count}</span>}
          </div>
        )}
      </nav>
      <UserCard role={role} profile={profile} />
    </aside>);

};

const TopBar = ({ crumbs, actions }) =>
<div className="topbar">
    <div className="crumbs">
      {crumbs.map((c, i) =>
    <React.Fragment key={i}>
          {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>}
          {i === crumbs.length - 1 ? <strong>{c}</strong> : c}
        </React.Fragment>
    )}
    </div>
    <div className="topbar-actions">{actions}</div>
  </div>;


const PageHead = ({ title, titleEm, subtitle, actions }) =>
<div className="page-head">
    <div>
      <h1 className="page-title">{title} {titleEm && <em>{titleEm}</em>}</h1>
      <div className="page-subtitle">{subtitle}</div>
    </div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>;


const Chip = ({ tone = "", children, dot }) =>
<span className={`chip ${tone}`}>
    {dot && <span className="chip-dot" />}{children}
  </span>;


const Metric = ({ label, value, unit, delta, deltaDir }) =>
<div className="metric">
    <div className="metric-label">{label}</div>
    <div className="metric-value">
      {value}{unit && <span className="unit">{unit}</span>}
    </div>
    {delta && <div className={`metric-delta ${deltaDir}`}>
      {deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '·'} {delta}
    </div>}
  </div>;


// === Picker chips: pick exactly one from a list. No typing. ===
const PickList = ({ options, value, onChange, columns = 2 }) =>
<div className="pick-list" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {options.map((opt) => {
    const k = typeof opt === "string" ? opt : opt.code;
    const label = typeof opt === "string" ? opt : opt.name;
    const sub = typeof opt === "string" ? null : opt.sub;
    const sel = value === k;
    return (
      <button key={k} type="button" className={`pick ${sel ? "on" : ""}`} onClick={() => onChange(k)}>
          <div className="pick-main">{label}</div>
          {sub && <div className="pick-sub">{sub}</div>}
          {sel && <span className="pick-check"><Icon name="check" size={12} /></span>}
        </button>);

  })}
  </div>;


const EmptyState = ({ title, desc, cta, onCta, icon = "info" }) =>
<div className="empty">
    <div className="empty-ic"><Icon name={icon} size={26} /></div>
    <div className="empty-title">{title}</div>
    {desc && <div className="empty-desc">{desc}</div>}
    {cta && <button className="btn btn-terra" onClick={onCta} style={{ marginTop: 14 }}>{cta}</button>}
  </div>;


Object.assign(window, { Icon, Logo, RoleSwitcher, UserCard, Sidebar, TopBar, PageHead, Chip, Metric, PickList, EmptyState, ROLES });