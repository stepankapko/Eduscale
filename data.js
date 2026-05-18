// EduScale data — extended for participant registration / event signup / coordinator attendance
window.EDUSCALE_DATA = (() => {
  const regions = [
    { code: "KUT", name: "Kutnohorsko", orp: "Kutná Hora", active: true,  coordinator: "Lucie Horáková" },
    { code: "OLO", name: "Olomoucko",    orp: "Olomouc",    active: true,  coordinator: "Rolando Svoboda" },
    { code: "PLZ", name: "Plzeňsko",     orp: "Plzeň",      active: true,  coordinator: "Karel Němec" },
    { code: "LIB", name: "Liberecko",    orp: "Liberec",    active: false, coordinator: "—" },
  ];

  const schools = [
    { redizo: "600046559", name: "ZŠ Kutná Hora, Jana Palacha",   region: "KUT", type: "ZŠ" },
    { redizo: "600046612", name: "ZŠ Čáslav, Masarykova",         region: "KUT", type: "ZŠ" },
    { redizo: "600046708", name: "MŠ Kutná Hora, Pohádka",        region: "KUT", type: "MŠ" },
    { redizo: "600046890", name: "Gymnázium Jiřího Ortena",       region: "KUT", type: "SŠ" },
    { redizo: "600171027", name: "ZŠ Olomouc, Holická",           region: "OLO", type: "ZŠ" },
    { redizo: "600171108", name: "ZŠ Olomouc, Komenium",          region: "OLO", type: "ZŠ" },
    { redizo: "600171221", name: "MŠ Olomouc, Michalské",         region: "OLO", type: "MŠ" },
    { redizo: "600069168", name: "ZŠ Plzeň, Schwarzova",          region: "PLZ", type: "ZŠ" },
    { redizo: "600069249", name: "ZŠ Plzeň, Božkovská",           region: "PLZ", type: "ZŠ" },
    { redizo: "600069320", name: "SŠ Plzeň, Křimická",            region: "PLZ", type: "SŠ" },
    { redizo: "—",         name: "Jiná instituce / NNO",          region: "—",   type: "Jiné" },
  ];

  // Catalog (číselník) of intervention types — drives drop-downs everywhere
  const interventionTypes = [
    { code: "WS",  name: "Workshop",                desc: "Jednorázové či série setkání" },
    { code: "MV",  name: "Mentoring",               desc: "Dlouhodobé párové vedení" },
    { code: "PL",  name: "Pedagogická porada",      desc: "Sborovna / leadership tým" },
    { code: "SB",  name: "Sdílení dobré praxe",     desc: "Krátké výměny mezi školami" },
    { code: "KO",  name: "Konference / setkání",    desc: "Hromadná akce regionálního CPV" },
  ];

  const interventionTopics = [
    { code: "FH", name: "Formativní hodnocení",      pillar: "Znak 7" },
    { code: "PL", name: "Pedagogický leadership",    pillar: "Znak 2" },
    { code: "SP", name: "Spolupráce ve sboru",       pillar: "Znak 3" },
    { code: "WB", name: "Wellbeing a klima školy",   pillar: "Znak 6" },
    { code: "MV", name: "Mentoring začínajících",    pillar: "Znak 4" },
    { code: "RO", name: "Rodiče jako partneři",      pillar: "Znak 3" },
  ];

  const targetGroups   = ["Učitelé", "Ředitelé", "Asistenti pedagoga", "Rodiče", "Žáci", "Všichni"];
  const fundingSources = ["Eduzměna", "OP JAK", "MŠMT — šablony", "Nadace OSF", "Krajský úřad", "Vlastní zdroje"];
  const cpvCodes       = ["80100000-5  Vzdělávání", "80400000-8  Vzdělávání dospělých", "80500000-9  Vzdělávací služby"];

  // Roles a participant might select (drop-down — no typing)
  const participantRoles = ["Učitel/ka 1. stupně", "Učitel/ka 2. stupně", "Ředitel/ka", "Zástupce ředitele", "Asistent/ka pedagoga", "Vychovatel/ka", "Speciální pedagog", "Rodič", "Nepedagogický pracovník"];
  const experienceBands  = ["0–2 roky", "3–5 let", "6–10 let", "11–20 let", "21+ let"];

  // === Pre-registered participants (database) ===
  const participants = [
    { id: "P-2031", firstName: "Jana",     lastName: "Nováková",   email: "jana.novakova@palacha.cz",  redizo: "600046559", role: "Učitel/ka 2. stupně", experience: "11–20 let", registeredAt: "2025-09-12" },
    { id: "P-2032", firstName: "Petr",     lastName: "Svoboda",    email: "p.svoboda@palacha.cz",       redizo: "600046559", role: "Ředitel/ka",          experience: "21+ let",   registeredAt: "2025-09-14" },
    { id: "P-2033", firstName: "Martina",  lastName: "Horáková",   email: "horakova@caslav-zs.cz",      redizo: "600046612", role: "Učitel/ka 1. stupně", experience: "6–10 let",  registeredAt: "2025-09-19" },
    { id: "P-2034", firstName: "Tomáš",    lastName: "Dvořák",     email: "dvorak@gymno.cz",            redizo: "600046890", role: "Učitel/ka 2. stupně", experience: "3–5 let",   registeredAt: "2025-10-02" },
    { id: "P-2035", firstName: "Eva",      lastName: "Černá",      email: "cerna@msolomouc.cz",         redizo: "600171221", role: "Vychovatel/ka",       experience: "6–10 let",  registeredAt: "2025-10-08" },
    { id: "P-2036", firstName: "Kateřina", lastName: "Procházková",email: "k.prochazkova@holicka.cz",   redizo: "600171027", role: "Učitel/ka 1. stupně", experience: "0–2 roky",  registeredAt: "2025-10-21" },
    { id: "P-2037", firstName: "Michal",   lastName: "Kučera",     email: "kucera@bozkovska.cz",        redizo: "600069249", role: "Asistent/ka pedagoga",experience: "3–5 let",   registeredAt: "2025-11-04" },
    { id: "P-2038", firstName: "Lucie",    lastName: "Veselá",     email: "vesela@schwarzova.cz",       redizo: "600069168", role: "Učitel/ka 2. stupně", experience: "21+ let",   registeredAt: "2025-11-12" },
    { id: "P-2039", firstName: "David",    lastName: "Krejčí",     email: "krejci@krimicka.cz",         redizo: "600069320", role: "Speciální pedagog",   experience: "11–20 let", registeredAt: "2025-11-25" },
    { id: "P-2040", firstName: "Markéta",  lastName: "Pospíšilová",email: "pospisilova@palacha.cz",     redizo: "600046559", role: "Učitel/ka 1. stupně", experience: "6–10 let",  registeredAt: "2026-01-09" },
  ];

  // === Interventions = series of meetings, with sign-ups + payments ===
  const interventions = [
    {
      id: "INT-2026-014",
      name: "Formativní hodnocení v praxi · jaro 2026",
      typeCode: "WS",
      topicCode: "FH",
      target: "Učitelé",
      funding: "Eduzměna",
      cpv: "80100000-5  Vzdělávání",
      region: "KUT",
      coordinator: "Lucie Horáková",
      schoolYear: "2025/26",
      year: 2026,
      price: 1490,
      capacity: 18,
      meetings: [
        { id: "M1", date: "2026-04-08", time: "14:00–17:00", venue: "ZŠ Palacha · Kutná Hora", topic: "Vstupní mapování, Exit Ticket" },
        { id: "M2", date: "2026-04-22", time: "14:00–17:00", venue: "ZŠ Palacha · Kutná Hora", topic: "Kritéria úspěchu" },
        { id: "M3", date: "2026-05-06", time: "14:00–17:00", venue: "ZŠ Palacha · Kutná Hora", topic: "Vrstevnické hodnocení" },
        { id: "M4", date: "2026-05-20", time: "14:00–17:00", venue: "ZŠ Palacha · Kutná Hora", topic: "Sebehodnocení žáků" },
        { id: "M5", date: "2026-06-03", time: "14:00–17:00", venue: "ZŠ Palacha · Kutná Hora", topic: "Sdílení a reflexe" },
      ],
      signups: ["P-2031","P-2033","P-2040","P-2032","P-2034"],
      paid:    ["P-2031","P-2033","P-2040","P-2032"],
    },
    {
      id: "INT-2026-015",
      name: "Pedagogický leadership · ředitelská skupina",
      typeCode: "MV",
      topicCode: "PL",
      target: "Ředitelé",
      funding: "OP JAK",
      cpv: "80400000-8  Vzdělávání dospělých",
      region: "OLO",
      coordinator: "Rolando Svoboda",
      schoolYear: "2025/26",
      year: 2026,
      price: 0,
      capacity: 8,
      meetings: [
        { id: "M1", date: "2026-04-15", time: "09:00–13:00", venue: "CPV Olomouc",        topic: "Vize a strategie" },
        { id: "M2", date: "2026-05-13", time: "09:00–13:00", venue: "CPV Olomouc",        topic: "Distribuované vedení" },
        { id: "M3", date: "2026-06-10", time: "09:00–13:00", venue: "CPV Olomouc",        topic: "Reflexe a další kroky" },
      ],
      signups: ["P-2032","P-2036","P-2038"],
      paid:    ["P-2032","P-2036","P-2038"],
    },
    {
      id: "INT-2026-012",
      name: "Wellbeing a klima · celoroční kohorta",
      typeCode: "WS",
      topicCode: "WB",
      target: "Všichni",
      funding: "Nadace OSF",
      cpv: "80500000-9  Vzdělávací služby",
      region: "PLZ",
      coordinator: "Karel Němec",
      schoolYear: "2025/26",
      year: 2026,
      price: 990,
      capacity: 24,
      meetings: [
        { id: "M1",  date: "2025-10-02", time: "13:30–16:30", venue: "ZŠ Schwarzova",       topic: "Úvod do wellbeingu" },
        { id: "M2",  date: "2025-11-06", time: "13:30–16:30", venue: "ZŠ Schwarzova",       topic: "Třídnická hodina" },
        { id: "M3",  date: "2025-12-04", time: "13:30–16:30", venue: "ZŠ Schwarzova",       topic: "Restorativní praxe" },
        { id: "M4",  date: "2026-01-15", time: "13:30–16:30", venue: "ZŠ Božkovská",        topic: "Pravidla a hranice" },
        { id: "M5",  date: "2026-02-12", time: "13:30–16:30", venue: "ZŠ Božkovská",        topic: "Konflikty a mediace" },
        { id: "M6",  date: "2026-03-19", time: "13:30–16:30", venue: "SŠ Křimická",         topic: "Žákovský parlament" },
        { id: "M7",  date: "2026-04-16", time: "13:30–16:30", venue: "SŠ Křimická",         topic: "Rodiče a komunita" },
        { id: "M8",  date: "2026-05-14", time: "13:30–16:30", venue: "ZŠ Schwarzova",       topic: "Sebepéče učitelů" },
      ],
      signups: ["P-2037","P-2038","P-2039","P-2031"],
      paid:    ["P-2037","P-2038","P-2039"],
    },
  ];

  // attendance state — meeting × participant. Pre-fill the past meetings (✓), leave future blank.
  const today = "2026-04-10";
  const attendance = {};
  interventions.forEach(iv => {
    attendance[iv.id] = {};
    iv.meetings.forEach(m => {
      attendance[iv.id][m.id] = {};
      iv.paid.forEach(pid => {
        if (m.date < today) {
          // past — stochastic-but-stable based on string hash
          const h = (iv.id + m.id + pid).split("").reduce((a,c) => a + c.charCodeAt(0), 0);
          attendance[iv.id][m.id][pid] = (h % 7) === 0 ? "absent" : "present";
        } else {
          attendance[iv.id][m.id][pid] = null;
        }
      });
    });
  });

  return {
    regions, schools, interventionTypes, interventionTopics,
    targetGroups, fundingSources, cpvCodes,
    participantRoles, experienceBands,
    participants, interventions, attendance,
    today,
  };
})();
