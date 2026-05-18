// === Coordinator: overview, intervention list, create form, attendance ===
const CoordinatorApp = ({ data, route, setRoute, attendance, setAttendance, showToast, drafts, setDrafts }) => {
  const myInterventions = data.interventions.filter(iv => iv.coordinator === ROLES.coordinator.name);

  return (
    <>
      {route === "c-overview"      && <CoordOverview data={data} myInterventions={myInterventions} attendance={attendance}/>}
      {route === "c-interventions" && <InterventionList data={data} myInterventions={myInterventions} setRoute={setRoute} drafts={drafts}/>}
      {route === "c-create"        && <CreateIntervention data={data} setRoute={setRoute} showToast={showToast} drafts={drafts} setDrafts={setDrafts}/>}
      {route === "c-attendance"    && <AttendanceView data={data} myInterventions={myInterventions} attendance={attendance} setAttendance={setAttendance} showToast={showToast}/>}
      {route === "c-participants"  && <ParticipantDB data={data}/>}
    </>
  );
};

// --- Overview ---
const CoordOverview = ({ data, myInterventions, attendance }) => {
  const today = data.today;
  const upcoming = [];
  myInterventions.forEach(iv => {
    iv.meetings.forEach(m => {
      if (m.date >= today) upcoming.push({ iv, m });
    });
  });
  upcoming.sort((a,b) => a.m.date.localeCompare(b.m.date));

  const totalSignups = myInterventions.reduce((a, iv) => a + iv.signups.length, 0);
  const totalMeetings = myInterventions.reduce((a, iv) => a + iv.meetings.length, 0);
  const meetingsDone = myInterventions.reduce((a, iv) => a + iv.meetings.filter(m => m.date < today).length, 0);

  return (
    <div>
      <div className="metrics" style={{ marginBottom: 18 }}>
        <Metric label="Aktivní intervence" value={myInterventions.length} delta="region Kutnohorsko" />
        <Metric label="Přihlášení účastníci" value={totalSignups} delta="napříč intervencemi"/>
        <Metric label="Setkání · postup" value={`${meetingsDone}/${totalMeetings}`} delta={`${Math.round(meetingsDone/Math.max(totalMeetings,1)*100)} %`} deltaDir="up"/>
        <Metric label="Nejbližší setkání" value={upcoming[0]?.m.date.slice(5) || "—"} delta={upcoming[0]?.iv.name.slice(0, 26) + "…" || "žádné"} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Nadcházející setkání</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>chronologicky · klik = otevřít docházku</div>
          <div className="meeting-rows">
            {upcoming.slice(0, 5).map(({ iv, m }, i) => (
              <div key={iv.id + m.id} className="meeting-row future">
                <div style={{ width: 60 }}>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>{m.date.slice(8)}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>{m.date.slice(5,7)}/{m.date.slice(2,4)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{iv.name}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{m.topic} · {m.time} · {m.venue}</div>
                </div>
                <Chip>{iv.signups.length} přihl.</Chip>
              </div>
            ))}
            {upcoming.length === 0 && <div className="muted">Žádná nadcházející setkání.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Moje intervence</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>postup setkání · docházka</div>
          <div className="stack" style={{ gap: 10 }}>
            {myInterventions.map(iv => {
              const total = iv.meetings.length;
              const done = iv.meetings.filter(m => m.date < today).length;
              return (
                <div key={iv.id}>
                  <div className="row-between" style={{ marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{iv.name}</div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{done}/{total}</span>
                  </div>
                  <div className="meeting-strip" style={{ marginTop: 4 }}>
                    {iv.meetings.map((m, i) => (
                      <div key={m.id} className={`meeting-pip ${m.date < today ? "done" : ""}`} title={m.topic}>
                        <div className="meeting-pip-num mono">{i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Intervention list ---
const InterventionList = ({ data, myInterventions, setRoute, drafts }) => {
  const all = [...myInterventions, ...drafts];
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
        <div>
          <div className="card-title">Moje intervence</div>
          <div className="card-sub">{all.length} celkem · {drafts.length} koncepty</div>
        </div>
        <button className="btn btn-terra" onClick={() => setRoute("c-create")}><Icon name="plus" size={14}/> Nová intervence</button>
      </div>
      <table className="data">
        <thead><tr><th>ID</th><th>Název</th><th>Typ</th><th>Cílová skupina</th><th style={{textAlign:"right"}}>Setkání</th><th style={{textAlign:"right"}}>Přihl.</th><th>Stav</th></tr></thead>
        <tbody>
          {all.map(iv => (
            <tr key={iv.id} onClick={() => setRoute("c-attendance")} style={{ cursor: "pointer" }}>
              <td className="mono">{iv.id}</td>
              <td style={{ fontWeight: 500 }}>{iv.name}</td>
              <td><Chip>{data.interventionTypes.find(t => t.code === iv.typeCode)?.name}</Chip></td>
              <td><Chip tone="plum">{iv.target}</Chip></td>
              <td style={{ textAlign: "right" }} className="mono">{iv.meetings.length}</td>
              <td style={{ textAlign: "right" }} className="mono">{iv.signups?.length ?? 0}/{iv.capacity}</td>
              <td>{iv.draft ? <Chip tone="amber">koncept</Chip> : <Chip tone="moss" dot>aktivní</Chip>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Create intervention (multi-step, all picks/dropdowns) ---
const CreateIntervention = ({ data, setRoute, showToast, drafts, setDrafts }) => {
  const today = data.today;
  const [form, setForm] = React.useState({
    date: today,
    year: 2026,
    schoolYear: "2025/26",
    cpv: data.cpvCodes[0],
    name: "",
    typeCode: "",
    topicCode: "",
    target: "",
    funding: "",
    coordinator: ROLES.coordinator.name,
    capacity: 18,
    price: 0,
    nMeetings: 5,
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.typeCode && form.topicCode && form.target && form.funding;

  const submit = () => {
    const newId = `INT-${form.year}-${String(20 + drafts.length).padStart(3, "0")}`;
    const topic = data.interventionTopics.find(t => t.code === form.topicCode)?.name;
    const type  = data.interventionTypes.find(t => t.code === form.typeCode)?.name;
    setDrafts(d => [...d, {
      id: newId,
      name: form.name || `${topic} · ${form.schoolYear}`,
      typeCode: form.typeCode, topicCode: form.topicCode,
      target: form.target, funding: form.funding, cpv: form.cpv,
      region: "KUT", coordinator: form.coordinator,
      schoolYear: form.schoolYear, year: form.year,
      price: form.price, capacity: form.capacity,
      meetings: Array.from({ length: form.nMeetings }, (_, i) => ({
        id: `M${i+1}`, date: addWeeks(form.date, i*2), time: "14:00–17:00", venue: "TBD",
        topic: `${topic} · setkání ${i+1}`,
      })),
      signups: [], paid: [], draft: true,
    }]);
    showToast(`Intervence ${newId} vytvořena · ${form.nMeetings} setkání · publikováno`);
    setRoute("c-interventions");
  };

  return (
    <div className="create-grid">
      <div className="stack" style={{ gap: 14 }}>
        <div className="card">
          <FormStep n={1} label="Základ — datum, rok, školní rok"/>
          <div className="grid-3">
            <div className="field">
              <div className="label">Datum vytvoření</div>
              <DatePicker value={form.date} onChange={set("date")} />
            </div>
            <div className="field">
              <div className="label">Rok</div>
              <PickList options={[2025, 2026, 2027].map(y => ({ code: y, name: String(y) }))} value={form.year} onChange={set("year")} columns={3}/>
            </div>
            <div className="field">
              <div className="label">Školní rok</div>
              <PickList options={["2024/25","2025/26","2026/27"].map(y => ({ code: y, name: y }))} value={form.schoolYear} onChange={set("schoolYear")} columns={3}/>
            </div>
          </div>
        </div>

        <div className="card">
          <FormStep n={2} label="CPV kód · číselník veřejných zakázek"/>
          <PickList options={data.cpvCodes.map(c => ({ code: c, name: c.split("  ")[1], sub: c.split("  ")[0] }))} value={form.cpv} onChange={set("cpv")} columns={3}/>
        </div>

        <div className="card">
          <FormStep n={3} label="Typ a téma intervence"/>
          <div className="label" style={{ marginTop: 6 }}>Typ intervence</div>
          <PickList options={data.interventionTypes.map(t => ({ code: t.code, name: t.name, sub: t.desc }))} value={form.typeCode} onChange={set("typeCode")} columns={3}/>
          <div className="label" style={{ marginTop: 14 }}>Upřesnění intervence (téma)</div>
          <PickList options={data.interventionTopics.map(t => ({ code: t.code, name: t.name, sub: t.pillar }))} value={form.topicCode} onChange={set("topicCode")} columns={3}/>
          <div className="field" style={{ marginTop: 14 }}>
            <div className="label">Název (volitelný — předvyplněno)</div>
            <input className="input" placeholder={`${data.interventionTopics.find(t => t.code === form.topicCode)?.name || "—"} · ${form.schoolYear}`} value={form.name} onChange={e => set("name")(e.target.value)}/>
          </div>
        </div>

        <div className="card">
          <FormStep n={4} label="Cílová skupina & financování"/>
          <div className="label">Cílová skupina</div>
          <PickList options={data.targetGroups.map(g => ({ code: g, name: g }))} value={form.target} onChange={set("target")} columns={3}/>
          <div className="label" style={{ marginTop: 14 }}>Finanční zdroj</div>
          <PickList options={data.fundingSources.map(f => ({ code: f, name: f }))} value={form.funding} onChange={set("funding")} columns={3}/>
        </div>

        <div className="card">
          <FormStep n={5} label="Realizátor & rozsah"/>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="field">
              <div className="label">Realizátor (regionální koordinátor)</div>
              <div className="picked-row">
                <div className="avatar">LH</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{form.coordinator}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>CPV Kutnohorsko · auto-fill</div>
                </div>
                <Icon name="check" size={14}/>
              </div>
            </div>
            <div className="field">
              <div className="label">Cena za účastníka</div>
              <PickList options={[0, 490, 990, 1490, 1990].map(p => ({ code: p, name: p === 0 ? "Zdarma" : `${p} Kč` }))} value={form.price} onChange={set("price")} columns={5}/>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <div className="label">Kapacita</div>
              <Slider min={6} max={40} step={2} value={form.capacity} onChange={set("capacity")}/>
            </div>
            <div className="field">
              <div className="label">Počet setkání · 3–15</div>
              <Slider min={3} max={15} step={1} value={form.nMeetings} onChange={set("nMeetings")}/>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
        <div className="card">
          <div className="card-sub">Náhled karty intervence</div>
          <div className="card-title" style={{ fontSize: 18, marginTop: 4 }}>
            {form.name || data.interventionTopics.find(t => t.code === form.topicCode)?.name || "—"}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {form.typeCode && <Chip>{data.interventionTypes.find(t => t.code === form.typeCode)?.name}</Chip>}
            {form.target && <Chip tone="plum">{form.target}</Chip>}
            {form.funding && <Chip tone="terra" dot>{form.funding}</Chip>}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            <div className="row-between"><span>Setkání</span><strong className="mono">{form.nMeetings}×</strong></div>
            <div className="row-between"><span>Kapacita</span><strong className="mono">{form.capacity}</strong></div>
            <div className="row-between"><span>Cena</span><strong className="mono">{form.price === 0 ? "zdarma" : `${form.price} Kč`}</strong></div>
            <div className="row-between"><span>Školní rok</span><strong className="mono">{form.schoolYear}</strong></div>
            <div className="row-between"><span>Region</span><strong className="mono">KUT · Kutnohorsko</strong></div>
          </div>

          <button className="btn btn-terra" disabled={!valid} onClick={submit} style={{ width: "100%", marginTop: 14, justifyContent: "center", padding: "10px" }}>
            <Icon name="check" size={14}/> Vytvořit a publikovat
          </button>
          {!valid && <div className="muted" style={{ fontSize: 11, marginTop: 8, textAlign: "center" }}>Vyplňte typ, téma, cílovou skupinu a financování.</div>}
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-sub">Předvyplněno systémem</div>
          <ul className="prefill-list">
            <li><Icon name="check" size={12}/> Realizátor (přihlášený koordinátor)</li>
            <li><Icon name="check" size={12}/> Region & CPV uzel</li>
            <li><Icon name="check" size={12}/> Datum &amp; rok &amp; školní rok</li>
            <li><Icon name="check" size={12}/> Termíny setkání (lze přepsat)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const addWeeks = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n*7);
  return d.toISOString().slice(0,10);
};

const DatePicker = ({ value, onChange }) => {
  const days = [];
  const base = new Date(value);
  for (let i = -3; i <= 10; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0,10));
  }
  return (
    <div className="datestrip">
      {days.map(d => (
        <button key={d} type="button" className={`datepip ${d === value ? "on" : ""} ${d === "2026-04-10" ? "today" : ""}`} onClick={() => onChange(d)}>
          <div className="datepip-d serif">{d.slice(8)}</div>
          <div className="mono" style={{ fontSize: 9 }}>{d.slice(5,7)}</div>
        </button>
      ))}
    </div>
  );
};

const Slider = ({ min, max, step, value, onChange }) => (
  <div className="slider-row">
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}/>
    <div className="slider-val mono">{value}</div>
  </div>
);

// --- Attendance ---
const AttendanceView = ({ data, myInterventions, attendance, setAttendance, showToast }) => {
  const [selectedIv, setSelectedIv] = React.useState(myInterventions[0]?.id);
  const iv = myInterventions.find(i => i.id === selectedIv);
  const today = data.today;

  // Pick "current" meeting: today if exists, else last past, else first
  const initialMeeting = (() => {
    if (!iv) return null;
    const todayM = iv.meetings.find(m => m.date === today);
    if (todayM) return todayM.id;
    const past = iv.meetings.filter(m => m.date < today);
    if (past.length) return past[past.length-1].id;
    return iv.meetings[0].id;
  })();
  const [meetingId, setMeetingId] = React.useState(initialMeeting);
  React.useEffect(() => { setMeetingId(initialMeeting); }, [selectedIv]);

  if (!iv) return <EmptyState title="Žádné intervence" desc="Vytvořte první intervenci, abyste mohli zaznamenat docházku." icon="clipboard"/>;

  const meeting = iv.meetings.find(m => m.id === meetingId);
  const att = attendance[iv.id]?.[meetingId] || {};
  const setStatus = (pid, status) => {
    setAttendance(a => ({
      ...a,
      [iv.id]: {
        ...(a[iv.id] || {}),
        [meetingId]: { ...(a[iv.id]?.[meetingId] || {}), [pid]: status },
      },
    }));
  };

  const presentCount = Object.values(att).filter(s => s === "present").length;
  const absentCount  = Object.values(att).filter(s => s === "absent").length;
  const pending      = iv.paid.length - presentCount - absentCount;

  return (
    <div>
      <div className="filterbar">
        <div className="label">Intervence</div>
        <select className="select" value={selectedIv} onChange={e => setSelectedIv(e.target.value)} style={{ minWidth: 320 }}>
          {myInterventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <Chip tone="terra" dot>{data.regions.find(r => r.code === iv.region)?.name}</Chip>
        <Chip>{iv.paid.length} zaplaceno z {iv.signups.length} přihlášených</Chip>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-sm"><Icon name="download" size={12}/> Export prezenční listiny</button>
        </div>
      </div>

      <div className="att-shell">
        <div className="att-side card">
          <div className="card-sub">Setkání · vyber pro docházku</div>
          <div className="meeting-list">
            {iv.meetings.map((m, i) => {
              const a = attendance[iv.id]?.[m.id] || {};
              const filled = Object.values(a).filter(v => v).length;
              const status = m.date < today ? "past" : m.date === today ? "today" : "future";
              return (
                <button key={m.id} className={`meeting-list-item ${meetingId === m.id ? "on" : ""} ${status}`} onClick={() => setMeetingId(m.id)}>
                  <div className="ml-num mono">{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.topic}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{m.date} · {m.time}</div>
                  </div>
                  <div className="ml-status">
                    {status === "past"  && <Chip tone="moss" dot>{filled}/{iv.paid.length}</Chip>}
                    {status === "today" && <Chip tone="amber">dnes</Chip>}
                    {status === "future"&& <Chip>{m.date.slice(5)}</Chip>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="att-main card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-sub">Setkání {iv.meetings.indexOf(meeting)+1} z {iv.meetings.length} · {meeting.date}</div>
              <div className="card-title">{meeting.topic}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{meeting.time} · {meeting.venue}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Chip tone="moss" dot>{presentCount} přítomno</Chip>
              <Chip tone="amber">{absentCount} chybí</Chip>
              <Chip>{pending} ?</Chip>
            </div>
          </div>

          <div className="att-actions">
            <button className="btn btn-sm" onClick={() => iv.paid.forEach(pid => setStatus(pid, "present"))}>
              <Icon name="check" size={12}/> Vše přítomno
            </button>
            <button className="btn btn-sm" onClick={() => iv.paid.forEach(pid => setStatus(pid, null))}>
              <Icon name="x" size={12}/> Vyčistit
            </button>
            <div className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>
              Tip: klepněte na řádek pro přepnutí ✓ / ✗ — žádné psaní.
            </div>
          </div>

          <div className="att-list">
            {iv.signups.map(pid => {
              const p = data.participants.find(x => x.id === pid);
              const isPaid = iv.paid.includes(pid);
              const s = att[pid];
              return (
                <div key={pid} className={`att-row ${s || ""} ${!isPaid ? "unpaid" : ""}`}>
                  <div className="att-avatar">{p.firstName[0]}{p.lastName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName} <span className="mono" style={{ fontSize: 11, color: "var(--ink-500)", marginLeft: 6 }}>{p.id}</span></div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{p.role} · {data.schools.find(s => s.redizo === p.redizo)?.name}</div>
                  </div>
                  {!isPaid ? (
                    <Chip tone="amber">nezaplaceno</Chip>
                  ) : (
                    <div className="att-toggle">
                      <button className={`att-btn present ${s === "present" ? "on" : ""}`} onClick={() => setStatus(pid, "present")}><Icon name="check" size={14}/> Přítomen</button>
                      <button className={`att-btn absent ${s === "absent" ? "on" : ""}`} onClick={() => setStatus(pid, "absent")}><Icon name="x" size={14}/> Chybí</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="row" style={{ justifyContent: "flex-end", marginTop: 14, gap: 8 }}>
            <button className="btn">Uložit jako koncept</button>
            <button className="btn btn-terra" onClick={() => showToast(`Docházka uložena · ${presentCount} přítomno · ${absentCount} chybí`)}>
              <Icon name="check" size={14}/> Potvrdit a odeslat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Participant DB ---
const ParticipantDB = ({ data }) => {
  const [q, setQ] = React.useState("");
  const list = data.participants.filter(p => !q || `${p.firstName} ${p.lastName} ${p.email} ${p.id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
        <div>
          <div className="card-title">Databáze účastníků</div>
          <div className="card-sub">{list.length} osob · region Kutnohorsko</div>
        </div>
        <input className="input" placeholder="hledat jméno / email / ID" value={q} onChange={e => setQ(e.target.value)} style={{ width: 260 }}/>
      </div>
      <table className="data">
        <thead><tr><th>ID</th><th>Jméno</th><th>Role</th><th>Praxe</th><th>Škola</th><th>Email</th><th>Registrace</th></tr></thead>
        <tbody>
          {list.map(p => (
            <tr key={p.id}>
              <td className="mono">{p.id}</td>
              <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
              <td><Chip>{p.role}</Chip></td>
              <td className="mono">{p.experience}</td>
              <td>{data.schools.find(s => s.redizo === p.redizo)?.name}</td>
              <td className="mono" style={{ fontSize: 12 }}>{p.email}</td>
              <td className="mono" style={{ fontSize: 12, color: "var(--ink-500)" }}>{p.registeredAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Object.assign(window, { CoordinatorApp });
