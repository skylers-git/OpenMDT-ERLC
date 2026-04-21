// ── STATE ─────────────────────────────────────
const STORAGE_KEY = 'mdt_incidents_v2';

function getIncidents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveIncidents(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// ── SESSION & AGENCY ───────────────────────────
const AGENCY_CONFIG = {
  PD: {
    short:    'RCPD',
    long:     'RIVER CITY POLICE DEPARTMENT',
    topbar:   'METRO PD',
    sub:      'MOBILE DATA TERMINAL',
    loginName:'METRO PD',
    loginSub: 'RIVER CITY POLICE DEPARTMENT',
    sysLabel: '◆ SECURE MDT ACCESS — OFFICER SIGN-ON ◆',
    csLabel:  'UNIT / CALLSIGN',
    csHint:   'e.g. 4-ADAM-12',
    btnText:  '▶ &nbsp; SIGN ON DUTY',
    bodyClass:'agency-pd'
  },
  SO: {
    short:    'LCSO',
    long:     'LIBERTY COUNTY SHERIFF\'S OFFICE',
    topbar:   'LCSO',
    sub:      'MOBILE DATA TERMINAL',
    loginName:'LCSO',
    loginSub: 'LIBERTY COUNTY SHERIFF\'S OFFICE',
    sysLabel: '◆ SECURE MDT ACCESS — DEPUTY SIGN-ON ◆',
    csLabel:  'DISTRICT / CALLSIGN',
    csHint:   'e.g. KING-31',
    btnText:  '▶ &nbsp; SIGN ON DUTY',
    bodyClass:'agency-sheriff'
  }
};

let selectedAgency = 'PD';

// ── THEME APPLICATION ──────────────────────────
function applyTheme(agency) {
  // Set body theme class
  document.body.classList.remove('theme-pd', 'theme-lcso', 'agency-pd', 'agency-sheriff');
  if (agency === 'SO') {
    document.body.classList.add('theme-lcso', 'agency-sheriff');
  } else {
    document.body.classList.add('theme-pd', 'agency-pd');
  }

  // Swap topbar badge icons (CSS handles it via class, but also set directly for safety)
  const shield = document.getElementById('badge-shield');
  const star   = document.getElementById('badge-star');
  if (shield) shield.style.display = agency === 'SO' ? 'none'  : 'block';
  if (star)   star.style.display   = agency === 'SO' ? 'block' : 'none';

  // Persist to localStorage so theme survives page refresh
  localStorage.setItem('mdt_theme', agency);
}

function selectAgency(agency) {
  selectedAgency = agency;
  const cfg = AGENCY_CONFIG[agency];

  // Apply full theme (classes + badge swap + localStorage)
  applyTheme(agency);

  // Toggle login buttons
  const togglePD = document.getElementById('toggle-pd');
  const toggleSO = document.getElementById('toggle-so');
  if (togglePD) {
    togglePD.classList.toggle('active', agency === 'PD');
    togglePD.classList.remove('sheriff');
  }
  if (toggleSO) {
    toggleSO.classList.toggle('active', agency === 'SO');
    if (agency === 'SO') toggleSO.classList.add('sheriff');
    else toggleSO.classList.remove('sheriff');
  }

  // Update login screen text
  const agencyNameEl = document.getElementById('login-agency-name');
  const systemLabelEl = document.getElementById('login-system-label');
  const subEl = document.getElementById('login-agency-sub');
  const csLabel = document.getElementById('callsign-label');
  const csInput = document.getElementById('login-callsign');
  const btn = document.getElementById('login-btn');

  if (agencyNameEl) agencyNameEl.textContent = cfg.loginName;
  if (systemLabelEl) systemLabelEl.textContent = cfg.sysLabel;
  if (subEl) subEl.textContent = cfg.loginSub;
  if (csLabel) csLabel.textContent = cfg.csLabel;
  if (csInput) csInput.placeholder = cfg.csHint;
  if (btn) btn.innerHTML = cfg.btnText;

  // Update login seal ring accent color inline for immediate visual feedback
  document.querySelectorAll('.seal-ring-outer').forEach((r, i) => {
    r.style.borderColor = agency === 'SO' ? '#8b7020' : '';
    r.style.boxShadow   = agency === 'SO'
      ? '0 0 18px rgba(212,175,55,0.2), inset 0 0 18px rgba(212,175,55,0.06)'
      : '';
  });
}

function getOfficerStr() {
  const name = sessionStorage.getItem('mdt_officer_name') || '—';
  const cs   = sessionStorage.getItem('mdt_callsign') || '—';
  const ag   = sessionStorage.getItem('mdt_agency') || 'PD';
  const short = AGENCY_CONFIG[ag]?.short || 'RCPD';
  return `${short} | ${cs.toUpperCase()} | ${name.toUpperCase()}`;
}

function updateOfficerDisplays() {
  const name  = (sessionStorage.getItem('mdt_officer_name') || '—').toUpperCase();
  const cs    = (sessionStorage.getItem('mdt_callsign') || '—').toUpperCase();
  const ag    = sessionStorage.getItem('mdt_agency') || 'PD';
  const cfg   = AGENCY_CONFIG[ag] || AGENCY_CONFIG.PD;
  const str   = getOfficerStr();

  // Topbar agency name + officer line
  const tb = document.getElementById('topbar-officer-display');
  if (tb) tb.textContent = `${cfg.short} | ${cs} | ${name}`;

  const tan = document.getElementById('topbar-agency-name');
  if (tan) tan.textContent = cfg.topbar;

  const tas = document.getElementById('topbar-agency-sub');
  if (tas) tas.textContent = cfg.sub;

  // Nav footer
  const nf = document.getElementById('nav-footer-session');
  if (nf) nf.innerHTML = `SYS v4.2.1<br>ENCRYPTED<br>SHIFT: DAY<br><br><span style="color:var(--cyber);letter-spacing:0;">${cfg.short} — ${cs}</span><br><span style="font-size:9px;">${name}</span>`;

  // All officer display divs in forms
  ['inc-officer','pca-affiant','sw-affiant','pur-officer','ev-by'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.tagName !== 'INPUT') el.textContent = str;
  });

  // Apply correct theme class
  applyTheme(ag);
}

function signOn() {
  const nameEl = document.getElementById('login-name');
  const csEl   = document.getElementById('login-callsign');
  const errEl  = document.getElementById('login-error');

  const name = nameEl.value.trim();
  const cs   = csEl.value.trim();

  if (!name) { errEl.textContent = '⚠ OFFICER NAME IS REQUIRED'; nameEl.focus(); return; }
  if (!cs)   { errEl.textContent = '⚠ UNIT / CALLSIGN IS REQUIRED'; csEl.focus(); return; }

  sessionStorage.setItem('mdt_officer_name', name);
  sessionStorage.setItem('mdt_callsign', cs.toUpperCase());
  sessionStorage.setItem('mdt_agency', selectedAgency);

  // Persist theme to localStorage so it survives full page refresh
  localStorage.setItem('mdt_theme', selectedAgency);
  applyTheme(selectedAgency);

  document.getElementById('login-overlay').classList.add('hidden');
  updateOfficerDisplays();
  renderDispatch();
  startAmbientCAD();
}

function signOff() {
  if (!confirm('SIGN OFF DUTY?\n\nThis will end your current session.')) return;
  sessionStorage.removeItem('mdt_officer_name');
  sessionStorage.removeItem('mdt_callsign');
  sessionStorage.removeItem('mdt_agency');
  localStorage.removeItem('mdt_theme');
  stopAmbientCAD();

  ['inc-officer','pca-affiant','sw-affiant','pur-officer','ev-by'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.tagName !== 'INPUT') el.textContent = '—';
  });
  document.getElementById('topbar-officer-display').textContent = 'UNIT —  |  —';
  document.getElementById('topbar-agency-name').textContent = 'METRO PD';

  // Reset login form
  document.getElementById('login-name').value = '';
  document.getElementById('login-callsign').value = '';
  document.getElementById('login-error').textContent = '';
  selectAgency('PD');
  document.getElementById('login-overlay').classList.remove('hidden');
}

// ── CLOCK ─────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0') + ':' +
    String(now.getSeconds()).padStart(2,'0');
}
setInterval(updateClock, 1000);
updateClock();

// ── TAB NAVIGATION ────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');

  if (tab === 'database') renderDatabase();
  if (tab === 'dispatch') renderDispatch();
}

function switchSearchTab(tab, btn) {
  document.querySelectorAll('.search-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.search-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('search-' + tab).classList.add('active');
}

// ── DISPATCH ──────────────────────────────────
const MOCK_CALLS = [
  { id:'CAD-0441', type:'SUSPICIOUS VEHICLE', addr:'400 BLK N. MAPLE AVE', time:'14 MIN AGO', priority:'high', unit:'4A-6', status:'DISPATCHED' },
  { id:'CAD-0438', type:'DOMESTIC DISTURBANCE', addr:'1832 WESTBROOK DR', time:'31 MIN AGO', priority:'high', unit:'4A-9', status:'ON SCENE' },
  { id:'CAD-0435', type:'THEFT IN PROGRESS', addr:'CENTRAL MALL — WEST ENTRANCE', time:'42 MIN AGO', priority:'med', unit:'4B-3', status:'RESPONDING' },
  { id:'CAD-0431', type:'TRAFFIC ACCIDENT', addr:'HWY 40 & COLISEUM BLVD', time:'1 HR AGO', priority:'med', unit:'4A-12', status:'CLEARING' },
  { id:'CAD-0429', type:'WELFARE CHECK', addr:'2204 OHIO ST, APT 3B', time:'1.2 HRS AGO', priority:'low', unit:'—', status:'OPEN' },
  { id:'CAD-0424', type:'NOISE COMPLAINT', addr:'900 BLK DELAWARE ST', time:'1.8 HRS AGO', priority:'low', unit:'4C-1', status:'CLOSED' },
];

const MOCK_UNITS = [
  { cs:'4A-6', name:'OBRYAN / REYES', status:'DISPATCHED', dot:'dot-amber' },
  { cs:'4A-9', name:'HARRIS / COLE', status:'ON SCENE', dot:'dot-red' },
  { cs:'4A-12', name:'MILLER / SGT', status:'PATROL', dot:'dot-green' },
  { cs:'4B-3', name:'WASHINGTON', status:'RESPONDING', dot:'dot-amber' },
  { cs:'4C-1', name:'PATEL / YOUNG', status:'AVAILABLE', dot:'dot-green' },
  { cs:'4C-7', name:'NEWMAN', status:'MEAL BREAK', dot:'dot-gray' },
];

function renderDispatch() {
  const container = document.getElementById('dispatch-calls');
  const incidents = getIncidents();
  const allCalls = [...MOCK_CALLS];
  // Inject real saved incidents as calls
  incidents.slice().reverse().slice(0,3).forEach((inc, i) => {
    allCalls.unshift({
      id: inc.id,
      type: inc.type,
      addr: inc.location || 'SEE NARRATIVE',
      time: formatAge(inc.timestamp),
      priority: 'med',
      unit: '4A-12',
      status: 'LOGGED'
    });
  });

  document.getElementById('call-count').textContent = allCalls.filter(c => c.status !== 'CLOSED').length;

  container.innerHTML = allCalls.map(c => `
    <div class="call-item priority-${c.priority}">
      <div>
        <div class="call-id">${c.id}</div>
        <div class="call-time">${c.time}</div>
      </div>
      <div class="call-info">
        <div class="call-type">${c.type}</div>
        <div class="call-addr">${c.addr}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
        <span class="call-badge ${c.priority==='high'?'badge-red':c.priority==='med'?'badge-amber':'badge-blue'}">${c.status}</span>
        <span style="font-size:10px;color:var(--text-dim);">UNIT: ${c.unit}</span>
      </div>
    </div>
  `).join('');

  const ul = document.getElementById('unit-status-list');
  ul.innerHTML = MOCK_UNITS.map(u => `
    <div class="unit-row">
      <span class="unit-callsign">${u.cs}</span>
      <span class="unit-status-dot ${u.dot}"></span>
      <span class="unit-name">${u.name}</span>
      <span class="unit-status-txt" style="color:${u.dot.includes('green')?'var(--accent-green)':u.dot.includes('red')?'var(--accent-red)':u.dot.includes('amber')?'var(--accent-amber)':'var(--text-dim)'}">${u.status}</span>
    </div>
  `).join('');
}

renderDispatch();

// ── AMBIENT CAD SIMULATOR ──────────────────────
const CAD_CALL_TYPES = [
  { code:'10-50',   desc:'Major Traffic Accident',              pri:1 },
  { code:'10-50 PDO',desc:'Traffic Accident — Property Damage Only', pri:2 },
  { code:'10-11',   desc:'Dog Complaint / Animal At Large',     pri:3 },
  { code:'10-16',   desc:'Domestic Disturbance',                pri:1 },
  { code:'10-31',   desc:'Crime in Progress',                   pri:1 },
  { code:'10-32',   desc:'Person with a Weapon',                pri:1 },
  { code:'10-33',   desc:'Emergency — Officer Needs Assistance',pri:1 },
  { code:'10-35',   desc:'Major Crime Alert',                   pri:1 },
  { code:'10-54',   desc:'Suspicious Vehicle',                  pri:2 },
  { code:'10-55',   desc:'Intoxicated Driver',                  pri:2 },
  { code:'10-65',   desc:'Missing Person Report',               pri:2 },
  { code:'10-70',   desc:'Fire Alarm / Structure Fire',         pri:2 },
  { code:'10-90',   desc:'Alarm — Business',                    pri:2 },
  { code:'10-91',   desc:'Alarm — Residential',                 pri:3 },
  { code:'911 HANG',desc:'911 Hangup / No Response',            pri:2 },
  { code:'WELFARE', desc:'Welfare Check',                       pri:3 },
  { code:'NOISE',   desc:'Noise Complaint',                     pri:3 },
  { code:'THEFT',   desc:'Theft / Shoplifting in Progress',     pri:2 },
  { code:'BURGLARY',desc:'Burglary in Progress',                pri:1 },
  { code:'ROBBERY', desc:'Armed Robbery',                       pri:1 },
  { code:'PURSUIT', desc:'Vehicle Pursuit in Progress',         pri:1 },
  { code:'OD/MED',  desc:'Medical — Possible Overdose',         pri:1 },
  { code:'SHOTS',   desc:'Shots Fired / ShotSpotter Alert',     pri:1 },
  { code:'TRESPASS',desc:'Trespassing / Unwanted Subject',      pri:3 },
  { code:'VAND',    desc:'Vandalism in Progress',               pri:3 },
];

const CAD_LOCATIONS = [
  'River City Gas Station — Rt. 1 & Main',
  'Grain Terminal — Industrial Way',
  'Paleto Way & 3rd St',
  'Central Mall — West Entrance',
  'Springfield Motel — Hwy 40',
  'Liberty County Fairgrounds',
  'Rockland Avenue Bridge',
  'Westbrook Trailer Park',
  'Coliseum Boulevard & Oak',
  'River City Bank — Market St',
  'Sunrise Apartments — Ohio St',
  'Eagle Construction Site — N. Maple',
  'Liberty Diner — Route 9',
  'Lake View Park — Shoreline Rd',
  'Old Sawmill Road — Rural',
  'Springfield High School',
  'County Road 7 & Hwy 40',
  'River City Hospital — ER Entrance',
  '400 Blk Delaware St',
  'Downtown Parking Garage — Level 2',
  'Valley Transit Hub — Springfield',
  'Post Office — River City Center',
];

const CAD_UNITS = [
  '4-ADAM-6','4-ADAM-9','4-ADAM-20','4-ADAM-15',
  '4-BAKER-3','4-BAKER-7','4-CHARLIE-1','4-CHARLIE-4',
  '1-LINCOLN-5','1-LINCOLN-8','1-KING-2',
  'KING-31','KING-14','KING-22',
  'AIR-1','K9-2','SGT-4',
];

let cadCalls  = [];
let cadTimer  = null;
let cadIdCtr  = 450;

function cadRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function cadNowStr() {
  const n = new Date();
  return String(n.getHours()).padStart(2,'0') + ':' +
         String(n.getMinutes()).padStart(2,'0') + ':' +
         String(n.getSeconds()).padStart(2,'0');
}

function generateAmbientCall() {
  const call  = cadRand(CAD_CALL_TYPES);
  const loc   = cadRand(CAD_LOCATIONS);
  const unit  = cadRand(CAD_UNITS);
  const unit2 = Math.random() > 0.6 ? ', ' + cadRand(CAD_UNITS) : '';
  cadIdCtr++;
  const uid = Date.now() + '_' + Math.floor(Math.random()*9999);

  const entry = { id:'CAD-'+cadIdCtr, code:call.code, desc:call.desc,
                  loc, unit:unit+unit2, pri:call.pri, ts:cadNowStr(), uid };

  cadCalls.unshift(entry);
  if (cadCalls.length > 20) cadCalls.pop();
  renderCADFeed();

  // Flash P1 calls on BOLO ticker
  if (call.pri === 1) {
    const ticker = document.getElementById('boloTicker');
    if (ticker) {
      const flash = `⚡ P1 — ${call.code}: ${call.desc.toUpperCase()} AT ${loc.toUpperCase()} — UNIT: ${unit.toUpperCase()}`;
      ticker.innerHTML = flash + ' &nbsp;&nbsp;&nbsp; ◆ &nbsp;&nbsp;&nbsp; ' + ticker.innerHTML;
    }
  }
}

function renderCADFeed() {
  const feed = document.getElementById('cad-feed');
  if (!feed) return;
  if (!cadCalls.length) {
    feed.innerHTML = '<div class="cad-empty">AWAITING CALLS...</div>';
    return;
  }
  feed.innerHTML = cadCalls.map(c => `
    <div class="cad-call pri-${c.pri}">
      <div class="cad-call-top">
        <span class="cad-pri cad-pri-${c.pri}">P${c.pri}</span>
        <span class="cad-type">${c.code}</span>
        <button class="cad-dismiss" onclick="dismissCAD('${c.uid}')">✕ DISMISS</button>
      </div>
      <div class="cad-addr">${c.desc}</div>
      <div class="cad-addr" style="color:var(--text-dim);font-size:9px;">${c.loc}</div>
      <div class="cad-meta">
        <span>${c.ts}</span><span>|</span><span>${c.id}</span><span>|</span><span>${c.unit}</span>
      </div>
    </div>
  `).join('');
}

function dismissCAD(uid) {
  cadCalls = cadCalls.filter(c => c.uid !== uid);
  renderCADFeed();
}

function startAmbientCAD() {
  if (cadTimer) return;
  // First call in 8–15s so it feels prompt
  cadTimer = setTimeout(function fireCad() {
    generateAmbientCall();
    const delay = 60000 + Math.random() * 60000;
    cadTimer = setTimeout(fireCad, delay);
  }, 8000 + Math.random() * 7000);
}

function stopAmbientCAD() {
  clearTimeout(cadTimer);
  cadTimer = null;
  cadCalls = [];
  renderCADFeed();
}

// ── BOLO TICKER ───────────────────────────────
const BOLOS = [
  'BOLO: 2021 SILVER HONDA ACCORD — PLATE: XKR-4482 — WANTED: ARMED ROBBERY — DO NOT APPROACH',
  'BOLO: WHITE MALE, 6\'2", BLUE JACKET, BROWN HAIR — WANTED: AGGRAVATED ASSAULT — LAST SEEN DOWNTOWN',
  'BOLO: 2018 RED DODGE CHARGER — PLATE: MNL-0091 — STOLEN VEHICLE — CAUTION: OCCUPANTS MAY BE ARMED',
  'SILVER ALERT: EDNA GRACE, 82YO WF — LAST SEEN: ROCKLAND AVE AREA — DRIVING BEIGE BUICK — PLATE: RGA-7723',
  'ALERT: COUNTERFEIT BILLS REPORTED PASSING IN AREA OF CENTRAL & MARKET ST — NOTIFY DISPATCH WITH ANY SIGHTINGS',
];

(function() {
  const ticker = document.getElementById('boloTicker');
  const msg = [...BOLOS, ...BOLOS].join(' &nbsp;&nbsp;&nbsp; ◆ &nbsp;&nbsp;&nbsp; ');
  ticker.innerHTML = msg;
})();

// ── SEARCH ────────────────────────────────────
const MOCK_PERSONS = [
  { name:'DOE, JOHN ALLEN', dob:'1985-03-14', race:'W/M', dl:'IN-4829301', flags:['WARRANT','CAUTION'], notes:'Outstanding warrant — failure to appear.' },
  { name:'SMITH, MARIA L', dob:'1992-07-22', race:'H/F', dl:'IN-3312998', flags:[], notes:'No wants or warrants.' },
  { name:'JOHNSON, DEREK T', dob:'1978-11-05', race:'B/M', dl:'IN-5503821', flags:['NO CONTACT ORDER'], notes:'No contact order with PATRICIA JOHNSON (filed 2023).' },
  { name:'WILLIAMS, ASHLEY N', dob:'2000-01-30', race:'W/F', dl:'IN-7821033', flags:['SUSPENDED DL'], notes:'License suspended — unpaid fines.' },
];

const MOCK_PLATES = [
  { plate:'XKR-4482', state:'IN', year:2021, color:'SLV', make:'HONDA', model:'ACCORD', owner:'TRAVIS HALL', flags:['BOLO','STOLEN'], status:'STOLEN — ARMED ROBBERY' },
  { plate:'ABC-1234', state:'IN', year:2019, color:'BLK', make:'FORD', model:'F-150', owner:'JANE MORRISON', flags:[], status:'CLEAR' },
  { plate:'MNL-0091', state:'IN', year:2018, color:'RED', make:'DODGE', model:'CHARGER', owner:'VICTOR SALINAS', flags:['BOLO'], status:'STOLEN VEHICLE' },
  { plate:'RGA-7723', state:'IN', year:2005, color:'BEI', make:'BUICK', model:'LACROSSE', owner:'EDNA GRACE', flags:['SILVER ALERT'], status:'SILVER ALERT ACTIVE' },
];

function searchPerson() {
  const q = document.getElementById('person-query').value.trim().toLowerCase();
  const results = q ? MOCK_PERSONS.filter(p =>
    p.name.toLowerCase().includes(q) || p.dob.includes(q) || p.dl.toLowerCase().includes(q)
  ) : MOCK_PERSONS;

  const el = document.getElementById('person-results');
  if (!results.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠</div>NO RECORDS FOUND</div>'; return; }

  el.innerHTML = `
    <table class="result-table">
      <thead><tr><th>NAME</th><th>DOB</th><th>R/S</th><th>DL#</th><th>FLAGS</th><th>STATUS</th></tr></thead>
      <tbody>${results.map(p => `
        <tr>
          <td><b>${p.name}</b></td>
          <td>${p.dob}</td>
          <td>${p.race}</td>
          <td>${p.dl}</td>
          <td>${p.flags.map(f => `<span class="flag-tag badge-red">${f}</span>`).join('') || '<span style="color:var(--text-dim)">NONE</span>'}</td>
          <td style="color:${p.flags.length?'var(--accent-red)':'var(--accent-green)'};">${p.flags.length?'WANTS/WARRANTS':'CLEAR'}</td>
        </tr>
        <tr><td colspan="6" style="font-size:10px;color:var(--text-secondary);padding:4px 10px 10px;border:none;">&nbsp;&nbsp;↳ ${p.notes}</td></tr>
      `).join('')}</tbody>
    </table>`;
}

function searchPlate() {
  const q = document.getElementById('plate-query').value.trim().toUpperCase().replace(/\s/g,'');
  const results = q ? MOCK_PLATES.filter(p =>
    p.plate.replace('-','').includes(q.replace('-','')) || p.owner.toUpperCase().includes(q)
  ) : MOCK_PLATES;

  const el = document.getElementById('plate-results');
  if (!results.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠</div>NO RECORDS FOUND</div>'; return; }

  el.innerHTML = `
    <table class="result-table">
      <thead><tr><th>PLATE</th><th>ST</th><th>YEAR</th><th>VEHICLE</th><th>REG. OWNER</th><th>FLAGS</th><th>STATUS</th></tr></thead>
      <tbody>${results.map(p => `
        <tr>
          <td style="color:var(--cyber);letter-spacing:2px;"><b>${p.plate}</b></td>
          <td>${p.state}</td>
          <td>${p.year}</td>
          <td>${p.color} ${p.make} ${p.model}</td>
          <td>${p.owner}</td>
          <td>${p.flags.map(f => `<span class="flag-tag badge-red">${f}</span>`).join('') || '<span style="color:var(--text-dim)">NONE</span>'}</td>
          <td style="color:${p.flags.length?'var(--accent-red)':'var(--accent-green)'};">${p.status}</td>
        </tr>
      `).join('')}</tbody>
    </table>`;
}

// ── INCIDENT FORM ─────────────────────────────
function generateIncidentId() {
  const ts = Date.now().toString(36).toUpperCase();
  return 'INC-' + ts;
}

// ── REPORT TYPE LOGIC ─────────────────────────
const REPORT_LABELS = {
  INCIDENT:'INCIDENT / CASE REPORT', CRASH:'VEHICLE CRASH REPORT',
  UOF:'USE OF FORCE REPORT', PCA:'PROBABLE CAUSE AFFIDAVIT',
  WARRANT:'SEARCH WARRANT AFFIDAVIT', PURSUIT:'PURSUIT REPORT',
  EVIDENCE:'PROPERTY / EVIDENCE LOG', SUPPLEMENT:'SUPPLEMENTAL REPORT'
};

let currentReportType = '';

function onReportTypeChange() {
  const type = document.getElementById('report-type-select').value;
  currentReportType = type;

  // Hide all form panels
  document.querySelectorAll('.rpt-form').forEach(f => f.style.display = 'none');
  const common = document.getElementById('rpt-common');
  const submitBar = document.getElementById('rpt-submit-bar');

  if (!type) {
    common.style.display = 'none';
    submitBar.style.display = 'none';
    document.getElementById('inc-number-display').textContent = 'ID#: AUTO-ASSIGN';
    return;
  }

  common.style.display = 'block';
  document.getElementById('rpt-type-label').textContent = REPORT_LABELS[type] || type;

  const form = document.getElementById('form-' + type);
  if (form) {
    form.style.display = 'flex';
    // Init evidence items if needed
    if (type === 'EVIDENCE' && document.getElementById('ev-items-container').children.length === 0) {
      addEvidenceItem();
    }
  }

  submitBar.style.display = 'flex';
  document.getElementById('inc-number-display').textContent = REPORT_LABELS[type];
  // Ensure officer displays are populated from session
  updateOfficerDisplays();
}

// ── EVIDENCE ITEM ROWS ─────────────────────────
let evItemCount = 0;
function addEvidenceItem() {
  evItemCount++;
  const n = evItemCount;
  const container = document.getElementById('ev-items-container');
  const div = document.createElement('div');
  div.id = 'ev-item-' + n;
  div.style.cssText = 'border-bottom:1px solid var(--border);padding:10px 0;margin-bottom:4px;';
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span style="font-family:var(--font-ui);font-size:10px;font-weight:700;letter-spacing:2px;color:var(--cyber);">ITEM #${n}</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('ev-item-${n}').remove()" style="margin-left:auto;padding:2px 8px;">✕ REMOVE</button>
    </div>
    <div class="form-grid cols-3">
      <div class="form-group"><label>EVIDENCE BAG #</label><input type="text" id="ev-bag-${n}" placeholder="EB-${String(n).padStart(4,'0')}"></div>
      <div class="form-group" style="grid-column:span 2;"><label>ITEM DESCRIPTION</label><input type="text" id="ev-desc-${n}" placeholder="Describe item, color, condition, quantity..."></div>
      <div class="form-group"><label>SERIAL NUMBER</label><input type="text" id="ev-serial-${n}" placeholder="SN or N/A"></div>
      <div class="form-group"><label>QUANTITY</label><input type="text" id="ev-qty-${n}" placeholder="e.g. 1, 3 bags, 14g"></div>
      <div class="form-group"><label>CATEGORY</label>
        <select id="ev-cat-${n}">
          <option>NARCOTICS / CONTROLLED SUBSTANCE</option><option>FIREARM</option>
          <option>AMMUNITION</option><option>CURRENCY</option><option>ELECTRONIC DEVICE</option>
          <option>CLOTHING / PERSONAL EFFECTS</option><option>VEHICLE</option>
          <option>DOCUMENTS / RECORDS</option><option>PARAPHERNALIA</option><option>OTHER</option>
        </select>
      </div>
    </div>`;
  container.appendChild(div);
}

// ── DIGITAL SIGNATURE ─────────────────────────
const signatures = {};
function signDocument(prefix) {
  const officer = getOfficerStr();
  const now = new Date();
  const ts = now.toLocaleDateString('en-US') + ' ' + now.toLocaleTimeString('en-US');
  signatures[prefix] = { officer, ts };

  const box = document.getElementById(prefix + '-sig-box');
  box.classList.add('signed');
  box.innerHTML = `
    <div class="sig-text">DIGITALLY SIGNED AND SWORN</div>
    <div class="sig-name">${officer.split('|').pop().trim()}</div>
    <div class="sig-timestamp">✔ SIGNED: ${ts} | PENALTY OF PERJURY ACKNOWLEDGED</div>
    <div style="font-size:9px;color:var(--text-secondary);margin-top:4px;letter-spacing:1px;">BADGE: ${officer.split('|')[0].trim()}</div>`;
}

// ── IMPACT DIAGRAM ─────────────────────────────
function toggleImpact(cell) {
  if (cell.classList.contains('vehicle-center')) return;
  cell.classList.toggle('selected');
}

// ── SUBMIT REPORT ─────────────────────────────
function submitReport() {
  const type = currentReportType;
  if (!type) { flashStatus('⚠ SELECT A REPORT TYPE'); return; }

  const date = document.getElementById('inc-date').value;
  const time = document.getElementById('inc-time').value;
  const officer = getOfficerStr();

  if (!date) { flashStatus('⚠ DATE IS REQUIRED'); return; }

  // Collect fields per type
  let record = {
    id: generateIncidentId(),
    timestamp: Date.now(),
    reportType: type,
    reportLabel: REPORT_LABELS[type],
    date, time, officer
  };

  if (type === 'INCIDENT') {
    const rawType = document.getElementById('inc-type').value;
    if (!rawType) { flashStatus('⚠ SELECT A STATUTE'); return; }
    const narrative = document.getElementById('inc-narrative').value.trim();
    if (!narrative) { flashStatus('⚠ NARRATIVE IS REQUIRED'); return; }
    const typeParts = rawType.split('||');
    record.type = (typeParts[0] || rawType) + ' — ' + (typeParts[2] || rawType);
    record.location = document.getElementById('inc-location').value.trim();
    record.name = document.getElementById('inc-name').value.trim();
    record.dob = document.getElementById('inc-dob').value;
    record.race = document.getElementById('inc-race').value;
    record.citation = document.getElementById('inc-citation').value.trim();
    record.plate = document.getElementById('inc-plate').value.trim().toUpperCase();
    record.vehicle = document.getElementById('inc-vehicle').value.trim();
    record.narrative = narrative;

  } else if (type === 'CRASH') {
    record.type = 'VEHICLE CRASH — ' + (document.getElementById('cr-type').value || 'UNSPECIFIED');
    record.name = document.getElementById('cr-v1-driver').value.trim();
    record.plate = document.getElementById('cr-v1-plate').value.trim().toUpperCase();
    record.vehicle = document.getElementById('cr-v1-desc').value.trim();
    record.location = '';
    record.narrative = document.getElementById('cr-narrative').value.trim();
    record.details = {
      weather: document.getElementById('cr-weather').value,
      light: document.getElementById('cr-light').value,
      road: document.getElementById('cr-road').value,
      injury: document.getElementById('cr-injury').value,
      v1vin: document.getElementById('cr-v1-vin').value.trim().toUpperCase(),
      v2plate: document.getElementById('cr-v2-plate').value.trim().toUpperCase(),
      v2driver: document.getElementById('cr-v2-driver').value.trim(),
      impactNotes: document.getElementById('cr-impact-notes').value.trim()
    };

  } else if (type === 'UOF') {
    record.type = 'USE OF FORCE';
    record.name = document.getElementById('uof-subject').value.trim();
    record.location = document.getElementById('uof-location').value.trim();
    record.plate = '';
    record.vehicle = '';
    record.narrative = document.getElementById('uof-narrative').value.trim();
    record.details = {
      resistance: ['passive','active','forcible','deadly'].filter(r => document.getElementById('uof-resist-' + r)?.checked).join(', '),
      techniques: ['verbal','hands','taser','oc','baton','k9','firearm'].filter(t => document.getElementById('uof-t-' + t)?.checked).join(', '),
      offInjury: document.getElementById('uof-off-injury').value,
      subInjury: document.getElementById('uof-sub-injury').value,
      supervisor: document.getElementById('uof-supervisor').value,
      supName: document.getElementById('uof-sup-name').value.trim()
    };

  } else if (type === 'PCA') {
    if (!signatures['pca']) { flashStatus('⚠ DIGITAL SIGNATURE REQUIRED'); return; }
    record.type = 'PROBABLE CAUSE AFFIDAVIT';
    record.name = document.getElementById('pca-defendant').value.trim();
    record.location = '';
    record.plate = '';
    record.vehicle = '';
    record.narrative = document.getElementById('pca-facts').value.trim();
    record.details = {
      charges: document.getElementById('pca-charges').value.trim(),
      caseno: document.getElementById('pca-caseno').value.trim(),
      signed: signatures['pca']
    };

  } else if (type === 'WARRANT') {
    if (!signatures['sw']) { flashStatus('⚠ DIGITAL SIGNATURE REQUIRED'); return; }
    record.type = 'SEARCH WARRANT AFFIDAVIT';
    record.name = document.getElementById('sw-suspect').value.trim();
    record.location = document.getElementById('sw-place').value.trim().slice(0,60);
    record.plate = '';
    record.vehicle = '';
    record.narrative = document.getElementById('sw-nexus').value.trim();
    record.details = {
      crime: document.getElementById('sw-crime').value.trim(),
      items: document.getElementById('sw-items').value.trim(),
      place: document.getElementById('sw-place').value.trim(),
      signed: signatures['sw']
    };

  } else if (type === 'PURSUIT') {
    record.type = 'PURSUIT — ' + document.getElementById('pur-termination').value;
    record.name = '';
    record.plate = document.getElementById('pur-plate').value.trim().toUpperCase();
    record.vehicle = document.getElementById('pur-veh').value.trim();
    record.location = document.getElementById('pur-start').value.trim();
    record.narrative = document.getElementById('pur-narrative').value.trim();
    record.details = {
      reason: document.getElementById('pur-reason').value.trim(),
      duration: document.getElementById('pur-duration').value.trim(),
      maxSpeedSuspect: document.getElementById('pur-spd-suspect').value.trim(),
      maxSpeedOfficer: document.getElementById('pur-spd-officer').value.trim(),
      miles: document.getElementById('pur-miles').value.trim(),
      pit: document.getElementById('pur-pit').checked,
      spikes: document.getElementById('pur-spikes').checked,
      termination: document.getElementById('pur-termination').value,
      outcome: document.getElementById('pur-outcome').value
    };

  } else if (type === 'EVIDENCE') {
    record.type = 'EVIDENCE LOG';
    record.name = document.getElementById('ev-from').value.trim();
    record.location = document.getElementById('ev-location').value.trim();
    record.plate = '';
    record.vehicle = '';
    record.narrative = 'Evidence log — see details.';
    // Collect items
    const items = [];
    for (let i = 1; i <= evItemCount; i++) {
      const bagEl = document.getElementById('ev-bag-' + i);
      if (!bagEl) continue;
      items.push({
        bag: bagEl.value,
        desc: document.getElementById('ev-desc-' + i)?.value,
        serial: document.getElementById('ev-serial-' + i)?.value,
        qty: document.getElementById('ev-qty-' + i)?.value,
        cat: document.getElementById('ev-cat-' + i)?.value
      });
    }
    record.details = { items, caseno: document.getElementById('ev-caseno').value.trim(), storage: document.getElementById('ev-storage').value };

  } else if (type === 'SUPPLEMENT') {
    const origCase = document.getElementById('sup-caseno').value.trim();
    if (!origCase) { flashStatus('⚠ ORIGINAL CASE # REQUIRED'); return; }
    record.type = 'SUPPLEMENT TO ' + origCase;
    record.name = document.getElementById('sup-subject').value.trim();
    record.location = '';
    record.plate = '';
    record.vehicle = '';
    record.narrative = document.getElementById('sup-narrative').value.trim();
    record.details = { origCase, suppNum: document.getElementById('sup-num').value.trim(), offense: document.getElementById('sup-offense').value.trim() };
  }

  showNCICLoader(() => {
    const incidents = getIncidents();
    incidents.push(record);
    saveIncidents(incidents);
    clearReportForm();
    document.getElementById('inc-number-display').textContent = 'LAST SAVED: ' + record.id;
    showToast('✔ ' + record.id + ' [' + (REPORT_LABELS[type] || type) + '] SAVED');
  });
}

// Keep old name as alias for backward compat
function submitIncident() { submitReport(); }

function clearReportForm() {
  // Reset all text inputs and selects inside the tab
  const tab = document.getElementById('tab-incident');
  tab.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], textarea').forEach(el => {
    el.value = '';
  });
  tab.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  tab.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
  // Reset sig boxes
  ['pca','sw'].forEach(p => {
    const box = document.getElementById(p + '-sig-box');
    if (box) { box.classList.remove('signed'); box.innerHTML = '<div class="sig-text">CLICK TO DIGITALLY SIGN — SWORN UNDER PENALTY OF PERJURY</div><div style="font-size:24px;opacity:0.3;">✍</div>'; }
    delete signatures[p];
  });
  // Reset impact diagram
  document.querySelectorAll('.impact-cell').forEach(c => c.classList.remove('selected'));
  // Reset evidence items
  document.getElementById('ev-items-container').innerHTML = '';
  evItemCount = 0;
  // Reset statute autofill
  const sat = document.getElementById('statute-autofill-row');
  if (sat) sat.style.display = 'none';
  buildStatuteDropdown(null);
  // Reset defaults
  const now = new Date();
  const di = document.getElementById('inc-date');
  const ti = document.getElementById('inc-time');
  if (di) di.value = now.toISOString().slice(0,10);
  if (ti) ti.value = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  // Re-populate officer displays from session
  updateOfficerDisplays();
  flashStatus('FORM CLEARED');
}

// Keep old name alias
function clearIncidentForm() { clearReportForm(); }

function flashStatus(msg) {
  const el = document.getElementById('form-status');
  if (el) { el.textContent = msg; setTimeout(() => el.textContent = '', 3000); }
}

// ── NCIC LOADER ───────────────────────────────
const LOADER_MSGS = [
  'ESTABLISHING SECURE CHANNEL...',
  'AUTHENTICATING USER CREDENTIALS...',
  'ENCRYPTING REPORT DATA (AES-256)...',
  'TRANSMITTING TO NCIC SERVER...',
  'CROSS-REFERENCING WARRANT DATABASE...',
  'ASSIGNING CASE NUMBER...',
  'VERIFYING DATA INTEGRITY...',
  'UPLOAD COMPLETE — RECORD SAVED.',
];

function showNCICLoader(callback) {
  const loader = document.getElementById('ncic-loader');
  const bar = document.getElementById('loader-bar');
  const msg = document.getElementById('loader-msg');
  loader.classList.add('show');
  bar.style.width = '0%';

  let step = 0;
  const totalDuration = 2400;
  const interval = totalDuration / LOADER_MSGS.length;

  const tick = setInterval(() => {
    if (step >= LOADER_MSGS.length) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.remove('show');
        callback();
      }, 300);
      return;
    }
    msg.textContent = LOADER_MSGS[step];
    bar.style.width = ((step + 1) / LOADER_MSGS.length * 100) + '%';
    step++;
  }, interval);
}

// ── DATABASE VIEW ─────────────────────────────
function renderDatabase() {
  const incidents = getIncidents();
  const filter = (document.getElementById('db-filter')?.value || '').toLowerCase();

  const filtered = filter
    ? incidents.filter(i =>
        (i.type||'').toLowerCase().includes(filter) ||
        (i.name||'').toLowerCase().includes(filter) ||
        (i.plate||'').toLowerCase().includes(filter) ||
        (i.id||'').toLowerCase().includes(filter) ||
        (i.location||'').toLowerCase().includes(filter) ||
        (i.reportLabel||'').toLowerCase().includes(filter)
      )
    : incidents;

  document.getElementById('db-count-label').textContent = incidents.length + ' TOTAL RECORDS';

  // Stats by report type
  const typeCounts = {};
  incidents.forEach(i => {
    const k = i.reportLabel || 'INCIDENT / CASE REPORT';
    typeCounts[k] = (typeCounts[k]||0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0];
  const rptTypes = Object.keys(typeCounts).length;

  document.getElementById('db-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${incidents.length}</div><div class="stat-lbl">TOTAL RECORDS</div></div>
    <div class="stat-card"><div class="stat-num">${rptTypes}</div><div class="stat-lbl">REPORT TYPES</div></div>
    <div class="stat-card"><div class="stat-num" style="font-size:13px;padding-top:12px;line-height:1.3;">${topType ? topType[0].split(' ').slice(0,3).join(' ') : '—'}</div><div class="stat-lbl">MOST FILED</div></div>
  `;

  const log = document.getElementById('incident-log');

  if (!filtered.length) {
    log.innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div>${incidents.length?'NO MATCHING RECORDS':'NO RECORDS ON FILE'}</div>`;
    return;
  }

  const TYPE_ICONS = {
    'INCIDENT / CASE REPORT':'📋','VEHICLE CRASH REPORT':'🚗','USE OF FORCE REPORT':'⚡',
    'PROBABLE CAUSE AFFIDAVIT':'⚖️','SEARCH WARRANT AFFIDAVIT':'🔍','PURSUIT REPORT':'🚔',
    'PROPERTY / EVIDENCE LOG':'🏷️','SUPPLEMENTAL REPORT':'📎'
  };

  log.innerHTML = filtered.slice().reverse().map(inc => {
    const icon = TYPE_ICONS[inc.reportLabel] || '📋';
    const label = inc.reportLabel || 'INCIDENT / CASE REPORT';
    return `
    <div class="incident-list-item">
      <div class="incident-id">${inc.id}</div>
      <div class="incident-info">
        <div class="incident-type"><span class="rpt-tag">${icon} ${label}</span>${inc.type || ''}</div>
        <div class="incident-meta">
          ${inc.date||''} ${inc.time||''}
          ${inc.name ? '&nbsp;|&nbsp; ' + inc.name : ''}
          ${inc.plate ? '&nbsp;|&nbsp; ' + inc.plate : ''}
          ${inc.location ? '&nbsp;|&nbsp; ' + inc.location.slice(0,40) : ''}
          &nbsp;|&nbsp; ${inc.officer||''}
        </div>
      </div>
      <div class="incident-actions">
        <button class="btn btn-sm btn-primary" onclick="viewIncident('${inc.id}')">VIEW</button>
        <button class="btn btn-sm btn-danger" onclick="deleteIncident('${inc.id}')">DEL</button>
      </div>
    </div>`;
  }).join('');
}

function viewIncident(id) {
  const inc = getIncidents().find(i => i.id === id);
  if (!inc) return;
  let extra = '';
  if (inc.details) {
    extra = '\n── ADDITIONAL DETAILS ──\n';
    Object.entries(inc.details).forEach(([k,v]) => {
      if (k === 'items' && Array.isArray(v)) {
        extra += 'EVIDENCE ITEMS:\n';
        v.forEach((it,idx) => { extra += `  #${idx+1} [${it.bag}] ${it.desc} | QTY: ${it.qty} | S/N: ${it.serial}\n`; });
      } else if (k === 'signed' && v) {
        extra += `SIGNED BY: ${v.officer} @ ${v.ts}\n`;
      } else if (typeof v === 'boolean') {
        extra += `${k.toUpperCase()}: ${v ? 'YES' : 'NO'}\n`;
      } else if (v && typeof v === 'string') {
        extra += `${k.toUpperCase()}: ${v}\n`;
      }
    });
  }
  alert(
    `═══ ${inc.reportLabel || 'REPORT'}: ${inc.id} ═══\n\n` +
    `DATE/TIME: ${inc.date||'—'} @ ${inc.time||'—'}\n` +
    `OFFICER: ${inc.officer||'—'}\n` +
    `TYPE: ${inc.type||'—'}\n` +
    `SUBJECT: ${inc.name||'—'}\n` +
    `PLATE: ${inc.plate||'—'}\n` +
    `VEHICLE: ${inc.vehicle||'—'}\n` +
    `LOCATION: ${inc.location||'—'}\n\n` +
    (inc.narrative ? `── NARRATIVE ──\n${inc.narrative}\n` : '') +
    extra
  );
}

function deleteIncident(id) {
  if (!confirm('DELETE INCIDENT ' + id + '?\nThis cannot be undone.')) return;
  saveIncidents(getIncidents().filter(i => i.id !== id));
  renderDatabase();
}

function clearAllData() {
  if (!confirm('PURGE ALL INCIDENT RECORDS FROM LOCAL DATABASE?\n\nThis action is permanent.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderDatabase();
}

// ── TOAST ─────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── INDIANA STATUTE DATABASE ──────────────────
// cat, code, label, fine, mandatoryCourtAppearance, licenseAction, narrativeSuffix
const STATUTES = [
  // TRAFFIC VIOLATIONS
  { cat:'TRAFFIC', code:'IC 9-21-5-2',    label:'Speeding (1–15 mph over)',               fine:'$150',   court:false, lic:'0 pts',      notes:'Speed infraction — no court required unless contested.' },
  { cat:'TRAFFIC', code:'IC 9-21-5-3',    label:'Speeding (16–25 mph over)',               fine:'$300',   court:false, lic:'2 pts',      notes:'Speed infraction.' },
  { cat:'TRAFFIC', code:'IC 9-21-5-4',    label:'Speeding (26+ mph over)',                 fine:'$500',   court:true,  lic:'4 pts / possible suspension', notes:'Excessive speed — mandatory court appearance required.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-2',    label:'Failure to Yield Right of Way',           fine:'$150',   court:false, lic:'2 pts',      notes:'Failure to yield infraction.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-6',    label:'Failure to Stop at Red Signal',           fine:'$200',   court:false, lic:'2 pts',      notes:'Traffic signal violation.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-50',   label:'Unsafe Vehicle Operation',                fine:'$150',   court:false, lic:'—',          notes:'Vehicle in unsafe condition.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-52',   label:'Reckless Driving',                        fine:'$1,000', court:true,  lic:'6 pts / possible suspension', notes:'Reckless driving — mandatory court appearance. Class B Misdemeanor.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-35',   label:'Failure to Yield to Emergency Vehicle',   fine:'$500',   court:true,  lic:'4 pts',      notes:'Failure to yield to emergency vehicle — court required.' },
  { cat:'TRAFFIC', code:'IC 9-21-7-3',    label:'Improper Lane Change / Failure to Signal',fine:'$100',   court:false, lic:'0 pts',      notes:'Lane / signaling infraction.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-42',   label:'Failure to Stop at Stop Sign',            fine:'$150',   court:false, lic:'2 pts',      notes:'Stop sign violation.' },
  { cat:'TRAFFIC', code:'IC 9-21-8-30',   label:'Following Too Closely (Tailgating)',      fine:'$150',   court:false, lic:'2 pts',      notes:'Following distance violation.' },
  { cat:'TRAFFIC', code:'IC 9-26-1-1',    label:'Leaving Scene of Accident (Property)',    fine:'$500',   court:true,  lic:'6 pts',      notes:'Hit and run — property damage. Mandatory court. Class B Misdemeanor.' },
  { cat:'TRAFFIC', code:'IC 9-26-1-2',    label:'Leaving Scene of Accident (Injury)',      fine:'$5,000+',court:true,  lic:'Suspension', notes:'Hit and run with injury. Mandatory court. Class A Misdemeanor / Level 6 Felony.' },
  { cat:'TRAFFIC', code:'IC 9-19-6-4',    label:'Seatbelt Violation (Driver)',             fine:'$25',    court:false, lic:'—',          notes:'Seatbelt infraction — driver.' },
  { cat:'TRAFFIC', code:'IC 9-19-11-2',   label:'Cell Phone / Distracted Driving',         fine:'$500',   court:false, lic:'—',          notes:'Distracted driving infraction.' },
  { cat:'TRAFFIC', code:'IC 9-24-3-4',    label:'No Valid Driver\'s License',              fine:'$500',   court:true,  lic:'—',          notes:'Operating without valid license. Mandatory court.' },
  { cat:'TRAFFIC', code:'IC 9-24-19-1',   label:'Driving While Suspended',                 fine:'$500',   court:true,  lic:'Additional suspension', notes:'Driving while suspended — mandatory court. Class A Infraction / Misdemeanor.' },
  { cat:'TRAFFIC', code:'IC 9-25-4-1',    label:'No Proof of Insurance',                   fine:'$250',   court:true,  lic:'Suspension if uninsured', notes:'No insurance / proof of financial responsibility. Court required.' },
  { cat:'TRAFFIC', code:'IC 9-18.1-2-1',  label:'No Vehicle Registration',                 fine:'$150',   court:false, lic:'—',          notes:'Operating unregistered vehicle.' },

  // OWI / IMPAIRED
  { cat:'OWI', code:'IC 9-30-5-1',    label:'OWI — BAC 0.08–0.14% (Misdemeanor)',        fine:'$5,000',  court:true,  lic:'90-day suspension', notes:'Operating While Intoxicated — BAC 0.08–0.14%. Class C Misdemeanor. Mandatory court. License suspension.' },
  { cat:'OWI', code:'IC 9-30-5-2',    label:'OWI — BAC 0.15%+ or Endangerment',          fine:'$10,000', court:true,  lic:'180-day suspension', notes:'OWI with endangerment or BAC 0.15%+. Class A Misdemeanor. Mandatory court. License suspension.' },
  { cat:'OWI', code:'IC 9-30-5-3',    label:'OWI — Prior Conviction (Level 6 Felony)',   fine:'$10,000', court:true,  lic:'1-yr suspension', notes:'OWI — prior OWI conviction. Level 6 Felony. Mandatory court. Vehicle may be seized.' },
  { cat:'OWI', code:'IC 9-30-5-4',    label:'OWI Causing Serious Bodily Injury',         fine:'$10,000', court:true,  lic:'2-yr suspension', notes:'OWI causing serious bodily injury. Level 5 Felony. Mandatory court.' },
  { cat:'OWI', code:'IC 9-30-5-5',    label:'OWI Causing Death',                         fine:'$10,000', court:true,  lic:'Revocation',    notes:'OWI causing death. Level 4 Felony. Mandatory court. License revocation.' },
  { cat:'OWI', code:'IC 9-30-6-2',    label:'Implied Consent Refusal (Chemical Test)',   fine:'$500',    court:true,  lic:'1-yr suspension', notes:'Refusal of chemical test. Mandatory 1-year license suspension.' },
  { cat:'OWI', code:'IC 9-30-10-4',   label:'Habitual Traffic Violator — OWI',           fine:'$10,000', court:true,  lic:'10-yr suspension', notes:'HTV designation — OWI. Level 6 Felony. Mandatory court.' },

  // NARCOTICS
  { cat:'NARCOTICS', code:'IC 35-48-4-11',  label:'Possession of Marijuana (< 30g)',         fine:'$1,000',  court:true,  lic:'—', notes:'Possession of marijuana. Class B Misdemeanor. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-11.5',label:'Possession of Marijuana (Prior / Large)',  fine:'$5,000',  court:true,  lic:'—', notes:'Marijuana possession w/ prior conviction or 30g+. Class A Misdemeanor. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-6',   label:'Dealing Marijuana (< 30g)',               fine:'$10,000', court:true,  lic:'—', notes:'Dealing/delivery of marijuana. Level 6 Felony. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-7',   label:'Dealing in a Controlled Substance (Sched. I/II)', fine:'$10,000+', court:true, lic:'—', notes:'Dealing controlled substance. Level 2–5 Felony depending on quantity. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-8.3', label:'Possession of Controlled Substance',      fine:'$5,000',  court:true,  lic:'—', notes:'Possession of Schedule I/II substance. Level 6 Felony. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-14.5',label:'Possession of Paraphernalia',             fine:'$1,000',  court:true,  lic:'—', notes:'Paraphernalia possession. Class C Misdemeanor. Mandatory court.' },
  { cat:'NARCOTICS', code:'IC 35-48-4-10',  label:'Maintaining Common Nuisance (Drug House)',fine:'$10,000', court:true,  lic:'—', notes:'Operating/maintaining drug premises. Level 6 Felony. Mandatory court.' },

  // CRIMES AGAINST PERSONS
  { cat:'PERSONS', code:'IC 35-42-2-1',    label:'Battery (Class B Misdemeanor)',           fine:'$1,000',  court:true,  lic:'—', notes:'Simple battery — bodily injury. Class B Misdemeanor. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-2-1',    label:'Aggravated Battery (Level 3 Felony)',     fine:'$10,000', court:true,  lic:'—', notes:'Aggravated battery — serious bodily injury. Level 3 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-2-1.3',  label:'Domestic Battery',                        fine:'$5,000',  court:true,  lic:'—', notes:'Domestic battery — Class A Misdemeanor minimum. Mandatory court. No contact order may apply.' },
  { cat:'PERSONS', code:'IC 35-42-2-2',    label:'Criminal Recklessness',                   fine:'$5,000',  court:true,  lic:'—', notes:'Criminal recklessness. Level 6 Felony (with deadly weapon). Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-3-2',    label:'Kidnapping',                              fine:'$10,000', court:true,  lic:'—', notes:'Kidnapping. Level 3 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-3-3',    label:'Criminal Confinement',                    fine:'$10,000', court:true,  lic:'—', notes:'Criminal confinement. Level 3–5 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-4-1',    label:'Rape',                                    fine:'$10,000', court:true,  lic:'—', notes:'Rape. Level 1–3 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-1-1',    label:'Murder',                                  fine:'$10,000', court:true,  lic:'—', notes:'Murder. Murder charge — no bail presumed. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-1-3',    label:'Voluntary Manslaughter',                  fine:'$10,000', court:true,  lic:'—', notes:'Voluntary manslaughter. Level 2 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-1-4',    label:'Involuntary Manslaughter',                fine:'$10,000', court:true,  lic:'—', notes:'Involuntary manslaughter. Level 5 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-42-2-9',    label:'Strangulation',                           fine:'$10,000', court:true,  lic:'—', notes:'Strangulation. Level 6 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-45-2-1',    label:'Intimidation / Criminal Threatening',     fine:'$5,000',  court:true,  lic:'—', notes:'Intimidation. Class A Misdemeanor / Level 6 Felony. Mandatory court.' },
  { cat:'PERSONS', code:'IC 35-45-2-2',    label:'Harassment',                              fine:'$1,000',  court:true,  lic:'—', notes:'Harassment. Class B Misdemeanor. Mandatory court.' },

  // PROPERTY CRIMES
  { cat:'PROPERTY', code:'IC 35-43-1-1',   label:'Arson (Level 4 Felony)',                  fine:'$10,000', court:true,  lic:'—', notes:'Arson. Level 4 Felony. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-1-2',   label:'Criminal Mischief / Vandalism',            fine:'$1,000',  court:true,  lic:'—', notes:'Criminal mischief. Class B Misdemeanor (< $750 damage) up to Level 6 Felony. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-2-1',   label:'Burglary (Level 4–5 Felony)',              fine:'$10,000', court:true,  lic:'—', notes:'Burglary. Level 4–5 Felony. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-2-2',   label:'Criminal Trespass',                       fine:'$1,000',  court:true,  lic:'—', notes:'Criminal trespass. Class A Misdemeanor. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-4-2',   label:'Theft (Class A Misdemeanor / Felony)',     fine:'$5,000',  court:true,  lic:'—', notes:'Theft — Class A Misdemeanor (< $750) up to Level 5 Felony ($50,000+). Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-4-2.5', label:'Receiving Stolen Property',               fine:'$5,000',  court:true,  lic:'—', notes:'Receiving stolen property. Level 6 Felony and above. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-4-3',   label:'Robbery (Armed)',                         fine:'$10,000', court:true,  lic:'—', notes:'Robbery with deadly weapon. Level 3 Felony. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-5-3',   label:'Auto Theft / Vehicle Taking',             fine:'$10,000', court:true,  lic:'—', notes:'Unauthorized auto taking. Level 6–5 Felony. Mandatory court.' },
  { cat:'PROPERTY', code:'IC 35-43-5-2',   label:'Forgery / Fraud',                         fine:'$10,000', court:true,  lic:'—', notes:'Forgery. Level 6 Felony. Mandatory court.' },

  // WEAPONS
  { cat:'WEAPONS', code:'IC 35-47-2-1',   label:'Carrying Handgun Without License',         fine:'$5,000',  court:true,  lic:'—', notes:'Unlicensed handgun carry. Class A Misdemeanor / Level 5 Felony (prior conviction). Mandatory court.' },
  { cat:'WEAPONS', code:'IC 35-47-4-5',   label:'Possession of Firearm by Serious Felon',   fine:'$10,000', court:true,  lic:'—', notes:'Felon in possession of firearm. Level 4 Felony. Mandatory court. Firearm to be seized.' },
  { cat:'WEAPONS', code:'IC 35-47-5-4.1', label:'Possession of Machine Gun / Sawed-Off',    fine:'$10,000', court:true,  lic:'—', notes:'Prohibited weapon possession. Level 5 Felony. Mandatory court. Weapon seized.' },
  { cat:'WEAPONS', code:'IC 35-47-5-2',   label:'Pointing Firearm at Another Person',       fine:'$5,000',  court:true,  lic:'—', notes:'Pointing firearm. Class D Felony. Mandatory court.' },
  { cat:'WEAPONS', code:'IC 35-47-8-5',   label:'Dangerous Foreign Object / Switchblade',   fine:'$1,000',  court:true,  lic:'—', notes:'Possession of prohibited blade. Class B Misdemeanor. Mandatory court.' },

  // OBSTRUCTION / RESISTING
  { cat:'OBSTRUCTION', code:'IC 35-44.1-3-1', label:'Resisting Law Enforcement (Fleeing)',  fine:'$5,000',  court:true,  lic:'—', notes:'Fleeing law enforcement on foot or in vehicle. Level 6 Felony. Mandatory court.' },
  { cat:'OBSTRUCTION', code:'IC 35-44.1-3-1', label:'Resisting — Vehicle Pursuit',          fine:'$10,000', court:true,  lic:'License revocation', notes:'Vehicle pursuit fleeing — Level 5 Felony if risk of bodily injury. Mandatory court. License may be revoked.' },
  { cat:'OBSTRUCTION', code:'IC 35-44.1-2-2', label:'False Reporting / Filing False Report', fine:'$1,000',  court:true,  lic:'—', notes:'False reporting to law enforcement. Class B Misdemeanor. Mandatory court.' },
  { cat:'OBSTRUCTION', code:'IC 35-44.1-2-3', label:'Interference with Reporting a Crime',  fine:'$1,000',  court:true,  lic:'—', notes:'Obstruction of reporting. Class A Misdemeanor. Mandatory court.' },
  { cat:'OBSTRUCTION', code:'IC 35-44.1-2-1', label:'Obstruction of Justice',               fine:'$10,000', court:true,  lic:'—', notes:'Obstruction of justice. Level 6 Felony. Mandatory court.' },
  { cat:'OBSTRUCTION', code:'IC 35-44.1-3-4', label:'Escape / Escape from Custody',         fine:'$10,000', court:true,  lic:'—', notes:'Escape from custody. Level 5–6 Felony. Mandatory court.' },

  // DISORDERLY / PUBLIC ORDER
  { cat:'DISORDER', code:'IC 35-45-1-3',   label:'Disorderly Conduct',                      fine:'$500',    court:true,  lic:'—', notes:'Disorderly conduct. Class B Misdemeanor. Mandatory court.' },
  { cat:'DISORDER', code:'IC 7.1-5-1-3',   label:'Public Intoxication',                     fine:'$500',    court:true,  lic:'—', notes:'Public intoxication. Class B Misdemeanor. Mandatory court.' },
  { cat:'DISORDER', code:'IC 35-45-5-3',   label:'Riot',                                    fine:'$10,000', court:true,  lic:'—', notes:'Riot participation. Level 6 Felony. Mandatory court.' },
  { cat:'DISORDER', code:'IC 35-45-4-1',   label:'Indecent Exposure / Public Nudity',       fine:'$1,000',  court:true,  lic:'—', notes:'Indecent exposure. Class B Misdemeanor. Mandatory court.' },
  { cat:'DISORDER', code:'IC 35-45-2-5',   label:'Stalking',                                fine:'$5,000',  court:true,  lic:'—', notes:'Stalking. Class A Misdemeanor / Level 6 Felony (prior). Mandatory court.' },

  // OTHER
  { cat:'OTHER', code:'IC 35-44.1-2-2',   label:'False Identification to Law Enforcement',  fine:'$1,000',  court:true,  lic:'—', notes:'False ID to officer. Class A Misdemeanor. Mandatory court.' },
  { cat:'OTHER', code:'IC 35-38-1-1',     label:'Warrant Arrest — Failure to Appear',       fine:'Varies',  court:true,  lic:'—', notes:'FTA warrant. Subject to arrest. Court required to recall warrant.' },
  { cat:'OTHER', code:'IC 35-36-8-1',     label:'Bench Warrant — Civil Contempt',           fine:'Varies',  court:true,  lic:'—', notes:'Bench warrant issued. Court required.' },
  { cat:'OTHER', code:'IC 35-43-7-2',     label:'Identity Deception / Identity Theft',      fine:'$10,000', court:true,  lic:'—', notes:'Identity theft. Level 6 Felony. Mandatory court.' },
  { cat:'OTHER', code:'IC 35-48-4-14',    label:'Dealing in a Counterfeit Substance',       fine:'$10,000', court:true,  lic:'—', notes:'Counterfeit controlled substance dealing. Level 6 Felony. Mandatory court.' },
];

function buildStatuteDropdown(filterCat) {
  const sel = document.getElementById('inc-type');
  const prev = sel.value;
  sel.innerHTML = '<option value="">— SELECT STATUTE —</option>';

  const groups = {};
  STATUTES.forEach(s => {
    if (filterCat && s.cat !== filterCat) return;
    if (!groups[s.cat]) groups[s.cat] = [];
    groups[s.cat].push(s);
  });

  const CAT_LABELS = {
    TRAFFIC:'TRAFFIC VIOLATIONS', OWI:'OWI / IMPAIRED DRIVING',
    NARCOTICS:'NARCOTICS', PERSONS:'CRIMES AGAINST PERSONS',
    PROPERTY:'PROPERTY CRIMES', WEAPONS:'WEAPONS OFFENSES',
    OBSTRUCTION:'OBSTRUCTION / RESISTING', DISORDER:'DISORDERLY / PUBLIC ORDER',
    OTHER:'OTHER / MISC'
  };

  Object.keys(groups).forEach(cat => {
    const grp = document.createElement('optgroup');
    grp.label = CAT_LABELS[cat] || cat;
    groups[cat].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.code + '||' + s.cat + '||' + s.label;
      opt.textContent = s.code + ' — ' + s.label;
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  });

  // try to restore selection
  if (prev) {
    for (let o of sel.options) if (o.value === prev) { sel.value = prev; break; }
  }
}

function filterStatutes() {
  const cat = document.getElementById('inc-charge-class').value;
  buildStatuteDropdown(cat || null);
  document.getElementById('statute-autofill-row').style.display = 'none';
}

function onStatuteSelect() {
  const val = document.getElementById('inc-type').value;
  const row = document.getElementById('statute-autofill-row');
  if (!val) { row.style.display = 'none'; return; }

  const [code] = val.split('||');
  const s = STATUTES.find(x => x.code === code && val.includes(x.label));

  if (!s) { row.style.display = 'none'; return; }

  document.getElementById('sf-code').textContent = s.code;
  document.getElementById('sf-class').textContent = s.label;
  document.getElementById('sf-class').style.color = 'var(--text-primary)';
  document.getElementById('sf-fine').textContent = s.fine;

  const courtEl = document.getElementById('sf-court');
  courtEl.textContent = s.court ? '⚠ MANDATORY' : 'NOT REQUIRED';
  courtEl.style.color = s.court ? 'var(--accent-red)' : 'var(--accent-green)';

  document.getElementById('sf-license').textContent = s.lic;
  document.getElementById('sf-license').style.color = s.lic === '—' ? 'var(--text-secondary)' : 'var(--accent-amber)';

  row.style.display = 'block';

  // Auto-append notes to narrative if it's still the placeholder / empty
  const nar = document.getElementById('inc-narrative');
  const currentVal = nar.value.trim();
  // Replace or append statute auto-fill line
  const autoLine = `\n\n[STATUTE AUTO-FILL] ${s.code}: ${s.label}\nBase Fine: ${s.fine} | Court Appearance: ${s.court ? 'MANDATORY' : 'NOT REQUIRED'} | License Action: ${s.lic}\nNote: ${s.notes}`;
  // Strip any previous auto-fill before appending
  const stripped = currentVal.replace(/\n\n\[STATUTE AUTO-FILL\][\s\S]*$/,'');
  nar.value = (stripped || '') + autoLine;
}

// Build on load
buildStatuteDropdown(null);

// ── UTILS ─────────────────────────────────────
function formatAge(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return mins + ' MIN AGO';
  const hrs = Math.floor(mins / 60);
  return hrs + ' HR' + (hrs>1?'S':'') + ' AGO';
}

// ── MODAL SYSTEM ──────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'codes-modal') {
    filterCodes();
  }
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// ── CODE SEARCH DATA ──────────────────────────
const TEN_CODES = [
  // Unit Status
  { code:'10-0',  desc:'Caution',                         cat:'unit'    },
  { code:'10-1',  desc:'Reception Poor / Signal Weak',    cat:'admin'   },
  { code:'10-2',  desc:'Reception Good / Signal OK',      cat:'admin'   },
  { code:'10-3',  desc:'Stop Transmitting',               cat:'admin'   },
  { code:'10-4',  desc:'Acknowledged / OK / Message Received', cat:'admin' },
  { code:'10-5',  desc:'Relay Message',                   cat:'admin'   },
  { code:'10-6',  desc:'Busy — Stand By',                 cat:'unit'    },
  { code:'10-7',  desc:'Out of Service',                  cat:'unit'    },
  { code:'10-8',  desc:'In Service / Available',          cat:'unit'    },
  { code:'10-9',  desc:'Repeat / Say Again',              cat:'admin'   },
  { code:'10-10', desc:'Fight in Progress',               cat:'person'  },
  { code:'10-11', desc:'Animal Complaint / Dog Case',     cat:'scene'   },
  { code:'10-12', desc:'Stand By — Officer Present',      cat:'admin'   },
  { code:'10-13', desc:'Weather / Road Report',           cat:'admin'   },
  { code:'10-14', desc:'Escort / Convoy',                 cat:'unit'    },
  { code:'10-15', desc:'Prisoner in Custody / En Route',  cat:'person'  },
  { code:'10-16', desc:'Domestic Disturbance',            cat:'person'  },
  { code:'10-17', desc:'Meet Complainant',                cat:'admin'   },
  { code:'10-18', desc:'Urgent / Complete Assignment ASAP', cat:'admin'  },
  { code:'10-19', desc:'Return to Station',               cat:'unit'    },
  { code:'10-20', desc:'Location / Position (What is your 20?)', cat:'admin' },
  { code:'10-21', desc:'Call by Phone',                   cat:'admin'   },
  { code:'10-22', desc:'Disregard / Cancel',              cat:'admin'   },
  { code:'10-23', desc:'Arrived on Scene',                cat:'unit'    },
  { code:'10-24', desc:'Assignment Completed',            cat:'unit'    },
  { code:'10-25', desc:'Report in Person / Meet Officer', cat:'admin'   },
  { code:'10-26', desc:'Detaining Subject / ETA?',        cat:'person'  },
  { code:'10-27', desc:'Driver\'s License Check',         cat:'traffic' },
  { code:'10-28', desc:'Vehicle Registration Check',      cat:'traffic' },
  { code:'10-29', desc:'Check for Wants / Warrants',      cat:'person'  },
  { code:'10-30', desc:'Illegal Use of Radio',            cat:'admin'   },
  { code:'10-31', desc:'Crime in Progress',               cat:'scene'   },
  { code:'10-32', desc:'Man with Gun / Armed Subject',    cat:'person'  },
  { code:'10-33', desc:'Emergency — Assist Officer',      cat:'person'  },
  { code:'10-34', desc:'Riot / Civil Disturbance',        cat:'scene'   },
  { code:'10-35', desc:'Major Crime Alert / Confidential Info', cat:'scene' },
  { code:'10-36', desc:'Correct Time',                    cat:'admin'   },
  { code:'10-37', desc:'Suspicious Vehicle',              cat:'traffic' },
  { code:'10-38', desc:'Stopping Suspicious Vehicle',     cat:'traffic' },
  { code:'10-39', desc:'Urgent — Use Lights & Siren',     cat:'unit'    },
  { code:'10-40', desc:'Silent Response — No Lights/Siren', cat:'unit'  },
  { code:'10-41', desc:'Beginning Tour of Duty / On Duty', cat:'unit'   },
  { code:'10-42', desc:'Ending Tour of Duty / Off Duty',  cat:'unit'    },
  { code:'10-43', desc:'Information',                     cat:'admin'   },
  { code:'10-44', desc:'Permission to Leave Patrol Area', cat:'admin'   },
  { code:'10-45', desc:'Animal Carcass / Dead Animal',    cat:'scene'   },
  { code:'10-46', desc:'Assist Motorist',                 cat:'traffic' },
  { code:'10-47', desc:'Emergency Road Repair Needed',    cat:'traffic' },
  { code:'10-48', desc:'Traffic Signal Out',              cat:'traffic' },
  { code:'10-49', desc:'Traffic Light Out / Proceed to Location', cat:'traffic' },
  { code:'10-50', desc:'Accident (Traffic Collision)',     cat:'traffic' },
  { code:'10-50 PDO', desc:'Accident — Property Damage Only', cat:'traffic' },
  { code:'10-50 PI', desc:'Accident — Personal Injury',   cat:'traffic' },
  { code:'10-50 F', desc:'Accident — Fatal',              cat:'traffic' },
  { code:'10-51', desc:'Wrecker Needed / Request Tow',    cat:'traffic' },
  { code:'10-52', desc:'Ambulance Needed',                cat:'scene'   },
  { code:'10-53', desc:'Road Blocked',                    cat:'traffic' },
  { code:'10-54', desc:'Livestock on Highway / Suspicious Vehicle', cat:'traffic' },
  { code:'10-55', desc:'Intoxicated Driver / OWI Suspect', cat:'traffic' },
  { code:'10-56', desc:'Intoxicated Pedestrian',          cat:'person'  },
  { code:'10-57', desc:'Hit and Run Accident',            cat:'traffic' },
  { code:'10-58', desc:'Direct Traffic',                  cat:'traffic' },
  { code:'10-59', desc:'Convoy / Escort',                 cat:'unit'    },
  { code:'10-60', desc:'Squad in Vicinity',               cat:'unit'    },
  { code:'10-61', desc:'Personnel in Area',               cat:'unit'    },
  { code:'10-62', desc:'Reply to Message',                cat:'admin'   },
  { code:'10-63', desc:'Prepare to Copy / Make Written Copy', cat:'admin' },
  { code:'10-64', desc:'Found Property',                  cat:'scene'   },
  { code:'10-65', desc:'Missing Person / Net Message',    cat:'person'  },
  { code:'10-66', desc:'Suspicious Person',               cat:'person'  },
  { code:'10-67', desc:'Person Calling for Help',         cat:'person'  },
  { code:'10-68', desc:'Dispatch Information',            cat:'admin'   },
  { code:'10-69', desc:'Message Received',                cat:'admin'   },
  { code:'10-70', desc:'Fire / Alarm',                    cat:'scene'   },
  { code:'10-71', desc:'Advise Nature of Fire',           cat:'scene'   },
  { code:'10-72', desc:'Report Progress on Fire',         cat:'scene'   },
  { code:'10-73', desc:'Smoke Report',                    cat:'scene'   },
  { code:'10-74', desc:'Negative / No',                   cat:'admin'   },
  { code:'10-75', desc:'In Contact With',                 cat:'admin'   },
  { code:'10-76', desc:'En Route to Location',            cat:'unit'    },
  { code:'10-77', desc:'ETA (Estimated Time of Arrival)', cat:'unit'    },
  { code:'10-78', desc:'Need Assistance',                 cat:'unit'    },
  { code:'10-79', desc:'Notify Coroner',                  cat:'scene'   },
  { code:'10-80', desc:'Pursuit in Progress',             cat:'traffic' },
  { code:'10-81', desc:'Breathalyzer / Intoxilyzer Report', cat:'traffic' },
  { code:'10-82', desc:'Reserve Lodging',                 cat:'admin'   },
  { code:'10-83', desc:'Work School Crossing',            cat:'traffic' },
  { code:'10-84', desc:'If Meeting Advise ETA',           cat:'admin'   },
  { code:'10-85', desc:'Delayed Due to...',               cat:'admin'   },
  { code:'10-86', desc:'Officer / Operator on Duty',      cat:'unit'    },
  { code:'10-87', desc:'Pick Up / Distribute Checks',     cat:'admin'   },
  { code:'10-88', desc:'Present Telephone Number of...',  cat:'admin'   },
  { code:'10-89', desc:'Bomb Threat',                     cat:'scene'   },
  { code:'10-90', desc:'Alarm at Bank / Business',        cat:'scene'   },
  { code:'10-91', desc:'Pick Up Prisoner / Residential Alarm', cat:'person' },
  { code:'10-92', desc:'Improperly Parked Vehicle',       cat:'traffic' },
  { code:'10-93', desc:'Road Blockade / Intersection Block', cat:'traffic' },
  { code:'10-94', desc:'Drag Racing in Progress',         cat:'traffic' },
  { code:'10-95', desc:'Prisoner / Subject in Custody',   cat:'person'  },
  { code:'10-96', desc:'Mental Subject / Psych Hold',     cat:'person'  },
  { code:'10-97', desc:'Arrived at Scene / Check Signal', cat:'unit'    },
  { code:'10-98', desc:'Prison Break / Escape',           cat:'person'  },
  { code:'10-99', desc:'Wanted / Stolen Record Confirmed / Officer in Danger', cat:'person' },
];

const SIGNAL_CODES = [
  { code:'Signal 0',  desc:'Officer Needs Help — Emergency',           cat:'person' },
  { code:'Signal 1',  desc:'Crime in Progress',                        cat:'scene'  },
  { code:'Signal 2',  desc:'Person Shot / Stabbed',                    cat:'person' },
  { code:'Signal 3',  desc:'Prowler / Suspicious Person',              cat:'person' },
  { code:'Signal 4',  desc:'Fight / Disturbance',                      cat:'person' },
  { code:'Signal 5',  desc:'Traffic Accident — No Injuries',           cat:'traffic'},
  { code:'Signal 6',  desc:'Traffic Accident — Injuries',              cat:'traffic'},
  { code:'Signal 7',  desc:'Dead Body / Person',                       cat:'scene'  },
  { code:'Signal 8',  desc:'Theft in Progress / Just Occurred',        cat:'scene'  },
  { code:'Signal 9',  desc:'Burglary in Progress / Just Occurred',     cat:'scene'  },
  { code:'Signal 10', desc:'Vehicle Pursuit in Progress',              cat:'traffic'},
  { code:'Signal 11', desc:'Armed Robbery in Progress',                cat:'scene'  },
  { code:'Signal 12', desc:'Officer Down / Needs Immediate Assistance',cat:'person' },
  { code:'Signal 13', desc:'Stolen Vehicle',                           cat:'traffic'},
  { code:'Signal 14', desc:'Wanted Person on Scene',                   cat:'person' },
  { code:'Signal 15', desc:'Domestic Dispute / Violence',              cat:'person' },
  { code:'Signal 16', desc:'Drug Activity / Narcotics',                cat:'scene'  },
  { code:'Signal 17', desc:'Vandalism / Criminal Damage',              cat:'scene'  },
  { code:'Signal 18', desc:'Assist Other Unit / Agency',               cat:'unit'   },
  { code:'Signal 19', desc:'Meet Officer / Supervisor',                cat:'unit'   },
  { code:'Signal 20', desc:'Missing Person',                           cat:'person' },
  { code:'Signal 21', desc:'Trespasser / Unwanted Subject',            cat:'person' },
  { code:'Signal 22', desc:'Alarm — Residential',                      cat:'scene'  },
  { code:'Signal 23', desc:'Alarm — Commercial / Business',            cat:'scene'  },
  { code:'Signal 24', desc:'Intoxicated Subject',                      cat:'person' },
  { code:'Signal 25', desc:'Mental / Psych Patient — EDP',             cat:'person' },
  { code:'Signal 26', desc:'Welfare Check',                            cat:'person' },
  { code:'Signal 27', desc:'Juvenile Complaint',                       cat:'person' },
  { code:'Signal 28', desc:'Animal Complaint',                         cat:'scene'  },
  { code:'Signal 29', desc:'Abandoned Vehicle',                        cat:'traffic'},
  { code:'Signal 30', desc:'Fire / Smoke Reported',                    cat:'scene'  },
  { code:'Signal 31', desc:'Medical Emergency',                        cat:'scene'  },
  { code:'Signal 32', desc:'Shooting in Progress',                     cat:'scene'  },
  { code:'Signal 33', desc:'Hostage Situation',                        cat:'scene'  },
  { code:'Signal 34', desc:'Bank Robbery / In Progress',               cat:'scene'  },
  { code:'Signal 35', desc:'Bomb Threat',                              cat:'scene'  },
  { code:'Signal 36', desc:'Civil Disturbance / Riot',                 cat:'scene'  },
  { code:'Signal 37', desc:'Suspicious Package / Device',              cat:'scene'  },
  { code:'Signal 38', desc:'Vehicle Break-In / Auto Burglary',         cat:'scene'  },
  { code:'Signal 39', desc:'Noise Complaint',                          cat:'admin'  },
  { code:'Signal 40', desc:'Parking Violation / Complaint',            cat:'traffic'},
  { code:'Signal 41', desc:'Reckless Driver',                          cat:'traffic'},
  { code:'Signal 42', desc:'DUI / OWI — Driving Impaired',             cat:'traffic'},
  { code:'Signal 43', desc:'Motorist Assist / Disabled Vehicle',       cat:'traffic'},
  { code:'Signal 44', desc:'Road Hazard / Obstruction',                cat:'traffic'},
  { code:'Signal 45', desc:'Hit and Run',                              cat:'traffic'},
  { code:'Signal 46', desc:'Recover Stolen Vehicle',                   cat:'traffic'},
  { code:'Signal 47', desc:'Property Found',                           cat:'admin'  },
  { code:'Signal 48', desc:'Property Lost / Reported Stolen',          cat:'admin'  },
  { code:'Signal 49', desc:'Foot Pursuit in Progress',                 cat:'person' },
  { code:'Signal 50', desc:'SWAT / Special Response Requested',        cat:'unit'   },
  // PRC / ER:LC community codes
  { code:'Code 1',  desc:'Routine — No Lights or Siren',               cat:'unit'   },
  { code:'Code 2',  desc:'Urgent — Lights, No Siren',                  cat:'unit'   },
  { code:'Code 3',  desc:'Emergency — Lights and Siren',               cat:'unit'   },
  { code:'Code 4',  desc:'All Clear — No Further Assistance Needed',   cat:'unit'   },
  { code:'Code 5',  desc:'Stakeout — Stay Away from Area',             cat:'unit'   },
  { code:'Code 6',  desc:'Out of Vehicle for Investigation',           cat:'unit'   },
  { code:'Code 7',  desc:'Meal Break / Out of Service',                cat:'unit'   },
  { code:'Code 8',  desc:'Bomb Threat',                                cat:'scene'  },
  { code:'Code 9',  desc:'Jail Break / Escape',                        cat:'person' },
  { code:'Code 10', desc:'SWAT Activation',                            cat:'unit'   },
  { code:'Code 11', desc:'Armed and Dangerous Subject',                cat:'person' },
  { code:'Code 12', desc:'Officer Needs Help — Silent Alarm',          cat:'person' },
  { code:'Code 13', desc:'Riot',                                       cat:'scene'  },
  { code:'Code 14', desc:'Resuming Patrol',                            cat:'unit'   },
];

const CAT_LABELS = {
  traffic:'TRAFFIC', person:'PERSONS', unit:'UNIT STATUS',
  scene:'ON SCENE', admin:'ADMIN', signal:'SIGNAL'
};

let activeCodeTab = '10codes';

function switchCodeTab(tab, btn) {
  activeCodeTab = tab;
  document.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterCodes();
}

function filterCodes() {
  const q = (document.getElementById('code-search-input')?.value || '').toLowerCase().trim();
  const container = document.getElementById('codes-table-container');
  if (!container) return;

  let pool = [];
  if (activeCodeTab === '10codes') pool = TEN_CODES;
  else if (activeCodeTab === 'signals') pool = SIGNAL_CODES;
  else pool = [...TEN_CODES, ...SIGNAL_CODES];

  const results = q
    ? pool.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        (CAT_LABELS[c.cat]||'').toLowerCase().includes(q)
      )
    : pool;

  if (!results.length) {
    container.innerHTML = `<div class="code-no-results">⚠ NO CODES MATCHING "${q.toUpperCase()}"</div>`;
    return;
  }

  container.innerHTML = `
    <table class="code-table">
      <thead>
        <tr>
          <th>CODE</th>
          <th>DESCRIPTION</th>
          <th>CATEGORY</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(c => `
          <tr>
            <td class="code-num">${c.code}</td>
            <td class="code-desc">${c.desc}</td>
            <td><span class="code-cat cat-${c.cat}">${CAT_LABELS[c.cat]||c.cat.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}
(function() {
  const now = new Date();
  const di = document.getElementById('inc-date');
  const ti = document.getElementById('inc-time');
  if (di) di.value = now.toISOString().slice(0,10);
  if (ti) ti.value = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  // Restore theme from localStorage FIRST (before anything else renders)
  const savedTheme = localStorage.getItem('mdt_theme') || 'PD';
  applyTheme(savedTheme);

  const savedName = sessionStorage.getItem('mdt_officer_name');
  const savedCs   = sessionStorage.getItem('mdt_callsign');
  const savedAg   = sessionStorage.getItem('mdt_agency') || savedTheme;

  if (savedName && savedCs) {
    selectedAgency = savedAg;
    applyTheme(savedAg);
    document.getElementById('login-overlay').classList.add('hidden');
    updateOfficerDisplays();
    startAmbientCAD();
  } else {
    // No active session — show login, pre-select agency based on last theme
    selectAgency(savedTheme);
  }
})();
