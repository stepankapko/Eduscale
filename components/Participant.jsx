// === Participant: browse events + signups (registration is a separate screen — see ParticipantOnboarding) ===
const ParticipantApp = ({ data, route, setRoute, showToast, profile, setProfile, mySignups, signUp }) => {
  const [editingProfile, setEditingProfile] = React.useState(false);
  return (
    <>
      {route === "p-events" && (
        <EventBrowser data={data} mySignups={mySignups} signUp={signUp} setRoute={setRoute}/>
      )}
      {route === "p-mine" && (
        <MyInterventions data={data} mySignups={mySignups} setRoute={setRoute}/>
      )}
      {editingProfile && (
        <ProfileEditModal data={data} profile={profile} setProfile={setProfile} onClose={() => setEditingProfile(false)} showToast={showToast}/>
      )}
      <button className="profile-fab" onClick={() => setEditingProfile(true)} title="Upravit profil">
        <Icon name="badge" size={14}/> Profil
      </button>
    </>
  );
};

// === Standalone onboarding screen — shown before participant has saved a profile ===
const ParticipantOnboarding = ({ data, setProfile, showToast }) => {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName:  "",
    email:     "",
    redizo:    "",
    role:      "",
    experience: "",
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const complete = form.firstName.trim() && form.lastName.trim() && emailValid && form.redizo && form.role && form.experience;

  // Step progression — visual cue
  const stepDone = {
    1: !!(form.firstName.trim() && form.lastName.trim()),
    2: !!form.redizo,
    3: emailValid,
    4: !!form.role,
    5: !!form.experience,
  };
  const stepCount = Object.values(stepDone).filter(Boolean).length;

  const submit = () => {
    if (!complete) return;
    setProfile({ ...form, id: "P-2031" });
    showToast("Profil uložen · ID P-2031 přiděleno · vítejte v EduScale");
  };

  return (
    <div className="onboarding-shell">
      <div className="onboarding-header">
        <div className="logo">
          <div>
            <div className="logo-mark">Edu<em>Scale</em></div>
            <div className="logo-sub">engine · v0.5</div>
          </div>
        </div>
        <div className="onboard-progress mono">
          krok {stepCount}/5
          <div className="onboard-progress-bar"><div style={{ width: `${(stepCount/5)*100}%` }}/></div>
        </div>
      </div>

      <div className="onboarding-grid">
        <div className="onboarding-hero">
          <div className="onboarding-eyebrow mono">Registrace účastníka</div>
          <h1 className="onboarding-title">Vítejte v <em>EduScale</em>.<br/>Pojďme založit váš profil.</h1>
          <p className="onboarding-lede">
            Profil vyplníte jednou. Slouží napříč všemi intervencemi — koordinátor s vaším ID
            potvrdí účast bez přepisování jména a školy.
          </p>
          <div className="onboarding-bullets">
            <div><Icon name="badge" size={14}/> <span>Unikátní ID účastníka</span></div>
            <div><Icon name="school" size={14}/> <span>Propojení se školou z rejstříku</span></div>
            <div><Icon name="ticket" size={14}/> <span>Přístup k regionálním akcím</span></div>
          </div>
          <div className="onboarding-card-preview">
            <div className="profile-id-card" style={{ marginTop: 0 }}>
              <div className="profile-id-stripe"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-sub">Náhled karty</div>
                <div className="profile-name">{form.firstName || "Jméno"} {form.lastName || "Příjmení"}</div>
                <div className="mono" style={{ color: "var(--ink-500)", fontSize: 11 }}>{form.email || "email@…"}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {form.role && <Chip tone="terra" dot>{form.role}</Chip>}
                  {form.experience && <Chip>{form.experience}</Chip>}
                  {form.redizo && <Chip tone="plum">{data.schools.find(s => s.redizo === form.redizo)?.name}</Chip>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="onboarding-form">
          <div className="card">
            <FormStep n={1} label="Jméno a příjmení" done={stepDone[1]}/>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Zadejte své jméno přesně tak, jak má být uvedeno na prezenční listině.</div>
            <div className="grid-2">
              <div className="field">
                <div className="label">Křestní jméno</div>
                <input className="input input-lg" autoFocus placeholder="např. Jana" value={form.firstName} onChange={e => set("firstName")(e.target.value)}/>
              </div>
              <div className="field">
                <div className="label">Příjmení</div>
                <input className="input input-lg" placeholder="např. Nováková" value={form.lastName} onChange={e => set("lastName")(e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="card">
            <FormStep n={2} label="Škola / instituce" done={stepDone[2]}/>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Vyberte z rejstříku škol — bez přepisování. Hledá se dle názvu i REDIZO.</div>
            <SchoolPicker schools={data.schools} value={form.redizo} onChange={set("redizo")}/>
          </div>

          <div className="card">
            <FormStep n={3} label="Email" done={stepDone[3]}/>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Pracovní email, na který obdržíte potvrzení přihlášek.</div>
            <input className="input input-lg" type="email" placeholder="jana.novakova@skola.cz" value={form.email} onChange={e => set("email")(e.target.value)}/>
            {form.email && !emailValid && <div className="hint hint-warn">Email musí obsahovat @ a doménu.</div>}
          </div>

          <div className="card">
            <FormStep n={4} label="Role" done={stepDone[4]}/>
            <PickList
              options={data.participantRoles.map(r => ({ code: r, name: r }))}
              value={form.role} onChange={set("role")} columns={3}
            />
          </div>

          <div className="card">
            <FormStep n={5} label="Délka profesní praxe" done={stepDone[5]}/>
            <div className="experience-slider">
              {data.experienceBands.map((b, i) => (
                <button key={b} type="button"
                  className={`exp-band ${form.experience === b ? "on" : ""}`}
                  onClick={() => set("experience")(b)}>
                  <div className="exp-band-num">{i+1}</div>
                  <div className="exp-band-label">{b}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card profile-actions">
            <div>
              <div className="card-sub">Stav registrace</div>
              <div className="card-title" style={{ fontSize: 16 }}>
                {complete ? "Profil je připraven k uložení" : `Zbývá ${5 - stepCount} ${5 - stepCount === 1 ? "krok" : 5 - stepCount < 5 ? "kroky" : "kroků"}`}
              </div>
            </div>
            <button className="btn btn-terra btn-lg" disabled={!complete} onClick={submit}>
              <Icon name="check" size={14}/> Vytvořit účet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profile edit modal — opened from the floating Profil button ---
const ProfileEditModal = ({ data, profile, setProfile, onClose, showToast }) => {
  const [form, setForm] = React.useState(profile);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const valid = form.firstName.trim() && form.lastName.trim() && emailValid && form.redizo && form.role && form.experience;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="card-sub">Účastnický identifikátor · {profile.id}</div>
            <div className="card-title">Upravit profil</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-2">
            <div className="field">
              <div className="label">Křestní jméno</div>
              <input className="input" value={form.firstName} onChange={e => set("firstName")(e.target.value)}/>
            </div>
            <div className="field">
              <div className="label">Příjmení</div>
              <input className="input" value={form.lastName} onChange={e => set("lastName")(e.target.value)}/>
            </div>
          </div>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" type="email" value={form.email} onChange={e => set("email")(e.target.value)}/>
          </div>
          <div className="field">
            <div className="label">Škola</div>
            <SchoolPicker schools={data.schools} value={form.redizo} onChange={set("redizo")}/>
          </div>
          <div className="field">
            <div className="label">Role</div>
            <PickList options={data.participantRoles.map(r => ({ code: r, name: r }))} value={form.role} onChange={set("role")} columns={3}/>
          </div>
          <div className="field">
            <div className="label">Délka profesní praxe</div>
            <div className="experience-slider">
              {data.experienceBands.map((b, i) => (
                <button key={b} type="button" className={`exp-band ${form.experience === b ? "on" : ""}`} onClick={() => set("experience")(b)}>
                  <div className="exp-band-num">{i+1}</div>
                  <div className="exp-band-label">{b}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button className="btn" onClick={onClose}>Zrušit</button>
            <button className="btn btn-terra" disabled={!valid} onClick={() => { setProfile(form); showToast("Profil aktualizován"); onClose(); }}>
              <Icon name="check" size={14}/> Uložit změny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormStep = ({ n, label, done }) => (
  <div className="form-step">
    <div className={`step-num ${done ? "done" : ""}`}>{done ? <Icon name="check" size={12}/> : n}</div>
    <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: "-0.01em" }}>{label}</div>
  </div>
);

// --- SchoolPicker: filter + pick (no free text in answer) ---
const SchoolPicker = ({ schools, value, onChange }) => {
  const [q, setQ] = React.useState("");
  const filtered = schools.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.redizo.includes(q));
  return (
    <div>
      <div className="filterbar" style={{ padding: 8, marginBottom: 10 }}>
        <Icon name="search" size={14}/>
        <input className="input" placeholder="filtrovat (jen pomoc — nelze přepsat výsledek)" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, border: "none", background: "transparent" }}/>
      </div>
      <div className="school-list">
        {filtered.map(s => (
          <button key={s.redizo} type="button" className={`school-row ${value === s.redizo ? "on" : ""}`} onClick={() => onChange(s.redizo)}>
            <div className="school-type">{s.type}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="school-name">{s.name}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>REDIZO {s.redizo}</div>
            </div>
            {value === s.redizo && <Icon name="check" size={14}/>}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Event browser (Luma-like) ---
const EventBrowser = ({ data, mySignups, signUp, setRoute }) => {
  const [filter, setFilter] = React.useState("all");
  const [paying, setPaying] = React.useState(null);

  const list = data.interventions.filter(iv => {
    if (filter === "all") return true;
    if (filter === "free") return iv.price === 0;
    if (filter === "paid") return iv.price > 0;
    return iv.region === filter;
  });

  return (
    <div>
      <div className="filterbar">
        <div className="label">Filtr</div>
        <div className="seg">
          {[
            { k: "all",  label: "Vše" },
            { k: "free", label: "Zdarma" },
            { k: "paid", label: "Placené" },
            ...data.regions.filter(r => r.active).map(r => ({ k: r.code, label: r.name })),
          ].map(o => (
            <button key={o.k} className={filter === o.k ? "on" : ""} onClick={() => setFilter(o.k)}>{o.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} className="muted">{list.length} akcí</div>
      </div>

      <div className="event-grid">
        {list.map(iv => {
          const signed = mySignups.includes(iv.id);
          const left   = iv.capacity - iv.signups.length;
          const start  = iv.meetings[0];
          return (
            <div key={iv.id} className={`event-card ${signed ? "signed" : ""}`}>
              <div className="event-head">
                <div className="event-date">
                  <div className="event-date-day">{start.date.slice(8)}</div>
                  <div className="event-date-month mono">{start.date.slice(5,7)}/{start.date.slice(2,4)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="event-title">{iv.name}</div>
                  <div className="event-meta">
                    <Chip tone="terra" dot>{data.regions.find(r => r.code === iv.region)?.name}</Chip>
                    <Chip>{data.interventionTypes.find(t => t.code === iv.typeCode)?.name}</Chip>
                    <Chip tone="plum">{iv.target}</Chip>
                  </div>
                </div>
                <div className="event-price">
                  {iv.price === 0 ? <span className="free">zdarma</span> : <><span>{iv.price}</span><span className="mono unit">&nbsp;Kč</span></>}
                </div>
              </div>
              <div className="event-body">
                <div className="event-section">
                  <div className="card-sub">Setkání</div>
                  <div className="meeting-strip">
                    {iv.meetings.map((m, i) => (
                      <div key={m.id} className="meeting-pip" title={`${m.date} · ${m.topic}`}>
                        <div className="meeting-pip-num mono">{i+1}</div>
                        <div className="meeting-pip-date mono">{m.date.slice(5)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    {iv.meetings.length} setkání · {iv.coordinator}
                  </div>
                </div>
                <div className="event-section row-between">
                  <div>
                    <div className="card-sub">Volných míst</div>
                    <div className="cap-bar"><div style={{ width: `${(iv.signups.length/iv.capacity)*100}%` }}/></div>
                    <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>{iv.signups.length}/{iv.capacity} · zbývá <strong>{left}</strong></div>
                  </div>
                  {signed ? (
                    <button className="btn" onClick={() => setRoute("p-mine")}>
                      <Icon name="check" size={14}/> Přihlášeno
                    </button>
                  ) : (
                    <button className="btn btn-terra" onClick={() => setPaying(iv)} disabled={left <= 0}>
                      <Icon name={iv.price === 0 ? "ticket" : "money"} size={14}/> {iv.price === 0 ? "Přihlásit se" : "Přihlásit & zaplatit"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paying && <PaymentModal iv={paying} onClose={() => setPaying(null)} onConfirm={() => { signUp(paying.id); setPaying(null); }}/>}
    </div>
  );
};

const PaymentModal = ({ iv, onClose, onConfirm }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <div className="modal-head">
        <div style={{ flex: 1 }}>
          <div className="card-sub">Potvrdit přihlášku</div>
          <div className="card-title">{iv.name}</div>
        </div>
        <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="modal-body">
        <div className="pay-row"><span className="muted">Účastník</span><strong>Jana Nováková · P-2031</strong></div>
        <div className="pay-row"><span className="muted">Setkání</span><strong>{iv.meetings.length} × po sobě jdoucích</strong></div>
        <div className="pay-row"><span className="muted">První setkání</span><strong>{iv.meetings[0].date}</strong></div>
        <div className="pay-row pay-total"><span className="muted">Celkem</span><strong className="serif" style={{ fontSize: 28 }}>{iv.price === 0 ? "Zdarma" : `${iv.price} Kč`}</strong></div>

        {iv.price > 0 && (
          <div className="stripe-card">
            <div className="stripe-head">
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>Card · powered by stripe</div>
              <div className="card-brand">VISA</div>
            </div>
            <div className="stripe-num mono">•••• •••• •••• 4242</div>
            <div className="row-between" style={{ marginTop: 8 }}>
              <div className="mono" style={{ fontSize: 11 }}>EXP 12/28</div>
              <div className="mono" style={{ fontSize: 11 }}>CVC •••</div>
            </div>
          </div>
        )}

        <button className="btn btn-terra" onClick={onConfirm} style={{ width: "100%", marginTop: 14, justifyContent: "center", padding: "12px" }}>
          {iv.price === 0 ? "Potvrdit přihlášku" : `Zaplatit ${iv.price} Kč`}
        </button>
        <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 8 }}>
          Po platbě obdržíte potvrzení na email a přihláška se objeví v sekci „Moje intervence".
        </div>
      </div>
    </div>
  </div>
);

// --- My interventions ---
const MyInterventions = ({ data, mySignups, setRoute }) => {
  const list = data.interventions.filter(iv => mySignups.includes(iv.id));
  const today = data.today;
  if (list.length === 0) return <EmptyState title="Zatím nejste přihlášeni" desc="Projděte si nabídku regionálních intervencí a vyberte si." cta="Otevřít nabídku" onCta={() => setRoute("p-events")} icon="ticket"/>;
  return (
    <div className="stack" style={{ gap: 14 }}>
      {list.map(iv => {
        const next = iv.meetings.find(m => m.date >= today) || iv.meetings[iv.meetings.length-1];
        const past = iv.meetings.filter(m => m.date < today).length;
        return (
          <div key={iv.id} className="card">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-sub">{iv.id} · {data.regions.find(r => r.code === iv.region)?.name}</div>
                <div className="card-title">{iv.name}</div>
              </div>
              <Chip tone="moss" dot>přihlášeno · {iv.price === 0 ? "zdarma" : `zaplaceno ${iv.price} Kč`}</Chip>
            </div>
            <div className="meeting-rows">
              {iv.meetings.map((m, i) => {
                const status = m.date < today ? "past" : m.date === today ? "today" : "future";
                return (
                  <div key={m.id} className={`meeting-row ${status}`}>
                    <div className="meeting-num mono">{i+1}/{iv.meetings.length}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{m.topic}</div>
                      <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{m.date} · {m.time} · {m.venue}</div>
                    </div>
                    {status === "past"   && <Chip tone="moss" dot>absolvováno</Chip>}
                    {status === "today"  && <Chip tone="amber">probíhá dnes</Chip>}
                    {status === "future" && <Chip>plánováno</Chip>}
                  </div>
                );
              })}
            </div>
            <div className="row" style={{ marginTop: 12, justifyContent: "space-between", borderTop: "1px solid var(--ink-100)", paddingTop: 12 }}>
              <div className="muted" style={{ fontSize: 12 }}>
                Postup: <strong style={{ color: "var(--ink-900)" }}>{past}/{iv.meetings.length}</strong> setkání · další <strong>{next.date}</strong>
              </div>
              <button className="btn"><Icon name="calendar" size={14}/> Přidat do kalendáře</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Object.assign(window, { ParticipantApp, ParticipantOnboarding });
