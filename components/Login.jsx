// === Login screen — fake auth, pick a role ===
const LoginScreen = ({ onLogin }) => {
  const [picked, setPicked] = React.useState(null);

  const go = (r) => {
    setPicked(r);
    setTimeout(() => onLogin(r), 220);
  };

  return (
    <div className="login-shell">
      <div className="login-grid-bg" aria-hidden="true"/>

      <header className="login-top">
        <div className="logo">
          <div>
            <div className="logo-mark">Edu<em>Scale</em></div>
            <div className="logo-sub">engine · v0.6</div>
          </div>
        </div>
        <div className="login-top-meta mono">
          <span>demo prostředí</span>
          <span className="login-dot"/>
          <span>2025/26</span>
        </div>
      </header>

      <main className="login-main">
        <div className="login-hero">
          <div className="login-eyebrow mono">Přihlášení · Single sign-on</div>
          <h1 className="login-title">
            Vítejte zpět.<br/>
            <em>Vyberte svou roli.</em>
          </h1>
          <p className="login-lede">
            EduScale Engine je interní nástroj pro&nbsp;regionální koordinátory a&nbsp;evaluační tým.
            Účastníci do&nbsp;systému nepřistupují — zapisují je sami koordinátoři nebo evaluátoři.
          </p>
          <ul className="login-bullets">
            <li><Icon name="check" size={12}/> <span>Žádné registrace ze&nbsp;strany učitelů</span></li>
            <li><Icon name="check" size={12}/> <span>Plně auditovaná docházka a&nbsp;intervence</span></li>
            <li><Icon name="check" size={12}/> <span>Cross-region reporting a&nbsp;AI nad knihovnou</span></li>
          </ul>
        </div>

        <div className="login-roles">
          <button
            className={`login-role ${picked === "coordinator" ? "picked" : ""}`}
            onClick={() => go("coordinator")}>
            <div className="login-role-head">
              <div className="login-role-glyph"><Icon name="pin" size={20}/></div>
              <div className="login-role-tag mono">Region</div>
            </div>
            <div className="login-role-name">Regionální koordinátor</div>
            <div className="login-role-person">
              <div className="avatar">LH</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>Lucie Horáková</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>CPV Kutnohorsko · KUT</div>
              </div>
            </div>
            <ul className="login-role-can">
              <li><Icon name="dot" size={8}/> přehled regionu</li>
              <li><Icon name="dot" size={8}/> vlastní intervence a&nbsp;docházka</li>
              <li><Icon name="dot" size={8}/> databáze účastníků</li>
            </ul>
            <div className="login-role-cta">
              Přihlásit se jako koordinátor <Icon name="arrow" size={14}/>
            </div>
          </button>

          <button
            className={`login-role evaluator ${picked === "evaluator" ? "picked" : ""}`}
            onClick={() => go("evaluator")}>
            <div className="login-role-head">
              <div className="login-role-glyph"><Icon name="sparkle" size={20}/></div>
              <div className="login-role-tag mono">Eduzměna · národní</div>
            </div>
            <div className="login-role-name">Evaluátor</div>
            <div className="login-role-person">
              <div className="avatar" style={{ background: "var(--ink-900)" }}>ŠM</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>Štěpán Marek</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>Evaluační tým · Eduzměna</div>
              </div>
            </div>
            <ul className="login-role-can">
              <li><Icon name="dot" size={8}/> cross-region reporting</li>
              <li><Icon name="dot" size={8}/> správa intervencí a&nbsp;účastníků</li>
              <li><Icon name="dot" size={8}/> knihovna evaluací + AI asistent</li>
            </ul>
            <div className="login-role-cta">
              Přihlásit se jako evaluátor <Icon name="arrow" size={14}/>
            </div>
          </button>
        </div>
      </main>

      <footer className="login-foot mono">
        <span>EduScale Engine · prototyp pro&nbsp;Eduzměnu</span>
        <span>·</span>
        <span>žádné účastnické přihlášení — data spravuje koordinátor / evaluátor</span>
      </footer>
    </div>
  );
};

Object.assign(window, { LoginScreen });
