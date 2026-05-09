// === Evaluator: dashboard + data + people + library + AI assistant ===
const EvaluatorApp = ({ data, route, attendance }) => {
  return (
    <>
      {route === "e-dashboard" && <EvalDashboard data={data} attendance={attendance}/>}
      {route === "e-data"      && <EvalData data={data} attendance={attendance}/>}
      {route === "e-people"    && <EvalPeople data={data} attendance={attendance}/>}
      {route === "e-library"   && <EvalLibrary data={data}/>}
      {route === "e-assistant" && <EvalAssistant data={data}/>}
    </>
  );
};

// Helpers — derive event-like records from interventions+meetings+attendance
const deriveEvents = (data, attendance) => {
  const events = [];
  data.interventions.forEach(iv => {
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

const EvalDashboard = ({ data, attendance }) => {
  const events = deriveEvents(data, attendance);
  const [region, setRegion] = React.useState("");
  const [topic, setTopic] = React.useState("");

  const filtered = events.filter(e => (!region || e.region === region) && (!topic || e.topic === topic));

  const totalMeetings = filtered.length;
  const totalAttendances = filtered.reduce((a, e) => a + e.presentIds.length, 0);
  const uniqueParticipants = new Set();
  filtered.forEach(e => e.presentIds.forEach(pid => uniqueParticipants.add(pid)));
  const totalHours = filtered.reduce((a, e) => a + e.hours, 0);

  // By month
  const byMonth = {};
  filtered.forEach(e => { const m = e.date.slice(0,7); byMonth[m] = (byMonth[m]||0)+1; });
  const months = Object.keys(byMonth).sort();
  const maxMonth = Math.max(1, ...Object.values(byMonth));

  // By topic
  const byTopic = {};
  filtered.forEach(e => { byTopic[e.topic] = (byTopic[e.topic]||0) + e.presentIds.length; });
  const topicEntries = Object.entries(byTopic).sort((a,b) => b[1]-a[1]);
  const maxTopic = Math.max(1, ...Object.values(byTopic));

  // By target group
  const byTarget = {};
  filtered.forEach(e => { byTarget[e.target] = (byTarget[e.target]||0) + e.presentIds.length; });

  // By region
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

        <div className="card">
          <div className="card-title" style={{ fontSize: 15 }}>Stav přihlášek</div>
          <div className="card-sub" style={{ marginBottom: 12 }}>Napříč intervencemi</div>
          {(() => {
            const totSign = data.interventions.reduce((a, iv) => a + iv.signups.length, 0);
            const totPaid = data.interventions.reduce((a, iv) => a + iv.paid.length, 0);
            const totCap  = data.interventions.reduce((a, iv) => a + iv.capacity, 0);
            const ratio = totCap > 0 ? totSign / totCap : 0;
            return (
              <>
                <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>{Math.round(ratio*100)}<span className="mono" style={{ fontSize: 14, color: "var(--ink-500)" }}> %</span></div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>obsazenost kapacity</div>
                <div style={{ height: 8, background: "var(--ink-100)", borderRadius: 4, marginTop: 12, overflow: "hidden", display: "flex" }}>
                  <div style={{ flex: totPaid, background: "var(--moss)" }}/>
                  <div style={{ flex: totSign - totPaid, background: "var(--amber)" }}/>
                  <div style={{ flex: totCap - totSign, background: "var(--ink-100)" }}/>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span><span style={{ display:"inline-block", width: 8, height: 8, background:"var(--moss)", marginRight: 4, borderRadius: 2 }}/> Zaplaceno {totPaid}</span>
                  <span><span style={{ display:"inline-block", width: 8, height: 8, background:"var(--amber)", marginRight: 4, borderRadius: 2 }}/> Přihl. nezapl. {totSign-totPaid}</span>
                  <span><span style={{ display:"inline-block", width: 8, height: 8, background:"var(--ink-100)", marginRight: 4, borderRadius: 2, border: "1px solid var(--ink-200)" }}/> Volno {totCap-totSign}</span>
                </div>
              </>
            );
          })()}
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

const EvalData = ({ data, attendance }) => {
  const [iv, setIv] = React.useState(data.interventions[0].id);
  const intervention = data.interventions.find(i => i.id === iv);

  return (
    <div>
      <div className="filterbar">
        <div className="label">Intervence</div>
        <select className="select" value={iv} onChange={e => setIv(e.target.value)} style={{ minWidth: 320 }}>
          {data.interventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <Chip tone="terra" dot>{data.regions.find(r => r.code === intervention.region)?.name}</Chip>
        <Chip>{intervention.coordinator}</Chip>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-sm"><Icon name="download" size={12}/> Stáhnout raw data</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
          <div>
            <div className="card-title">Matice docházky</div>
            <div className="card-sub">Účastník × setkání · ✓ přítomen / ✗ chybí / · zatím nezaznamenáno</div>
          </div>
          <Chip>{intervention.paid.length} účastníků × {intervention.meetings.length} setkání</Chip>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data attendance-matrix">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Účastník</th>
                {intervention.meetings.map((m, i) => (
                  <th key={m.id} style={{ textAlign: "center" }}>
                    <div className="mono" style={{ fontSize: 10 }}>{i+1}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--ink-500)" }}>{m.date.slice(5)}</div>
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Účast</th>
              </tr>
            </thead>
            <tbody>
              {intervention.paid.map(pid => {
                const p = data.participants.find(x => x.id === pid);
                let presentCount = 0; let totalRecorded = 0;
                const cells = intervention.meetings.map(m => {
                  const s = attendance[intervention.id]?.[m.id]?.[pid];
                  if (s) totalRecorded++;
                  if (s === "present") presentCount++;
                  return s;
                });
                return (
                  <tr key={pid}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.id} · {p.role}</div>
                    </td>
                    {cells.map((s, i) => (
                      <td key={i} style={{ textAlign: "center", padding: "6px" }}>
                        {s === "present" && <span className="att-cell present">✓</span>}
                        {s === "absent"  && <span className="att-cell absent">✗</span>}
                        {!s && <span className="att-cell pending">·</span>}
                      </td>
                    ))}
                    <td style={{ textAlign: "right" }} className="mono">
                      <strong>{presentCount}</strong>/{totalRecorded || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EvalPeople = ({ data, attendance }) => {
  // Aggregate per-participant attendance across all interventions
  const stats = data.participants.map(p => {
    let present = 0, absent = 0, signedUp = 0;
    const ivList = [];
    data.interventions.forEach(iv => {
      if (iv.signups.includes(p.id)) {
        signedUp++;
        ivList.push(iv);
        iv.meetings.forEach(m => {
          const s = attendance[iv.id]?.[m.id]?.[p.id];
          if (s === "present") present++;
          if (s === "absent")  absent++;
        });
      }
    });
    return { ...p, present, absent, signedUp, ivList };
  });

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
        <div>
          <div className="card-title">Unikátní účastníci · cross-intervence</div>
          <div className="card-sub">Deduplikováno dle ID · žádná duplicita ze psaní jména</div>
        </div>
        <Chip>{data.participants.length} osob</Chip>
      </div>
      <table className="data">
        <thead><tr><th>ID</th><th>Jméno</th><th>Role</th><th>Praxe</th><th>Škola</th><th style={{textAlign:"right"}}>Intervence</th><th style={{textAlign:"right"}}>Přítomen</th><th style={{textAlign:"right"}}>Chybí</th><th>Aktivita</th></tr></thead>
        <tbody>
          {stats.map(p => {
            const total = p.present + p.absent;
            const ratio = total > 0 ? p.present / total : 0;
            return (
              <tr key={p.id}>
                <td className="mono">{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                <td><Chip>{p.role}</Chip></td>
                <td className="mono">{p.experience}</td>
                <td>{data.schools.find(s => s.redizo === p.redizo)?.name}</td>
                <td style={{textAlign:"right"}} className="mono">{p.signedUp}</td>
                <td style={{textAlign:"right"}} className="mono"><strong>{p.present}</strong></td>
                <td style={{textAlign:"right"}} className="mono">{p.absent}</td>
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
        </tbody>
      </table>
    </div>
  );
};

// === Library docs (shared with assistant for RAG) ===
const LIBRARY_DOCS = [
  {
    id: "D1", title: "Evaluační zpráva — Q1 2026", type: "Analýza", format: "pdf", region: "—", date: "2026-04-02", size: "2.4 MB",
    chunks: [
      { p: 3,  text: "V regionu Kutnohorsko realizováno 12 setkání s celkovou účastí 184 žákových dnů. Průměrná docházka 86 % přesahuje plánovaný cíl 80 %." },
      { p: 7,  text: "Formální leadership (Znak 2): ředitelé sami uvádějí posun v distribuovaném vedeni; nejsilnější efekt na ZS Palacha a Gymnáziu Ortena." },
      { p: 12, text: "Wellbeing kohorta v Plzeňsku vykazuje vyšší early-drop — především v lednovém bloku Restorativní praxe. Doporučujeme zkrátit interval mezi setkáními." },
      { p: 18, text: "Náklad na účastníka při mentoringu ředitelů činí 4 200 Kč, přičemž srovnatelné program y v EU se pohybují 5 800–7 200 Kč." },
    ],
  },
  {
    id: "D2", title: "Přepis rozhovoru · ředitelka KH", type: "Přepis", format: "md", region: "KUT", date: "2026-02-04", size: "84 kB",
    chunks: [
      { p: 1, text: "„Form. hodnocení nám otevřelo oči — žáci sami začali každý týden formulovat kritéria úspěchu. Sbor má společný jazyk.“" },
      { p: 2, text: "Bariérou byla časová dotace — dvě setkání do měsíce učitelé vnímali jako maximum slučitelné s rozvrhem." },
      { p: 3, text: "Sbírání dat z prezencí bylo nejhorší částí projektu. Excel s rukou psanými jmény přestal postačovat již v listopadu." },
    ],
  },
  {
    id: "D3", title: "Metodika · Formativní hodnocení", type: "Metodika", format: "pdf", region: "—", date: "2025-09-01", size: "4.1 MB",
    chunks: [
      { p: 4,  text: "Form. hodnocení = průběžné zjišťování pochopení s cílem upravit další výuku, nikoli známkovat. Klasické nástroje: Exit Ticket, Kritéria úspěchu, Vrstevnické hodnocení." },
      { p: 11, text: "Doporučený sěch nácviku: 5 setkání po 3 hodinách s 14denní pauzou pro implementaci ve třídě." },
      { p: 22, text: "Kontraindikace: zavádění FH bez podpory vedení školy výrazně zvyšuje riziko návratu k tradičnímu známkování do 6 měsíců." },
    ],
  },
  {
    id: "D4", title: "Prezenční listina · WB / Schwarzova", type: "Docházka", format: "xlsx", region: "PLZ", date: "2026-03-19", size: "32 kB",
    chunks: [
      { p: 1, text: "Setkání 6/8 · žákovský parlament · přítomno 19 z 24 zaplacených účastníků (79 %). 3 omluveni, 2 bez vyjádření." },
    ],
  },
];

const EvalLibrary = ({ data }) => {
  return (
    <div className="lib-grid">
      {LIBRARY_DOCS.map(d => (
        <div key={d.id} className="doc-card">
          <div className="doc-head">
            <div className="doc-icon">{d.format}</div>
            <div style={{ flex: 1 }}>
              <div className="doc-title">{d.title}</div>
              <div className="doc-meta">{d.type} · {d.date} · {d.size}</div>
            </div>
          </div>
          <div className="doc-tags">
            <Chip tone="terra" dot>{d.region}</Chip>
            <Chip>{d.type}</Chip>
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>
            {d.chunks.length} indexovaných pasáží · dostupné v AI asistentovi
          </div>
        </div>
      ))}
    </div>
  );
};

// === AI assistant — RAG over LIBRARY_DOCS ===
const EvalAssistant = ({ data }) => {
  const [messages, setMessages] = React.useState([
    { role: "system", text: "Jsem RAG asistent nad knihovnou evaluací. Odpovídám s citacemi na pasáže z dokumentů." },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [scope, setScope] = React.useState(LIBRARY_DOCS.map(d => d.id));
  const endRef = React.useRef(null);
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);

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

    // Naive retrieval: rank chunks by overlap of stemmed words
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ");
    const qWords = new Set(norm(q).split(/\s+/).filter(w => w.length > 3));
    const ranked = [];
    LIBRARY_DOCS.filter(d => scope.includes(d.id)).forEach(d => {
      d.chunks.forEach(c => {
        const words = norm(c.text).split(/\s+/);
        const score = words.reduce((a, w) => a + (qWords.has(w) ? 1 : 0), 0);
        if (score > 0) ranked.push({ doc: d, chunk: c, score });
      });
    });
    ranked.sort((a, b) => b.score - a.score);
    const top = ranked.slice(0, 3);

    // Build prompt and call window.claude
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
        <div className="card-title" style={{ fontSize: 15, marginBottom: 10 }}>{scope.length} z {LIBRARY_DOCS.length} dokumentů</div>
        <div className="assistant-doclist">
          {LIBRARY_DOCS.map(d => {
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

Object.assign(window, { EvaluatorApp });
