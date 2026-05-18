// === Evaluator: dashboard + interventions + participants + library + AI assistant ===
const EvaluatorApp = ({
  data, route, setRoute, attendance, showToast,
  participants, addParticipant,
  interventions, addIntervention, updateIntervention,
  libraryDocs, addLibraryDoc,
}) => {
  return (
    <>
      {route === "e-dashboard"     && <EvalDashboard data={data} attendance={attendance} interventions={interventions} participants={participants} setRoute={setRoute}/>}
      {route === "e-interventions" && <EvalInterventions data={data} interventions={interventions} participants={participants} attendance={attendance} addIntervention={addIntervention} updateIntervention={updateIntervention} showToast={showToast}/>}
      {route === "e-people"        && <EvalPeople data={data} participants={participants} interventions={interventions} attendance={attendance} addParticipant={addParticipant} showToast={showToast}/>}
      {route === "e-library"       && <EvalLibrary data={data} libraryDocs={libraryDocs} addLibraryDoc={addLibraryDoc} showToast={showToast}/>}
      {route === "e-assistant"     && <EvalAssistant data={data} libraryDocs={libraryDocs}/>}
    </>
  );
};

// Helpers — derive event-like records from interventions+meetings+attendance
const deriveEvents = (data, interventions, attendance) => {
  const events = [];
  interventions.forEach(iv => {
    iv.meetings.forEach(m => {
      const att = attendance[iv.id]?.[m.id] || {};
      const present = Object.entries(att).filter(([_, v]) => v === "present").map(([pid]) => pid);
      if (m.date < data.today) {
        events.push({
          interventionId: iv.id, meetingId: m.id, date: m.date,
          region: iv.region, target: iv.target, topic: iv.topicCode, type: iv.typeCode,
          presentIds: present, hours: 3,
        });
      }
    });
  });
  return events;
};

// ============================================================
// DASHBOARD
// ============================================================
const EvalDashboard = ({ data, attendance, interventions, participants, setRoute }) => {
  const events = deriveEvents(data, interventions, attendance);
  const [region, setRegion] = React.useState("");
  const [topic, setTopic] = React.useState("");

  const filtered = events.filter(e => (!region || e.region === region) && (!topic || e.topic === topic));

  const totalMeetings = filtered.length;
  const totalAttendances = filtered.reduce((a, e) => a + e.presentIds.length, 0);
  const uniqueParticipants = new Set();
  filtered.forEach(e => e.presentIds.forEach(pid => uniqueParticipants.add(pid)));
  const totalHours = filtered.reduce((a, e) => a + e.hours, 0);

  const byMonth = {};
  filtered.forEach(e => { const m = e.date.slice(0,7); byMonth[m] = (byMonth[m]||0)+1; });
  const months = Object.keys(byMonth).sort();
  const maxMonth = Math.max(1, ...Object.values(byMonth));

  const byTopic = {};
  filtered.forEach(e => { byTopic[e.topic] = (byTopic[e.topic]||0) + e.presentIds.length; });
  const topicEntries = Object.entries(byTopic).sort((a,b) => b[1]-a[1]);
  const maxTopic = Math.max(1, ...Object.values(byTopic));

  const byTarget = {};
  filtered.forEach(e => { byTarget[e.target] = (byTarget[e.target]||0) + e.presentIds.length; });

  const byRegion = {};
  filtered.forEach(e => { byRegion[e.region] = (byRegion[e.region]||0) + e.presentIds.length; });

  return (
    <div>
      <div className="filterbar">
        <div className="label">Filtr</div>
        <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Všechny regiony</option>
          {data.regions.filter(r => r.active).map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
        <select className="select" value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Všechna témata</option>
          {data.interventionTopics.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
        <select className="select"><option>Školní rok 2025/26</option></select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn btn-sm"><Icon name="plus" size={12}/> Uložit pohled</button>
          <button className="btn btn-sm btn-primary"><Icon name="download" size={12}/> Export XLSX</button>
        </div>
      </div>

      <div className="metrics" style={{ marginBottom: 16 }}>
        <Metric label="Realizovaná setkání" value={totalMeetings} delta="z dochrázky koordinátorů" deltaDir="up"/>
        <Metric label="Záznamy účastí" value={totalAttendances.toLocaleString("cs-CZ")} delta={`Ø ${totalMeetings ? (totalAttendances/totalMeetings).toFixed(1) : 0} / setkání`}/>
        <Metric label="Unikátní účastníci" value={uniqueParticipants.size} delta="dle ID účastníka"/>
        <Metric label="Hodiny celkem" value={totalHours} unit="h" delta={`Ø ${(totalHours/Math.max(uniqueParticipants.size,1)).toFixed(1)} h / osoba`}/>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div><div className="card-title">Setkání v čase</div><div className="card-sub">Měsíčně · realizováno</div></div>
            <Chip tone="moss" dot>průběžně</Chip>
          </div>
          <svg width="100%" height="180" viewBox="0 0 500 180" preserveAspectRatio="none">
            {months.length === 0 && <text x="250" y="90" textAnchor="middle" fill="var(--ink-400)" fontSize="12">Žádná data</text>}
            {months.map((m, i) => {
              const x = (i / Math.max(months.length-1, 1)) * 460 + 20;
              const h = (byMonth[m] / maxMonth) * 130;
              return (
                <g key={m}>
                  <rect x={x-14} y={150-h} width="28" height={h} fill="var(--terra)" opacity="0.85" rx="2"/>
                  <text x={x} y={170} className="chart-label" textAnchor="middle">{m.slice(5)}</text>
                  <text x={x} y={150-h-6} className="chart-value" textAnchor="middle">{byMonth[m]}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="card">
          <div className="card-title">Účast dle tématu</div>
          <div className="card-sub" style={{ marginBottom: 14 }}>Součet účastí</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topicEntries.map(([code, val]) => {
              const t = data.interventionTopics.find(x => x.code === code);
              return (
                <div key={code} style={{ display: "grid", gridTemplateColumns: "160px 1fr 50px", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{t?.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>{t?.pillar}</div>
                  </div>
                  <div style={{ height: 14, background: "var(--ink-100)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${(val/maxTopic)*100}%`, height: "100%", background: "var(--ink-900)" }}/>
                  </div>
                  <div className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{val}</div>
                </div>
              );
            })}
            {topicEntries.length === 0 && <div className="muted">Žádná data</div>}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title" style={{ fontSize: 15 }}>Cílové skupiny</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>Účast dle skupiny</div>
          {Object.entries(byTarget).length ? Object.entries(byTarget).map(([g, v]) => {
            const max = Math.max(...Object.values(byTarget), 1);
            return (
              <div key={g} style={{ marginBottom: 10 }}>
                <div className="row-between" style={{ fontSize: 12.5 }}>
                  <span style={{ fontWeight: 500 }}>{g}</span>
                  <span className="mono">{v}</span>
                </div>
                <div style={{ height: 6, background: "var(--ink-100)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(v/max)*100}%`, height: "100%", background: "var(--terra)" }}/>
                </div>
              </div>
            );
          }) : <div className="muted">Žádná data</div>}
        </div>

        <div className="card">
          <div className="card-title" style={{ fontSize: 15 }}>Regiony / CPV</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>Účast dle regionu</div>
          {data.regions.filter(r => r.active).map(r => {
            const v = byRegion[r.code] || 0;
            const max = Math.max(...Object.values(byRegion), 1);
            return (
              <div key={r.code} style={{ marginBottom: 10 }}>
                <div className="row-between" style={{ fontSize: 12.5 }}>
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span className="mono">{v}</span>
                </div>
                <div style={{ height: 6, background: "var(--ink-100)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(v/max)*100}%`, height: "100%", background: "var(--plum)" }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI quick-ask card — surfaces assistant on the dashboard */}
        <div className="card ai-card" onClick={() => setRoute("e-assistant")}>
          <div className="ai-card-head">
            <div className="assistant-spark" style={{ width: 36, height: 36, marginBottom: 0 }}><Icon name="sparkle" size={18}/></div>
            <div>
              <div className="card-title" style={{ fontSize: 15 }}>AI asistent</div>
              <div className="card-sub" style={{ fontSize: 10 }}>RAG nad knihovnou</div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, margin: "10px 0 12px" }}>
            Zeptejte se na trendy, regiony, nebo konkrétní pasáže z reportů a přepisů.
          </div>
          <div className="ai-card-suggestions">
            <div className="ai-card-chip" onClick={(e) => { e.stopPropagation(); setRoute("e-assistant"); }}>
              <Icon name="sparkle" size={10}/> Dopad form. hodnocení v KH?
            </div>
            <div className="ai-card-chip" onClick={(e) => { e.stopPropagation(); setRoute("e-assistant"); }}>
              <Icon name="sparkle" size={10}/> Proč klesá účast v Plzni?
            </div>
          </div>
          <div className="ai-card-cta">
            Otevřít asistenta <Icon name="arrow" size={12}/>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
          <div>
            <div className="card-title">Region × Téma</div>
            <div className="card-sub">Pivot · počet přítomných účastí</div>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Region (CPV)</th>
              {data.interventionTopics.map(t => <th key={t.code} style={{ textAlign: "right" }}>{t.name}</th>)}
              <th style={{ textAlign: "right" }}>Celkem</th>
            </tr>
          </thead>
          <tbody>
            {data.regions.filter(r => r.active).map(r => {
              const row = data.interventionTopics.map(t => filtered.filter(e => e.region === r.code && e.topic === t.code).reduce((a, e) => a + e.presentIds.length, 0));
              const total = row.reduce((a,b) => a+b, 0);
              const max = Math.max(...row, 1);
              return (
                <tr key={r.code}>
                  <td><Chip tone="terra" dot>{r.name}</Chip></td>
                  {row.map((v, i) => (
                    <td key={i} style={{ textAlign: "right" }}>
                      <span style={{
                        display: "inline-block", minWidth: 32, padding: "2px 8px", borderRadius: 4,
                        background: v ? `color-mix(in oklch, var(--terra) ${(v/max)*60}%, transparent)` : "transparent",
                        fontFamily: "var(--font-mono)", fontWeight: v ? 600 : 400,
                      }}>{v || "—"}</span>
                    </td>
                  ))}
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// INTERVENTIONS — list, create, detail with manual participant attach
// ============================================================
const EvalInterventions = ({ data, interventions, participants, attendance, addIntervention, updateIntervention, showToast }) => {
  const [view, setView] = React.useState("list"); // list | create | detail
  const [openId, setOpenId] = React.useState(null);
  const [filter, setFilter] = React.useState({ region: "", year: "", topic: "" });

  const filtered = interventions.filter(iv =>
    (!filter.region || iv.region === filter.region) &&
    (!filter.year   || String(iv.year) === filter.year) &&
    (!filter.topic  || iv.topicCode === filter.topic)
  );

  // sort by first meeting date desc
  filtered.sort((a,b) => (b.meetings[0]?.date || "").localeCompare(a.meetings[0]?.date || ""));

  const today = data.today;

  const openDetail = (id) => { setOpenId(id); setView("detail"); };
  const intervention = interventions.find(i => i.id === openId);

  if (view === "create") {
    return <CreateInterventionEval data={data} onCancel={() => setView("list")} onSubmit={(iv) => { addIntervention(iv); setView("list"); showToast(`Intervence ${iv.id} vytvořena · ${iv.meetings.length} setkání`); }}/>;
  }

  if (view === "detail" && intervention) {
    return <InterventionDetail data={data} intervention={intervention} participants={participants} attendance={attendance} updateIntervention={updateIntervention} onBack={() => { setView("list"); setOpenId(null); }} showToast={showToast}/>;
  }

  const years = [...new Set(interventions.map(i => i.year))].sort();

  return (
    <div>
      <div className="filterbar">
        <div className="label">Filtr</div>
        <select className="select" value={filter.region} onChange={e => setFilter(f => ({ ...f, region: e.target.value }))}>
          <option value="">Všechny regiony</option>
          {data.regions.filter(r => r.active).map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
        <select className="select" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}>
          <option value="">Všechny roky</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="select" value={filter.topic} onChange={e => setFilter(f => ({ ...f, topic: e.target.value }))}>
          <option value="">Všechna témata</option>
          {data.interventionTopics.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn btn-sm"><Icon name="download" size={12}/> Export</button>
          <button className="btn btn-sm btn-terra" onClick={() => setView("create")}><Icon name="plus" size={12}/> Nová intervence</button>
        </div>
      </div>

      <div className="iv-grid">
        {filtered.map(iv => {
          const start  = iv.meetings[0]?.date || "—";
          const end    = iv.meetings[iv.meetings.length-1]?.date || "—";
          const done   = iv.meetings.filter(m => m.date < today).length;
          const type   = data.interventionTypes.find(t => t.code === iv.typeCode);
          const topic  = data.interventionTopics.find(t => t.code === iv.topicCode);
          const region = data.regions.find(r => r.code === iv.region);
          const status = end < today ? "past" : start > today ? "future" : "running";
          return (
            <button key={iv.id} className={`iv-card iv-status-${status}`} onClick={() => openDetail(iv.id)}>
              <div className="iv-card-head">
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-500)" }}>{iv.id}</div>
                {status === "past"    && <Chip>archivováno</Chip>}
                {status === "running" && <Chip tone="moss" dot>probíhá</Chip>}
                {status === "future"  && <Chip tone="terra" dot>plánováno</Chip>}
              </div>
              <div className="iv-card-title">{iv.name}</div>
              <div className="iv-card-meta">
                <Chip>{type?.name}</Chip>
                <Chip tone="plum">{topic?.name}</Chip>
                <Chip tone="terra" dot>{region?.name}</Chip>
              </div>
              <div className="iv-card-strip">
                {iv.meetings.map((m, i) => {
                  const past = m.date < today;
                  return <div key={m.id} className={`iv-pip ${past ? "done" : ""}`} title={`${m.date} · ${m.topic}`}/>;
                })}
              </div>
              <div className="iv-card-foot">
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                  {start.slice(5)} → {end.slice(5)} · {done}/{iv.meetings.length} setkání
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                  {iv.signups.length} účastníků
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState title="Žádné intervence" desc="Změňte filtr nebo založte novou intervenci." cta="Nová intervence" onCta={() => setView("create")} icon="clipboard"/>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Create Intervention (evaluator — picks region too) ---
const CreateInterventionEval = ({ data, onCancel, onSubmit }) => {
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
    region: "KUT",
    capacity: 18,
    price: 0,
    nMeetings: 5,
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.typeCode && form.topicCode && form.target && form.funding && form.region;

  const submit = () => {
    const topic = data.interventionTopics.find(t => t.code === form.topicCode)?.name;
    const newId = `INT-${form.year}-${String(Math.floor(Math.random()*900)+100)}`;
    const coordinator = data.regions.find(r => r.code === form.region)?.coordinator || "—";
    onSubmit({
      id: newId,
      name: form.name || `${topic} · ${form.schoolYear}`,
      typeCode: form.typeCode, topicCode: form.topicCode,
      target: form.target, funding: form.funding, cpv: form.cpv,
      region: form.region, coordinator,
      schoolYear: form.schoolYear, year: form.year,
      price: form.price, capacity: form.capacity,
      meetings: Array.from({ length: form.nMeetings }, (_, i) => ({
        id: `M${i+1}`, date: addWeeksEval(form.date, i*2), time: "14:00–17:00", venue: "TBD",
        topic: `${topic} · setkání ${i+1}`,
      })),
      signups: [], paid: [], createdByEval: true,
    });
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn btn-sm" onClick={onCancel}><Icon name="arrow" size={12} style={{ transform: "rotate(180deg)" }}/> Zpět na seznam</button>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)", marginLeft: 8 }}>nová intervence · ručně</div>
      </div>

      <div className="create-grid">
        <div className="stack" style={{ gap: 14 }}>
          <div className="card">
            <FormStep n={1} label="Region · pro koho intervenci zakládáte"/>
            <PickList options={data.regions.filter(r => r.active).map(r => ({ code: r.code, name: r.name, sub: r.coordinator }))} value={form.region} onChange={set("region")} columns={3}/>
          </div>

          <div className="card">
            <FormStep n={2} label="Rok · školní rok · CPV"/>
            <div className="grid-3">
              <div className="field">
                <div className="label">Rok</div>
                <PickList options={[2024, 2025, 2026, 2027].map(y => ({ code: y, name: String(y) }))} value={form.year} onChange={set("year")} columns={2}/>
              </div>
              <div className="field">
                <div className="label">Školní rok</div>
                <PickList options={["2024/25","2025/26","2026/27"].map(y => ({ code: y, name: y }))} value={form.schoolYear} onChange={set("schoolYear")} columns={1}/>
              </div>
              <div className="field">
                <div className="label">CPV</div>
                <PickList options={data.cpvCodes.map(c => ({ code: c, name: c.split("  ")[1], sub: c.split("  ")[0] }))} value={form.cpv} onChange={set("cpv")} columns={1}/>
              </div>
            </div>
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
            <FormStep n={5} label="Rozsah"/>
            <div className="grid-2">
              <div className="field">
                <div className="label">Kapacita</div>
                <Slider min={6} max={40} step={2} value={form.capacity} onChange={set("capacity")}/>
              </div>
              <div className="field">
                <div className="label">Počet setkání · 1–15</div>
                <Slider min={1} max={15} step={1} value={form.nMeetings} onChange={set("nMeetings")}/>
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
              <div className="row-between"><span>Region</span><strong className="mono">{data.regions.find(r => r.code === form.region)?.name}</strong></div>
              <div className="row-between"><span>Koordinátor</span><strong className="mono">{data.regions.find(r => r.code === form.region)?.coordinator}</strong></div>
              <div className="row-between"><span>Setkání</span><strong className="mono">{form.nMeetings}×</strong></div>
              <div className="row-between"><span>Kapacita</span><strong className="mono">{form.capacity}</strong></div>
              <div className="row-between"><span>Školní rok</span><strong className="mono">{form.schoolYear}</strong></div>
            </div>

            <button className="btn btn-terra" disabled={!valid} onClick={submit} style={{ width: "100%", marginTop: 14, justifyContent: "center", padding: "10px" }}>
              <Icon name="check" size={14}/> Vytvořit intervenci
            </button>
            {!valid && <div className="muted" style={{ fontSize: 11, marginTop: 8, textAlign: "center" }}>Vyplňte region, typ, téma, cílovou skupinu a financování.</div>}
            <div className="muted" style={{ fontSize: 11, marginTop: 10, textAlign: "center" }}>
              Po vytvoření můžete ručně přiřadit účastníky.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const addWeeksEval = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n*7);
  return d.toISOString().slice(0,10);
};

// --- Intervention detail — meetings + manual participant attach ---
const InterventionDetail = ({ data, intervention, participants, attendance, updateIntervention, onBack, showToast }) => {
  const [addingPeople, setAddingPeople] = React.useState(false);
  const today = data.today;
  const region = data.regions.find(r => r.code === intervention.region);
  const type   = data.interventionTypes.find(t => t.code === intervention.typeCode);
  const topic  = data.interventionTopics.find(t => t.code === intervention.topicCode);

  const removeParticipant = (pid) => {
    const newSignups = intervention.signups.filter(x => x !== pid);
    const newPaid    = intervention.paid.filter(x => x !== pid);
    updateIntervention(intervention.id, { signups: newSignups, paid: newPaid });
    showToast(`Účastník ${pid} odebrán z intervence`);
  };

  const addParticipants = (pids) => {
    const newSignups = [...new Set([...intervention.signups, ...pids])];
    const newPaid    = [...new Set([...intervention.paid, ...pids])];
    updateIntervention(intervention.id, { signups: newSignups, paid: newPaid });
    showToast(`Přidáno ${pids.length} účastníků · ${intervention.id}`);
    setAddingPeople(false);
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn btn-sm" onClick={onBack}><Icon name="arrow" size={12} style={{ transform: "rotate(180deg)" }}/> Zpět na seznam</button>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)", marginLeft: 8 }}>{intervention.id}</div>
      </div>

      <div className="iv-detail-head card">
        <div style={{ flex: 1 }}>
          <div className="card-sub">{region?.name} · {intervention.coordinator} · {intervention.schoolYear}</div>
          <h2 className="iv-detail-title">{intervention.name}</h2>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <Chip>{type?.name}</Chip>
            <Chip tone="plum">{topic?.name} · {topic?.pillar}</Chip>
            <Chip tone="terra" dot>{intervention.target}</Chip>
            <Chip>{intervention.funding}</Chip>
            <Chip>{intervention.price === 0 ? "zdarma" : `${intervention.price} Kč`}</Chip>
          </div>
        </div>
        <div className="iv-detail-stats">
          <div><div className="serif" style={{ fontSize: 28 }}>{intervention.meetings.length}</div><div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>setkání</div></div>
          <div><div className="serif" style={{ fontSize: 28 }}>{intervention.signups.length}/{intervention.capacity}</div><div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>účastníků</div></div>
        </div>
      </div>

      <div className="iv-detail-grid">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Účastníci · ručně přiřazeni</div>
              <div className="card-sub">{intervention.signups.length} osob</div>
            </div>
            <button className="btn btn-terra btn-sm" onClick={() => setAddingPeople(true)}>
              <Icon name="plus" size={12}/> Přiřadit účastníky
            </button>
          </div>
          {intervention.signups.length === 0 ? (
            <div className="empty" style={{ padding: "40px 20px" }}>
              <div className="empty-ic"><Icon name="users" size={20}/></div>
              <div className="empty-title" style={{ fontSize: 16 }}>Zatím nikdo</div>
              <div className="empty-desc">Přiřaďte účastníky z databáze ručně.</div>
            </div>
          ) : (
            <div className="att-list" style={{ marginTop: 8 }}>
              {intervention.signups.map(pid => {
                const p = participants.find(x => x.id === pid);
                if (!p) return null;
                return (
                  <div key={pid} className="att-row">
                    <div className="att-avatar">{p.firstName[0]}{p.lastName[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName} <span className="mono" style={{ fontSize: 11, color: "var(--ink-500)", marginLeft: 6 }}>{p.id}</span></div>
                      <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{p.role} · {data.schools.find(s => s.redizo === p.redizo)?.name}</div>
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={() => removeParticipant(pid)} title="Odebrat"><Icon name="x" size={12}/></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Setkání</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>{intervention.meetings.filter(m => m.date < today).length} z {intervention.meetings.length} proběhlo</div>
          <div className="meeting-rows">
            {intervention.meetings.map((m, i) => {
              const status = m.date < today ? "past" : m.date === today ? "today" : "future";
              const att = attendance[intervention.id]?.[m.id] || {};
              const present = Object.values(att).filter(v => v === "present").length;
              return (
                <div key={m.id} className={`meeting-row ${status}`}>
                  <div className="meeting-num mono">{i+1}/{intervention.meetings.length}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.topic}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{m.date} · {m.time} · {m.venue}</div>
                  </div>
                  {status === "past"   && <Chip tone="moss" dot>{present} přítomno</Chip>}
                  {status === "today"  && <Chip tone="amber">dnes</Chip>}
                  {status === "future" && <Chip>plánováno</Chip>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {addingPeople && (
        <AttachParticipantsModal
          data={data}
          participants={participants}
          excludeIds={intervention.signups}
          intervention={intervention}
          onClose={() => setAddingPeople(false)}
          onAdd={addParticipants}
        />
      )}
    </div>
  );
};

const AttachParticipantsModal = ({ data, participants, excludeIds, intervention, onClose, onAdd }) => {
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState([]);
  const filtered = participants.filter(p => !excludeIds.includes(p.id) && (!q || `${p.firstName} ${p.lastName} ${p.email} ${p.id} ${p.role}`.toLowerCase().includes(q.toLowerCase())));

  const toggle = (pid) => setPicked(s => s.includes(pid) ? s.filter(x => x !== pid) : [...s, pid]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="card-sub">{intervention.id} · {intervention.name}</div>
            <div className="card-title">Přiřadit účastníky z databáze</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="filterbar" style={{ marginBottom: 12 }}>
            <Icon name="search" size={14}/>
            <input className="input" placeholder="hledat jméno / email / role / ID" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, border: "none", background: "transparent" }}/>
            <div className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>{picked.length} vybráno · {filtered.length} dostupných</div>
          </div>
          <div className="attach-list">
            {filtered.map(p => {
              const sel = picked.includes(p.id);
              return (
                <button key={p.id} className={`attach-row ${sel ? "on" : ""}`} onClick={() => toggle(p.id)}>
                  <div className={`attach-check ${sel ? "on" : ""}`}>{sel && <Icon name="check" size={10}/>}</div>
                  <div className="att-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{p.firstName[0]}{p.lastName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.firstName} {p.lastName} <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-500)", marginLeft: 4 }}>{p.id}</span></div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.role} · {data.schools.find(s => s.redizo === p.redizo)?.name}</div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="muted" style={{ padding: 20, textAlign: "center" }}>Žádní další účastníci v databázi.</div>}
          </div>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 14, gap: 8 }}>
            <button className="btn" onClick={onClose}>Zrušit</button>
            <button className="btn btn-terra" disabled={picked.length === 0} onClick={() => onAdd(picked)}>
              <Icon name="check" size={14}/> Přidat {picked.length} {picked.length === 1 ? "účastníka" : "účastníků"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PARTICIPANTS — library + Add modal (form lives on evaluator's side)
// ============================================================
const EvalPeople = ({ data, participants, interventions, attendance, addParticipant, showToast }) => {
  const [q, setQ] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const stats = participants.map(p => {
    let present = 0, absent = 0, signedUp = 0;
    interventions.forEach(iv => {
      if (iv.signups.includes(p.id)) {
        signedUp++;
        iv.meetings.forEach(m => {
          const s = attendance[iv.id]?.[m.id]?.[p.id];
          if (s === "present") present++;
          if (s === "absent")  absent++;
        });
      }
    });
    return { ...p, present, absent, signedUp };
  });

  const list = stats.filter(p => !q || `${p.firstName} ${p.lastName} ${p.email} ${p.id} ${p.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="card" style={{ padding: 0 }}>
        <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
          <div>
            <div className="card-title">Knihovna účastníků</div>
            <div className="card-sub">{list.length} z {participants.length} osob · ručně spravované · žádná duplicita</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" placeholder="hledat…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 220 }}/>
            <button className="btn"><Icon name="download" size={12}/> Export</button>
            <button className="btn btn-terra" onClick={() => setAdding(true)}><Icon name="plus" size={14}/> Přidat účastníka</button>
          </div>
        </div>
        <table className="data">
          <thead><tr><th>ID</th><th>Jméno</th><th>Role</th><th>Praxe</th><th>Škola</th><th>Email</th><th style={{textAlign:"right"}}>Intervence</th><th style={{textAlign:"right"}}>Přítomen</th><th>Aktivita</th></tr></thead>
          <tbody>
            {list.map(p => {
              const total = p.present + p.absent;
              const ratio = total > 0 ? p.present / total : 0;
              return (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                  <td><Chip>{p.role}</Chip></td>
                  <td className="mono">{p.experience}</td>
                  <td>{data.schools.find(s => s.redizo === p.redizo)?.name || "—"}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{p.email}</td>
                  <td style={{textAlign:"right"}} className="mono">{p.signedUp}</td>
                  <td style={{textAlign:"right"}} className="mono"><strong>{p.present}</strong></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 80, height: 5, background: "var(--ink-100)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${ratio*100}%`, height: "100%", background: ratio > 0.7 ? "var(--moss)" : ratio > 0.4 ? "var(--amber)" : "var(--terra)" }}/>
                      </div>
                      <span className="mono" style={{ fontSize: 11 }}>{total ? `${Math.round(ratio*100)} %` : "—"}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan="9" style={{ textAlign: "center", padding: 40, color: "var(--ink-500)" }}>Žádné výsledky pro „{q}".</td></tr>}
          </tbody>
        </table>
      </div>

      {adding && (
        <AddParticipantModal
          data={data}
          existingIds={participants.map(p => p.id)}
          onClose={() => setAdding(false)}
          onAdd={(p) => { addParticipant(p); showToast(`Účastník ${p.id} · ${p.firstName} ${p.lastName} přidán do databáze`); setAdding(false); }}
        />
      )}
    </div>
  );
};

// --- Add participant modal (evaluator-driven registration) ---
const AddParticipantModal = ({ data, existingIds, onClose, onAdd }) => {
  const [form, setForm] = React.useState({
    firstName: "", lastName: "", email: "",
    redizo: "", role: "", experience: "",
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const valid = form.firstName.trim() && form.lastName.trim() && emailValid && form.redizo && form.role && form.experience;

  const nextId = () => {
    const nums = existingIds.map(id => parseInt(id.split("-")[1], 10)).filter(n => !isNaN(n));
    const max = Math.max(2040, ...nums);
    return `P-${max + 1}`;
  };

  const submit = () => {
    if (!valid) return;
    onAdd({
      ...form,
      id: nextId(),
      registeredAt: data.today,
    });
  };

  const stepDone = {
    1: !!(form.firstName.trim() && form.lastName.trim()),
    2: !!form.redizo,
    3: emailValid,
    4: !!form.role,
    5: !!form.experience,
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="card-sub">Ruční zápis · evaluátor</div>
            <div className="card-title">Nový účastník</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="add-step-card">
            <FormStep n={1} label="Jméno a příjmení" done={stepDone[1]}/>
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

          <div className="add-step-card">
            <FormStep n={2} label="Škola / instituce" done={stepDone[2]}/>
            <SchoolPicker schools={data.schools} value={form.redizo} onChange={set("redizo")}/>
          </div>

          <div className="add-step-card">
            <FormStep n={3} label="Email" done={stepDone[3]}/>
            <input className="input input-lg" type="email" placeholder="jana.novakova@skola.cz" value={form.email} onChange={e => set("email")(e.target.value)}/>
            {form.email && !emailValid && <div className="hint hint-warn">Email musí obsahovat @ a doménu.</div>}
          </div>

          <div className="add-step-card">
            <FormStep n={4} label="Role" done={stepDone[4]}/>
            <PickList options={data.participantRoles.map(r => ({ code: r, name: r }))} value={form.role} onChange={set("role")} columns={3}/>
          </div>

          <div className="add-step-card">
            <FormStep n={5} label="Délka profesní praxe" done={stepDone[5]}/>
            <div className="experience-slider">
              {data.experienceBands.map((b, i) => (
                <button key={b} type="button" className={`exp-band ${form.experience === b ? "on" : ""}`} onClick={() => set("experience")(b)}>
                  <div className="exp-band-num">{i+1}</div>
                  <div className="exp-band-label">{b}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
            <div className="muted" style={{ fontSize: 12 }}>
              Účastník dostane ID <strong className="mono" style={{ color: "var(--ink-900)" }}>{nextId()}</strong> po uložení.
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn" onClick={onClose}>Zrušit</button>
              <button className="btn btn-terra" disabled={!valid} onClick={submit}>
                <Icon name="check" size={14}/> Přidat do databáze
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LIBRARY — upload modal with type/year/region tags
// ============================================================
const EvalLibrary = ({ data, libraryDocs, addLibraryDoc, showToast }) => {
  const [uploading, setUploading] = React.useState(false);
  const [filterType, setFilterType] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("");
  const [filterRegion, setFilterRegion] = React.useState("");

  const filtered = libraryDocs.filter(d =>
    (!filterType   || d.type === filterType) &&
    (!filterYear   || String(d.year) === filterYear) &&
    (!filterRegion || d.region === filterRegion)
  );

  const years = [...new Set(libraryDocs.map(d => d.year).filter(Boolean))].sort();

  return (
    <div>
      <div className="filterbar">
        <div className="label">Filtr</div>
        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Všechny typy</option>
          <option value="Evaluační zpráva">Evaluační zpráva</option>
          <option value="Přepis">Přepis</option>
        </select>
        <select className="select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">Všechny roky</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="">Všechny regiony</option>
          {data.regions.filter(r => r.active).map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
          <option value="—">Nezařazené</option>
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <div className="muted" style={{ fontSize: 12 }}>{filtered.length} z {libraryDocs.length}</div>
          <button className="btn btn-terra btn-sm" onClick={() => setUploading(true)}>
            <Icon name="upload" size={12}/> Nahrát soubor
          </button>
        </div>
      </div>

      <div className="lib-grid">
        {filtered.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-head">
              <div className={`doc-icon ${d.source === "audio" ? "doc-icon-audio" : ""}`}>
                {d.source === "audio" ? <Icon name="mic" size={14}/> : d.format}
              </div>
              <div style={{ flex: 1 }}>
                <div className="doc-title">{d.title}</div>
                <div className="doc-meta">
                  {d.date} · {d.size}
                  {d.source === "audio" && d.audio?.duration ? ` · ${d.audio.duration} audio` : ""}
                </div>
              </div>
            </div>
            <div className="doc-tags">
              <Chip tone={d.type === "Evaluační zpráva" ? "plum" : "terra"} dot>{d.type}</Chip>
              {d.source === "audio" && <Chip tone="moss"><Icon name="mic" size={10}/> AI přepis</Chip>}
              {d.year && <Chip>{d.year}</Chip>}
              {d.region && d.region !== "—" && <Chip tone="terra" dot>{data.regions.find(r => r.code === d.region)?.name || d.region}</Chip>}
              {d.region === "—" && <Chip>napříč regiony</Chip>}
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>
              {d.chunks.length} indexovaných pasáží · dostupné v AI asistentovi
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState title="Žádné dokumenty" desc="Nahrajte evaluační zprávu nebo přepis rozhovoru." cta="Nahrát soubor" onCta={() => setUploading(true)} icon="upload"/>
          </div>
        )}
      </div>

      {uploading && (
        <UploadDocModal
          data={data}
          onClose={() => setUploading(false)}
          onUpload={(doc) => {
            addLibraryDoc(doc);
            showToast(doc.source === "audio"
              ? `Přepis rozhovoru „${doc.title}" uložen · indexováno do AI`
              : `Dokument „${doc.title}" nahrán · indexováno do AI`);
            setUploading(false);
          }}
        />
      )}
    </div>
  );
};

const AUDIO_EXTS = ["mp3", "wav", "m4a", "ogg", "webm", "flac", "aac", "opus"];

const TRANSCRIBE_STAGES = [
  { key: "prep",     label: "Příprava audia",          detail: "normalizace, redukce šumu",        ms: 600 },
  { key: "diarize",  label: "Detekce mluvčích",        detail: "diarizace · 2 mluvčí",             ms: 700 },
  { key: "asr",      label: "Přepis řeči → text",      detail: "model whisper-large · čeština",    ms: 1300 },
  { key: "polish",   label: "Korektura & interpunkce", detail: "časové značky, odstavce",          ms: 600 },
];

// Mock transcript shown after "transcription" completes — also indexed for the AI assistant.
const MOCK_TRANSCRIPT = [
  { t: "00:00:12", who: "Tazatel",  text: "Jak byste popsala dopad intervence Učím rád na vaši třídu — řekněme s odstupem jednoho školního roku?" },
  { t: "00:00:24", who: "Učitelka", text: "Největší změna je v zapojení. Dřív se hlásila třetina, dneska skoro všichni. A když někdo neví, řekne to nahlas — to je pro mě hlavní indikátor." },
  { t: "00:01:08", who: "Tazatel",  text: "A z hlediska kolegů ve sborovně? Vnímáte, že se formát šíří dál?" },
  { t: "00:01:14", who: "Učitelka", text: "Postupně přebírají ten styl. Není to o tom, že bych někoho přesvědčovala — vidí výsledky a chtějí je taky." },
  { t: "00:02:30", who: "Tazatel",  text: "Co označíte jako hlavní bariéru implementace?" },
  { t: "00:02:36", who: "Učitelka", text: "Čas. Příprava trvá déle, ale po prvním pololetí se to začne vracet. Kdo to vzdá v září, nedostane se k tomu." },
];

const UploadDocModal = ({ data, onClose, onUpload }) => {
  const [file, setFile] = React.useState(null);
  const [type, setType] = React.useState("");
  const [year, setYear] = React.useState(2026);
  const [region, setRegion] = React.useState("");
  const [drag, setDrag] = React.useState(false);
  const [isAudio, setIsAudio] = React.useState(false);
  const [transcribe, setTranscribe] = React.useState("idle"); // idle | running | done
  const [stageIdx, setStageIdx]     = React.useState(-1);
  const timersRef = React.useRef([]);

  const audioReady = !isAudio || transcribe === "done";
  const valid = file && type && year && region && audioReady;

  const resetAudio = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsAudio(false);
    setTranscribe("idle");
    setStageIdx(-1);
  };

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const startTranscription = () => {
    setTranscribe("running");
    setStageIdx(0);
    let cum = 0;
    TRANSCRIBE_STAGES.forEach((s, i) => {
      cum += s.ms;
      timersRef.current.push(setTimeout(() => {
        if (i < TRANSCRIBE_STAGES.length - 1) {
          setStageIdx(i + 1);
        } else {
          setStageIdx(TRANSCRIBE_STAGES.length);
          setTranscribe("done");
        }
      }, cum));
    });
  };

  const onFile = (f) => {
    if (!f) return;
    resetAudio();
    const sizeKB = Math.round(f.size / 1024);
    const size = sizeKB > 1024 ? `${(sizeKB/1024).toFixed(1)} MB` : `${sizeKB} kB`;
    const ext = (f.name.split(".").pop() || "file").toLowerCase();
    const audio = AUDIO_EXTS.includes(ext);
    setFile({ name: f.name, size, format: ext });
    if (audio) {
      setIsAudio(true);
      setType("Přepis");
      // simulated audio length derived from file size — keeps mock plausible
      const minutes = Math.max(4, Math.min(90, Math.round(f.size / (1024 * 90))));
      const seconds = String(Math.floor(Math.random() * 50) + 10).padStart(2, "0");
      setFile(prev => ({ ...prev, name: f.name, size, format: ext, duration: `${minutes}:${seconds}` }));
      startTranscription();
    }
  };

  const transcriptText = MOCK_TRANSCRIPT.map(l => `[${l.t}] ${l.who}: ${l.text}`).join("\n");

  const submit = () => {
    if (!valid) return;
    const baseTitle = file.name.replace(/\.[^.]+$/, "");
    const title = isAudio ? `Přepis rozhovoru — ${baseTitle}` : baseTitle;
    onUpload({
      id: `D${Date.now().toString().slice(-4)}`,
      title,
      type, year, region,
      format: isAudio ? "txt" : file.format,
      date: data.today,
      size: file.size,
      source: isAudio ? "audio" : "file",
      audio: isAudio ? { original: file.name, duration: file.duration, speakers: 2 } : undefined,
      chunks: isAudio
        ? MOCK_TRANSCRIPT.map((l, i) => ({ p: i + 1, text: `[${l.t}] ${l.who}: ${l.text}` }))
        : [{ p: 1, text: `Nahraný dokument · ${type.toLowerCase()} z roku ${year}, region ${data.regions.find(r => r.code === region)?.name || region}. Indexace pasáží proběhne na pozadí.` }],
      uploadedByEval: true,
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="card-sub">Nahrát do knihovny evaluací</div>
            <div className="card-title">{isAudio ? "Audio → přepis rozhovoru" : "Nový dokument"}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <div className="label">Soubor</div>
            {!file ? (
              <label
                className={`dropzone dropzone-sm ${drag ? "hover" : ""}`}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}>
                <input type="file" hidden onChange={e => onFile(e.target.files[0])}/>
                <Icon name="upload" size={24}/>
                <div className="dropzone-title" style={{ fontSize: 16 }}>Přetáhněte soubor sem</div>
                <div className="dropzone-sub">PDF, DOCX, MD, TXT, XLSX · do 50 MB</div>
                <div className="dropzone-sub" style={{ marginTop: 4 }}>
                  <Icon name="mic" size={11}/> nebo audio (MP3, WAV, M4A, OGG) → AI přepis
                </div>
              </label>
            ) : isAudio ? (
              <div className="audio-picked">
                <div className="audio-picked-head">
                  <div className="audio-icon"><Icon name="mic" size={16}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="audio-name" title={file.name}>{file.name}</div>
                    <div className="mono audio-meta">
                      {file.format.toUpperCase()} · {file.size}{file.duration ? ` · ${file.duration}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => { setFile(null); resetAudio(); }} title="Odebrat">
                    <Icon name="x" size={12}/>
                  </button>
                </div>
                <div className={`waveform ${transcribe === "running" ? "is-live" : "is-static"}`} aria-hidden="true">
                  {Array.from({ length: 56 }).map((_, i) => (
                    <span key={i} style={{ "--h": `${20 + Math.abs(Math.sin(i * 0.6) * 70) + (i % 7) * 4}%`, "--d": `${(i % 11) * 60}ms` }}/>
                  ))}
                </div>
              </div>
            ) : (
              <div className="picked-row">
                <div className="doc-icon" style={{ width: 32, height: 40, fontSize: 10 }}>{file.format}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{file.size}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}><Icon name="x" size={12}/></button>
              </div>
            )}
          </div>

          {isAudio && (
            <div className="transcribe-panel">
              <div className="transcribe-head">
                <div>
                  <div className="card-sub">{transcribe === "done" ? "Přepis hotov" : "AI přepis běží"}</div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 2 }}>
                    {transcribe === "done"
                      ? "Uloženo jako přepis rozhovoru · ~3 240 slov"
                      : "Zpracovávám audio do textu…"}
                  </div>
                </div>
                <div className={`transcribe-badge ${transcribe === "done" ? "done" : "live"}`}>
                  {transcribe === "done" ? <><Icon name="check" size={11}/> hotovo</> : <><span className="pulse-dot"/> {Math.min(100, Math.round(((stageIdx + 1) / TRANSCRIBE_STAGES.length) * 100))} %</>}
                </div>
              </div>

              <ol className="transcribe-stages">
                {TRANSCRIBE_STAGES.map((s, i) => {
                  const state = i < stageIdx ? "done" : i === stageIdx ? "live" : "pending";
                  return (
                    <li key={s.key} className={`tstage tstage-${state}`}>
                      <span className="tstage-dot">
                        {state === "done" ? <Icon name="check" size={10}/> : state === "live" ? <span className="pulse-dot"/> : null}
                      </span>
                      <span className="tstage-label">{s.label}</span>
                      <span className="tstage-detail mono">{s.detail}</span>
                    </li>
                  );
                })}
              </ol>

              {transcribe === "done" && (
                <div className="transcript-preview">
                  <div className="transcript-head">
                    <Icon name="quote" size={12}/>
                    <span className="card-sub" style={{ margin: 0 }}>Náhled přepisu · prvních 6 replik</span>
                    <span className="mono transcript-meta">2 mluvčí · {file.duration || "27:18"}</span>
                  </div>
                  <div className="transcript-body">
                    {MOCK_TRANSCRIPT.map((l, i) => (
                      <div key={i} className="transcript-line">
                        <span className="mono transcript-t">{l.t}</span>
                        <span className={`transcript-who who-${l.who === "Tazatel" ? "a" : "b"}`}>{l.who}</span>
                        <span className="transcript-text">{l.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAudio && (
            <div>
              <div className="label">Typ dokumentu <span className="required">*</span></div>
              <PickList
                options={[
                  { code: "Evaluační zpráva", name: "Evaluační zpráva", sub: "report · analýza · pivoty" },
                  { code: "Přepis",            name: "Přepis",            sub: "rozhovor · setkání · fokus skupina" },
                ]}
                value={type} onChange={setType} columns={2}
              />
            </div>
          )}

          <div className="grid-2">
            <div>
              <div className="label">Rok dat <span className="required">*</span></div>
              <PickList
                options={[2022, 2023, 2024, 2025, 2026].map(y => ({ code: y, name: String(y) }))}
                value={year} onChange={setYear} columns={5}
              />
            </div>
            <div>
              <div className="label">Region <span className="required">*</span></div>
              <select className="select" value={region} onChange={e => setRegion(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 13.5 }}>
                <option value="">— vyberte —</option>
                {data.regions.filter(r => r.active).map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                <option value="—">Napříč regiony / nezařazené</option>
              </select>
            </div>
          </div>

          <div className="upload-preview">
            <div className="card-sub">Náhled štítků</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {isAudio && <Chip tone="terra" dot>Přepis rozhovoru</Chip>}
              {!isAudio && type && <Chip tone={type === "Evaluační zpráva" ? "plum" : "terra"} dot>{type}</Chip>}
              {isAudio && <Chip tone="moss"><Icon name="mic" size={10}/> z audio</Chip>}
              {year && <Chip>{year}</Chip>}
              {region && <Chip tone="terra" dot>{region === "—" ? "napříč regiony" : data.regions.find(r => r.code === region)?.name}</Chip>}
              {!type && !year && !region && <span className="muted" style={{ fontSize: 12 }}>vyplňte typ, rok a region</span>}
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button className="btn" onClick={onClose}>Zrušit</button>
            <button className="btn btn-terra" disabled={!valid} onClick={submit}>
              <Icon name="upload" size={14}/> {isAudio ? "Uložit přepis do knihovny" : "Nahrát a indexovat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// AI ASSISTANT — RAG over library docs
// ============================================================
const EvalAssistant = ({ data, libraryDocs }) => {
  const [messages, setMessages] = React.useState([
    { role: "system", text: "Jsem RAG asistent nad knihovnou evaluací. Odpovídám s citacemi na pasáže z dokumentů." },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [scope, setScope] = React.useState(libraryDocs.map(d => d.id));
  const endRef = React.useRef(null);
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);
  React.useEffect(() => { setScope(libraryDocs.map(d => d.id)); }, [libraryDocs.length]);

  const toggleDoc = (id) => setScope(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const suggestions = [
    "Jaký je dopad form. hodnocení v regionu Kutnohorsko?",
    "Proč klesá účast v Plzeňsku v lednu?",
    "Srovnej náklady na mentoring s evropským průměrem.",
    "Co říká ředitelka KH o sběru dat?",
  ];

  const ask = async (q) => {
    if (!q.trim() || busy) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);

    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ");
    const qWords = new Set(norm(q).split(/\s+/).filter(w => w.length > 3));
    const ranked = [];
    libraryDocs.filter(d => scope.includes(d.id)).forEach(d => {
      d.chunks.forEach(c => {
        const words = norm(c.text).split(/\s+/);
        const score = words.reduce((a, w) => a + (qWords.has(w) ? 1 : 0), 0);
        if (score > 0) ranked.push({ doc: d, chunk: c, score });
      });
    });
    ranked.sort((a, b) => b.score - a.score);
    const top = ranked.slice(0, 3);

    const ctx = top.length
      ? top.map((r, i) => `[${i+1}] ${r.doc.title} (s. ${r.chunk.p}): ${r.chunk.text}`).join("\n")
      : "Žádné relevantní pasáže nenalezeny.";
    const prompt = `Jsi evaluační asistent. Odpovízej česky, stručně (max 4 věty). Používej výhradně kontext. Pokud kontext neobsahuje odpověď, řekni to. Čísla zdrojů uváděj v hranatých závorkách [1], [2]…\n\nKONTEXT:\n${ctx}\n\nOTÁZKA: ${q}`;

    let answer;
    try {
      answer = await window.claude.complete(prompt);
    } catch (e) {
      answer = "Asistent není dostupný. (V reálném nasazení by zde běžel RAG endpoint nad knihovnou.)";
    }
    setMessages(m => [...m, { role: "assistant", text: answer, sources: top }]);
    setBusy(false);
  };

  return (
    <div className="assistant-shell">
      <div className="assistant-side card">
        <div className="card-sub">Zdroje v indexu</div>
        <div className="card-title" style={{ fontSize: 15, marginBottom: 10 }}>{scope.length} z {libraryDocs.length} dokumentů</div>
        <div className="assistant-doclist">
          {libraryDocs.map(d => {
            const on = scope.includes(d.id);
            return (
              <button key={d.id} className={`assistant-doc ${on ? "on" : ""}`} onClick={() => toggleDoc(d.id)}>
                <div className="doc-icon-sm">{d.format}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{d.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>{d.type} · {d.chunks.length} pasáží</div>
                </div>
                <div className={`assistant-toggle ${on ? "on" : ""}`}>{on ? <Icon name="check" size={10}/> : null}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="assistant-main card">
        <div className="assistant-stream">
          {messages.length === 1 && (
            <div className="assistant-empty">
              <div className="assistant-spark"><Icon name="sparkle" size={28}/></div>
              <div className="empty-title">Zeptejte se na cokoli z knihovny</div>
              <div className="empty-desc">Asistent prohledá vybrané dokumenty a odpoví s odkazy na přesné pasáže.</div>
              <div className="assistant-suggestions">
                {suggestions.map(s => (
                  <button key={s} className="assistant-suggestion" onClick={() => ask(s)}>
                    <Icon name="sparkle" size={12}/> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.filter(m => m.role !== "system").map((m, i) => (
            <div key={i} className={`assistant-msg ${m.role}`}>
              <div className="assistant-avatar">{m.role === "user" ? "ŠM" : <Icon name="sparkle" size={14}/>}</div>
              <div className="assistant-bubble">
                <div className="assistant-text">{m.text}</div>
                {m.sources?.length > 0 && (
                  <div className="assistant-sources">
                    <div className="card-sub" style={{ marginBottom: 6 }}>Zdroje</div>
                    {m.sources.map((s, j) => (
                      <div key={j} className="assistant-source">
                        <div className="source-num mono">[{j+1}]</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{s.doc.title} <span className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>· s. {s.chunk.p}</span></div>
                          <div className="source-snippet">{s.chunk.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="assistant-msg assistant">
              <div className="assistant-avatar"><Icon name="sparkle" size={14}/></div>
              <div className="assistant-bubble">
                <div className="typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        <form className="assistant-input" onSubmit={e => { e.preventDefault(); ask(input); }}>
          <input className="input" placeholder="Zeptám se asistenta…" value={input} onChange={e => setInput(e.target.value)} disabled={busy}/>
          <button type="submit" className="btn btn-terra" disabled={busy || !input.trim()}>
            <Icon name="arrow" size={14}/>
          </button>
        </form>
      </div>
    </div>
  );
};

// Default library seed (used by app.jsx)
const INITIAL_LIBRARY = [
  {
    id: "D1", title: "Evaluační zpráva — Q1 2026", type: "Evaluační zpráva", year: 2026, format: "pdf", region: "—", date: "2026-04-02", size: "2.4 MB",
    chunks: [
      { p: 3,  text: "V regionu Kutnohorsko realizováno 12 setkání s celkovou účastí 184 žákových dnů. Průměrná docházka 86 % přesahuje plánovaný cíl 80 %." },
      { p: 7,  text: "Formální leadership (Znak 2): ředitelé sami uvádějí posun v distribuovaném vedeni; nejsilnější efekt na ZS Palacha a Gymnáziu Ortena." },
      { p: 12, text: "Wellbeing kohorta v Plzeňsku vykazuje vyšší early-drop — především v lednovém bloku Restorativní praxe. Doporučujeme zkrátit interval mezi setkáními." },
      { p: 18, text: "Náklad na účastníka při mentoringu ředitelů činí 4 200 Kč, přičemž srovnatelné program y v EU se pohybují 5 800–7 200 Kč." },
    ],
  },
  {
    id: "D2", title: "Přepis rozhovoru · ředitelka KH", type: "Přepis", year: 2026, format: "md", region: "KUT", date: "2026-02-04", size: "84 kB",
    chunks: [
      { p: 1, text: "„Form. hodnocení nám otevřelo oči — žáci sami začali každý týden formulovat kritéria úspěchu. Sbor má společný jazyk.“" },
      { p: 2, text: "Bariérou byla časová dotace — dvě setkání do měsíce učitelé vnímali jako maximum slučitelné s rozvrhem." },
      { p: 3, text: "Sbírání dat z prezencí bylo nejhorší částí projektu. Excel s rukou psanými jmény přestal postačovat již v listopadu." },
    ],
  },
  {
    id: "D3", title: "Evaluační zpráva · pilot 2024/25", type: "Evaluační zpráva", year: 2025, format: "pdf", region: "—", date: "2025-09-01", size: "4.1 MB",
    chunks: [
      { p: 4,  text: "Pilotní fáze zahrnula 4 regiony, 38 intervencí a celkem 412 unikátních účastníků. Dokončenost 84 %." },
      { p: 11, text: "Doporučený rytmus nácviku: 5 setkání po 3 hodinách s 14denní pauzou pro implementaci ve třídě." },
      { p: 22, text: "Kontraindikace: zavádění FH bez podpory vedení školy výrazně zvyšuje riziko návratu k tradičnímu známkování do 6 měsíců." },
    ],
  },
  {
    id: "D4", title: "Přepis · fokus skupina Plzeň", type: "Přepis", year: 2026, format: "txt", region: "PLZ", date: "2026-03-19", size: "32 kB",
    chunks: [
      { p: 1, text: "Setkání 6/8 · žákovský parlament · přítomno 19 z 24 účastníků (79 %). 3 omluveni, 2 bez vyjádření." },
    ],
  },
];

Object.assign(window, { EvaluatorApp, INITIAL_LIBRARY });
